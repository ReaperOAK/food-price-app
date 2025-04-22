<?php
/**
 * Generate XML sitemap specifically for web stories
 */

// Include database connection
require_once 'db.php';

// Set content type
header('Content-Type: text/xml');

// Start XML output
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

// Add main webstories index page
echo '<url>' . "\n";
echo '  <loc>https://todayeggrates.com/webstories/</loc>' . "\n";
echo '  <lastmod>' . date('Y-m-d') . '</lastmod>' . "\n";
echo '  <changefreq>daily</changefreq>' . "\n";
echo '  <priority>0.8</priority>' . "\n";
echo '</url>' . "\n";

// Get all web stories
$webstories_query = "SELECT slug, title, created_at, updated_at FROM webstories ORDER BY updated_at DESC";
try {
    $webstories_stmt = $pdo->query($webstories_query);
    if ($webstories_stmt && $webstories_stmt->rowCount() > 0) {
        while ($story = $webstories_stmt->fetch(PDO::FETCH_ASSOC)) {
            echo '<url>' . "\n";
            echo '  <loc>https://todayeggrates.com/webstories/' . $story['slug'] . '</loc>' . "\n";
            echo '  <lastmod>' . date('Y-m-d', strtotime($story['updated_at'])) . '</lastmod>' . "\n";
            echo '  <changefreq>weekly</changefreq>' . "\n";
            echo '  <priority>0.7</priority>' . "\n";
            echo '</url>' . "\n";
        }
    } else {
        // Get web stories from directory as fallback
        $webstories_dir = '../webstories/';
        if (file_exists($webstories_dir) && is_dir($webstories_dir)) {
            $files = scandir($webstories_dir);
            foreach ($files as $file) {
                if ($file != '.' && $file != '..' && pathinfo($file, PATHINFO_EXTENSION) == 'html') {
                    $slug = pathinfo($file, PATHINFO_FILENAME);
                    echo '<url>' . "\n";
                    echo '  <loc>https://todayeggrates.com/webstories/' . $slug . '</loc>' . "\n";
                    echo '  <lastmod>' . date('Y-m-d', filemtime($webstories_dir . $file)) . '</lastmod>' . "\n";
                    echo '  <changefreq>weekly</changefreq>' . "\n";
                    echo '  <priority>0.7</priority>' . "\n";
                    echo '</url>' . "\n";
                }
            }
        }
    }
} catch (PDOException $e) {
    // Log error and fallback to directory scanning
    error_log("Error generating webstories sitemap entries: " . $e->getMessage());
    
    // Get web stories from directory as fallback
    $webstories_dir = '../webstories/';
    if (file_exists($webstories_dir) && is_dir($webstories_dir)) {
        $files = scandir($webstories_dir);
        foreach ($files as $file) {
            if ($file != '.' && $file != '..' && pathinfo($file, PATHINFO_EXTENSION) == 'html') {
                $slug = pathinfo($file, PATHINFO_FILENAME);
                echo '<url>' . "\n";
                echo '  <loc>https://todayeggrates.com/webstories/' . $slug . '</loc>' . "\n";
                echo '  <lastmod>' . date('Y-m-d', filemtime($webstories_dir . $file)) . '</lastmod>' . "\n";
                echo '  <changefreq>weekly</changefreq>' . "\n";
                echo '  <priority>0.7</priority>' . "\n";
                echo '</url>' . "\n";
            }
        }
    }
}

// Close XML
echo '</urlset>';
