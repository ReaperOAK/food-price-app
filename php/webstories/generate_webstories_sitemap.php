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

// ALWAYS create a fresh database connection specifically for the sitemap generator
try {
    require_once dirname(__DIR__) . '/config/db.php';
    
    // Use the forceNew parameter to guarantee a fresh connection
    $sitemap_conn = getDbConnection(true);
    
    // Get all web stories from the database
    $webstories_sql = "SELECT * FROM webstories WHERE status = 'published' ORDER BY publish_date DESC";
    $webstories_result = $sitemap_conn->query($webstories_sql);
    
} catch (Exception $e) {
    // Log error but continue to generate an empty sitemap
    error_log("Sitemap generator error: " . $e->getMessage());
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
    // If no web stories found, create a list of webstories files directly from the filesystem
    $doc_root = isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] : dirname(dirname(dirname(__FILE__)));
    $webstories_dir = $doc_root . '/webstories';
    
    if (file_exists($webstories_dir) && is_dir($webstories_dir)) {
        $files = scandir($webstories_dir);
        foreach ($files as $file) {
            if ($file != '.' && $file != '..' && pathinfo($file, PATHINFO_EXTENSION) == 'html' && $file != 'index.html') {
                $slug = pathinfo($file, PATHINFO_FILENAME);
                $url = $base_url . '/webstory/' . $slug;
                
                echo '  <url>' . PHP_EOL;
                echo '    <loc>' . htmlspecialchars($url) . '</loc>' . PHP_EOL;
                echo '    <lastmod>' . date('c') . '</lastmod>' . PHP_EOL;
                echo '    <changefreq>weekly</changefreq>' . PHP_EOL;
                echo '    <priority>0.8</priority>' . PHP_EOL;
                echo '  </url>' . PHP_EOL;
            }
        }
    } else {
        // If no files found either, add a placeholder URL
        echo '  <url>' . PHP_EOL;
        echo '    <loc>' . htmlspecialchars($base_url . '/webstories') . '</loc>' . PHP_EOL;
        echo '    <lastmod>' . date('c') . '</lastmod>' . PHP_EOL;
        echo '    <changefreq>weekly</changefreq>' . PHP_EOL;
        echo '    <priority>0.8</priority>' . PHP_EOL;
        echo '  </url>' . PHP_EOL;
    }
}

// Close the XML
echo '</urlset>';

// Get the sitemap content
$sitemap_content = ob_get_contents();
ob_end_clean();

// Save the sitemap to a file
$doc_root = isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] : dirname(dirname(dirname(__FILE__)));
$sitemap_path = $doc_root . '/webstories-sitemap.xml';
file_put_contents($sitemap_path, $sitemap_content);

// Close our connection
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
