<?php
/**
 * ImageProcessor Class
 * 
 * This class provides image manipulation utilities
 */

require_once __DIR__ . '/Logger.php';
require_once __DIR__ . '/FileSystem.php';

class ImageProcessor {
    /**
     * Resize an image while maintaining aspect ratio
     * 
     * @param string $sourcePath Source image path
     * @param string $destinationPath Destination path
     * @param int $width Target width
     * @param int $height Target height
     * @param bool $crop Whether to crop the image to fit exact dimensions
     * @return bool Success status
     */
    public static function resizeImage($sourcePath, $destinationPath, $width, $height, $crop = false) {
        $logger = Logger::getInstance();
        
        if (!file_exists($sourcePath)) {
            $logger->error("Source image does not exist: $sourcePath", 'ImageProcessor');
            return false;
        }
        
        // Get image dimensions
        list($origWidth, $origHeight, $type) = getimagesize($sourcePath);
        
        if (!$origWidth || !$origHeight) {
            $logger->error("Failed to get source image dimensions: $sourcePath", 'ImageProcessor');
            return false;
        }
        
        // Calculate aspect ratios
        $ratioOrig = $origWidth / $origHeight;
        $ratio = $width / $height;
        
        // Determine dimensions based on crop setting
        if ($crop) {
            // If crop is enabled, maintain target dimensions and crop as needed
            if ($ratioOrig > $ratio) {
                // Image is wider than needed
                $newWidth = $origHeight * $ratio;
                $newHeight = $origHeight;
                $srcX = ($origWidth - $newWidth) / 2;
                $srcY = 0;
            } else {
                // Image is taller than needed
                $newWidth = $origWidth;
                $newHeight = $origWidth / $ratio;
                $srcX = 0;
                $srcY = ($origHeight - $newHeight) / 2;
            }
        } else {
            // If crop is disabled, maintain aspect ratio
            if ($ratioOrig > $ratio) {
                // Width constrains the size
                $newWidth = $width;
                $newHeight = $width / $ratioOrig;
            } else {
                // Height constrains the size
                $newHeight = $height;
                $newWidth = $height * $ratioOrig;
            }
            $srcX = 0;
            $srcY = 0;
        }
        
        // Create source and destination image resources
        $sourceResource = self::createImageResource($sourcePath, $type);
        if (!$sourceResource) {
            return false;
        }
        
        $destResource = imagecreatetruecolor($width, $height);
        if (!$destResource) {
            $logger->error("Failed to create destination image resource", 'ImageProcessor');
            imagedestroy($sourceResource);
            return false;
        }
        
        // Set transparent background for PNG images
        if ($type === IMAGETYPE_PNG) {
            imagealphablending($destResource, false);
            imagesavealpha($destResource, true);
            $transparent = imagecolorallocatealpha($destResource, 255, 255, 255, 127);
            imagefilledrectangle($destResource, 0, 0, $width, $height, $transparent);
        }
        
        // Resize image
        if ($crop) {
            $result = imagecopyresampled(
                $destResource,
                $sourceResource,
                0, 0, $srcX, $srcY,
                $width, $height,
                $newWidth, $newHeight
            );
        } else {
            // Calculate position for centering
            $destX = ($width - $newWidth) / 2;
            $destY = ($height - $newHeight) / 2;
            
            // Fill background with white if not PNG
            if ($type !== IMAGETYPE_PNG) {
                $white = imagecolorallocate($destResource, 255, 255, 255);
                imagefilledrectangle($destResource, 0, 0, $width, $height, $white);
            }
            
            $result = imagecopyresampled(
                $destResource,
                $sourceResource,
                $destX, $destY, 0, 0,
                $newWidth, $newHeight,
                $origWidth, $origHeight
            );
        }
        
        if (!$result) {
            $logger->error("Failed to resize image", 'ImageProcessor');
            imagedestroy($sourceResource);
            imagedestroy($destResource);
            return false;
        }
        
        // Ensure destination directory exists
        FileSystem::ensureDirectoryExists(dirname($destinationPath));
        
        // Save the image
        $saveResult = self::saveImageResource($destResource, $destinationPath, $type);
        
        // Clean up resources
        imagedestroy($sourceResource);
        imagedestroy($destResource);
        
        return $saveResult;
    }
    
    /**
     * Add text overlay to an image
     * 
     * @param string $imagePath Image path
     * @param string $text Text to add
     * @param int $x X position
     * @param int $y Y position
     * @param int $fontSize Font size in points
     * @param array $color RGB color array [r, g, b]
     * @param string $fontPath Path to TTF font file (optional)
     * @return bool Success status
     */
    public static function addTextOverlay($imagePath, $text, $x, $y, $fontSize, $color = [255, 255, 255], $fontPath = null) {
        $logger = Logger::getInstance();
        
        if (!file_exists($imagePath)) {
            $logger->error("Image does not exist: $imagePath", 'ImageProcessor');
            return false;
        }
        
        // Get image type
        list(, , $type) = getimagesize($imagePath);
        
        // Create image resource
        $imageResource = self::createImageResource($imagePath, $type);
        if (!$imageResource) {
            return false;
        }
        
        // Set font path or use default
        if ($fontPath === null || !file_exists($fontPath)) {
            $fontPath = 4; // Use built-in font
            $textColor = imagecolorallocate($imageResource, $color[0], $color[1], $color[2]);
            
            // Add text
            $result = imagestring($imageResource, $fontPath, $x, $y, $text, $textColor);
        } else {
            $textColor = imagecolorallocate($imageResource, $color[0], $color[1], $color[2]);
            
            // Add text with TrueType font
            $result = imagettftext($imageResource, $fontSize, 0, $x, $y, $textColor, $fontPath, $text);
        }
        
        if (!$result) {
            $logger->error("Failed to add text overlay", 'ImageProcessor');
            imagedestroy($imageResource);
            return false;
        }
        
        // Save the image
        $saveResult = self::saveImageResource($imageResource, $imagePath, $type);
        
        // Clean up
        imagedestroy($imageResource);
        
        return $saveResult;
    }
    
    /**
     * Create an image resource from a file
     * 
     * @param string $imagePath Image path
     * @param int $type Image type constant
     * @return resource|false Image resource or false on failure
     */
    public static function createImageResource($imagePath, $type) {
        $logger = Logger::getInstance();
        
        switch ($type) {
            case IMAGETYPE_JPEG:
                $resource = imagecreatefromjpeg($imagePath);
                break;
            case IMAGETYPE_PNG:
                $resource = imagecreatefrompng($imagePath);
                break;
            case IMAGETYPE_GIF:
                $resource = imagecreatefromgif($imagePath);
                break;
            case IMAGETYPE_WEBP:
                $resource = imagecreatefromwebp($imagePath);
                break;
            default:
                $logger->error("Unsupported image type: $type", 'ImageProcessor');
                return false;
        }
        
        if (!$resource) {
            $logger->error("Failed to create image resource from: $imagePath", 'ImageProcessor');
            return false;
        }
        
        return $resource;
    }
    
    /**
     * Save an image resource to a file
     * 
     * @param resource $resource Image resource
     * @param string $imagePath Destination path
     * @param int $type Image type constant
     * @param int $quality JPEG quality (1-100)
     * @return bool Success status
     */
    public static function saveImageResource($resource, $imagePath, $type, $quality = 90) {
        $logger = Logger::getInstance();
        
        switch ($type) {
            case IMAGETYPE_JPEG:
                $result = imagejpeg($resource, $imagePath, $quality);
                break;
            case IMAGETYPE_PNG:
                $result = imagepng($resource, $imagePath, 9); // Compression level 0-9
                break;
            case IMAGETYPE_GIF:
                $result = imagegif($resource, $imagePath);
                break;
            case IMAGETYPE_WEBP:
                $result = imagewebp($resource, $imagePath, $quality);
                break;
            default:
                $logger->error("Unsupported image type for saving: $type", 'ImageProcessor');
                return false;
        }
        
        if (!$result) {
            $logger->error("Failed to save image to: $imagePath", 'ImageProcessor');
            return false;
        }
        
        return true;
    }
    
    /**
     * Get image type from file path
     * 
     * @param string $imagePath Image path
     * @return int|false Image type constant or false on failure
     */
    public static function getImageType($imagePath) {
        if (!file_exists($imagePath)) {
            return false;
        }
        
        $info = getimagesize($imagePath);
        
        if ($info === false) {
            return false;
        }
        
        return $info[2];
    }
    
    /**
     * Create a thumbnail image
     * 
     * @param string $sourcePath Source image path
     * @param string $thumbnailPath Destination path
     * @param int $width Thumbnail width
     * @param int $height Thumbnail height
     * @return bool Success status
     */
    public static function createThumbnail($sourcePath, $thumbnailPath, $width, $height) {
        return self::resizeImage($sourcePath, $thumbnailPath, $width, $height, true);
    }
}
