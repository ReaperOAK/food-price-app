<?php
/**
 * Generate XML sitemap for better SEO
 */

// Include database connection
require_once 'db.php';

// Set content type
header('Content-Type: text/xml');

// Start XML output
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

// Add homepage
echo '<url>' . "\n";
echo '  <loc>https://todayeggrates.com/</loc>' . "\n";
echo '  <lastmod>' . date('Y-m-d') . '</lastmod>' . "\n";
echo '  <changefreq>daily</changefreq>' . "\n";
echo '  <priority>1.0</priority>' . "\n";
echo '</url>' . "\n";

// Add static pages
$static_pages = [
    'privacy' => 0.5,
    'terms' => 0.5,
    'disclaimer' => 0.5
];

foreach ($static_pages as $page => $priority) {
    echo '<url>' . "\n";
    echo '  <loc>https://todayeggrates.com/' . $page . '</loc>' . "\n";
    echo '  <lastmod>' . date('Y-m-d', strtotime('-1 week')) . '</lastmod>' . "\n";
    echo '  <changefreq>monthly</changefreq>' . "\n";
    echo '  <priority>' . $priority . '</priority>' . "\n";
    echo '</url>' . "\n";
}

// Get all cities from database
$cities_query = "SELECT city_name, date FROM egg_rates GROUP BY city_name ORDER BY city_name";
try {
    $cities_stmt = $pdo->query($cities_query);
    while ($city = $cities_stmt->fetch(PDO::FETCH_ASSOC)) {
        // Format city name for URL
        $city_url = strtolower(str_replace(' ', '-', $city['city_name'])) . '-egg-rate';
        echo '<url>' . "\n";
        echo '  <loc>https://todayeggrates.com/' . $city_url . '</loc>' . "\n";
        echo '  <lastmod>' . date('Y-m-d', strtotime($city['date'])) . '</lastmod>' . "\n";
        echo '  <changefreq>daily</changefreq>' . "\n";
        echo '  <priority>0.9</priority>' . "\n";
        echo '</url>' . "\n";
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
        echo '<url>' . "\n";
        echo '  <loc>https://todayeggrates.com/' . $state_url . '</loc>' . "\n";
        echo '  <lastmod>' . date('Y-m-d') . '</lastmod>' . "\n";
        echo '  <changefreq>daily</changefreq>' . "\n";
        echo '  <priority>0.8</priority>' . "\n";
        echo '</url>' . "\n";
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
            echo '<url>' . "\n";
            echo '  <loc>https://todayeggrates.com/blog/' . $blog['slug'] . '</loc>' . "\n";
            echo '  <lastmod>' . date('Y-m-d', strtotime($blog['updated_at'])) . '</lastmod>' . "\n";
            echo '  <changefreq>weekly</changefreq>' . "\n";
            echo '  <priority>0.7</priority>' . "\n";
            echo '</url>' . "\n";
        }
    } else {
        // Add known blog posts from sitemap.txt
        $known_blogs = ['egg-rate-barwala', 'blog-1', 'blog-2'];
        foreach ($known_blogs as $blog) {
            echo '<url>' . "\n";
            echo '  <loc>https://todayeggrates.com/blog/' . $blog . '</loc>' . "\n";
            echo '  <lastmod>' . date('Y-m-d', strtotime('-1 month')) . '</lastmod>' . "\n";
            echo '  <changefreq>monthly</changefreq>' . "\n";
            echo '  <priority>0.7</priority>' . "\n";
            echo '</url>' . "\n";
        }
    }
} catch (PDOException $e) {
    // Log error but continue
    error_log("Error generating blog sitemap entries: " . $e->getMessage());
    // Add known blog posts from sitemap.txt as fallback
    $known_blogs = ['egg-rate-barwala', 'blog-1', 'blog-2'];
    foreach ($known_blogs as $blog) {
        echo '<url>' . "\n";
        echo '  <loc>https://todayeggrates.com/blog/' . $blog . '</loc>' . "\n";
        echo '  <lastmod>' . date('Y-m-d', strtotime('-1 month')) . '</lastmod>' . "\n";
        echo '  <changefreq>monthly</changefreq>' . "\n";
        echo '  <priority>0.7</priority>' . "\n";
        echo '</url>' . "\n";
    }
}

// Close XML
echo '</urlset>';