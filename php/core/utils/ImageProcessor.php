<?php
/**
 * ImageProcessor.php
 * Helper class for image processing operations
 */

namespace FoodPriceApp\Core\Utils;

use FoodPriceApp\Core\Utils\Logger;
use Exception;

class ImageProcessor {
    private Logger $logger;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->logger = new Logger('IMAGE_PROCESSOR');
    }
    
    /**
     * Determine the image type from file
     * 
     * @param string $imagePath Path to the image file
     * @return string|null Image MIME type or null on failure
     */
    public function determineImageType(string $imagePath): ?string {
        if (!file_exists($imagePath)) {
            $this->logger->error("Image file does not exist: " . $imagePath);
            return null;
        }
        
        $imageInfo = getimagesize($imagePath);
        
        if ($imageInfo === false) {
            $this->logger->error("Failed to get image info: " . $imagePath);
            return null;
        }
        
        return $imageInfo['mime'];
    }
    
    /**
     * Create image resource from file
     * 
     * @param string $imagePath Path to image file
     * @return resource|false Image resource or false on failure
     */
    public function createImageResource(string $imagePath) {
        $imageType = $this->determineImageType($imagePath);
        
        if ($imageType === null) {
            return false;
        }
        
        switch ($imageType) {
            case 'image/jpeg':
                return imagecreatefromjpeg($imagePath);
            case 'image/png':
                return imagecreatefrompng($imagePath);
            case 'image/gif':
                return imagecreatefromgif($imagePath);
            case 'image/webp':
                return imagecreatefromwebp($imagePath);
            default:
                $this->logger->error("Unsupported image type: " . $imageType);
                return false;
        }
    }
    
    /**
     * Save image resource to file
     * 
     * @param resource $image Image resource
     * @param string $outputPath Path to save image
     * @param string $imageType Image MIME type
     * @param int $quality Image quality (0-100 for JPEG)
     * @return bool Success status
     */
    public function saveImageResource($image, string $outputPath, string $imageType = 'image/jpeg', int $quality = 90): bool {
        if (!$image) {
            $this->logger->error("Invalid image resource");
            return false;
        }
        
        try {
            // Create directory if it doesn't exist
            $directory = dirname($outputPath);
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }
            
            switch ($imageType) {
                case 'image/jpeg':
                    return imagejpeg($image, $outputPath, $quality);
                case 'image/png':
                    // PNG quality is 0-9, so convert
                    $pngQuality = round((100 - $quality) / 11.1);
                    return imagepng($image, $outputPath, $pngQuality);
                case 'image/gif':
                    return imagegif($image, $outputPath);
                case 'image/webp':
                    return imagewebp($image, $outputPath, $quality);
                default:
                    $this->logger->error("Unsupported output image type: " . $imageType);
                    return false;
            }
        } catch (Exception $e) {
            $this->logger->error("Error saving image: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Resize an image maintaining aspect ratio
     * 
     * @param string $inputPath Input image path
     * @param string $outputPath Output image path
     * @param int $maxWidth Maximum width
     * @param int $maxHeight Maximum height
     * @param string $outputType Output image type
     * @param int $quality Output image quality
     * @return bool Success status
     */
    public function resizeImage(
        string $inputPath, 
        string $outputPath, 
        int $maxWidth, 
        int $maxHeight, 
        string $outputType = 'image/jpeg', 
        int $quality = 90
    ): bool {
        try {
            // Create source image
            $sourceImage = $this->createImageResource($inputPath);
            
            if (!$sourceImage) {
                $this->logger->error("Failed to create source image: " . $inputPath);
                return false;
            }
            
            // Get source dimensions
            $sourceWidth = imagesx($sourceImage);
            $sourceHeight = imagesy($sourceImage);
            
            // Calculate new dimensions preserving aspect ratio
            $ratio = min($maxWidth / $sourceWidth, $maxHeight / $sourceHeight);
            $newWidth = round($sourceWidth * $ratio);
            $newHeight = round($sourceHeight * $ratio);
            
            // Create destination image
            $destImage = imagecreatetruecolor($newWidth, $newHeight);
            
            // For PNG and WebP, preserve alpha channel
            if ($outputType === 'image/png' || $outputType === 'image/webp') {
                imagealphablending($destImage, false);
                imagesavealpha($destImage, true);
                $transparent = imagecolorallocatealpha($destImage, 255, 255, 255, 127);
                imagefilledrectangle($destImage, 0, 0, $newWidth, $newHeight, $transparent);
            }
            
            // Resize the image
            imagecopyresampled(
                $destImage, $sourceImage,
                0, 0, 0, 0,
                $newWidth, $newHeight, $sourceWidth, $sourceHeight
            );
            
            // Save the image
            $result = $this->saveImageResource($destImage, $outputPath, $outputType, $quality);
            
            // Free memory
            imagedestroy($sourceImage);
            imagedestroy($destImage);
            
            return $result;
        } catch (Exception $e) {
            $this->logger->error("Error resizing image: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Add text overlay to an image
     * 
     * @param string $inputPath Input image path
     * @param string $outputPath Output image path
     * @param string $text Text to overlay
     * @param int $fontSize Font size in points
     * @param array $position [x, y] position of text
     * @param array $color [r, g, b] color components
     * @param string $fontPath Path to TTF font file
     * @param string $outputType Output image type
     * @param int $quality Output image quality
     * @return bool Success status
     */
    public function addTextOverlay(
        string $inputPath, 
        string $outputPath, 
        string $text, 
        int $fontSize = 20, 
        array $position = [10, 30], 
        array $color = [255, 255, 255], 
        string $fontPath = '', 
        string $outputType = 'image/jpeg', 
        int $quality = 90
    ): bool {
        try {
            // Create source image
            $image = $this->createImageResource($inputPath);
            
            if (!$image) {
                $this->logger->error("Failed to create image for overlay: " . $inputPath);
                return false;
            }
            
            // Allocate color
            $textColor = imagecolorallocate($image, $color[0], $color[1], $color[2]);
            
            // Add text to image
            if (!empty($fontPath) && file_exists($fontPath)) {
                // Use TrueType font
                imagettftext($image, $fontSize, 0, $position[0], $position[1], $textColor, $fontPath, $text);
            } else {
                // Use built-in font
                $fontSize = min(5, max(1, floor($fontSize / 10))); // Convert point size to built-in font size (1-5)
                imagestring($image, $fontSize, $position[0], $position[1], $text, $textColor);
            }
            
            // Save the image
            $result = $this->saveImageResource($image, $outputPath, $outputType, $quality);
            
            // Free memory
            imagedestroy($image);
            
            return $result;
        } catch (Exception $e) {
            $this->logger->error("Error adding text overlay: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Create a composite image with another image overlay
     * 
     * @param string $baseImagePath Path to base image
     * @param string $overlayImagePath Path to overlay image
     * @param string $outputPath Output image path
     * @param int $posX X position of overlay
     * @param int $posY Y position of overlay
     * @param int $opacity Overlay opacity (0-100)
     * @param string $outputType Output image type
     * @param int $quality Output image quality
     * @return bool Success status
     */
    public function addImageOverlay(
        string $baseImagePath, 
        string $overlayImagePath, 
        string $outputPath, 
        int $posX = 0, 
        int $posY = 0, 
        int $opacity = 100, 
        string $outputType = 'image/jpeg', 
        int $quality = 90
    ): bool {
        try {
            // Create base image
            $baseImage = $this->createImageResource($baseImagePath);
            
            if (!$baseImage) {
                $this->logger->error("Failed to create base image: " . $baseImagePath);
                return false;
            }
            
            // Create overlay image
            $overlayImage = $this->createImageResource($overlayImagePath);
            
            if (!$overlayImage) {
                $this->logger->error("Failed to create overlay image: " . $overlayImagePath);
                imagedestroy($baseImage);
                return false;
            }
            
            // Get dimensions
            $baseWidth = imagesx($baseImage);
            $baseHeight = imagesy($baseImage);
            $overlayWidth = imagesx($overlayImage);
            $overlayHeight = imagesy($overlayImage);
            
            // Apply opacity if less than 100%
            if ($opacity < 100) {
                // Create a new image for blending
                $blendImage = imagecreatetruecolor($overlayWidth, $overlayHeight);
                
                // Fill with transparent color
                imagealphablending($blendImage, false);
                imagesavealpha($blendImage, true);
                $transparent = imagecolorallocatealpha($blendImage, 0, 0, 0, 127);
                imagefilledrectangle($blendImage, 0, 0, $overlayWidth, $overlayHeight, $transparent);
                
                // Set the opacity
                imagecopymerge($blendImage, $overlayImage, 0, 0, 0, 0, $overlayWidth, $overlayHeight, $opacity);
                
                // Replace overlay with the blended version
                imagedestroy($overlayImage);
                $overlayImage = $blendImage;
            }
            
            // Merge images
            imagecopy(
                $baseImage, $overlayImage,
                $posX, $posY, 0, 0,
                $overlayWidth, $overlayHeight
            );
            
            // Save the result
            $result = $this->saveImageResource($baseImage, $outputPath, $outputType, $quality);
            
            // Free memory
            imagedestroy($baseImage);
            imagedestroy($overlayImage);
            
            return $result;
        } catch (Exception $e) {
            $this->logger->error("Error adding image overlay: " . $e->getMessage());
            return false;
        }
    }
}
?>
