<?php
/**
 * Generate prerendered HTML pages with proper titles for search engines
 * This addresses the Page/SERP title mismatch issue by providing static HTML
 * with correct titles that search engines can immediately see
 */

// Include database configuration
require_once __DIR__ . '/../config/db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

class SeoPageGenerator {
    private $pdo;
    private $baseTemplate;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->loadBaseTemplate();
    }
    
    private function loadBaseTemplate() {
        $templatePath = __DIR__ . '/../../index.html';
        if (!file_exists($templatePath)) {
            throw new Exception("Base template not found: $templatePath");
        }
        $this->baseTemplate = file_get_contents($templatePath);
    }
    
    /**
     * Get cities with their latest egg rates
     */
    private function getCitiesWithRates() {
        try {
            $query = "
                SELECT DISTINCT 
                    e.city,
                    e.state,
                    e.rate,
                    e.date_added
                FROM egg_rates e
                INNER JOIN (
                    SELECT city, MAX(date_added) as max_date
                    FROM egg_rates 
                    WHERE rate IS NOT NULL 
                    AND rate != 'N/A' 
                    AND rate > 0
                    GROUP BY city
                ) latest ON e.city = latest.city AND e.date_added = latest.max_date
                WHERE e.rate IS NOT NULL 
                AND e.rate != 'N/A' 
                AND e.rate > 0
                ORDER BY e.city
            ";
            
            $stmt = $this->pdo->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error fetching cities with rates: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Generate SEO-optimized title
     */
    private function generateSeoTitle($city, $state, $rate) {
        $today = date('j M Y');
        $formattedRate = $this->formatPrice($rate);
        
        if ($city) {
            if ($rate && $rate !== 'N/A') {
                return "{$city} Egg Rate: ₹{$formattedRate}/egg | {$today}";
            } else {
                return "{$city} Egg Rate Today - Live NECC Prices";
            }
        } elseif ($state) {
            return "{$state} Egg Rate: Live Prices {$today}";
        } else {
            return "India Egg Rates: Live NECC Prices | {$today}";
        }
    }
    
    /**
     * Generate SEO description
     */
    private function generateSeoDescription($city, $state, $rate) {
        $today = date('j M Y');
        $formattedRate = $this->formatPrice($rate);
        
        if ($city && $rate && $rate !== 'N/A') {
            return "Live egg rates {$city} ({$today}). Current rate: ₹{$formattedRate}/egg. Check latest NECC prices, wholesale & retail rates. Daily market updates from {$city} egg markets.";
        } elseif ($city) {
            return "Live egg rates {$city} ({$today}). Check latest NECC prices, wholesale & retail rates. Daily market updates from {$city} egg markets. Compare rates across India.";
        } else {
            return "Live NECC egg rates across India ({$today}). Get today's wholesale & retail egg prices, market trends, and daily updates from major Indian cities.";
        }
    }
    
    /**
     * Format price for display
     */
    private function formatPrice($price) {
        if ($price === 'N/A' || !$price || $price <= 0) return 'N/A';
        return number_format((float)$price, 2);
    }
    
    /**
     * Generate prerendered HTML for a specific page
     */
    public function generatePrerenderedPage($city = null, $state = null, $rate = null) {
        $title = $this->generateSeoTitle($city, $state, $rate);
        $description = $this->generateSeoDescription($city, $state, $rate);
        $canonicalUrl = 'https://todayeggrates.com';
        
        if ($city) {
            $canonicalUrl .= '/' . strtolower(str_replace(' ', '-', $city));
        }
        
        // Create the prerendered HTML
        $html = $this->baseTemplate;
        
        // Replace the default title
        $html = preg_replace(
            '/<title>.*?<\/title>/i',
            "<title>{$title}</title>",
            $html
        );
        
        // Add enhanced meta tags for better SERP adoption
        $metaTags = "
    <!-- SEO-Enhanced Meta Tags for SERP Title Adoption -->
    <meta name=\"title\" content=\"{$title}\" />
    <meta name=\"description\" content=\"{$description}\" />
    <meta property=\"og:title\" content=\"{$title}\" />
    <meta property=\"og:description\" content=\"{$description}\" />
    <meta property=\"twitter:title\" content=\"{$title}\" />
    <meta property=\"twitter:description\" content=\"{$description}\" />
    <link rel=\"canonical\" href=\"{$canonicalUrl}\" />
    <meta name=\"robots\" content=\"index, follow, max-image-preview:large\" />
    <meta name=\"last-modified\" content=\"" . date('c') . "\" />
    
    <!-- Additional title signals for search engines -->
    <meta property=\"article:title\" content=\"{$title}\" />
    <meta name=\"page-title\" content=\"{$title}\" />
    
    <!-- Structured data for better understanding -->
    <script type=\"application/ld+json\">
    {
        \"@context\": \"https://schema.org\",
        \"@type\": \"WebPage\",
        \"name\": \"{$title}\",
        \"headline\": \"{$title}\",
        \"description\": \"{$description}\",
        \"url\": \"{$canonicalUrl}\",
        \"dateModified\": \"" . date('c') . "\",
        \"inLanguage\": \"en-IN\",
        \"isPartOf\": {
            \"@type\": \"WebSite\",
            \"name\": \"Today Egg Rates\",
            \"url\": \"https://todayeggrates.com\"
        }
    }
    </script>";
        
        // Insert meta tags before the closing </head> tag
        $html = str_replace('</head>', $metaTags . "\n</head>", $html);
        
        return $html;
    }
    
    /**
     * Generate prerendered pages for all major cities
     */
    public function generateAllPages() {
        $outputDir = __DIR__ . '/../../prerendered';
        
        // Create output directory if it doesn't exist
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }
        
        $generatedPages = [];
        
        // Generate homepage
        $homepageHtml = $this->generatePrerenderedPage();
        file_put_contents($outputDir . '/index.html', $homepageHtml);
        $generatedPages[] = 'Homepage';
        
        // Generate pages for cities with rates
        $cities = $this->getCitiesWithRates();
        
        foreach ($cities as $cityData) {
            $city = $cityData['city'];
            $state = $cityData['state'];
            $rate = $cityData['rate'];
            
            $citySlug = strtolower(str_replace(' ', '-', $city));
            $cityHtml = $this->generatePrerenderedPage($city, $state, $rate);
            
            $cityDir = $outputDir . '/' . $citySlug;
            if (!is_dir($cityDir)) {
                mkdir($cityDir, 0755, true);
            }
            
            file_put_contents($cityDir . '/index.html', $cityHtml);
            $generatedPages[] = "City: {$city} (Rate: ₹{$this->formatPrice($rate)})";
        }
        
        return $generatedPages;
    }
}

// Main execution
try {
    // Get database connection
    $database = new Database();
    $pdo = $database->getConnection();
    
    if (!$pdo) {
        throw new Exception("Database connection failed");
    }
    
    // Generate prerendered pages
    $generator = new SeoPageGenerator($pdo);
    $generatedPages = $generator->generateAllPages();
    
    // Output results
    echo "Successfully generated " . count($generatedPages) . " prerendered pages:\n";
    foreach ($generatedPages as $page) {
        echo "- {$page}\n";
    }
    
    // Log success
    error_log("SEO prerendered pages generated successfully: " . count($generatedPages) . " pages");
    
} catch (Exception $e) {
    error_log("Error generating prerendered pages: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
