<?php
/**
 * SEO: Generate Main Sitemap
 * 
 * Generates main sitemap.xml and sitemap.txt for the website
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../core/DatabaseConnection.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../utils/FileSystem.php';
require_once __DIR__ . '/../models/Rate.php';
require_once __DIR__ . '/../models/Location.php';

class SitemapGenerator {
    private $db;
    private $logger;
    private $fileSystem;
    private $rateModel;
    private $locationModel;
    
    private $basePath;
    private $baseUrl;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->db = DatabaseConnection::getInstance();
        $this->logger = Logger::getInstance();
        $this->fileSystem = new FileSystem();
        $this->rateModel = new Rate();
        $this->locationModel = new Location();
        
        // Set paths and URLs
        $this->basePath = defined('BASE_PATH') ? BASE_PATH : dirname(dirname(__DIR__));
        $this->baseUrl = defined('BASE_URL') ? BASE_URL : 'https://todayeggrates.com';
    }
    
    /**
     * Generate main sitemap
     * 
     * @return array Result statistics
     */
    public function generate() {
        $result = [
            'urls' => 0,
            'states' => 0,
            'cities' => 0,
            'webstories' => 0,
            'static' => 0
        ];
        
        $this->logger->info("Starting main sitemap generation", "Sitemap");
        
        // Create XML sitemap header
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        
        // Create text sitemap
        $txt = '';
        
        // Add homepage
        $xml .= $this->addUrl($this->baseUrl, '1.0');
        $txt .= $this->baseUrl . PHP_EOL;
        $result['static']++;
        $result['urls']++;
        
        // Add static pages
        $staticPages = [
            '/about' => 0.8,
            '/contact' => 0.7,
            '/privacy-policy' => 0.6,
            '/terms' => 0.6,
            '/disclaimer' => 0.6,
            '/egg-rate-chart' => 0.8,
            '/egg-price-calculator' => 0.8,
            '/webstories' => 0.9
        ];
        
        foreach ($staticPages as $page => $priority) {
            $xml .= $this->addUrl($this->baseUrl . $page, $priority);
            $txt .= $this->baseUrl . $page . PHP_EOL;
            $result['static']++;
            $result['urls']++;
        }
        
        // Add state URLs
        $states = $this->locationModel->getAllStates();
        foreach ($states as $state) {
            $stateSlug = $this->createSlug($state);
            $stateUrl = $this->baseUrl . '/state/' . $stateSlug . '-egg-rate';
            
            $xml .= $this->addUrl($stateUrl, '0.8');
            $txt .= $stateUrl . PHP_EOL;
            $result['states']++;
            $result['urls']++;
        }
        
        // Add city URLs with latest rates
        $cityRates = $this->rateModel->getAllLatestRates();
        foreach ($cityRates as $rate) {
            $city = $rate['city'];
            $state = $rate['state'];
            
            // Skip special state
            if (strtolower($state) === 'special') {
                continue;
            }
            
            $citySlug = $this->createSlug($city);
            $stateSlug = $this->createSlug($state);
            
            // City URL
            $cityUrl = $this->baseUrl . '/city/' . $citySlug . '-' . $stateSlug . '-egg-rate';
            $xml .= $this->addUrl($cityUrl, '0.8');
            $txt .= $cityUrl . PHP_EOL;
            $result['cities']++;
            $result['urls']++;
            
            // Check if web story exists
            $webstoryPath = $this->basePath . '/webstories/' . $citySlug . '-egg-rate.html';
            
            if (file_exists($webstoryPath)) {
                $webstoryUrl = $this->baseUrl . '/webstory/' . $citySlug . '-egg-rate';
                $xml .= $this->addUrl($webstoryUrl, '0.8', date('Y-m-d', filemtime($webstoryPath)));
                $txt .= $webstoryUrl . PHP_EOL;
                $result['webstories']++;
                $result['urls']++;
            }
        }
        
        // Add web stories sitemap reference
        $txt .= $this->baseUrl . '/webstories-sitemap.xml' . PHP_EOL;
        
        // Close XML
        $xml .= '</urlset>';
        
        // Save sitemaps
        $sitemapXml = $this->basePath . '/sitemap.xml';
        $sitemapTxt = $this->basePath . '/sitemap.txt';
        
        // Write files
        $xmlResult = $this->fileSystem->writeFile($sitemapXml, $xml);
        $txtResult = $this->fileSystem->writeFile($sitemapTxt, $txt);
        
        if (!$xmlResult || !$txtResult) {
            $this->logger->error("Failed to write sitemap files", "Sitemap");
            $result['status'] = 'error';
            $result['message'] = 'Failed to write sitemap files';
            return $result;
        }
        
        $this->logger->info("Main sitemap generated successfully with {$result['urls']} URLs", "Sitemap");
        
        $result['status'] = 'success';
        return $result;
    }
    
    /**
     * Add a URL to the sitemap XML
     *
     * @param string $url URL to add
     * @param string $priority URL priority (0.0 to 1.0)
     * @param string $lastmod Last modification date (Y-m-d)
     * @return string XML entry for the URL
     */
    private function addUrl($url, $priority = '0.5', $lastmod = null) {
        $lastmod = $lastmod ?: date('Y-m-d');
        
        $xml = '  <url>' . PHP_EOL;
        $xml .= '    <loc>' . htmlspecialchars($url) . '</loc>' . PHP_EOL;
        $xml .= '    <lastmod>' . $lastmod . '</lastmod>' . PHP_EOL;
        $xml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
        $xml .= '    <priority>' . $priority . '</priority>' . PHP_EOL;
        $xml .= '  </url>' . PHP_EOL;
        
        return $xml;
    }
    
    /**
     * Create URL-friendly slug from text
     * 
     * @param string $text Text to convert
     * @return string Slug
     */
    private function createSlug($text) {
        return strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $text));
    }
}

// Execute if this script is called directly
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    try {
        $sitemapGenerator = new SitemapGenerator();
        $result = $sitemapGenerator->generate();
        
        if ($result['status'] === 'success') {
            echo "Sitemap generated successfully with {$result['urls']} URLs.\n";
            echo "- Static pages: {$result['static']}\n";
            echo "- States: {$result['states']}\n";
            echo "- Cities: {$result['cities']}\n";
            echo "- Web stories: {$result['webstories']}\n";
        } else {
            echo "Error: {$result['message']}\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
