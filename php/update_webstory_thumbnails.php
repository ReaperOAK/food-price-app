<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if GD library is available
if (!extension_loaded('gd')) {
    die("Error: GD library is not available. Please install it for image processing.");
}

// Configuration
$imageDir = '../images/webstories';
$thumbnailWidth = 400;
$thumbnailHeight = 300;

// Create the images directory if it doesn't exist
if (!file_exists($imageDir)) {
    mkdir($imageDir, 0755, true);
}

// Default background images for various cities
$backgroundImages = [
    'default' => 'eggpic.png',
];

// Database connection
include 'db.php';

// Get all cities from database
$sql = "SELECT DISTINCT city FROM egg_rates ORDER BY city";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $city = $row['city'];
        $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
        
        // Determine which background image to use
        $backgroundFile = $backgroundImages['default'];
        $cityLower = strtolower($city);
        if (isset($backgroundImages[$cityLower])) {
            $backgroundFile = $backgroundImages[$cityLower];
        }
        
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
        
        // Add city name text overlay
        $textColor = imagecolorallocate($thumbnailImage, 255, 255, 255);
        $shadowColor = imagecolorallocate($thumbnailImage, 0, 0, 0);
        $font = 5; // Built-in font
        
        // Get text dimensions
        $textWidth = imagefontwidth($font) * strlen($city);
        $textHeight = imagefontheight($font);
        
        // Calculate position for centered text
        $textX = ($thumbnailWidth - $textWidth) / 2;
        $textY = $thumbnailHeight - $textHeight - 10;
        
        // Draw text shadow
        imagestring($thumbnailImage, $font, $textX + 1, $textY + 1, $city, $shadowColor);
        
        // Draw text
        imagestring($thumbnailImage, $font, $textX, $textY, $city, $textColor);
        
        // Save the thumbnail
        $thumbnailPath = $imageDir . '/thumbnail-' . $citySlug . '.jpg';
        imagejpeg($thumbnailImage, $thumbnailPath, 90);
        
        // Clean up
        imagedestroy($sourceImage);
        imagedestroy($thumbnailImage);
        
        echo "Generated thumbnail for $city at $thumbnailPath<br>";
    }
    
    echo "All thumbnails generated successfully.";
} else {
    echo "No cities found in the database.";
}

$conn->close();
?>
