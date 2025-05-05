<?php
// This script should be included by generate_web_stories.php or can be run independently
if(!defined('THUMBNAIL_SCRIPT_RUNNING')) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
    ini_set('error_log', dirname(dirname(__FILE__)) . '/error.log');
    define('THUMBNAIL_SCRIPT_RUNNING', true);
}

function log_thumbnail($message) {
    error_log(date('Y-m-d H:i:s') . " [THUMBNAILS] " . $message);
    if(!defined('INCLUDED_SCRIPT')) {
        echo $message . "<br>";
    }
}

try {
    log_thumbnail("Starting thumbnail generation");
    
    // Set up directories
    $basePath = dirname(dirname(dirname(__FILE__)));
    $webstoriesDir = $basePath . '/webstories';
    $thumbnailsDir = $basePath . '/images/webstories';
    
    // Create thumbnails directory if it doesn't exist
    if (!file_exists($thumbnailsDir)) {
        mkdir($thumbnailsDir, 0777, true);
        log_thumbnail("Created thumbnails directory: " . $thumbnailsDir);
    }
    
    // Check if we have sample images to use
    $sampleImagesAvailable = false;
    $sampleImagesDir = $thumbnailsDir;
    if (file_exists($sampleImagesDir)) {
        $sampleImages = glob($sampleImagesDir . "/*.jpg");
        if (count($sampleImages) > 0) {
            $sampleImagesAvailable = true;
            log_thumbnail("Found " . count($sampleImages) . " sample images for thumbnails");
        }
    }
    
    if (!$sampleImagesAvailable) {
        log_thumbnail("No sample images found for thumbnails");
        return;
    }
    
    // Get all web story HTML files
    $webstoryFiles = glob($webstoriesDir . "/*.html");
    $totalThumbnails = 0;
    
    foreach ($webstoryFiles as $webstoryFile) {
        // Get the slug (filename without extension)
        $slug = pathinfo($webstoryFile, PATHINFO_FILENAME);
        
        // For simplicity, we'll use a sample image as the thumbnail
        // In a real implementation, you might want to generate actual screenshots
        $randomSampleImage = $sampleImages[array_rand($sampleImages)];
        $thumbnailDestination = $thumbnailsDir . "/" . $slug . ".jpg";
        
        // Copy sample image as thumbnail
        if (copy($randomSampleImage, $thumbnailDestination)) {
            $totalThumbnails++;
            log_thumbnail("Created thumbnail for " . $slug);
        } else {
            log_thumbnail("Failed to create thumbnail for " . $slug);
        }
    }
    
    log_thumbnail("Thumbnail generation complete - created " . $totalThumbnails . " thumbnails");

} catch (Exception $e) {
    log_thumbnail("Error: " . $e->getMessage());
}
?>
