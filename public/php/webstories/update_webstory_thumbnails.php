<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if GD library is available
if (!extension_loaded('gd')) {
    die("Error: GD library is not available. Please install it for image processing.");
}

// Configuration with absolute paths
$basePath = dirname(dirname(dirname(__FILE__))); // Go up two levels from webstories dir
$imageDir = $basePath . '/images/webstories';
$webstoriesDir = $basePath . '/webstories';
$thumbnailWidth = 400;
$thumbnailHeight = 300;

// Create the images directory if it doesn't exist with error handling
if (!file_exists($imageDir)) {
    try {
        if (!mkdir($imageDir, 0755, true)) {
            error_log("Failed to create directory: $imageDir");
            echo "Failed to create directory: $imageDir. Please check permissions.<br>";
        }
    } catch (Exception $e) {
        error_log("Exception creating directory: " . $e->getMessage());
        echo "Error creating directory: " . $e->getMessage() . "<br>";
    }
}

// Get all available background images
$backgroundImages = [];
if (is_dir($imageDir)) {
    $files = scandir($imageDir);
    foreach ($files as $file) {
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif']) && $file !== '.' && $file !== '..') {
            // Skip thumbnail files
            if (strpos($file, 'thumbnail-') === 0) {
                continue;
            }
            $backgroundImages[] = $file;
        }
    }
}

// If no background images found, use default
if (empty($backgroundImages)) {
    echo "Warning: No background images found. Using default image.<br>";
    // Check if default image exists in public directory
    $defaultImage = $basePath . '/eggpic.png';
    if (file_exists($defaultImage)) {
        // Copy default image to webstories image directory
        copy($defaultImage, $imageDir . '/default.png');
        $backgroundImages[] = 'default.png';
    } else {
        die("Error: No background images found and default image does not exist.");
    }
}

// Database connection
include dirname(__DIR__) . '/config/db.php';

// Get all cities from database - try normalized tables first
try {
    $sql = "
        SELECT DISTINCT c.name AS city, s.name AS state 
        FROM cities c
        JOIN states s ON c.state_id = s.id
        ORDER BY c.name
    ";
    $result = $conn->query($sql);
    
    if (!$result || $result->num_rows === 0) {
        throw new Exception("No results from normalized tables");
    }
} catch (Exception $e) {
    // Fall back to original table
    $sql = "SELECT DISTINCT city, state FROM egg_rates ORDER BY city";
    $result = $conn->query($sql);
}

$processedCities = 0;
$skippedCities = 0;

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $city = $row['city'];
        $state = $row['state'];
        $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
        
        // Check if we need to update the thumbnail
        $webstoryFile = $webstoriesDir . '/' . $citySlug . '.html';
        $thumbnailFile = $imageDir . '/thumbnail-' . $citySlug . '.jpg';
        
        // Skip if webstory doesn't exist or thumbnail is recent
        if (!file_exists($webstoryFile)) {
            echo "Skipping thumbnail for $city - no webstory file exists<br>";
            $skippedCities++;
            continue;
        }
        
        // Check if thumbnail exists and is less than 1 day old
        if (file_exists($thumbnailFile) && (time() - filemtime($thumbnailFile) < 86400)) {
            echo "Skipping thumbnail for $city - existing thumbnail is recent<br>";
            $skippedCities++;
            continue;
        }
        
        // Pick a random background image for this city
        $randomIndex = array_rand($backgroundImages);
        $backgroundFile = $backgroundImages[$randomIndex];
        
        // Load the source image
        $sourceImagePath = $imageDir . '/' . $backgroundFile;
        if (!file_exists($sourceImagePath)) {
            echo "Warning: Source image not found: $sourceImagePath<br>";
            continue;
        }
        
        // Get image type
        $imageInfo = getimagesize($sourceImagePath);
        if ($imageInfo === false) {
            echo "Error: Cannot determine image type for $sourceImagePath<br>";
            continue;
        }
        
        $sourceType = $imageInfo[2];
        
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
                echo "Error: Unsupported image type for $sourceImagePath<br>";
                continue;
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
        
        // Add semi-transparent overlay for better text readability
        $overlayColor = imagecolorallocatealpha($thumbnailImage, 0, 0, 0, 80); // Black with alpha
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
        $rateSql = "SELECT rate FROM egg_rates WHERE city = ? AND state = ? ORDER BY date DESC LIMIT 1";
        $rateStmt = $conn->prepare($rateSql);
        $rateStmt->bind_param("ss", $city, $state);
        $rateStmt->execute();
        $rateResult = $rateStmt->get_result();
        
        if ($rateResult && $rateResult->num_rows > 0) {
            $rateRow = $rateResult->fetch_assoc();
            $rate = $rateRow['rate'];
            
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
        }
        
        // Save the thumbnail
        $thumbnailPath = $imageDir . '/thumbnail-' . $citySlug . '.jpg';
        imagejpeg($thumbnailImage, $thumbnailPath, 90);
        
        // Clean up
        imagedestroy($sourceImage);
        imagedestroy($thumbnailImage);
        
        echo "Generated thumbnail for $city, $state at $thumbnailPath<br>";
        $processedCities++;
        
        // Update webstory meta tags to include the thumbnail
        if (file_exists($webstoryFile)) {
            $webstoryContent = file_get_contents($webstoryFile);
            $thumbnailUrl = '/images/webstories/thumbnail-' . $citySlug . '.jpg';
            
            // Update or add poster-portrait-src
            $pattern = '/<amp-story.*?poster-portrait-src="[^"]*"/s';
            $replacement = '<amp-story poster-portrait-src="' . $thumbnailUrl . '"';
            $webstoryContent = preg_replace($pattern, $replacement, $webstoryContent);
            
            // Update or add meta image tag
            $metaPattern = '/<meta property="og:image" content="[^"]*"/';
            $metaReplacement = '<meta property="og:image" content="' . $thumbnailUrl . '"';
            
            if (preg_match($metaPattern, $webstoryContent)) {
                $webstoryContent = preg_replace($metaPattern, $metaReplacement, $webstoryContent);
            } else {
                // Add meta tag if it doesn't exist
                $headPattern = '/<head>/';
                $headReplacement = '<head>' . PHP_EOL . '    ' . $metaReplacement;
                $webstoryContent = preg_replace($headPattern, $headReplacement, $webstoryContent);
            }
            
            // Save the updated webstory
            file_put_contents($webstoryFile, $webstoryContent);
            echo "Updated webstory with thumbnail reference: $webstoryFile<br>";
        }
    }
    
    echo "<hr>All operations completed.<br>";
    echo "Generated " . $processedCities . " thumbnails.<br>";
    echo "Skipped " . $skippedCities . " thumbnails (already exist or no webstory).<br>";
} else {
    echo "No cities found in the database.";
}

// Cleanup unused thumbnails
echo "<hr>Cleaning up unused thumbnails:<br>";
$unusedCount = 0;

if (is_dir($imageDir)) {
    $files = scandir($imageDir);
    foreach ($files as $file) {
        // Check if file is a thumbnail
        if (strpos($file, 'thumbnail-') === 0) {
            $citySlug = substr($file, 10, -4); // Remove 'thumbnail-' prefix and '.jpg' suffix
            $webstoryFile = $webstoriesDir . '/' . $citySlug . '.html';
            
            // If webstory doesn't exist, remove the thumbnail
            if (!file_exists($webstoryFile)) {
                unlink($imageDir . '/' . $file);
                echo "Removed unused thumbnail: $file<br>";
                $unusedCount++;
            }
        }
    }
}

echo "Removed " . $unusedCount . " unused thumbnails.<br>";

$conn->close();
?>
