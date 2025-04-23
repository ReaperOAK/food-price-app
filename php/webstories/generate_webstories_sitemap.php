<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
include_once dirname(__DIR__) . '/config/db.php';

// Configuration with absolute paths
$basePath = dirname(dirname(dirname(__FILE__))); // Go up two levels from webstories dir
$storiesDir = $basePath . '/webstories';
$sitemapFile = $basePath . '/webstories-sitemap.xml';

// Create XML sitemap header
$xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// Get all web stories
$files = glob("$storiesDir/*.html");
$storyCount = 0;

if (is_array($files)) {
    foreach ($files as $file) {
        // Skip index.html
        if (basename($file) === 'index.html') {
            continue;
        }
        
        $filename = basename($file, '.html');
        
        // Check if it's a valid web story (city-egg-rate.html format)
        if (preg_match('/^(.*)-egg-rate$/', $filename, $matches)) {
            $citySlug = $matches[1];
            
            // Get the last modified date of the file
            $lastMod = date('Y-m-d', filemtime($file));
            
            // Add URL to sitemap
            $xml .= '  <url>' . PHP_EOL;
            $xml .= '    <loc>https://todayeggrates.com/webstories/' . $filename . '.html</loc>' . PHP_EOL;
            $xml .= '    <lastmod>' . $lastMod . '</lastmod>' . PHP_EOL;
            $xml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
            $xml .= '    <priority>0.8</priority>' . PHP_EOL;
            $xml .= '  </url>' . PHP_EOL;
            
            $storyCount++;
        }
    }
}

// Add the web stories index page
$xml .= '  <url>' . PHP_EOL;
$xml .= '    <loc>https://todayeggrates.com/webstories/</loc>' . PHP_EOL;
$xml .= '    <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
$xml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
$xml .= '    <priority>0.9</priority>' . PHP_EOL;
$xml .= '  </url>' . PHP_EOL;

// Close XML sitemap
$xml .= '</urlset>';

// Save sitemap
file_put_contents($sitemapFile, $xml);

echo "Web stories sitemap generated with $storyCount stories.";

// Only close the connection if this script is called directly, not when included
if (basename($_SERVER['SCRIPT_FILENAME']) == basename(__FILE__)) {
    $conn->close();
}
?>
