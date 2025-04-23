<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(__FILE__)) . '/error.log');

// Use a try-catch block around the entire script to catch any unexpected errors
try {
    // Database connection - using require_once instead of include to avoid duplicate function declarations
    require_once dirname(__DIR__) . '/config/db.php';

    // Verify that $conn exists, otherwise create the connection
    if (!isset($conn) || $conn->connect_error) {
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
    }

    // Include the function to delete old web stories, we're using require_once to avoid duplicate declarations
    require_once __DIR__ . '/delete_old_webstories.php';

    // Configuration - use absolute paths to avoid permission issues
    $basePath = dirname(dirname(dirname(__FILE__))); // Go up two levels from webstories dir
    $storiesDir = $basePath . '/webstories';
    $imageDir = $basePath . '/images/webstories';
    $templateFile = $basePath . '/templates/webstory_template.html';

    // Create the necessary directories if they don't exist
    foreach ([$storiesDir, $imageDir] as $dir) {
        if (!file_exists($dir)) {
            if (!mkdir($dir, 0755, true)) {
                throw new Exception("Failed to create directory: $dir. Please check permissions.");
            }
        } elseif (!is_writable($dir)) {
            throw new Exception("Directory not writable: $dir. Please check permissions.");
        }
    }

    // Get all available background images
    $backgroundImages = [];
    if (is_dir($imageDir)) {
        $files = scandir($imageDir);
        if ($files === false) {
            throw new Exception("Failed to scan directory: $imageDir");
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
    }

    // If no images found, use a default image
    if (empty($backgroundImages)) {
        $defaultImage = $basePath . '/eggpic.png';
        if (file_exists($defaultImage)) {
            // Make sure the images directory exists
            if (!file_exists($imageDir)) {
                if (!mkdir($imageDir, 0755, true)) {
                    throw new Exception("Failed to create directory: $imageDir");
                }
            }
            
            // Copy the default image to the webstories image directory
            $targetImage = $imageDir . '/eggpic.png';
            if (!copy($defaultImage, $targetImage)) {
                throw new Exception("Failed to copy default image to $targetImage");
            }
            
            $backgroundImages[] = '/images/webstories/eggpic.png';
        } else {
            throw new Exception("No background images found and default image does not exist at $defaultImage");
        }
    }

    // Get the web story template with error handling
    if (file_exists($templateFile)) {
        $template = file_get_contents($templateFile);
        if ($template === false) {
            throw new Exception("Could not read template file $templateFile");
        }
    } else {
        // Check alternative locations
        $alternateTemplateFile = $basePath . '/public_html/templates/webstory_template.html';
        if (file_exists($alternateTemplateFile)) {
            $template = file_get_contents($alternateTemplateFile);
            if ($template === false) {
                throw new Exception("Could not read template file $alternateTemplateFile");
            }
        } else {
            throw new Exception("Template file not found at $templateFile or $alternateTemplateFile");
        }
    }

    // Get today's date
    $today = date('Y-m-d');

    // Clean up old web stories first - but don't close the connection
    $daysToKeep = 3;
    deleteOldWebStories($storiesDir, $imageDir, $daysToKeep, $conn, false);

    // Get the latest egg rates - use the normalized tables first
    try {
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
            throw new Exception("No results from normalized tables");
        }
    } catch (Exception $e) {
        // Fall back to original table
        error_log("Falling back to original table: " . $e->getMessage());
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
            throw new Exception("Database query failed: " . $conn->error);
        }
    }

    if ($result && $result->num_rows > 0) {
        $storiesGenerated = 0;
        
        while ($row = $result->fetch_assoc()) {
            $city = $row['city'];
            $state = $row['state'];
            $rate = $row['rate'];
            $date = $row['date'];
            
            // Skip if the rate is from more than 3 days ago
            if (strtotime($date) < strtotime('-3 days')) {
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
            if (file_put_contents($filename, $story)) {
                $storiesGenerated++;
                
                // Generate thumbnail using the first selected background image
                generateThumbnail($imageDir, $city, $citySlug, $thumbnailSourceImage);
            } else {
                throw new Exception("Could not write to file $filename");
            }
        }
        
        // Generate an index file for all web stories
        generateWebStoryIndex($storiesDir, $conn);
        
        echo "Generated $storiesGenerated web stories successfully.";
    } else {
        echo "No egg rates found in the database. Please check your data.";
    }

    // Use require_once to avoid double inclusion issues
    require_once 'generate_webstories_sitemap.php';

    // Success message
    error_log("Web stories generation completed successfully at " . date('Y-m-d H:i:s'));

} catch (Exception $e) {
    // Log any exceptions that occur
    error_log("Web stories generation error: " . $e->getMessage());
    echo "Error generating web stories: " . $e->getMessage();
    
    // Make sure we return a non-zero exit code to indicate an error
    exit(1);
}
?>
