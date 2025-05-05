<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(__FILE__)) . '/error.log');

// Helper function for structured debugging
function debug_log($step, $message, $data = null) {
    $log = date('Y-m-d H:i:s') . " [WEB STORIES] " . $step . ": " . $message;
    if ($data !== null) {
        $log .= " - " . json_encode($data, JSON_UNESCAPED_SLASHES);
    }
    error_log($log);
}

// Use a try-catch block around the entire script to catch any unexpected errors
try {
    debug_log("START", "Beginning web stories generation");
    
    // Database connection - using require_once instead of include to avoid duplicate function declarations
    debug_log("DB", "Including database configuration");
    require_once dirname(__DIR__) . '/config/db.php';

    // Verify that $conn exists, otherwise create the connection
    if (!isset($conn) || $conn->connect_error) {
        debug_log("DB", "Creating new database connection");
        // Connection details
        $servername = "localhost";
        $username = "u901337298_test";
        $password = "A12345678b*";
        $dbname = "u901337298_test";
        
        // Create connection
        $conn = new mysqli($servername, $username, $password, $dbname);
        
        // Check connection
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        debug_log("DB", "New database connection created successfully");
    } else {
        debug_log("DB", "Using existing database connection");
    }

    // Function to generate web story index
    if (!function_exists('generateWebStoryIndex')) {
        debug_log("FUNCTIONS", "Defining generateWebStoryIndex function");
        function generateWebStoryIndex($storiesDir, $conn) {
            debug_log("INDEX", "Generating web stories index page");
            $indexFile = $storiesDir . '/index.html';
            
            // Try normalized table first for getting latest egg rates
            try {
                debug_log("INDEX", "Querying normalized tables for rates");
                $sql = "
                    SELECT c.name as city, s.name as state, ern.rate, ern.date 
                    FROM egg_rates_normalized ern
                    JOIN cities c ON ern.city_id = c.id
                    JOIN states s ON c.state_id = s.id
                    WHERE (ern.city_id, ern.date) IN (
                        SELECT city_id, MAX(date)
                        FROM egg_rates_normalized
                        GROUP BY city_id
                    )
                    ORDER BY c.name
                ";
                
                $result = $conn->query($sql);
                
                if (!$result || $result->num_rows === 0) {
                    debug_log("INDEX", "No results from normalized table, falling back to original table");
                    throw new Exception("No results from normalized table");
                }
            } catch (Exception $e) {
                // Fall back to original table
                debug_log("INDEX", "Using original table: " . $e->getMessage());
                $sql = "
                    SELECT city, state, rate, date 
                    FROM egg_rates 
                    WHERE (city, date) IN (
                        SELECT city, MAX(date) 
                        FROM egg_rates 
                        GROUP BY city
                    )
                    ORDER BY city
                ";
                $result = $conn->query($sql);
            }
            
            // Generate HTML for index file
            $html = "<!DOCTYPE html><html><head><title>Web Stories Index</title></head><body>";
            $html .= "<h1>Web Stories Index</h1><ul>";
            
            while ($row = $result->fetch_assoc()) {
                $city = $row['city'];
                $state = $row['state'];
                $rate = $row['rate'];
                $date = $row['date'];
                
                debug_log("INDEX", "Adding index entry for {$city}, {$state}");
                $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
                $html .= "<li><a href='{$citySlug}-egg-rate.html'>{$city}, {$state} - {$rate} ({$date})</a></li>";
            }
            
            $html .= "</ul></body></html>";
            
            debug_log("INDEX", "Saving index file to {$indexFile}");
            $writeResult = file_put_contents($indexFile, $html);
            if ($writeResult === false) {
                debug_log("INDEX", "Failed to write index file to {$indexFile}");
                throw new Exception("Failed to write index file to {$indexFile}");
            }
            debug_log("INDEX", "Web stories index page generated successfully");
        }
    }

    // Include the function to delete old web stories, we're using require_once to avoid duplicate declarations
    debug_log("INCLUDES", "Including delete_old_webstories.php");
    require_once __DIR__ . '/delete_old_webstories.php';

    // Configuration - use absolute paths to avoid permission issues
    $basePath = dirname(dirname(dirname(__FILE__))); // Go up two levels from webstories dir
    $storiesDir = $basePath . '/webstories';
    $imageDir = $basePath . '/images/webstories';
    $templateFile = $basePath . '/templates/webstory_template.html';
    
    debug_log("CONFIG", "Paths configured", [
        "basePath" => $basePath,
        "storiesDir" => $storiesDir,
        "imageDir" => $imageDir,
        "templateFile" => $templateFile
    ]);

    // Create the necessary directories if they don't exist
    foreach ([$storiesDir, $imageDir] as $dir) {
        if (!file_exists($dir)) {
            debug_log("DIRS", "Creating directory: {$dir}");
            if (!mkdir($dir, 0777, true)) {
                $error = error_get_last();
                debug_log("DIRS", "Failed to create directory: {$dir}", $error);
                throw new Exception("Failed to create directory: {$dir}. Error: " . ($error['message'] ?? 'Unknown error'));
            }
            // After creation, ensure it's writable
            chmod($dir, 0777);
            debug_log("DIRS", "Directory created successfully: {$dir}");
        } elseif (!is_writable($dir)) {
            debug_log("DIRS", "Directory not writable: {$dir}");
            // Try to make it writable
            chmod($dir, 0777);
            if (!is_writable($dir)) {
                throw new Exception("Directory not writable: {$dir}. Please check permissions.");
            }
        } else {
            debug_log("DIRS", "Directory exists and is writable: {$dir}");
        }
    }

    // Get all available background images
    $backgroundImages = [];
    if (is_dir($imageDir)) {
        debug_log("IMAGES", "Scanning directory for background images: {$imageDir}");
        $files = scandir($imageDir);
        if ($files === false) {
            debug_log("IMAGES", "Failed to scan directory: {$imageDir}");
            throw new Exception("Failed to scan directory: {$imageDir}");
        }
        
        foreach ($files as $file) {
            $extension = pathinfo($file, PATHINFO_EXTENSION);
            if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif']) && $file !== '.' && $file !== '..') {
                // Skip thumbnail files
                if (strpos($file, 'thumbnail-') === 0) {
                    continue;
                }
                // Store just the filename, not the full path
                $backgroundImages[] = $file;
                debug_log("IMAGES", "Found background image: {$file}");
            }
        }
        debug_log("IMAGES", "Found " . count($backgroundImages) . " background images");
    }

    // If no images found, use a default image
    if (empty($backgroundImages)) {
        debug_log("IMAGES", "No background images found, using default");
        // Check multiple locations for default image
        $defaultImageLocations = [
            $basePath . '/eggpic.png',
            $basePath . '/public/eggpic.png',
            $basePath . '/build/eggpic.png'
        ];
        
        $defaultImageFound = false;
        foreach ($defaultImageLocations as $defaultImage) {
            if (file_exists($defaultImage)) {
                debug_log("IMAGES", "Found default image at: {$defaultImage}");
                // Copy default image to webstories image directory
                $targetImage = $imageDir . '/default.png';
                if (copy($defaultImage, $targetImage)) {
                    debug_log("IMAGES", "Copied default image to: {$targetImage}");
                    $backgroundImages[] = 'default.png';
                    $defaultImageFound = true;
                    break;
                } else {
                    $error = error_get_last();
                    debug_log("ERROR", "Failed to copy default image", $error);
                }
            }
        }
        
        if (!$defaultImageFound) {
            // Create a simple default image
            debug_log("IMAGES", "Creating a simple default image");
            $simpleImage = imagecreatetruecolor(800, 600);
            $bgColor = imagecolorallocate($simpleImage, 240, 240, 240);
            $textColor = imagecolorallocate($simpleImage, 0, 0, 0);
            imagefill($simpleImage, 0, 0, $bgColor);
            imagestring($simpleImage, 5, 300, 280, "Egg Rate", $textColor);
            
            // Save the simple image
            $simpleImagePath = $imageDir . '/default.png';
            imagepng($simpleImage, $simpleImagePath);
            imagedestroy($simpleImage);
            
            if (file_exists($simpleImagePath)) {
                debug_log("IMAGES", "Created simple default image at: {$simpleImagePath}");
                $backgroundImages[] = 'default.png';
            } else {
                debug_log("ERROR", "Failed to create simple default image");
                throw new Exception("No background images found and could not create a default image.");
            }
        }
    }

    // Get the web story template with error handling
    debug_log("TEMPLATE", "Looking for template file: {$templateFile}");
    if (file_exists($templateFile)) {
        debug_log("TEMPLATE", "Reading template file: {$templateFile}");
        $template = file_get_contents($templateFile);
        if ($template === false) {
            debug_log("TEMPLATE", "Could not read template file: {$templateFile}");
            throw new Exception("Could not read template file {$templateFile}");
        }
        debug_log("TEMPLATE", "Template file read successfully (" . strlen($template) . " bytes)");
    } else {
        // Check alternative locations
        $alternateTemplateFile = $basePath . '/public_html/templates/webstory_template.html';
        debug_log("TEMPLATE", "Template not found, trying alternate: {$alternateTemplateFile}");
        if (file_exists($alternateTemplateFile)) {
            debug_log("TEMPLATE", "Reading alternate template file: {$alternateTemplateFile}");
            $template = file_get_contents($alternateTemplateFile);
            if ($template === false) {
                debug_log("TEMPLATE", "Could not read alternate template file: {$alternateTemplateFile}");
                throw new Exception("Could not read template file {$alternateTemplateFile}");
            }
            debug_log("TEMPLATE", "Alternate template file read successfully (" . strlen($template) . " bytes)");
        } else {
            debug_log("TEMPLATE", "No template file found at either location");
            throw new Exception("Template file not found at {$templateFile} or {$alternateTemplateFile}");
        }
    }

    // Get today's date
    $today = date('Y-m-d');
    debug_log("DATE", "Current date: {$today}");

    // Clean up old web stories first - but don't close the connection
    $daysToKeep = 3;
    debug_log("CLEANUP", "Cleaning up old web stories (keeping {$daysToKeep} days)");
    deleteOldWebStories($storiesDir, $imageDir, $daysToKeep, $conn, false);

    // Get the latest egg rates - use the normalized tables first
    try {
        debug_log("DATA", "Querying normalized tables for egg rates");
        $sql = "
            SELECT c.name as city, s.name as state, ern.rate, ern.date 
            FROM egg_rates_normalized ern
            JOIN cities c ON ern.city_id = c.id
            JOIN states s ON c.state_id = s.id
            WHERE (ern.city_id, ern.date) IN (
                SELECT city_id, MAX(date)
                FROM egg_rates_normalized
                GROUP BY city_id
            )
            ORDER BY c.name
        ";

        $result = $conn->query($sql);
        
        if (!$result || $result->num_rows === 0) {
            debug_log("DATA", "No results from normalized tables, falling back to original table");
            throw new Exception("No results from normalized tables");
        }
    } catch (Exception $e) {
        // Fall back to original table
        debug_log("DATA", "Using original table: " . $e->getMessage());
        $sql = "
            SELECT city, state, rate, date 
            FROM egg_rates 
            WHERE (city, date) IN (
                SELECT city, MAX(date) 
                FROM egg_rates 
                GROUP BY city
            )
            ORDER BY city
        ";
        $result = $conn->query($sql);
        
        if (!$result) {
            debug_log("DATA", "Database query failed: " . $conn->error);
            throw new Exception("Database query failed: " . $conn->error);
        }
    }

    if ($result && $result->num_rows > 0) {
        debug_log("PROCESS", "Found " . $result->num_rows . " cities to generate web stories for");
        $storiesGenerated = 0;
        
        while ($row = $result->fetch_assoc()) {
            $city = $row['city'];
            $state = $row['state'];
            $rate = $row['rate'];
            $date = $row['date'];
            
            debug_log("STORY", "Processing city: {$city}, {$state}");
            
            // Skip if the rate is from more than 3 days ago
            if (strtotime($date) < strtotime('-3 days')) {
                debug_log("STORY", "Skipping {$city} - rate from {$date} is too old");
                continue;
            }
            
            // Create a URL-friendly city name
            $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
            
            // Randomly select different images for different pages
            shuffle($backgroundImages);
            
            // For each page in the web story, construct the proper path to the image
            // We'll use full absolute URLs to ensure they're accessible
            $coverImage = $backgroundImages[0];  // Remove the /images/webstories/ prefix 
            $trayPriceImage = isset($backgroundImages[1]) ? $backgroundImages[1] : $backgroundImages[0];
            $ctaImage = isset($backgroundImages[2]) ? $backgroundImages[2] : $backgroundImages[0];
            
            // Format date for display
            $displayDate = date('F j, Y', strtotime($date));
            
            // Replace placeholders in the template
            $story = $template;
            $story = str_replace('{{CITY_NAME}}', $city, $story);
            $story = str_replace('{{STATE_NAME}}', $state, $story);
            $story = str_replace('{{EGG_RATE}}', $rate, $story);
            // Calculate the tray price properly instead of literal string replacement
            $trayPrice = number_format($rate * 30, 1);
            $story = str_replace('{{EGG_RATE * 30}}', $trayPrice, $story);
            $story = str_replace('{{DATE}}', $displayDate, $story);
            
            // Replace different background images for different pages
            $story = str_replace('{{COVER_BACKGROUND_IMAGE}}', $coverImage, $story);
            $story = str_replace('{{TRAY_BACKGROUND_IMAGE}}', $trayPriceImage, $story);
            $story = str_replace('{{CTA_BACKGROUND_IMAGE}}', $ctaImage, $story);
            
            $story = str_replace('{{CITY_SLUG}}', $citySlug, $story);
            
            // Save the web story
            $filename = $storiesDir . '/' . $citySlug . '-egg-rate.html';
            debug_log("STORY", "Saving web story for {$city} to {$filename}");
            $writeResult = file_put_contents($filename, $story);
            
            if ($writeResult !== false) {
                $storiesGenerated++;
                debug_log("STORY", "Web story saved successfully for {$city}");
            } else {
                debug_log("STORY", "Failed to write web story file for {$city} to {$filename}");
                throw new Exception("Could not write to file {$filename}");
            }
        }
        
        // Generate an index file for all web stories
        debug_log("INDEX", "Generating index file for {$storiesGenerated} web stories");
        generateWebStoryIndex($storiesDir, $conn);
        
        debug_log("COMPLETE", "Generated {$storiesGenerated} web stories successfully");
        echo "Generated {$storiesGenerated} web stories successfully.<br>";
        
        // Call the thumbnail update script to generate thumbnails for all web stories
        debug_log("THUMBNAILS", "Calling update_webstory_thumbnails.php to generate thumbnails");
        echo "Generating thumbnails for web stories...<br>";
        include_once __DIR__ . '/update_webstory_thumbnails.php';
        
    } else {
        debug_log("ERROR", "No egg rates found in the database");
        echo "No egg rates found in the database. Please check your data.";
    }

    // Use require_once to avoid double inclusion issues
    debug_log("SITEMAP", "Generating web stories sitemap");
    require_once 'generate_webstories_sitemap.php';

    // Success message
    debug_log("SUCCESS", "Web stories generation completed successfully");

} catch (Exception $e) {
    // Log any exceptions that occur
    debug_log("ERROR", "Web stories generation error: " . $e->getMessage(), ["trace" => $e->getTraceAsString()]);
    echo "Error generating web stories: " . $e->getMessage();
    
    // Make sure we return a non-zero exit code to indicate an error
    exit(1);
}
?>
