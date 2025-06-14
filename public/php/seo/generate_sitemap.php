<?php
/**
 * Generate XML sitemap for better SEO
 */

// Clear any existing cache to ensure fresh data
if (function_exists('opcache_reset')) {
    opcache_reset();
}

// Clear file cache if it exists
$cacheDir = dirname(__DIR__) . '/cache';
if (is_dir($cacheDir)) {
    $cacheFiles = glob($cacheDir . '/*.json');
    foreach ($cacheFiles as $file) {
        if (strpos($file, 'sitemap') !== false || strpos($file, 'city') !== false) {
            unlink($file);
        }
    }
}

// Include database connection
require_once dirname(__DIR__) . '/config/db.php';

// Verify that $conn exists, otherwise create the connection
if (!isset($conn) || $conn->connect_error) {
    // Connection details
    $servername = "localhost";
    $username = "u901337298_test";
    $password = "A12345678b*";
    $dbname = "u901337298_test";
    
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
    }
}

// Helper function to generate city slug with -egg-rate-today suffix for clean URLs
if (!function_exists('generateCitySlugForSitemap')) {
    function generateCitySlugForSitemap($city, $state = null) {
        // Debug: Log what we're processing
        error_log("SLUG_DEBUG: Processing city='$city', state='$state'");
        
        // Clean the city name by removing any state codes in parentheses like "Allahabad (CC)" or "Agra (UP)"
        $cleanCity = $city;
        
        // Handle various patterns of state codes in city names:
        // Pattern 1: "City (XX)" where XX is a 2-letter state code
        if (preg_match('/^(.+?)\s*\(([A-Z]{2})\)$/', $city, $matches)) {
            $cleanCity = trim($matches[1]);
            error_log("SLUG_DEBUG: Removed state code pattern (XX) from city name, using: $cleanCity");
        }
        // Pattern 2: "City (State Name)" - remove full state name in parentheses
        elseif (preg_match('/^(.+?)\s*\([^)]+\)$/', $city, $matches)) {
            $cleanCity = trim($matches[1]);
            error_log("SLUG_DEBUG: Removed state name in parentheses from city name, using: $cleanCity");
        }
        // Pattern 3: Check if city name already has state code embedded (like "Agra UP")
        elseif (preg_match('/^(.+?)\s+([A-Z]{2})$/', $city, $matches)) {
            $cleanCity = trim($matches[1]);
            error_log("SLUG_DEBUG: Removed embedded state code from city name, using: $cleanCity");
        }
        
        // Generate the base city slug without state codes
        $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $cleanCity));
        $citySlug = trim($citySlug, '-'); // Remove leading/trailing dashes
        
        // IMPORTANT: Always add the -egg-rate-today suffix
        $slug = $citySlug . '-egg-rate-today';
        
        error_log("SLUG_DEBUG: Generated final slug with suffix: $slug");
        return $slug;
    }
}

// Define file paths
$basePath = dirname(dirname(__DIR__)); // Go up two levels from seo directory
$sitemapXmlFile = $basePath . '/sitemap.xml';
$sitemapTxtFile = $basePath . '/sitemap.txt';

// Also create a copy in the php directory for local testing
$phpDirSitemapXml = dirname(__DIR__) . '/sitemap.xml';

// Make sure the directories exist and are writable
$baseDir = dirname($sitemapXmlFile);
if (!file_exists($baseDir)) {
    mkdir($baseDir, 0755, true);
}

// Start XML output buffer
$xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// Start TXT output buffer
$txt = '';

// Base URL
$baseUrl = 'https://todayeggrates.com';

// Initialize counters
$city_count = 0;
$state_count = 0;
$blog_count = 0;

// Add homepage
$xml .= '<url>' . PHP_EOL;
$xml .= '  <loc>' . $baseUrl . '/</loc>' . PHP_EOL;
$xml .= '  <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
$xml .= '  <changefreq>daily</changefreq>' . PHP_EOL;
$xml .= '  <priority>1.0</priority>' . PHP_EOL;
$xml .= '</url>' . PHP_EOL;

$txt .= $baseUrl . '/' . PHP_EOL;

// Add static pages
$static_pages = [
    'privacy' => 0.5,
    'terms' => 0.5,
    'disclaimer' => 0.5,
    'webstories' => 0.8 // Add the webstories list page
];

foreach ($static_pages as $page => $priority) {
    $url = $baseUrl . '/' . $page;
    
    $xml .= '<url>' . PHP_EOL;
    $xml .= '  <loc>' . $url . '</loc>' . PHP_EOL;
    $xml .= '  <lastmod>' . date('Y-m-d', strtotime('-1 week')) . '</lastmod>' . PHP_EOL;
    $xml .= '  <changefreq>daily</changefreq>' . PHP_EOL;
    $xml .= '  <priority>' . $priority . '</priority>' . PHP_EOL;
    $xml .= '</url>' . PHP_EOL;
    
    $txt .= $url . PHP_EOL;
}

// Get distinct cities and states - try using normalized tables first
try {
    $cities_query = "
        SELECT DISTINCT c.name as city_name, s.name as state_name, MAX(ern.date) as date 
        FROM egg_rates_normalized ern
        JOIN cities c ON ern.city_id = c.id
        JOIN states s ON c.state_id = s.id
        GROUP BY c.name, s.name
        ORDER BY c.name
    ";
    
    $cities_result = $conn->query($cities_query);
    
    if (!$cities_result || $cities_result->num_rows === 0) {
        throw new Exception("No results from normalized tables");
    }
} catch (Exception $e) {
    // Fall back to original table on error
    $cities_query = "SELECT DISTINCT city as city_name, state as state_name, MAX(date) as date FROM egg_rates GROUP BY city, state ORDER BY city";
    $cities_result = $conn->query($cities_query);
}

if ($cities_result && $cities_result->num_rows > 0) {
    // Create an array to track unique states
    $unique_states = [];      while ($row = $cities_result->fetch_assoc()) {        // Add city URL using new slug format
        $citySlug = generateCitySlugForSitemap($row['city_name'], $row['state_name']);
        $url = $baseUrl . '/' . $citySlug;
        
        // Debug: Log the generated URL
        error_log("SITEMAP_DEBUG: Generated city URL: $url");
        
        $xml .= '<url>' . PHP_EOL;
        $xml .= '  <loc>' . $url . '</loc>' . PHP_EOL;
        $xml .= '  <lastmod>' . date('Y-m-d', strtotime($row['date'])) . '</lastmod>' . PHP_EOL;
        $xml .= '  <changefreq>daily</changefreq>' . PHP_EOL;
        $xml .= '  <priority>0.9</priority>' . PHP_EOL;
        $xml .= '</url>' . PHP_EOL;
        
        $txt .= $url . PHP_EOL;
        $city_count++;
        
        // Track unique states
        if (!isset($unique_states[$row['state_name']])) {
            $unique_states[$row['state_name']] = true;
              // Add state URL
            $state_url = 'state/' . strtolower(str_replace(' ', '-', $row['state_name'])) . '-egg-rate-today';
            $state_full_url = $baseUrl . '/' . $state_url;
            
            $xml .= '<url>' . PHP_EOL;
            $xml .= '  <loc>' . $state_full_url . '</loc>' . PHP_EOL;
            $xml .= '  <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
            $xml .= '  <changefreq>daily</changefreq>' . PHP_EOL;
            $xml .= '  <priority>0.8</priority>' . PHP_EOL;
            $xml .= '</url>' . PHP_EOL;
            
            $txt .= $state_full_url . PHP_EOL;        $state_count++;
        }
          // Also add the webstory URL for this city if it exists
        $webstory_path = $basePath . '/ampstory/' . $citySlug . '.html';
        if (file_exists($webstory_path)) {
            $webstory_url = $baseUrl . '/webstory/' . $citySlug;
            
            $xml .= '<url>' . PHP_EOL;
            $xml .= '  <loc>' . $webstory_url . '</loc>' . PHP_EOL;
            $xml .= '  <lastmod>' . date('Y-m-d', filemtime($webstory_path)) . '</lastmod>' . PHP_EOL;
            $xml .= '  <changefreq>daily</changefreq>' . PHP_EOL;
            $xml .= '  <priority>0.8</priority>' . PHP_EOL;
            $xml .= '</url>' . PHP_EOL;
            
            $txt .= $webstory_url . PHP_EOL;
        }
    }
} else {
    // No cities found in database, add some fallback cities
    error_log("No cities found in the database, adding fallback cities");
    $fallback_cities = [
        'hyderabad' => 'Telangana',
        'vijayawada' => 'Andhra Pradesh',
        'namakkal' => 'Tamil Nadu',
        'barwala' => 'Haryana',
        'delhi' => 'Delhi',
        'mumbai' => 'Maharashtra',
        'pune' => 'Maharashtra',
        'bangalore' => 'Karnataka',
        'chennai' => 'Tamil Nadu'
    ];
    
    $unique_states = [];      foreach ($fallback_cities as $city => $state) {        // Add city URL using generateCitySlugForSitemap function for consistency
        $citySlug = generateCitySlugForSitemap($city, $state);
        $url = $baseUrl . '/' . $citySlug;
        
        // Debug: Log the generated fallback URL
        error_log("SITEMAP_DEBUG: Generated fallback city URL: $url");
        
        $xml .= '<url>' . PHP_EOL;
        $xml .= '  <loc>' . $url . '</loc>' . PHP_EOL;
        $xml .= '  <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
        $xml .= '  <changefreq>daily</changefreq>' . PHP_EOL;
        $xml .= '  <priority>0.9</priority>' . PHP_EOL;
        $xml .= '</url>' . PHP_EOL;
        
        $txt .= $url . PHP_EOL;
        $city_count++;
        
        // Track unique states
        if (!isset($unique_states[$state])) {
            $unique_states[$state] = true;
              // Add state URL
            $state_url = 'state/' . strtolower(str_replace(' ', '-', $state)) . '-egg-rate-today';
            $state_full_url = $baseUrl . '/' . $state_url;
            
            $xml .= '<url>' . PHP_EOL;
            $xml .= '  <loc>' . $state_full_url . '</loc>' . PHP_EOL;
            $xml .= '  <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
            $xml .= '  <changefreq>daily</changefreq>' . PHP_EOL;
            $xml .= '  <priority>0.8</priority>' . PHP_EOL;
            $xml .= '</url>' . PHP_EOL;
            
            $txt .= $state_full_url . PHP_EOL;
            $state_count++;
        }
    }
}

// Get blog posts if they exist
$blog_query = "SELECT slug, updated_at FROM blog_posts ORDER BY updated_at DESC";
try {
    $blog_result = $conn->query($blog_query);
    if ($blog_result && $blog_result->num_rows > 0) {
        while ($blog = $blog_result->fetch_assoc()) {
            $url = $baseUrl . '/blog/' . $blog['slug'];
            
            $xml .= '<url>' . PHP_EOL;
            $xml .= '  <loc>' . $url . '</loc>' . PHP_EOL;
            $xml .= '  <lastmod>' . date('Y-m-d', strtotime($blog['updated_at'])) . '</lastmod>' . PHP_EOL;
            $xml .= '  <changefreq>weekly</changefreq>' . PHP_EOL;
            $xml .= '  <priority>0.7</priority>' . PHP_EOL;
            
            $xml .= '</url>' . PHP_EOL;
            
            $txt .= $url . PHP_EOL;
            
            $blog_count++;
        }
    } else {
        // Add known blog posts from data/blogs.js
        $known_blogs = ['egg-rate-barwala', 'blog-1', 'blog-2', 'ajmer-egg-rate-today', 'today-egg-rate-hyderabad'];
        foreach ($known_blogs as $blog) {
            $url = $baseUrl . '/blog/' . $blog;
            
            $xml .= '<url>' . PHP_EOL;
            $xml .= '  <loc>' . $url . '</loc>' . PHP_EOL;
            $xml .= '  <lastmod>' . date('Y-m-d', strtotime('-1 month')) . '</lastmod>' . PHP_EOL;
            $xml .= '  <changefreq>monthly</changefreq>' . PHP_EOL;
            $xml .= '  <priority>0.7</priority>' . PHP_EOL;
            $xml .= '</url>' . PHP_EOL;
            
            $txt .= $url . PHP_EOL;
            
            $blog_count++;
        }
    }
} catch (Exception $e) {
    // Log error but continue
    error_log("Error generating blog sitemap entries: " . $e->getMessage());
    // Add known blog posts as fallback
    $known_blogs = ['egg-rate-barwala', 'blog-1', 'blog-2', 'ajmer-egg-rate-today', 'today-egg-rate-hyderabad'];
    foreach ($known_blogs as $blog) {
        $url = $baseUrl . '/blog/' . $blog;
        
        $xml .= '<url>' . PHP_EOL;
        $xml .= '  <loc>' . $url . '</loc>' . PHP_EOL;
        $xml .= '  <lastmod>' . date('Y-m-d', strtotime('-1 month')) . '</lastmod>' . PHP_EOL;
        $xml .= '  <changefreq>monthly</changefreq>' . PHP_EOL;
        $xml .= '  <priority>0.7</priority>' . PHP_EOL;
        $xml .= '</url>' . PHP_EOL;
        
        $txt .= $url . PHP_EOL;
        
        $blog_count++;
    }
}

// Add webstories sitemap
$txt .= $baseUrl . '/webstories-sitemap.xml' . PHP_EOL;

// Close XML
$xml .= '</urlset>';

// Create error handling for file writes
try {
    // Write XML file to root directory with error checking
    if (file_put_contents($sitemapXmlFile, $xml) === false) {
        throw new Exception("Failed to write XML sitemap to $sitemapXmlFile");
    }

    // Also save a copy in the php directory for reference
    if (file_put_contents($phpDirSitemapXml, $xml) === false) {
        error_log("Warning: Failed to write copy of XML sitemap to $phpDirSitemapXml");
    }

    // Write TXT file with error checking
    if (file_put_contents($sitemapTxtFile, $txt) === false) {
        throw new Exception("Failed to write TXT sitemap to $sitemapTxtFile");
    }

    // Output success message
    echo "Sitemap generated successfully!";
    echo "<br>XML Sitemap: <a href='/sitemap.xml' target='_blank'>/sitemap.xml</a>";
    echo "<br>TXT Sitemap: <a href='/sitemap.txt' target='_blank'>/sitemap.txt</a>";
    echo "<br><br>Added to sitemap:";
    echo "<br>- Homepage";
    echo "<br>- " . count($static_pages) . " static pages";
    echo "<br>- " . $city_count . " city pages";
    echo "<br>- " . $state_count . " state pages";
    echo "<br>- " . $blog_count . " blog posts";

    // Log completion
    error_log("Sitemap generation completed at " . date('Y-m-d H:i:s') . " - Added $city_count cities, $state_count states, $blog_count blogs");
} catch (Exception $e) {
    error_log("Sitemap generation error: " . $e->getMessage());
    echo "Error generating sitemap: " . $e->getMessage();
}

// Debug info
echo "<br><br>Database Info:";
$query = "SELECT COUNT(*) as count FROM egg_rates";
$result = $conn->query($query);
if ($result) {
    $row = $result->fetch_assoc();
    echo "<br>- Total egg_rates entries: " . $row['count'];
}

$query = "SELECT DISTINCT city FROM egg_rates";
$result = $conn->query($query);
if ($result) {
    echo "<br>- Distinct cities in egg_rates: " . $result->num_rows;
}

// Close the connection if it exists
if (isset($conn)) {
    $conn->close();
}
?>