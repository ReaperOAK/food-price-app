<?php
/**
 * Web Stories Sitemap Generator
 * 
 * This script generates a dedicated XML sitemap specifically for Web Stories,
 * which helps Google discover and index your Web Stories for better visibility
 * in search results, especially on mobile devices.
 */

// Set header to XML
header('Content-Type: application/xml; charset=utf-8');

// Database connection
require_once('../config/db.php');

// Get all web stories from the database
$webstories_sql = "SELECT * FROM webstories WHERE status = 'published' ORDER BY publish_date DESC";
$webstories_result = $conn->query($webstories_sql);

// Start XML output
echo '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . PHP_EOL;

// Base URL for the website
$base_url = 'https://todayeggrates.com';

// Add each web story to the sitemap
if ($webstories_result->num_rows > 0) {
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

// Save the sitemap to a file
$sitemap_content = ob_get_contents();
file_put_contents($_SERVER['DOCUMENT_ROOT'] . '/webstories-sitemap.xml', $sitemap_content);

// Close the database connection
$conn->close();
?>
