<?php
/**
 * Generate XML sitemap for better SEO
 */

// Include database connection
require_once 'db.php';

// Define file paths
$basePath = dirname(dirname(__FILE__)); // Go up one level from php directory
$sitemapXmlFile = $basePath . '/sitemap.xml';
$sitemapTxtFile = $basePath . '/sitemap.txt';

// Also create a copy in the php directory for local testing
$phpDirSitemapXml = __DIR__ . '/sitemap.xml';

// Start XML output buffer
$xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// Start TXT output buffer
$txt = '';

// Base URL
$baseUrl = 'https://todayeggrates.com';

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

// Get all cities from database
$cities_query = "SELECT city_name, date FROM egg_rates GROUP BY city_name ORDER BY city_name";
try {
    $cities_result = $conn->query($cities_query);
    if ($cities_result) {
        while ($city = $cities_result->fetch_assoc()) {
            // Format city name for URL
            $city_url = strtolower(str_replace(' ', '-', $city['city_name'])) . '-egg-rate';
            $url = $baseUrl . '/' . $city_url;
            
            $xml .= '<url>' . PHP_EOL;
            $xml .= '  <loc>' . $url . '</loc>' . PHP_EOL;
            $xml .= '  <lastmod>' . date('Y-m-d', strtotime($city['date'])) . '</lastmod>' . PHP_EOL;
            $xml .= '  <changefreq>daily</changefreq>' . PHP_EOL;
            $xml .= '  <priority>0.9</priority>' . PHP_EOL;
            $xml .= '</url>' . PHP_EOL;
            
            $txt .= $url . PHP_EOL;
            
            // Also add the webstory URL for this city if it exists
            $webstory_path = $basePath . '/webstories/' . strtolower(str_replace(' ', '-', $city['city_name'])) . '-egg-rate.html';
            if (file_exists($webstory_path)) {
                $webstory_url = $baseUrl . '/webstory/' . strtolower(str_replace(' ', '-', $city['city_name'])) . '-egg-rate';
                
                $xml .= '<url>' . PHP_EOL;
                $xml .= '  <loc>' . $webstory_url . '</loc>' . PHP_EOL;
                $xml .= '  <lastmod>' . date('Y-m-d', filemtime($webstory_path)) . '</lastmod>' . PHP_EOL;
                $xml .= '  <changefreq>daily</changefreq>' . PHP_EOL;
                $xml .= '  <priority>0.8</priority>' . PHP_EOL;
                $xml .= '</url>' . PHP_EOL;
                
                $txt .= $webstory_url . PHP_EOL;
            }
        }
    }
} catch (Exception $e) {
    // Log error but continue
    error_log("Error generating city sitemap entries: " . $e->getMessage());
}

// Get all states from database
$states_query = "SELECT state_name FROM states ORDER BY state_name";
try {
    $states_result = $conn->query($states_query);
    if ($states_result) {
        while ($state = $states_result->fetch_assoc()) {
            // Format state name for URL
            $state_url = 'state/' . strtolower(str_replace(' ', '-', $state['state_name'])) . '-egg-rate';
            $url = $baseUrl . '/' . $state_url;
            
            $xml .= '<url>' . PHP_EOL;
            $xml .= '  <loc>' . $url . '</loc>' . PHP_EOL;
            $xml .= '  <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
            $xml .= '  <changefreq>daily</changefreq>' . PHP_EOL;
            $xml .= '  <priority>0.8</priority>' . PHP_EOL;
            $xml .= '</url>' . PHP_EOL;
            
            $txt .= $url . PHP_EOL;
        }
    }
} catch (Exception $e) {
    // Log error but continue
    error_log("Error generating state sitemap entries: " . $e->getMessage());
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
        }
    } else {
        // Add known blog posts from data/blogs.js
        $known_blogs = ['egg-rate-barwala', 'blog-1', 'blog-2'];
        foreach ($known_blogs as $blog) {
            $url = $baseUrl . '/blog/' . $blog;
            
            $xml .= '<url>' . PHP_EOL;
            $xml .= '  <loc>' . $url . '</loc>' . PHP_EOL;
            $xml .= '  <lastmod>' . date('Y-m-d', strtotime('-1 month')) . '</lastmod>' . PHP_EOL;
            $xml .= '  <changefreq>monthly</changefreq>' . PHP_EOL;
            $xml .= '  <priority>0.7</priority>' . PHP_EOL;
            $xml .= '</url>' . PHP_EOL;
            
            $txt .= $url . PHP_EOL;
        }
    }
} catch (Exception $e) {
    // Log error but continue
    error_log("Error generating blog sitemap entries: " . $e->getMessage());
    // Add known blog posts as fallback
    $known_blogs = ['egg-rate-barwala', 'blog-1', 'blog-2'];
    foreach ($known_blogs as $blog) {
        $url = $baseUrl . '/blog/' . $blog;
        
        $xml .= '<url>' . PHP_EOL;
        $xml .= '  <loc>' . $url . '</loc>' . PHP_EOL;
        $xml .= '  <lastmod>' . date('Y-m-d', strtotime('-1 month')) . '</lastmod>' . PHP_EOL;
        $xml .= '  <changefreq>monthly</changefreq>' . PHP_EOL;
        $xml .= '  <priority>0.7</priority>' . PHP_EOL;
        $xml .= '</url>' . PHP_EOL;
        
        $txt .= $url . PHP_EOL;
    }
}

// Add webstories sitemap
$txt .= $baseUrl . '/webstories-sitemap.xml' . PHP_EOL;

// Close XML
$xml .= '</urlset>';

// Write XML file to root directory
file_put_contents($sitemapXmlFile, $xml);

// Also save a copy in the php directory for reference
file_put_contents($phpDirSitemapXml, $xml);

// Write TXT file
file_put_contents($sitemapTxtFile, $txt);

// Output success message
echo "Sitemap generated successfully!";
echo "<br>XML Sitemap: <a href='/sitemap.xml' target='_blank'>/sitemap.xml</a>";
echo "<br>TXT Sitemap: <a href='/sitemap.txt' target='_blank'>/sitemap.txt</a>";
echo "<br><br>Added to sitemap:";
echo "<br>- Homepage";
echo "<br>- " . count($static_pages) . " static pages";

$city_count = $cities_result ? $cities_result->num_rows : 0;
echo "<br>- " . $city_count . " city pages";

$state_count = $states_result ? $states_result->num_rows : 0;
echo "<br>- " . $state_count . " state pages";

$blog_count = isset($blog_result) && $blog_result ? $blog_result->num_rows : count($known_blogs);
echo "<br>- " . $blog_count . " blog posts";

// Log completion
error_log("Sitemap generation completed at " . date('Y-m-d H:i:s'));
?>