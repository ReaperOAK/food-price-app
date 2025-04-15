<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
include 'db.php';

// Include the function to delete old web stories
include_once 'delete_old_webstories.php';

// Configuration
$storiesDir = '../webstories';
$imageDir = '../images/webstories';
$templateFile = '../templates/webstory_template.html';

// Create the stories directory if it doesn't exist
if (!file_exists($storiesDir)) {
    mkdir($storiesDir, 0755, true);
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
            $backgroundImages[] = '/images/webstories/' . $file;
        }
    }
}

// If no images found, use a default image
if (empty($backgroundImages)) {
    $backgroundImages[] = '/images/webstories/eggpic.png';
}

// Get the web story template
$template = file_get_contents($templateFile);
if (!$template) {
    die("Error: Could not load template file");
}

// Get today's date
$today = date('Y-m-d');

// Clean up old web stories first - but don't close the connection
$daysToKeep = 3;
deleteOldWebStories($storiesDir, $imageDir, $daysToKeep, $conn, false);

// Get the latest egg rates
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

if ($result->num_rows > 0) {
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
            echo "Error: Could not write to file $filename<br>";
        }
    }
    
    // Generate an index file for all web stories
    generateWebStoryIndex($storiesDir, $conn);
    
    echo "Generated $storiesGenerated web stories successfully.";
} else {
    echo "No egg rates found.";
}

// Function to generate thumbnail for a web story
function generateThumbnail($imageDir, $city, $citySlug, $sourceImage) {
    // Extract filename from source image path
    $sourceFilename = basename($sourceImage);
    $sourceImagePath = $imageDir . '/' . $sourceFilename;
    
    // Ensure source file exists
    if (!file_exists($sourceImagePath)) {
        // Try with the path as is (it might be a full path)
        $sourceImagePath = $_SERVER['DOCUMENT_ROOT'] . $sourceImage;
        if (!file_exists($sourceImagePath)) {
            return false;
        }
    }
    
    // Configuration
    $thumbnailWidth = 400;
    $thumbnailHeight = 300;
    
    // Get image type
    $imageInfo = getimagesize($sourceImagePath);
    if ($imageInfo === false) {
        return false;
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
    imagejpeg($thumbnailImage, $thumbnailPath, 90);
    
    // Clean up
    imagedestroy($sourceImage);
    imagedestroy($thumbnailImage);
    
    return true;
}

// Function to generate an index file for all web stories
function generateWebStoryIndex($storiesDir, $conn) {
    $indexFile = $storiesDir . '/index.html';
    
    // Get the latest egg rates for all cities
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
    
    $html = '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Egg Rate Web Stories - Today Egg Rates</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .stories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }
        .story-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s ease;
        }
        .story-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .story-thumbnail {
            height: 150px;
            background-size: cover;
            background-position: center;
            position: relative;
        }
        .story-info {
            padding: 15px;
        }
        .story-title {
            font-weight: bold;
            font-size: 18px;
            margin: 0 0 10px 0;
        }
        .story-date {
            color: #666;
            font-size: 14px;
        }
        .story-rate {
            color: #e63946;
            font-weight: bold;
        }
        a {
            text-decoration: none;
            color: inherit;
        }
    </style>
</head>
<body>
    <h1>Egg Rate Web Stories</h1>
    <div class="stories-grid">';
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $city = $row['city'];
            $state = $row['state'];
            $rate = $row['rate'];
            $date = $row['date'];
            
            // Create a URL-friendly city name
            $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
            
            // Format date for display
            $displayDate = date('F j, Y', strtotime($date));
            
            // Add card to grid
            $html .= '
        <a href="/' . $citySlug . '-egg-rate.html" class="story-card">
            <div class="story-thumbnail" style="background-image: url(\'/images/webstories/thumbnail-' . $citySlug . '.jpg\');">
            </div>
            <div class="story-info">
                <h3 class="story-title">Egg Rate in ' . $city . ', ' . $state . '</h3>
                <p class="story-date">' . $displayDate . '</p>
                <p class="story-rate">₹' . $rate . ' per egg</p>
            </div>
        </a>';
        }
    }
    
    $html .= '
    </div>
</body>
</html>';
    
    file_put_contents($indexFile, $html);
}

// Generate a web stories sitemap after creating all stories
include_once 'generate_webstories_sitemap.php';

// Connection is already closed in generate_webstories_sitemap.php, so don't close it again
?>
