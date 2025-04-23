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

    // Define functions first to avoid any redeclaration issues
    if (!function_exists('generateThumbnail')) {
        debug_log("FUNCTIONS", "Defining generateThumbnail function");
        function generateThumbnail($imageDir, $city, $citySlug, $sourceImage) {
            debug_log("THUMBNAIL", "Generating thumbnail for {$city}", ["slug" => $citySlug, "source" => $sourceImage]);
            
            // Extract filename from source image path
            $sourceFilename = basename($sourceImage);
            $sourceImagePath = $imageDir . '/' . $sourceFilename;
            
            // Ensure source file exists
            if (!file_exists($sourceImagePath)) {
                debug_log("THUMBNAIL", "Source image not found at {$sourceImagePath}, trying with document root");
                // Try with the path as is (it might be a full path)
                $sourceImagePath = $_SERVER['DOCUMENT_ROOT'] . $sourceImage;
                if (!file_exists($sourceImagePath)) {
                    debug_log("THUMBNAIL", "Source image not found at either location", ["original" => $imageDir . '/' . $sourceFilename, "alternate" => $_SERVER['DOCUMENT_ROOT'] . $sourceImage]);
                    return false;
                }
            }
            
            // Configuration
            $thumbnailWidth = 400;
            $thumbnailHeight = 300;
            
            // Get image type
            $imageInfo = getimagesize($sourceImagePath);
            if ($imageInfo === false) {
                debug_log("THUMBNAIL", "Failed to get image size information for {$sourceImagePath}");
                return false;
            }
            
            $sourceType = $imageInfo[2];
            debug_log("THUMBNAIL", "Image type detected", ["type" => $sourceType, "path" => $sourceImagePath]);
            
            // Create source image based on type
            switch ($sourceType) {
                case IMAGETYPE_JPEG:
                    $sourceImage = imagecreatefromjpeg($sourceImagePath);
                    break;
                case IMAGETYPE_PNG:
                    $sourceImage = imagecreatefrompng($sourceImagePath);
                    break;
                case IMAGETYPE_GIF:
                    $sourceImage = imagecreatefromgif($sourceImagePath);
                    break;
                default:
                    debug_log("THUMBNAIL", "Unsupported image type: {$sourceType}");
                    return false;
            }
            
            if (!$sourceImage) {
                debug_log("THUMBNAIL", "Failed to create image from file: {$sourceImagePath}");
                return false;
            }
            
            // Create a new thumbnail image
            $thumbnailImage = imagecreatetruecolor($thumbnailWidth, $thumbnailHeight);
            
            // Preserve transparency for PNG images
            if ($sourceType == IMAGETYPE_PNG) {
                imagecolortransparent($thumbnailImage, imagecolorallocate($thumbnailImage, 0, 0, 0));
                imagealphablending($thumbnailImage, false);
                imagesavealpha($thumbnailImage, true);
            }
            
            // Resize the image
            imagecopyresampled(
                $thumbnailImage, $sourceImage,
                0, 0, 0, 0,
                $thumbnailWidth, $thumbnailHeight,
                imagesx($sourceImage), imagesy($sourceImage)
            );
            
            // Add city name text overlay
            $textColor = imagecolorallocate($thumbnailImage, 255, 255, 255);
            $shadowColor = imagecolorallocate($thumbnailImage, 0, 0, 0);
            $font = 5; // Built-in font
            
            // Get text dimensions
            $textWidth = imagefontwidth($font) * strlen($city);
            $textHeight = imagefontheight($font);
            
            // Calculate position for centered text
            $textX = (int)(($thumbnailWidth - $textWidth) / 2); // Explicitly cast to int
            $textY = (int)($thumbnailHeight - $textHeight - 10); // Explicitly cast to int
            
            // Draw text shadow
            imagestring($thumbnailImage, $font, $textX + 1, $textY + 1, $city, $shadowColor);
            
            // Draw text
            imagestring($thumbnailImage, $font, $textX, $textY, $city, $textColor);
            
            // Save the thumbnail
            $thumbnailPath = $imageDir . '/thumbnail-' . $citySlug . '.jpg';
            debug_log("THUMBNAIL", "Saving thumbnail to {$thumbnailPath}");
            $result = imagejpeg($thumbnailImage, $thumbnailPath, 90);
            
            // Clean up
            imagedestroy($sourceImage);
            imagedestroy($thumbnailImage);
            
            debug_log("THUMBNAIL", "Thumbnail generation " . ($result ? "successful" : "failed") . " for {$city}");
            return $result;
        }
    }

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
        "storiesDir" => $storiesDir,
        "imageDir" => $imageDir,
        "templateFile" => $templateFile
    ]);

    // Create the necessary directories if they don't exist
    foreach ([$storiesDir, $imageDir] as $dir) {
        if (!file_exists($dir)) {
            debug_log("DIRS", "Creating directory: {$dir}");
            if (!mkdir($dir, 0755, true)) {
                debug_log("DIRS", "Failed to create directory: {$dir}");
                throw new Exception("Failed to create directory: {$dir}. Please check permissions.");
            }
        } elseif (!is_writable($dir)) {
            debug_log("DIRS", "Directory not writable: {$dir}");
            throw new Exception("Directory not writable: {$dir}. Please check permissions.");
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
            if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif']) && $file !== '.' && $file !== '..') {
                // Skip thumbnail files
                if (strpos($file, 'thumbnail-') === 0) {
                    continue;
                }
                $backgroundImages[] = '/images/webstories/' . $file;
            }
        }
        debug_log("IMAGES", "Found " . count($backgroundImages) . " background images");
    }

    // If no images found, use a default image
    if (empty($backgroundImages)) {
        debug_log("IMAGES", "No background images found, using default");
        $defaultImage = $basePath . '/eggpic.png';
        if (file_exists($defaultImage)) {
            debug_log("IMAGES", "Default image found: {$defaultImage}");
            // Make sure the images directory exists
            if (!file_exists($imageDir)) {
                debug_log("IMAGES", "Creating images directory for default image: {$imageDir}");
                if (!mkdir($imageDir, 0755, true)) {
                    debug_log("IMAGES", "Failed to create directory: {$imageDir}");
                    throw new Exception("Failed to create directory: {$imageDir}");
                }
            }
            
            // Copy the default image to the webstories image directory
            $targetImage = $imageDir . '/eggpic.png';
            debug_log("IMAGES", "Copying default image to: {$targetImage}");
            if (!copy($defaultImage, $targetImage)) {
                debug_log("IMAGES", "Failed to copy default image to: {$targetImage}");
                throw new Exception("Failed to copy default image to {$targetImage}");
            }
            
            $backgroundImages[] = '/images/webstories/eggpic.png';
            debug_log("IMAGES", "Using default image as background");
        } else {
            debug_log("IMAGES", "Default image not found: {$defaultImage}");
            throw new Exception("No background images found and default image does not exist at {$defaultImage}");
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
            $coverImage = $backgroundImages[0];
            $trayPriceImage = isset($backgroundImages[1]) ? $backgroundImages[1] : $backgroundImages[0];
            $ctaImage = isset($backgroundImages[2]) ? $backgroundImages[2] : $backgroundImages[0];
            
            // Store the first image for thumbnail use
            $thumbnailSourceImage = $coverImage;
            
            // Format date for display
            $displayDate = date('F j, Y', strtotime($date));
            
            // Replace placeholders in the template
            $story = $template;
            $story = str_replace('{{CITY_NAME}}', $city, $story);
            $story = str_replace('{{STATE_NAME}}', $state, $story);
            $story = str_replace('{{EGG_RATE}}', $rate, $story);
            $story = str_replace('{{EGG_RATE * 30}}', ($rate * 30), $story);
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
                
                // Generate thumbnail using the first selected background image
                debug_log("STORY", "Generating thumbnail for {$city}");
                $thumbnailResult = generateThumbnail($imageDir, $city, $citySlug, $thumbnailSourceImage);
                if (!$thumbnailResult) {
                    debug_log("STORY", "Warning: Thumbnail generation failed for {$city}");
                }
            } else {
                debug_log("STORY", "Failed to write web story file for {$city} to {$filename}");
                throw new Exception("Could not write to file {$filename}");
            }
        }
        
        // Generate an index file for all web stories
        debug_log("INDEX", "Generating index file for {$storiesGenerated} web stories");
        generateWebStoryIndex($storiesDir, $conn);
        
        debug_log("COMPLETE", "Generated {$storiesGenerated} web stories successfully");
        echo "Generated {$storiesGenerated} web stories successfully.";
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
