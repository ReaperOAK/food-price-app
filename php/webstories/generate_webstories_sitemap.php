<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection - using require_once instead of include to avoid duplicate function declarations
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

// Configuration with absolute paths
$basePath = dirname(dirname(dirname(__FILE__))); // Go up two levels from webstories dir
$storiesDir = $basePath . '/webstories';
$sitemapFile = $basePath . '/webstories-sitemap.xml';

// Create XML sitemap header with proper namespace
$xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' .
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' .
        'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 ' .
        'http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . PHP_EOL;

// Get all web stories
$files = glob("$storiesDir/*.html");
$storyCount = 0;

if (!is_array($files)) {
    echo "No files found or directory doesn't exist at: $storiesDir";
    exit;
}

// Log the process
$logMessage = "Starting sitemap generation at " . date('Y-m-d H:i:s') . "\n";
$logMessage .= "Found " . count($files) . " total files\n";

foreach ($files as $file) {
    // Skip index.html
    if (basename($file) === 'index.html') {
        $logMessage .= "Skipping index.html file\n";
        continue;
    }
    
    $filename = basename($file, '.html');
    
    // Check if it's a valid web story (city-egg-rate.html format)
    if (preg_match('/^(.*)-egg-rate$/', $filename, $matches)) {
        $citySlug = $matches[1];
        
        // Get the last modified date of the file
        $lastMod = date('Y-m-d', filemtime($file));
        
        // Add URL to sitemap with proper indentation
        $xml .= '  <url>' . PHP_EOL;
        $xml .= '    <loc>https://todayeggrates.com/webstories/' . $filename . '.html</loc>' . PHP_EOL;
        $xml .= '    <lastmod>' . $lastMod . '</lastmod>' . PHP_EOL;
        $xml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
        $xml .= '    <priority>0.8</priority>' . PHP_EOL;
        $xml .= '  </url>' . PHP_EOL;
        
        $storyCount++;
        $logMessage .= "Added $filename to sitemap\n";
    } else {
        $logMessage .= "Skipping non-matching file: $filename\n";
    }
}

// Add the web stories index page
$xml .= '  <url>' . PHP_EOL;
$xml .= '    <loc>https://todayeggrates.com/webstories/</loc>' . PHP_EOL;
$xml .= '    <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
$xml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
$xml .= '    <priority>0.9</priority>' . PHP_EOL;
$xml .= '  </url>' . PHP_EOL;

$logMessage .= "Added webstories index page to sitemap\n";

// Close XML sitemap
$xml .= '</urlset>';

// Save sitemap
if (file_put_contents($sitemapFile, $xml)) {
    $logMessage .= "Successfully wrote sitemap to $sitemapFile\n";
} else {
    $logMessage .= "ERROR: Failed to write sitemap to $sitemapFile\n";
}

// Output results for logging
echo "Web stories sitemap generated with $storyCount stories.";
file_put_contents(dirname(__FILE__) . '/sitemap_generation.log', $logMessage, FILE_APPEND);

// Validate the sitemap by trying to read it
if (file_exists($sitemapFile)) {
    $sitemapSize = filesize($sitemapFile);
    echo " Sitemap size: " . round($sitemapSize / 1024, 2) . " KB";
}

// Only close the connection if this script is called directly, not when included
if (basename($_SERVER['SCRIPT_FILENAME']) == basename(__FILE__)) {
    $conn->close();
}
?>
