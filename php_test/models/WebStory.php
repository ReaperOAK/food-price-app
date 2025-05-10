<?php
/**
 * WebStory Model
 * 
 * This class handles web story generation and management
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../core/DatabaseConnection.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../utils/FileSystem.php';
require_once __DIR__ . '/../utils/ImageProcessor.php';
require_once __DIR__ . '/../models/Rate.php';

class WebStory {
    private $db;
    private $logger;
    private $rateModel;
    
    // Web story properties
    private $webStoriesPath;
    private $webStoriesImagesPath;
    private $templatePath;
    private $webStoriesUrl;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->db = DatabaseConnection::getInstance();
        $this->logger = Logger::getInstance();
        $this->rateModel = new Rate();
        
        // Set paths
        $this->webStoriesPath = WEBSTORIES_PATH;
        $this->webStoriesImagesPath = WEBSTORIES_IMAGES_PATH;
        $this->templatePath = TEMPLATES_PATH . '/webstory_template.html';
        $this->webStoriesUrl = WEBSTORIES_URL;
        
        // Ensure directories exist
        FileSystem::ensureDirectoryExists($this->webStoriesPath);
        FileSystem::ensureDirectoryExists($this->webStoriesImagesPath);
    }
    
    /**
     * Generate web stories for all cities with the latest rates
     * 
     * @return array Result statistics
     */
    public function generateWebStories() {
        $result = [
            'generated' => 0,
            'skipped' => 0,
            'errors' => []
        ];
        
        // Get template content
        $templateContent = FileSystem::readFile($this->templatePath);
        
        if (empty($templateContent)) {
            $this->logger->error("Web story template not found or empty", "WebStory");
            $result['errors'][] = "Template not found or empty";
            return $result;
        }
        
        // Get latest rates for all cities
        $latestRates = $this->rateModel->getLatestRates();
        
        if (empty($latestRates)) {
            $this->logger->error("No rates found for web story generation", "WebStory");
            $result['errors'][] = "No rates found";
            return $result;
        }
        
        // Generate web stories for each city
        foreach ($latestRates as $rate) {
            $city = isset($rate['city_name']) ? $rate['city_name'] : $rate['city'];
            $state = isset($rate['state_name']) ? $rate['state_name'] : $rate['state'];
            
            // Skip special state
            if (strtolower($state) === 'special') {
                $result['skipped']++;
                continue;
            }
            
            // Generate web story
            $success = $this->generateWebStoryForCity($city, $state, $rate['rate'], $rate['date'], $templateContent);
            
            if ($success) {
                $result['generated']++;
            } else {
                $result['errors'][] = "Failed to generate web story for $city, $state";
            }
        }
        
        return $result;
    }
    
    /**
     * Generate a web story for a specific city
     * 
     * @param string $city City name
     * @param string $state State name
     * @param float $rate Egg rate
     * @param string $date Rate date
     * @param string $templateContent Web story template content
     * @return bool Success status
     */
    private function generateWebStoryForCity($city, $state, $rate, $date, $templateContent) {
        try {
            // Create filename from city name (URL-friendly)
            $filename = $this->sanitizeFilename($city) . '.html';
            $filePath = $this->webStoriesPath . '/' . $filename;
            
            // Generate thumbnail
            $thumbnailPath = $this->webStoriesImagesPath . '/' . $this->sanitizeFilename($city) . '.jpg';
            $thumbnailUrl = BASE_URL . '/images/webstories/' . $this->sanitizeFilename($city) . '.jpg';
            $this->generateThumbnail($city, $state, $rate, $thumbnailPath);
            
            // Format date for display
            $formattedDate = date('d M Y', strtotime($date));
            
            // Replace placeholders in template
            $storyContent = str_replace(
                [
                    '{{CITY}}',
                    '{{STATE}}',
                    '{{RATE}}',
                    '{{DATE}}',
                    '{{THUMBNAIL_URL}}',
                    '{{STORY_URL}}',
                    '{{BASE_URL}}'
                ],
                [
                    $city,
                    $state,
                    $rate,
                    $formattedDate,
                    $thumbnailUrl,
                    $this->webStoriesUrl . '/' . $filename,
                    BASE_URL
                ],
                $templateContent
            );
            
            // Save web story file
            $result = FileSystem::writeFile($filePath, $storyContent);
            
            if (!$result) {
                throw new Exception("Failed to write web story file: $filePath");
            }
            
            $this->logger->info("Generated web story for $city, $state", "WebStory");
            return true;
        } catch (Exception $e) {
            $this->logger->error("Error generating web story: " . $e->getMessage(), "WebStory");
            return false;
        }
    }
    
    /**
     * Generate a thumbnail image for a web story
     * 
     * @param string $city City name
     * @param string $state State name
     * @param float $rate Egg rate
     * @param string $thumbnailPath Path to save the thumbnail
     * @return bool Success status
     */
    public function generateThumbnail($city, $state, $rate, $thumbnailPath) {
        try {
            // Create a blank canvas (600x900 pixels)
            $image = imagecreatetruecolor(600, 900);
            
            if (!$image) {
                throw new Exception("Failed to create thumbnail image");
            }
            
            // Set colors
            $white = imagecolorallocate($image, 255, 255, 255);
            $black = imagecolorallocate($image, 0, 0, 0);
            $blue = imagecolorallocate($image, 30, 144, 255);
            
            // Fill background
            imagefilledrectangle($image, 0, 0, 600, 900, $white);
            
            // Draw header background
            imagefilledrectangle($image, 0, 0, 600, 150, $blue);
            
            // Add title
            $title = "Egg Rate Today";
            $font = 4; // Built-in font
            $titleWidth = imagefontwidth($font) * strlen($title);
            $titleX = (600 - $titleWidth) / 2;
            imagestring($image, $font, $titleX, 50, $title, $white);
            
            // Add city and state
            $locationText = "$city, $state";
            $locationWidth = imagefontwidth($font) * strlen($locationText);
            $locationX = (600 - $locationWidth) / 2;
            imagestring($image, $font, $locationX, 200, $locationText, $black);
            
            // Add rate
            $rateText = "₹ $rate per 100";
            $rateWidth = imagefontwidth($font) * strlen($rateText);
            $rateX = (600 - $rateWidth) / 2;
            imagestring($image, $font, $rateX, 300, $rateText, $black);
            
            // Add current date
            $dateText = date('d M Y');
            $dateWidth = imagefontwidth($font) * strlen($dateText);
            $dateX = (600 - $dateWidth) / 2;
            imagestring($image, $font, $dateX, 400, $dateText, $black);
            
            // Add watermark
            $watermark = "Egg Rate Today";
            $watermarkWidth = imagefontwidth(3) * strlen($watermark);
            $watermarkX = (600 - $watermarkWidth) / 2;
            imagestring($image, 3, $watermarkX, 850, $watermark, $black);
            
            // Save the image
            $result = imagejpeg($image, $thumbnailPath, 90);
            imagedestroy($image);
            
            if (!$result) {
                throw new Exception("Failed to save thumbnail image: $thumbnailPath");
            }
            
            return true;
        } catch (Exception $e) {
            $this->logger->error("Error generating thumbnail: " . $e->getMessage(), "WebStory");
            return false;
        }
    }
    
    /**
     * Update thumbnails for all web stories
     * 
     * @return array Result statistics
     */
    public function updateWebStoryThumbnails() {
        $result = [
            'updated' => 0,
            'skipped' => 0,
            'errors' => []
        ];
        
        // Get all web story HTML files
        $webStoryFiles = FileSystem::listFiles($this->webStoriesPath, '*.html');
        
        if (empty($webStoryFiles) || $webStoryFiles === false) {
            $this->logger->error("No web story files found", "WebStory");
            $result['errors'][] = "No web story files found";
            return $result;
        }
        
        foreach ($webStoryFiles as $file) {
            $basename = basename($file, '.html');
            $city = $this->unsanitizeFilename($basename);
            
            try {
                // Get state and rate for this city
                $rateData = $this->rateModel->getLatestRate($city, null);
                
                if (empty($rateData)) {
                    $result['skipped']++;
                    $this->logger->warning("No rate data found for $city", "WebStory");
                    continue;
                }
                
                $state = isset($rateData['state_name']) ? $rateData['state_name'] : $rateData['state'];
                $rate = $rateData['rate'];
                
                // Generate thumbnail
                $thumbnailPath = $this->webStoriesImagesPath . '/' . $basename . '.jpg';
                $thumbnailUrl = BASE_URL . '/images/webstories/' . $basename . '.jpg';
                
                $success = $this->generateThumbnail($city, $state, $rate, $thumbnailPath);
                
                if ($success) {
                    // Update thumbnail URL in the web story HTML
                    $content = FileSystem::readFile($file);
                    
                    if (!empty($content)) {
                        // Replace thumbnail URL in meta tags
                        $pattern = '/<meta property="og:image" content="([^"]+)">/';
                        $replacement = '<meta property="og:image" content="' . $thumbnailUrl . '">';
                        $content = preg_replace($pattern, $replacement, $content);
                        
                        FileSystem::writeFile($file, $content);
                    }
                    
                    $result['updated']++;
                } else {
                    $result['errors'][] = "Failed to update thumbnail for $city";
                }
            } catch (Exception $e) {
                $result['errors'][] = "Error updating thumbnail for $city: " . $e->getMessage();
                $this->logger->error("Error updating thumbnail: " . $e->getMessage(), "WebStory");
            }
        }
        
        return $result;
    }
    
    /**
     * Delete old web stories
     * 
     * @param int $days Number of days to consider a story outdated
     * @return array Result statistics
     */
    public function deleteOldWebStories($days = null) {
        if ($days === null) {
            $days = defined('WEBSTORY_EXPIRY_DAYS') ? WEBSTORY_EXPIRY_DAYS : 7;
        }
        
        $result = [
            'deleted' => 0,
            'errors' => []
        ];
        
        // Get all web story HTML files
        $webStoryFiles = FileSystem::listFiles($this->webStoriesPath, '*.html');
        
        if (empty($webStoryFiles) || $webStoryFiles === false) {
            $this->logger->error("No web story files found", "WebStory");
            $result['errors'][] = "No web story files found";
            return $result;
        }
        
        // Get latest rates
        $latestRates = $this->rateModel->getLatestRates();
        $latestRatesByCity = [];
        
        foreach ($latestRates as $rate) {
            $city = isset($rate['city_name']) ? $rate['city_name'] : $rate['city'];
            $latestRatesByCity[$city] = strtotime($rate['date']);
        }
        
        $currentTime = time();
        $cutoffTime = $currentTime - ($days * 86400); // 86400 seconds = 1 day
        
        foreach ($webStoryFiles as $file) {
            $basename = basename($file, '.html');
            $city = $this->unsanitizeFilename($basename);
            
            // Check if city has a recent rate
            if (!isset($latestRatesByCity[$city]) || $latestRatesByCity[$city] < $cutoffTime) {
                // Delete the web story file
                $deleteResult = FileSystem::deleteFile($file);
                
                // Also delete the thumbnail if it exists
                $thumbnailPath = $this->webStoriesImagesPath . '/' . $basename . '.jpg';
                if (file_exists($thumbnailPath)) {
                    FileSystem::deleteFile($thumbnailPath);
                }
                
                if ($deleteResult) {
                    $result['deleted']++;
                    $this->logger->info("Deleted outdated web story for $city", "WebStory");
                } else {
                    $result['errors'][] = "Failed to delete web story for $city";
                    $this->logger->error("Failed to delete web story for $city", "WebStory");
                }
            }
        }
        
        return $result;
    }
    
    /**
     * Generate a sitemap for web stories
     * 
     * @return bool Success status
     */
    public function generateSitemap() {
        try {
            // Get all web story HTML files
            $webStoryFiles = FileSystem::listFiles($this->webStoriesPath, '*.html');
            
            if (empty($webStoryFiles) || $webStoryFiles === false) {
                $this->logger->error("No web story files found for sitemap", "WebStory");
                return false;
            }
            
            // Create XML sitemap header
            $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
            
            // Create text sitemap
            $txtSitemap = '';
            
            foreach ($webStoryFiles as $file) {
                $filename = basename($file);
                $url = $this->webStoriesUrl . '/' . $filename;
                
                // Add URL to XML sitemap
                $xml .= "  <url>\n";
                $xml .= "    <loc>" . htmlspecialchars($url) . "</loc>\n";
                $xml .= "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
                $xml .= "    <changefreq>daily</changefreq>\n";
                $xml .= "    <priority>0.8</priority>\n";
                $xml .= "  </url>\n";
                
                // Add URL to text sitemap
                $txtSitemap .= $url . "\n";
            }
            
            // Close XML sitemap
            $xml .= '</urlset>';
            
            // Save XML sitemap
            $xmlSitemapPath = $this->webStoriesPath . '/sitemap.xml';
            $resultXml = FileSystem::writeFile($xmlSitemapPath, $xml);
            
            // Save text sitemap
            $txtSitemapPath = $this->webStoriesPath . '/sitemap.txt';
            $resultTxt = FileSystem::writeFile($txtSitemapPath, $txtSitemap);
            
            if (!$resultXml || !$resultTxt) {
                throw new Exception("Failed to write sitemap files");
            }
            
            $this->logger->info("Generated web stories sitemap with " . count($webStoryFiles) . " URLs", "WebStory");
            return true;
        } catch (Exception $e) {
            $this->logger->error("Error generating web stories sitemap: " . $e->getMessage(), "WebStory");
            return false;
        }
    }
    
    /**
     * Get web stories list
     * 
     * @return array List of web stories
     */
    public function getWebStories() {
        $stories = [];
        
        // Get all web story HTML files
        $webStoryFiles = FileSystem::listFiles($this->webStoriesPath, '*.html');
        
        if (empty($webStoryFiles) || $webStoryFiles === false) {
            return $stories;
        }
        
        foreach ($webStoryFiles as $file) {
            $filename = basename($file);
            $basename = basename($file, '.html');
            $city = $this->unsanitizeFilename($basename);
            
            // Get thumbnail path
            $thumbnailPath = $this->webStoriesImagesPath . '/' . $basename . '.jpg';
            $thumbnailUrl = file_exists($thumbnailPath) ? 
                BASE_URL . '/images/webstories/' . $basename . '.jpg' : 
                '';
            
            $stories[] = [
                'city' => $city,
                'url' => $this->webStoriesUrl . '/' . $filename,
                'thumbnail' => $thumbnailUrl
            ];
        }
        
        return $stories;
    }
    
    /**
     * Sanitize a filename from a city name
     * 
     * @param string $cityName City name
     * @return string Sanitized filename (without extension)
     */
    private function sanitizeFilename($cityName) {
        // Convert to lowercase
        $filename = strtolower($cityName);
        
        // Replace spaces and special characters
        $filename = preg_replace('/[^a-z0-9]/', '-', $filename);
        
        // Remove multiple consecutive dashes
        $filename = preg_replace('/-+/', '-', $filename);
        
        // Remove leading or trailing dashes
        $filename = trim($filename, '-');
        
        return $filename;
    }
    
    /**
     * Convert sanitized filename back to city name (approximate)
     * 
     * @param string $filename Sanitized filename (without extension)
     * @return string City name
     */
    private function unsanitizeFilename($filename) {
        // Replace dashes with spaces
        $cityName = str_replace('-', ' ', $filename);
        
        // Capitalize words
        $cityName = ucwords($cityName);
        
        return $cityName;
    }
}
