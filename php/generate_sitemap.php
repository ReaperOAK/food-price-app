<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
include 'db.php';

// Configuration with absolute paths
$basePath = realpath($_SERVER['DOCUMENT_ROOT']);
$sitemapFile = $basePath . '/sitemap.xml';
$baseURL = 'https://todayeggrates.com';

// Create XML sitemap header
$xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// Add static pages
$staticPages = [
    '' => ['priority' => '1.0', 'changefreq' => 'daily'],
    'blog' => ['priority' => '0.8', 'changefreq' => 'weekly'],
    'webstories' => ['priority' => '0.9', 'changefreq' => 'daily'],
    'privacy-policy' => ['priority' => '0.5', 'changefreq' => 'monthly'],
    'disclaimer' => ['priority' => '0.5', 'changefreq' => 'monthly'],
    'tos' => ['priority' => '0.5', 'changefreq' => 'monthly']
];

foreach ($staticPages as $page => $settings) {
    $xml .= '  <url>' . PHP_EOL;
    $xml .= '    <loc>' . $baseURL . '/' . $page . '</loc>' . PHP_EOL;
    $xml .= '    <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
    $xml .= '    <changefreq>' . $settings['changefreq'] . '</changefreq>' . PHP_EOL;
    $xml .= '    <priority>' . $settings['priority'] . '</priority>' . PHP_EOL;
    $xml .= '  </url>' . PHP_EOL;
}

// Get all states - first try from normalized tables, then fall back to original
$states = [];
try {
    // Try to get states from normalized tables
    $statesSql = "SELECT id, name FROM states ORDER BY name";
    $statesResult = $conn->query($statesSql);
    
    if ($statesResult && $statesResult->num_rows > 0) {
        while ($row = $statesResult->fetch_assoc()) {
            $states[$row['id']] = $row['name'];
        }
    } else {
        throw new Exception("No states found in normalized tables");
    }
} catch (Exception $e) {
    // Fall back to original table
    $statesSql = "SELECT DISTINCT state FROM egg_rates WHERE state != 'special' ORDER BY state";
    $statesResult = $conn->query($statesSql);
    
    if ($statesResult && $statesResult->num_rows > 0) {
        while ($row = $statesResult->fetch_assoc()) {
            $states[] = $row['state'];
        }
    }
}

// Process each state
if (!empty($states)) {
    foreach ($states as $stateId => $state) {
        $stateSlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $state));
        
        // Add state page URL
        $xml .= '  <url>' . PHP_EOL;
        $xml .= '    <loc>' . $baseURL . '/state/' . $stateSlug . '-egg-rate</loc>' . PHP_EOL;
        $xml .= '    <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
        $xml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
        $xml .= '    <priority>0.8</priority>' . PHP_EOL;
        $xml .= '  </url>' . PHP_EOL;
        
        // Get cities for this state - try normalized tables first
        $cities = [];
        try {
            if (is_numeric($stateId)) {
                // Using normalized tables (states array has id => name format)
                $citiesSql = "SELECT name FROM cities WHERE state_id = $stateId ORDER BY name";
                $citiesResult = $conn->query($citiesSql);
                
                if ($citiesResult && $citiesResult->num_rows > 0) {
                    while ($row = $citiesResult->fetch_assoc()) {
                        $cities[] = $row['name'];
                    }
                } else {
                    throw new Exception("No cities found for state ID: $stateId");
                }
            } else {
                throw new Exception("State ID is not numeric");
            }
        } catch (Exception $e) {
            // Fall back to original table
            $citiesSql = "SELECT DISTINCT city FROM egg_rates WHERE state = '$state' ORDER BY city";
            $citiesResult = $conn->query($citiesSql);
            
            if ($citiesResult && $citiesResult->num_rows > 0) {
                while ($row = $citiesResult->fetch_assoc()) {
                    $cities[] = $row['city'];
                }
            }
        }
        
        // Add city pages
        foreach ($cities as $city) {
            $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
            
            // Add city page URL
            $xml .= '  <url>' . PHP_EOL;
            $xml .= '    <loc>' . $baseURL . '/' . $citySlug . '-egg-rate</loc>' . PHP_EOL;
            $xml .= '    <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
            $xml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
            $xml .= '    <priority>0.9</priority>' . PHP_EOL;
            $xml .= '  </url>' . PHP_EOL;
        }
    }
}

// Get all blog posts
// In a real implementation, you would fetch these from a database or file system
// For now, we'll add the known blog posts
$blogPosts = [
    'egg-rate-barwala' => '2023-08-15',
    'blog-1' => '2023-07-20',
    'blog-2' => '2023-09-05'
];

foreach ($blogPosts as $slug => $date) {
    $xml .= '  <url>' . PHP_EOL;
    $xml .= '    <loc>' . $baseURL . '/blog/' . $slug . '</loc>' . PHP_EOL;
    $xml .= '    <lastmod>' . $date . '</lastmod>' . PHP_EOL;
    $xml .= '    <changefreq>monthly</changefreq>' . PHP_EOL;
    $xml .= '    <priority>0.7</priority>' . PHP_EOL;
    $xml .= '  </url>' . PHP_EOL;
}

// Get all web stories
$storiesDir = $basePath . '/webstories';
if (is_dir($storiesDir)) {
    $files = glob("$storiesDir/*.html");
    foreach ($files as $file) {
        // Skip index.html
        if (basename($file) === 'index.html') {
            continue;
        }
        
        $filename = basename($file);
        $lastMod = date('Y-m-d', filemtime($file));
        
        $xml .= '  <url>' . PHP_EOL;
        $xml .= '    <loc>' . $baseURL . '/webstories/' . $filename . '</loc>' . PHP_EOL;
        $xml .= '    <lastmod>' . $lastMod . '</lastmod>' . PHP_EOL;
        $xml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
        $xml .= '    <priority>0.8</priority>' . PHP_EOL;
        $xml .= '  </url>' . PHP_EOL;
    }
}

// Close XML sitemap
$xml .= '</urlset>';

// Save sitemap to file
file_put_contents($sitemapFile, $xml);

// Create a text version of the sitemap for Google verification
$urls = [];
preg_match_all('/<loc>(.*?)<\/loc>/s', $xml, $matches);
if (isset($matches[1]) && !empty($matches[1])) {
    $urls = $matches[1];
}

$textSitemap = implode("\n", $urls);
file_put_contents($basePath . '/sitemap.txt', $textSitemap);

echo "Sitemap generated with " . count($urls) . " URLs.<br>";
echo "XML sitemap: <a href='/sitemap.xml' target='_blank'>/sitemap.xml</a><br>";
echo "Text sitemap: <a href='/sitemap.txt' target='_blank'>/sitemap.txt</a>";

// Close database connection
$conn->close();
?>