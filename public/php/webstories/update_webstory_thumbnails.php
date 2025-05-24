<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(__FILE__)) . '/error.log');

// Helper function for structured debugging - only declare if it doesn't already exist
if (!function_exists('debug_log')) {
    function debug_log($step, $message, $data = null) {
        $log = date('Y-m-d H:i:s') . " [THUMBNAILS] " . $step . ": " . $message;
        if ($data !== null) {
            $log .= " - " . json_encode($data, JSON_UNESCAPED_SLASHES);
        }
        error_log($log);
    }
}

debug_log("START", "Beginning thumbnail generation process");

// Check if GD library is available
if (!extension_loaded('gd')) {
    debug_log("ERROR", "GD library is not available");
    die("Error: GD library is not available. Please install it for image processing.");
}

// Configuration with absolute paths - use appropriate path discovery methods
$basePath = dirname(dirname(dirname(__FILE__))); // Go up two levels from webstories dir
$imageDir = $basePath . '/images/webstories';
$webstoriesDir = $basePath . '/webstories';

// Also check build directory for webstories
$buildWebstoriesDir = $basePath . '/build/webstories';

// Set thumbnail dimensions to match Google's Web Story requirements (proper aspect ratio)
$thumbnailWidth = 640;  // Updated for better quality
$thumbnailHeight = 853; // Updated for 3:4 portrait aspect ratio (Google recommended)

debug_log("CONFIG", "Paths configured", [
    "basePath" => $basePath,
    "imageDir" => $imageDir,
    "webstoriesDir" => $webstoriesDir,
    "buildWebstoriesDir" => $buildWebstoriesDir,
    "thumbnailDimensions" => [
        "width" => $thumbnailWidth,
        "height" => $thumbnailHeight
    ]
]);

// Create the images directory if it doesn't exist with better error handling
if (!file_exists($imageDir)) {
    debug_log("DIRS", "Creating image directory: {$imageDir}");
    try {
        if (!mkdir($imageDir, 0777, true)) {
            $error = error_get_last();
            debug_log("ERROR", "Failed to create directory: {$imageDir}", $error);
            die("Failed to create directory: {$imageDir}. Error: " . ($error['message'] ?? 'Unknown error'));
        }
        // After creation, ensure it's writable
        chmod($imageDir, 0777);
        debug_log("DIRS", "Image directory created successfully");
    } catch (Exception $e) {
        debug_log("ERROR", "Exception creating directory: " . $e->getMessage(), ["trace" => $e->getTraceAsString()]);
        die("Error creating directory: " . $e->getMessage());
    }
} elseif (!is_writable($imageDir)) {
    debug_log("ERROR", "Image directory exists but is not writable: {$imageDir}");
    // Try to make it writable
    chmod($imageDir, 0777);
    if (!is_writable($imageDir)) {
        die("Error: Image directory exists but is not writable: {$imageDir}");
    }
}

// Check webstories directories
$webstoriesDirExists = false;

// Check main webstories directory
if (file_exists($webstoriesDir) && is_dir($webstoriesDir)) {
    $webstoriesDirExists = true;
    debug_log("DIRS", "Found main webstories directory: {$webstoriesDir}");
} 

// Check build webstories directory
if (file_exists($buildWebstoriesDir) && is_dir($buildWebstoriesDir)) {
    $webstoriesDirExists = true;
    $webstoriesDir = $buildWebstoriesDir; // Use build directory instead
    debug_log("DIRS", "Found build webstories directory: {$buildWebstoriesDir}");
}

if (!$webstoriesDirExists) {
    debug_log("ERROR", "No webstories directory found. Creating at {$webstoriesDir}");
    if (!mkdir($webstoriesDir, 0777, true)) {
        $error = error_get_last();
        debug_log("ERROR", "Failed to create webstories directory", $error);
        die("Failed to create webstories directory. Error: " . ($error['message'] ?? 'Unknown error'));
    }
    chmod($webstoriesDir, 0777);
}

debug_log("DIRS", "Directory checks complete");

// Get all available background images
$backgroundImages = [];
if (is_dir($imageDir)) {
    debug_log("IMAGES", "Scanning directory for background images: {$imageDir}");
    $files = scandir($imageDir);
    if ($files === false) {
        debug_log("ERROR", "Failed to scan directory: {$imageDir}");
        $files = [];
    }
    
    foreach ($files as $file) {
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif']) && $file !== '.' && $file !== '..') {
            // Skip thumbnail files
            if (strpos($file, 'thumbnail-') === 0) {
                continue;
            }
            $backgroundImages[] = $file;
            debug_log("IMAGES", "Found background image: {$file}");
        }
    }
}

// If no background images found, use default
if (empty($backgroundImages)) {
    debug_log("IMAGES", "No background images found, using default");
    // Check multiple locations for default image
    $defaultImageLocations = [
        $basePath . '/eggpic.webp',
        $basePath . '/public/eggpic.webp',
        $basePath . '/build/eggpic.webp'
    ];
    
    $defaultImageFound = false;
    foreach ($defaultImageLocations as $defaultImage) {
        if (file_exists($defaultImage)) {
            debug_log("IMAGES", "Found default image at: {$defaultImage}");
            // Copy default image to webstories image directory
            $targetImage = $imageDir . '/default.webp';
            if (copy($defaultImage, $targetImage)) {
                debug_log("IMAGES", "Copied default image to: {$targetImage}");
                $backgroundImages[] = 'default.webp';
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
        $simpleImagePath = $imageDir . '/default.webp';
        imagepng($simpleImage, $simpleImagePath);
        imagedestroy($simpleImage);
        
        if (file_exists($simpleImagePath)) {
            debug_log("IMAGES", "Created simple default image at: {$simpleImagePath}");
            $backgroundImages[] = 'default.webp';
        } else {
            debug_log("ERROR", "Failed to create simple default image");
            die("Error: No background images found and could not create a default image.");
        }
    }
}

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
        debug_log("ERROR", "Database connection failed: " . $conn->connect_error);
        die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
    }
    debug_log("DB", "Database connection created successfully");
} else {
    debug_log("DB", "Using existing database connection");
}

// Get all cities from database - try normalized tables first
try {
    debug_log("DB", "Querying normalized tables for cities");
    $sql = "
        SELECT DISTINCT c.name AS city, s.name AS state 
        FROM cities c
        JOIN states s ON c.state_id = s.id
        ORDER BY c.name
    ";
    $result = $conn->query($sql);
    
    if (!$result || $result->num_rows === 0) {
        debug_log("DB", "No results from normalized tables, falling back to original table");
        throw new Exception("No results from normalized tables");
    }
} catch (Exception $e) {
    // Fall back to original table
    debug_log("DB", "Querying original egg_rates table");
    $sql = "SELECT DISTINCT city, state FROM egg_rates ORDER BY city";
    $result = $conn->query($sql);
    
    if (!$result) {
        debug_log("ERROR", "Database query failed: " . $conn->error);
        die("Database error: " . $conn->error);
    }
}

$processedCities = 0;
$skippedCities = 0;
$errorCities = 0;

debug_log("PROCESS", "Beginning processing of " . ($result ? $result->num_rows : 0) . " cities");

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $city = $row['city'];
        $state = $row['state'];
        $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
        
        debug_log("CITY", "Processing city: {$city}, {$state}", ["slug" => $citySlug]);
        
        // Check if we need to update the thumbnail
        // Try multiple possible webstory file patterns
        $webstoryFile = null;
        $possiblePatterns = [
            $webstoriesDir . '/' . $citySlug . '-egg-rate.html',
            $webstoriesDir . '/' . $citySlug . '_egg_rate.html',
            $webstoriesDir . '/' . $citySlug . '.html',
            $webstoriesDir . '/egg-rate-' . $citySlug . '.html'
        ];

        foreach ($possiblePatterns as $pattern) {
            if (file_exists($pattern)) {
                $webstoryFile = $pattern;
                debug_log("FILES", "Found webstory file: {$pattern}");
                break;
            }
        }

        if (!$webstoryFile) {
            debug_log("SKIP", "No webstory file found for {$city} using any known pattern");
            $skippedCities++;
            continue;
        }

        $thumbnailFile = $imageDir . '/thumbnail-' . $citySlug . '.webp';
        
        debug_log("FILES", "Checking files", [
            "webstoryFile" => $webstoryFile,
            "webstoryExists" => file_exists($webstoryFile),
            "thumbnailFile" => $thumbnailFile,
            "thumbnailExists" => file_exists($thumbnailFile)
        ]);
        
        // Skip if webstory doesn't exist
        if (!file_exists($webstoryFile)) {
            debug_log("SKIP", "Skipping {$city} - no webstory file exists");
            $skippedCities++;
            continue;
        }
        
        // Force regeneration regardless of age for debugging purposes
        // Later, you can uncomment this condition to skip recent thumbnails
        /*
        if (file_exists($thumbnailFile) && (time() - filemtime($thumbnailFile) < 86400)) {
            debug_log("SKIP", "Skipping {$city} - existing thumbnail is recent");
            $skippedCities++;
            continue;
        }
        */
        
        try {
            // Pick a random background image for this city
            $randomIndex = array_rand($backgroundImages);
            $backgroundFile = $backgroundImages[$randomIndex];
            
            // Load the source image
            $sourceImagePath = $imageDir . '/' . $backgroundFile;
            debug_log("IMAGE", "Using background image: {$sourceImagePath}");
            
            if (!file_exists($sourceImagePath)) {
                debug_log("ERROR", "Source image not found: {$sourceImagePath}");
                throw new Exception("Source image not found: {$sourceImagePath}");
            }
            
            // Get image type
            $imageInfo = getimagesize($sourceImagePath);
            if ($imageInfo === false) {
                debug_log("ERROR", "Cannot determine image type for {$sourceImagePath}");
                throw new Exception("Cannot determine image type for {$sourceImagePath}");
            }
            
            $sourceType = $imageInfo[2];
            debug_log("IMAGE", "Image type detected: {$sourceType}");
            
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
                    debug_log("ERROR", "Unsupported image type: {$sourceType}");
                    throw new Exception("Unsupported image type: {$sourceType}");
            }
            
            if (!$sourceImage) {
                debug_log("ERROR", "Failed to create image from file: {$sourceImagePath}");
                throw new Exception("Failed to create image from file: {$sourceImagePath}");
            }
            
            // Create a new thumbnail image
            $thumbnailImage = imagecreatetruecolor($thumbnailWidth, $thumbnailHeight);
            if (!$thumbnailImage) {
                debug_log("ERROR", "Failed to create true color image");
                throw new Exception("Failed to create true color image");
            }
            
            // Preserve transparency for PNG images
            if ($sourceType == IMAGETYPE_PNG) {
                imagecolortransparent($thumbnailImage, imagecolorallocate($thumbnailImage, 0, 0, 0));
                imagealphablending($thumbnailImage, false);
                imagesavealpha($thumbnailImage, true);
            }
            
            // Resize the image
            $resizeResult = imagecopyresampled(
                $thumbnailImage, $sourceImage,
                0, 0, 0, 0,
                $thumbnailWidth, $thumbnailHeight,
                imagesx($sourceImage), imagesy($sourceImage)
            );
            
            if (!$resizeResult) {
                debug_log("ERROR", "Failed to resize image");
                throw new Exception("Failed to resize image");
            }
            
            // Add semi-transparent overlay for better text readability
            $overlayColor = imagecolorallocatealpha($thumbnailImage, 0, 0, 0, 80); // Black with alpha
            if ($overlayColor === false) {
                debug_log("ERROR", "Failed to allocate overlay color");
                $overlayColor = imagecolorallocate($thumbnailImage, 0, 0, 0); // Fallback to solid black
            }
            
            imagefilledrectangle(
                $thumbnailImage,
                0, $thumbnailHeight - 50,
                $thumbnailWidth, $thumbnailHeight,
                $overlayColor
            );
            
            // Add state name text (smaller)
            $stateTextColor = imagecolorallocate($thumbnailImage, 200, 200, 200); // Light gray
            $stateFont = 2; // Small built-in font
            $stateText = "($state)";
            
            // Get state text dimensions
            $stateTextWidth = imagefontwidth($stateFont) * strlen($stateText);
            
            // Add city name text overlay
            $textColor = imagecolorallocate($thumbnailImage, 255, 255, 255); // White
            $shadowColor = imagecolorallocate($thumbnailImage, 0, 0, 0); // Black shadow
            $font = 5; // Larger built-in font
            
            // Get city text dimensions
            $textWidth = imagefontwidth($font) * strlen($city);
            $textHeight = imagefontheight($font);
            
            // Calculate position for centered text
            $textX = (int)(($thumbnailWidth - $textWidth) / 2);
            $textY = (int)($thumbnailHeight - $textHeight - 20);
            
            // Draw city name with shadow
            imagestring($thumbnailImage, $font, $textX + 1, $textY + 1, $city, $shadowColor);
            imagestring($thumbnailImage, $font, $textX, $textY, $city, $textColor);
            
            // Draw state name below city
            $stateTextX = (int)(($thumbnailWidth - $stateTextWidth) / 2);
            $stateTextY = $textY + $textHeight + 2;
            imagestring($thumbnailImage, $stateFont, $stateTextX, $stateTextY, $stateText, $stateTextColor);
            
            // Get latest egg rate for this city
            debug_log("RATE", "Querying latest rate for {$city}, {$state}");
            $rateSql = "SELECT rate FROM egg_rates WHERE city = ? AND state = ? ORDER BY date DESC LIMIT 1";
            $rateStmt = $conn->prepare($rateSql);
            
            if (!$rateStmt) {
                debug_log("ERROR", "Failed to prepare rate query: " . $conn->error);
                throw new Exception("Database error: " . $conn->error);
            }
            
            $rateStmt->bind_param("ss", $city, $state);
            $rateStmt->execute();
            $rateResult = $rateStmt->get_result();
            
            if ($rateResult && $rateResult->num_rows > 0) {
                $rateRow = $rateResult->fetch_assoc();
                $rate = $rateRow['rate'];
                debug_log("RATE", "Found rate for {$city}: {$rate}");
                
                // Draw rate on top of image
                $rateText = "₹" . $rate;
                $rateColor = imagecolorallocate($thumbnailImage, 255, 255, 0); // Yellow
                $rateBackColor = imagecolorallocate($thumbnailImage, 0, 0, 0); // Black background
                
                // Create rate badge at top right
                imagefilledrectangle(
                    $thumbnailImage,
                    $thumbnailWidth - 100, 10,
                    $thumbnailWidth - 10, 40,
                    $rateBackColor
                );
                
                // Add rate text
                $rateFont = 4;
                $rateTextWidth = imagefontwidth($rateFont) * strlen($rateText);
                $rateX = $thumbnailWidth - 10 - $rateTextWidth - 10;
                imagestring($thumbnailImage, $rateFont, $rateX, 15, $rateText, $rateColor);
            } else {
                debug_log("RATE", "No rate found for {$city}, {$state}");
            }
            
            // Save the thumbnail
            $thumbnailPath = $imageDir . '/thumbnail-' . $citySlug . '.webp';
            debug_log("SAVE", "Saving thumbnail to {$thumbnailPath}");
            
            $saveResult = imagejpeg($thumbnailImage, $thumbnailPath, 90);
            
            // Clean up
            imagedestroy($sourceImage);
            imagedestroy($thumbnailImage);
            
            if (!$saveResult) {
                debug_log("ERROR", "Failed to save thumbnail to {$thumbnailPath}");
                throw new Exception("Failed to save thumbnail to {$thumbnailPath}");
            }
            
            debug_log("SUCCESS", "Generated thumbnail for {$city}, {$state}");
            $processedCities++;
            
            // Update webstory meta tags to include the thumbnail
            if (file_exists($webstoryFile)) {
                debug_log("UPDATE", "Updating webstory with thumbnail reference: {$webstoryFile}");
                $webstoryContent = file_get_contents($webstoryFile);
                
                if ($webstoryContent === false) {
                    debug_log("ERROR", "Failed to read webstory file: {$webstoryFile}");
                    throw new Exception("Failed to read webstory file: {$webstoryFile}");
                }
                
                $thumbnailUrl = '/images/webstories/thumbnail-' . $citySlug . '.webp';
                
                // Improved pattern matching for the amp-story tag to avoid creating multiple nested tags
                // We'll search for the entire amp-story opening tag and replace just the poster-portrait-src attribute
                $mainAmpStoryPattern = '/<amp-story[^>]*>/';
                
                if (preg_match($mainAmpStoryPattern, $webstoryContent, $matches)) {
                    $originalTag = $matches[0];
                    debug_log("UPDATE", "Found amp-story tag: {$originalTag}");
                    
                    // If tag already has poster-portrait-src attribute, replace it
                    if (strpos($originalTag, 'poster-portrait-src') !== false) {
                        $updatedTag = preg_replace('/poster-portrait-src="[^"]*"/', 'poster-portrait-src="' . $thumbnailUrl . '"', $originalTag);
                        debug_log("UPDATE", "Replacing poster-portrait-src attribute");
                    } else {
                        // Otherwise insert the attribute before the closing >
                        $updatedTag = str_replace('>', ' poster-portrait-src="' . $thumbnailUrl . '">', $originalTag);
                        debug_log("UPDATE", "Adding poster-portrait-src attribute");
                    }
                    
                    // Replace the opening amp-story tag with our updated version
                    $webstoryContent = str_replace($originalTag, $updatedTag, $webstoryContent);
                } else {
                    debug_log("ERROR", "Could not find amp-story tag");
                }
                
                // Update or add meta image tag
                $metaPattern = '/<meta property="og:image" content="[^"]*"/';
                $metaReplacement = '<meta property="og:image" content="https://todayeggrates.com/images/webstories/thumbnail-' . $citySlug . '.webp"';
                
                if (preg_match($metaPattern, $webstoryContent)) {
                    $webstoryContent = preg_replace($metaPattern, $metaReplacement, $webstoryContent);
                    debug_log("UPDATE", "Updated og:image meta tag");
                } else {
                    // Add meta tag if it doesn't exist
                    $headPattern = '/<head>/';
                    $headReplacement = '<head>' . PHP_EOL . '    ' . $metaReplacement;
                    $webstoryContent = preg_replace($headPattern, $headReplacement, $webstoryContent);
                    debug_log("UPDATE", "Added og:image meta tag");
                }
                
                // Also update Twitter card image
                $twitterPattern = '/<meta name="twitter:image" content="[^"]*"/';
                $twitterReplacement = '<meta name="twitter:image" content="https://todayeggrates.com/images/webstories/thumbnail-' . $citySlug . '.webp"';
                
                if (preg_match($twitterPattern, $webstoryContent)) {
                    $webstoryContent = preg_replace($twitterPattern, $twitterReplacement, $webstoryContent);
                    debug_log("UPDATE", "Updated twitter:image meta tag");
                }
                
                // Save the updated webstory
                $writeResult = file_put_contents($webstoryFile, $webstoryContent);
                
                if ($writeResult === false) {
                    debug_log("ERROR", "Failed to write updated webstory: {$webstoryFile}");
                    throw new Exception("Failed to write updated webstory: {$webstoryFile}");
                }
                
                debug_log("SUCCESS", "Updated webstory with thumbnail reference: {$webstoryFile}");
            }
        } catch (Exception $e) {
            debug_log("ERROR", "Exception processing {$city}: " . $e->getMessage(), ["trace" => $e->getTraceAsString()]);
            $errorCities++;
        }
    }
    
    debug_log("COMPLETE", "Thumbnail generation completed", [
        "processed" => $processedCities,
        "skipped" => $skippedCities,
        "errors" => $errorCities
    ]);
    
    echo "<hr>All operations completed.<br>";
    echo "Generated " . $processedCities . " thumbnails.<br>";
    echo "Skipped " . $skippedCities . " thumbnails (already exist or no webstory).<br>";
    echo "Errors encountered for " . $errorCities . " cities.<br>";
} else {
    debug_log("ERROR", "No cities found in the database");
    echo "No cities found in the database.";
}

// Cleanup unused thumbnails
debug_log("CLEANUP", "Cleaning up unused thumbnails");
$unusedCount = 0;

if (is_dir($imageDir)) {
    $files = scandir($imageDir);
    if ($files === false) {
        debug_log("ERROR", "Failed to scan image directory for cleanup");
    } else {
        foreach ($files as $file) {
            // Check if file is a thumbnail
            if (strpos($file, 'thumbnail-') === 0) {
                $citySlug = substr($file, 10, -4); // Remove 'thumbnail-' prefix and '.webp' suffix
                
                // Check all possible webstory patterns
                $webstoryFound = false;
                $possiblePatterns = [
                    $webstoriesDir . '/' . $citySlug . '-egg-rate.html',
                    $webstoriesDir . '/' . $citySlug . '_egg_rate.html',
                    $webstoriesDir . '/' . $citySlug . '.html',
                    $webstoriesDir . '/egg-rate-' . $citySlug . '.html'
                ];

                foreach ($possiblePatterns as $pattern) {
                    if (file_exists($pattern)) {
                        $webstoryFound = true;
                        debug_log("CLEANUP", "Found matching webstory for thumbnail: {$pattern}");
                        break;
                    }
                }

                // If no webstory exists with any pattern, remove the thumbnail
                if (!$webstoryFound) {
                    debug_log("CLEANUP", "No matching webstory found for thumbnail: {$file}");
                    if (unlink($imageDir . '/' . $file)) {
                        echo "Removed unused thumbnail: $file<br>";
                        $unusedCount++;
                    } else {
                        debug_log("ERROR", "Failed to remove unused thumbnail: {$file}");
                        echo "Failed to remove unused thumbnail: $file<br>";
                    }
                } else {
                    debug_log("CLEANUP", "Keeping thumbnail {$file} as matching webstory exists");
                }
            }
        }
    }
}

debug_log("CLEANUP", "Removed {$unusedCount} unused thumbnails");
echo "Removed " . $unusedCount . " unused thumbnails.<br>";

debug_log("END", "Thumbnail update process completed");

// Only close the connection if it wasn't passed from another script
if (!isset($suppressConnectionClose)) {
    $conn->close();
    debug_log("DB", "Closed database connection");
}
?>
