<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(__FILE__)) . '/error.log');

// Set up server paths - this is where we'll find our assets in production
$serverRoot = $_SERVER['DOCUMENT_ROOT'];
$webstoriesPath = $serverRoot . '/webstories';
$webstoriesImagesPath = $serverRoot . '/images/webstories';
$templatePath = $serverRoot . '/templates/webstory_template.html';

// Helper function for structured debugging
function debug_log($step, $message, $data = null) {
    $log = date('Y-m-d H:i:s') . " [WEB STORIES] " . $step . ": " . $message;
    if ($data !== null) {
        $log .= " - " . json_encode($data, JSON_UNESCAPED_SLASHES);
    }
    error_log($log);
}

// Helper function to ensure image URLs are properly formatted
function formatImagePath($imagePath) {
    // Strip any leading slashes if they exist
    $imagePath = ltrim($imagePath, '/');
    
    // Remove any duplicate path segments
    if (preg_match('#(^|/)images/webstories/.*#', $imagePath)) {
        // Extract just the filename by finding the last occurrence of images/webstories/
        $pattern = '#.*images/webstories/([^/]+)$#';
        if (preg_match($pattern, $imagePath, $matches)) {
            $filename = $matches[1];
            return '/images/webstories/' . $filename;
        }
    }
    
    // If it's just a filename without path, add the path
    if (strpos($imagePath, '/') === false) {
        return '/images/webstories/' . $imagePath;
    }
    
    // For other cases, ensure it has the correct prefix
    if (strpos($imagePath, 'images/webstories/') === 0) {
        return '/' . $imagePath;
    }
    
    // Default case - add the standard path
    return '/images/webstories/' . $imagePath;
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

    // Verify all required directories exist and are writable
    $requiredDirs = [
        $serverRoot . '/webstories',
        $serverRoot . '/images/webstories',
        $serverRoot . '/templates'
    ];

    foreach ($requiredDirs as $dir) {
        if (!file_exists($dir)) {
            debug_log("DIRS", "Directory already exists: {$dir}");
        } elseif (!is_writable($dir)) {
            debug_log("DIRS", "Directory not writable: {$dir}");
            chmod($dir, 0777);
            if (!is_writable($dir)) {
                throw new Exception("Directory not writable after chmod: {$dir}");
            }
            debug_log("DIRS", "Made directory writable: {$dir}");
        }
    }

    // Configuration - use server paths where the files will be served from
    $storiesDir = $webstoriesPath;
    $imageDir = $webstoriesImagesPath;
      // Template file locations to try, prioritizing server path
    $templateLocations = [
        $templatePath,  // Try server path first
        $serverRoot . '/templates/webstory_template.html',
        dirname(__DIR__) . '/templates/webstory_template.html',
        __DIR__ . '/templates/webstory_template.html'
    ];
    
    debug_log("CONFIG", "Looking for template file in multiple locations");
    
    $template = null;
    $templateFile = null;
    
    foreach ($templateLocations as $location) {
        debug_log("TEMPLATE", "Checking location: {$location}");
        if (file_exists($location)) {
            debug_log("TEMPLATE", "Found template at: {$location}");
            $template = file_get_contents($location);
            if ($template !== false) {
                $templateFile = $location;
                debug_log("TEMPLATE", "Successfully read template file");
                break;
            }
        }
    }
    
    if (!$template) {
        debug_log("ERROR", "Could not find or read template file in any location");
        throw new Exception("Web story template file not found in any location");
    }
    
    // Verify template has required elements
    if (!strpos($template, '<amp-story') || !strpos($template, '{{CITY_NAME}}')) {
        debug_log("ERROR", "Template file is invalid - missing required elements");
        throw new Exception("Web story template file is invalid - missing required elements");
    }
    
    debug_log("TEMPLATE", "Template file validated successfully");
    
    debug_log("CONFIG", "Paths configured", [
        "basePath" => $serverRoot,
        "storiesDir" => $storiesDir,
        "imageDir" => $imageDir,
        "templateFile" => $templateFile
    ]);

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

    // Create or check necessary directories
    $buildWebstoriesPath = $serverRoot . '/webstories';
    $buildImagesPath = $serverRoot . '/images/webstories';

    foreach ([$buildWebstoriesPath, $buildImagesPath] as $dir) {
        if (!file_exists($dir)) {
            debug_log("DIRS", "Directory already exists: {$dir}");
        } elseif (!is_writable($dir)) {
            debug_log("DIRS", "Directory not writable: {$dir}");
            chmod($dir, 0777);
            if (!is_writable($dir)) {
                debug_log("ERROR", "Directory not writable and could not fix permissions: {$dir}");
                throw new Exception("Directory not writable and could not fix permissions: {$dir}");
            }
            debug_log("DIRS", "Fixed directory permissions: {$dir}");
        }
    }

    // Get and validate background images
    $backgroundImages = [];
    $defaultImageCreated = false;

    if (is_dir($imageDir)) {
        debug_log("IMAGES", "Scanning directory for background images: {$imageDir}");
        $files = scandir($imageDir);
        if ($files === false) {
            debug_log("ERROR", "Failed to scan image directory");
            throw new Exception("Failed to scan image directory: {$imageDir}");
        }
        
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            
            $filePath = $imageDir . '/' . $file;
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            
            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                continue;
            }

            // Skip thumbnail files
            if (strpos($file, 'thumbnail-') === 0) {
                continue;
            }

            // Validate image
            $imageInfo = @getimagesize($filePath);
            if ($imageInfo === false) {
                debug_log("ERROR", "Invalid image file: {$file}");
                continue;
            }

            $backgroundImages[] = $file;
            debug_log("IMAGES", "Added valid background image: {$file}");
        }
    }

    // Create default image if no valid images found
    if (empty($backgroundImages)) {
        debug_log("IMAGES", "No valid background images found, creating default");
        
        try {
            // Create a more visually appealing default image
            $width = 1200;
            $height = 1600;
            $img = imagecreatetruecolor($width, $height);
            
            // Create gradient background
            $topColor = imagecolorallocate($img, 51, 153, 255);    // Light blue
            $bottomColor = imagecolorallocate($img, 255, 255, 255); // White
            
            // Draw gradient
            for($i = 0; $i < $height; $i++) {
                $color = imagecolorallocate($img, 
                    51 + ($i/$height) * (255-51),
                    153 + ($i/$height) * (255-153),
                    255);
                imageline($img, 0, $i, $width, $i, $color);
            }
            
            // Add text
            $fontColor = imagecolorallocate($img, 33, 33, 33);
            $fontSize = 5;
            $text = "Egg Rate Updates";
            
            // Center the text
            $textWidth = strlen($text) * imagefontwidth($fontSize);
            $textHeight = imagefontheight($fontSize);
            $x = ($width - $textWidth) / 2;
            $y = ($height - $textHeight) / 2;
            
            imagestring($img, $fontSize, $x, $y, $text, $fontColor);
            
            // Save as WebP for better quality/compression
            $defaultImagePath = $imageDir . '/default.webp';
            imagewebp($img, $defaultImagePath, 80);
            imagedestroy($img);
            
            if (file_exists($defaultImagePath)) {
                $backgroundImages[] = 'default.webp';
                $defaultImageCreated = true;
                debug_log("IMAGES", "Successfully created default background image");
            }
        } catch (Exception $e) {
            debug_log("ERROR", "Failed to create default image: " . $e->getMessage());
            throw new Exception("Could not create default background image: " . $e->getMessage());
        }
    }

    if (empty($backgroundImages)) {
        debug_log("ERROR", "No valid background images available");
        throw new Exception("No valid background images available and could not create default");
    }

    // Get today's date
    $today = date('Y-m-d');
    debug_log("DATE", "Current date: {$today}");

    // Clean up old web stories first - but don't close the connection
    $daysToKeep = 3;
    debug_log("CLEANUP", "Cleaning up old web stories (keeping {$daysToKeep} days)");
    deleteOldWebStories($storiesDir, $imageDir, $daysToKeep, $conn, false);

    // After template validation code
    // Try normalized tables first with better error handling and retry logic
    $maxRetries = 3;
    $retryDelay = 1; // seconds
    $attempt = 0;
    
    while ($attempt < $maxRetries) {
        try {
            $attempt++;
            debug_log("DATA", "Querying normalized tables for egg rates (attempt {$attempt})");
            
            // Test connection before query
            if (!$conn->ping()) {
                debug_log("DB", "Database connection lost, attempting to reconnect");
                $conn->close();
                $conn = new mysqli($servername, $username, $password, $dbname);
                if ($conn->connect_error) {
                    throw new Exception("Failed to reconnect to database: " . $conn->connect_error);
                }
                debug_log("DB", "Successfully reconnected to database");
            }

            // Try normalized tables first
            $sql = "
                SELECT c.name as city, s.name as state, ern.rate, ern.date 
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE (ern.city_id, ern.date) IN (
                    SELECT city_id, MAX(date)
                    FROM egg_rates_normalized
                    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
                    GROUP BY city_id
                )
                ORDER BY c.name
            ";

            debug_log("SQL", "Executing query on normalized tables");
            $result = $conn->query($sql);
            
            if (!$result) {
                throw new Exception("Database query failed: " . $conn->error);
            }

            if ($result->num_rows === 0) {
                debug_log("DATA", "No results from normalized tables, will try original table");
                throw new Exception("No results from normalized tables");
            }

            debug_log("DATA", "Successfully retrieved " . $result->num_rows . " rows from normalized tables");
            break; // Success, exit retry loop

        } catch (Exception $e) {
            debug_log("ERROR", "Attempt {$attempt} failed: " . $e->getMessage());
            
            if ($attempt === $maxRetries) {
                // On last attempt, try the original table as fallback
                debug_log("DATA", "All normalized table attempts failed, trying original table");
                
                $sql = "
                    SELECT city, state, rate, date 
                    FROM egg_rates 
                    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
                    AND (city, date) IN (
                        SELECT city, MAX(date) 
                        FROM egg_rates 
                        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
                        GROUP BY city
                    )
                    ORDER BY city
                ";
                
                $result = $conn->query($sql);
                
                if (!$result) {
                    debug_log("ERROR", "Both normalized and original table queries failed");
                    throw new Exception("Database queries failed for both tables: " . $conn->error);
                }

                if ($result->num_rows === 0) {
                    debug_log("ERROR", "No egg rates found in either table");
                    throw new Exception("No egg rates found in the database within the last 3 days");
                }
                
                debug_log("DATA", "Successfully retrieved " . $result->num_rows . " rows from original table");
                break;
            }
            
            // Wait before retrying
            sleep($retryDelay);
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
            
            // Format ISO date for Schema.org
            $isoDate = date('c', strtotime($date));
            
            // Replace placeholders in the template
            $story = $template;
            $story = str_replace('{{CITY_NAME}}', $city, $story);
            $story = str_replace('{{STATE_NAME}}', $state, $story);
            $story = str_replace('{{EGG_RATE}}', $rate, $story);
            $story = str_replace('{{ISO_DATE}}', $isoDate, $story);
            
            // Calculate the tray price properly instead of literal string replacement
            $trayPrice = number_format($rate * 30, 1);
            $story = str_replace('{{EGG_RATE * 30}}', $trayPrice, $story);
            $story = str_replace('{{DATE}}', $displayDate, $story);
            
            // Format image paths properly with the correct path prefix
            $formattedCoverImage = formatImagePath($coverImage);
            $formattedTrayImage = formatImagePath($trayPriceImage);
            $formattedCtaImage = formatImagePath($ctaImage);
            
            debug_log("IMAGES", "Formatted image paths", [
                "Original cover" => $coverImage,
                "Formatted cover" => $formattedCoverImage,
                "Original tray" => $trayPriceImage,
                "Formatted tray" => $formattedTrayImage,
                "Original CTA" => $ctaImage,
                "Formatted CTA" => $formattedCtaImage
            ]);
            
            // Replace different background images for different pages with correctly formatted paths
            $story = str_replace('{{COVER_BACKGROUND_IMAGE}}', $formattedCoverImage, $story);
            $story = str_replace('{{TRAY_BACKGROUND_IMAGE}}', $formattedTrayImage, $story);
            $story = str_replace('{{CTA_BACKGROUND_IMAGE}}', $formattedCtaImage, $story);
            
            $story = str_replace('{{CITY_SLUG}}', $citySlug, $story);
            
            // Check all img tags to ensure no duplicate paths
            $story = preg_replace('#src="[/]?images/webstories/([^"]+)"#', 'src="/images/webstories/$1"', $story);
            $story = preg_replace('#src="/+images/webstories/([^"]+)"#', 'src="/images/webstories/$1"', $story);
            $story = preg_replace('#src="/images/webstories//images/webstories/([^"]+)"#', 'src="/images/webstories/$1"', $story);
            
            // Fix duplicate paths in meta tags
            $story = preg_replace('#content="https://todayeggrates.com/images/webstories//images/webstories/([^"]+)"#', 'content="https://todayeggrates.com/images/webstories/$1"', $story);
            
            // Properly handle amp-story attributes by finding the main amp-story tag and ensuring it has all required attributes
            // First, check if the standalone attribute exists in the amp-story tag
            $thumbnailUrl = '/images/webstories/thumbnail-' . $citySlug . '.webp';
            $ampStoryPattern = '/<amp-story[^>]*>/';
            
            if (preg_match($ampStoryPattern, $story, $matches)) {
                $originalTag = $matches[0];
                debug_log("STORY", "Found amp-story tag: {$originalTag}");
                
                // Create a new amp-story tag with all required attributes
                $newTag = '<amp-story standalone title="Egg Rate in ' . $city . ', ' . $state . ' - ₹' . $rate . '" ' .
                         'publisher="Today Egg Rates" publisher-logo-src="/tee.webp" ' . 
                         'poster-portrait-src="' . $thumbnailUrl . '">';
                
                // Replace the original tag with our complete one
                $story = str_replace($originalTag, $newTag, $story);
                debug_log("STORY", "Updated amp-story tag with all required attributes");
            } else {
                debug_log("ERROR", "Could not find amp-story tag in template");
            }
            
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
        
        // Set flag to prevent connection closure in update_webstory_thumbnails.php
        $suppressConnectionClose = true;

        // Include thumbnail generation script
        debug_log("THUMBNAILS", "Including thumbnail generation script");
        include_once __DIR__ . '/update_webstory_thumbnails.php';

        debug_log("COMPLETE", "Generation process completed");
        // Close connection at the very end
        $conn->close();
        
        // Create new database connection for sitemap
        debug_log("SITEMAP", "Creating new database connection for sitemap");
        require_once dirname(__DIR__) . '/config/db.php';
        
        if (!$conn || $conn->connect_error) {
            throw new Exception("Failed to create new database connection for sitemap: " . ($conn ? $conn->connect_error : "Connection is null"));
        }
        
        // Generate sitemap with new connection
        debug_log("SITEMAP", "Generating sitemap");
        require_once __DIR__ . '/generate_webstories_sitemap.php';
        
        // Success message
        debug_log("SUCCESS", "Web stories generation completed successfully");
        return true;
        
    } else {
        debug_log("ERROR", "No egg rates found in the database");
        echo "No egg rates found in the database. Please check your data.";
        return false;
    }

} catch (Exception $e) {
    // Log any exceptions that occur
    debug_log("ERROR", "Web stories generation error: " . $e->getMessage(), ["trace" => $e->getTraceAsString()]);
    echo "Error generating web stories: " . $e->getMessage();
    return false;
}
?>
