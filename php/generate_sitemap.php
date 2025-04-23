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
    'disclaimer' => 0.5
];

foreach ($static_pages as $page => $priority) {
    $url = $baseUrl . '/' . $page;
    
    $xml .= '<url>' . PHP_EOL;
    $xml .= '  <loc>' . $url . '</loc>' . PHP_EOL;
    $xml .= '  <lastmod>' . date('Y-m-d', strtotime('-1 week')) . '</lastmod>' . PHP_EOL;
    $xml .= '  <changefreq>monthly</changefreq>' . PHP_EOL;
    $xml .= '  <priority>' . $priority . '</priority>' . PHP_EOL;
    $xml .= '</url>' . PHP_EOL;
    
    $txt .= $url . PHP_EOL;
}

// Get all cities from database
$cities_query = "SELECT city_name, date FROM egg_rates GROUP BY city_name ORDER BY city_name";
try {
    $cities_stmt = $pdo->query($cities_query);
    while ($city = $cities_stmt->fetch(PDO::FETCH_ASSOC)) {
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
    }
} catch (PDOException $e) {
    // Log error but continue
    error_log("Error generating city sitemap entries: " . $e->getMessage());
}

// Get all states from database
$states_query = "SELECT state_name FROM states ORDER BY state_name";
try {
    $states_stmt = $pdo->query($states_query);
    while ($state = $states_stmt->fetch(PDO::FETCH_ASSOC)) {
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
} catch (PDOException $e) {
    // Log error but continue
    error_log("Error generating state sitemap entries: " . $e->getMessage());
}

// Get blog posts if they exist
$blog_query = "SELECT slug, updated_at FROM blog_posts ORDER BY updated_at DESC";
try {
    $blog_stmt = $pdo->query($blog_query);
    if ($blog_stmt && $blog_stmt->rowCount() > 0) {
        while ($blog = $blog_stmt->fetch(PDO::FETCH_ASSOC)) {
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
        // Add known blog posts from sitemap.txt
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
} catch (PDOException $e) {
    // Log error but continue
    error_log("Error generating blog sitemap entries: " . $e->getMessage());
    // Add known blog posts from sitemap.txt as fallback
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

// Write XML file
file_put_contents($sitemapXmlFile, $xml);

// Write TXT file
file_put_contents($sitemapTxtFile, $txt);

// Output success message
echo "Sitemap generated successfully!";
echo "<br>XML Sitemap: <a href='/sitemap.xml' target='_blank'>/sitemap.xml</a>";
echo "<br>TXT Sitemap: <a href='/sitemap.txt' target='_blank'>/sitemap.txt</a>";

// Log completion
error_log("Sitemap generation completed at " . date('Y-m-d H:i:s'));
?>