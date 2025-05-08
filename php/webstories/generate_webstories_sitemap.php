<?php
/**
 * Web Stories Sitemap Generator
 * 
 * This script generates a dedicated XML sitemap specifically for Web Stories,
 * which helps Google discover and index your Web Stories for better visibility
 * in search results, especially on mobile devices.
 */

// Check if we're being included from another file or run directly
$generateSitemapOnly = isset($generateSitemapOnly) ? $generateSitemapOnly : false;

// Set header to XML only if not being included from another script
if (!$generateSitemapOnly) {
    header('Content-Type: application/xml; charset=utf-8');
}

// Start output buffering to capture XML
ob_start();

// Create a fresh database connection specifically for the sitemap generator
try {
    // Include the database configuration file with error handling
    if (!file_exists(dirname(__DIR__) . '/config/db.php')) {
        error_log("Sitemap generator error: Database configuration file not found");
        throw new Exception("Database configuration file not found");
    }
    
    require_once dirname(__DIR__) . '/config/db.php';
    
    // Make sure the getDbConnection function exists
    if (!function_exists('getDbConnection')) {
        error_log("Sitemap generator error: getDbConnection function not found");
        throw new Exception("Database connection function not found");
    }
    
    // Get a fresh database connection
    $sitemap_conn = getDbConnection();
    
    // Verify the connection is valid
    if (!$sitemap_conn || !($sitemap_conn instanceof mysqli) || $sitemap_conn->connect_error) {
        $error = $sitemap_conn->connect_error ?? "Unknown connection error";
        error_log("Sitemap generator error: Failed to connect to database - " . $error);
        throw new Exception("Failed to connect to database: " . $error);
    }
    
    // Get all web stories from the database
    $webstories_sql = "SELECT * FROM webstories WHERE status = 'published' ORDER BY publish_date DESC";
    $webstories_result = $sitemap_conn->query($webstories_sql);
    
    if ($sitemap_conn->error) {
        error_log("Sitemap generator query error: " . $sitemap_conn->error);
    }
    
} catch (Exception $e) {
    // Log the error but continue to generate an empty sitemap
    error_log("Sitemap generator exception: " . $e->getMessage());
    $webstories_result = false;
}

// Start XML output
echo '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . PHP_EOL;

// Base URL for the website
$base_url = 'https://todayeggrates.com';

// Add each web story to the sitemap
if (isset($webstories_result) && $webstories_result && $webstories_result->num_rows > 0) {
    while($story = $webstories_result->fetch_assoc()) {
        $url = $base_url . '/webstory/' . $story['slug'];
        $last_mod = date('c', strtotime($story['updated_at']));
        
        echo '  <url>' . PHP_EOL;
        echo '    <loc>' . htmlspecialchars($url) . '</loc>' . PHP_EOL;
        echo '    <lastmod>' . $last_mod . '</lastmod>' . PHP_EOL;
        echo '    <changefreq>weekly</changefreq>' . PHP_EOL;
        echo '    <priority>0.8</priority>' . PHP_EOL;
        echo '  </url>' . PHP_EOL;
    }
} else {
    // If no web stories found, add a placeholder URL
    echo '  <url>' . PHP_EOL;
    echo '    <loc>' . htmlspecialchars($base_url . '/webstories') . '</loc>' . PHP_EOL;
    echo '    <lastmod>' . date('c') . '</lastmod>' . PHP_EOL;
    echo '    <changefreq>weekly</changefreq>' . PHP_EOL;
    echo '    <priority>0.8</priority>' . PHP_EOL;
    echo '  </url>' . PHP_EOL;
}

// Close the XML
echo '</urlset>';

// Get the sitemap content
$sitemap_content = ob_get_contents();
ob_end_clean();

// Save the sitemap to a file
$doc_root = isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] : dirname(dirname(dirname(__FILE__)));
$sitemap_path = $doc_root . '/webstories-sitemap.xml';

// Ensure the directory exists
$sitemap_dir = dirname($sitemap_path);
if (!file_exists($sitemap_dir)) {
    mkdir($sitemap_dir, 0755, true);
}

file_put_contents($sitemap_path, $sitemap_content);

// Always close our own connection if it was successfully established
if (isset($sitemap_conn) && $sitemap_conn instanceof mysqli) {
    try {
        $sitemap_conn->close();
    } catch (Throwable $e) {
        // Silently ignore close errors
        error_log("Sitemap generator connection close error: " . $e->getMessage());
    }
}

// Output the sitemap if this script is being run directly
if (!$generateSitemapOnly) {
    echo $sitemap_content;
}
?>
