<?php
/**
 * Enhanced XML sitemap generator for SEO optimization
 * - Adds last modification dates
 * - Properly sets priority based on content importance
 * - Sets appropriate change frequency
 * - Creates sitemap index for better crawling
 */

// Include database connection
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

// Define file paths
$basePath = dirname(dirname(__DIR__)); // Go up two levels from seo directory
$sitemapXmlFile = $basePath . '/sitemap.xml';
$sitemapTxtFile = $basePath . '/sitemap.txt';
$sitemapIndexFile = $basePath . '/sitemap-index.xml';

// Create directory structure for sitemaps
$sitemapsDir = $basePath . '/sitemaps';
if (!file_exists($sitemapsDir)) {
    mkdir($sitemapsDir, 0755, true);
}

// Define sitemap files
$mainSitemap = $sitemapsDir . '/main-sitemap.xml';
$statesSitemap = $sitemapsDir . '/states-sitemap.xml';
$citiesSitemap = $sitemapsDir . '/cities-sitemap.xml';
$blogsSitemap = $sitemapsDir . '/blogs-sitemap.xml';

// Also create a copy in the php directory for local testing
$phpDirSitemapXml = dirname(__DIR__) . '/sitemap.xml';

// Make sure the directories exist and are writable
$baseDir = dirname($sitemapXmlFile);
if (!file_exists($baseDir)) {
    mkdir($baseDir, 0755, true);
}

// Current date in ISO format
$currentDate = date('c');
$baseUrl = 'https://todayeggrates.com';

// Function to get last modified date for a URL
function getLastModified($conn, $city = null, $state = null) {
    if ($city && $state) {
        // Get most recent egg rate date for city
        $stmt = $conn->prepare("SELECT MAX(date) as last_updated FROM egg_rates WHERE city = ? AND state = ?");
        $stmt->bind_param("ss", $city, $state);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return $row['last_updated'] ? date('c', strtotime($row['last_updated'])) : date('c');
        }
    } else if ($state) {
        // Get most recent egg rate date for state
        $stmt = $conn->prepare("SELECT MAX(date) as last_updated FROM egg_rates WHERE state = ?");
        $stmt->bind_param("s", $state);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return $row['last_updated'] ? date('c', strtotime($row['last_updated'])) : date('c');
        }
    }
    
    return date('c');
}

// Start generating sitemaps
// 1. Main sitemap - static pages
$mainXml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$mainXml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
             xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
             http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . PHP_EOL;

// Add homepage
$mainXml .= '  <url>' . PHP_EOL;
$mainXml .= '    <loc>' . $baseUrl . '/</loc>' . PHP_EOL;
$mainXml .= '    <lastmod>' . $currentDate . '</lastmod>' . PHP_EOL;
$mainXml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
$mainXml .= '    <priority>1.0</priority>' . PHP_EOL;
$mainXml .= '  </url>' . PHP_EOL;

// Add other static pages with appropriate priorities
$staticPages = [
    '/webstories' => ['changefreq' => 'daily', 'priority' => '0.8'],
    '/privacy-policy' => ['changefreq' => 'monthly', 'priority' => '0.3'],
    '/terms-of-service' => ['changefreq' => 'monthly', 'priority' => '0.3'],
    '/disclaimer' => ['changefreq' => 'monthly', 'priority' => '0.3'],
    '/blogs' => ['changefreq' => 'weekly', 'priority' => '0.7']
];

foreach ($staticPages as $page => $settings) {
    $mainXml .= '  <url>' . PHP_EOL;
    $mainXml .= '    <loc>' . $baseUrl . $page . '</loc>' . PHP_EOL;
    $mainXml .= '    <lastmod>' . $currentDate . '</lastmod>' . PHP_EOL;
    $mainXml .= '    <changefreq>' . $settings['changefreq'] . '</changefreq>' . PHP_EOL;
    $mainXml .= '    <priority>' . $settings['priority'] . '</priority>' . PHP_EOL;
    $mainXml .= '  </url>' . PHP_EOL;
}

$mainXml .= '</urlset>';
file_put_contents($mainSitemap, $mainXml);

// 2. States sitemap
$statesXml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$statesXml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// Get all states
$statesSql = "SELECT DISTINCT state FROM normalized_states ORDER BY state";
$statesResult = $conn->query($statesSql);

// Add entries for each state
while ($row = $statesResult->fetch_assoc()) {
    $state = $row['state'];
    // Skip "special" state which is used for featured rates
    if ($state === 'special') continue;
    
    // Create SEO-friendly URL
    $stateUrl = strtolower(str_replace(' ', '-', $state)) . '-egg-rate';
    $lastMod = getLastModified($conn, null, $state);
    
    $statesXml .= '  <url>' . PHP_EOL;
    $statesXml .= '    <loc>' . $baseUrl . '/' . $stateUrl . '</loc>' . PHP_EOL;
    $statesXml .= '    <lastmod>' . $lastMod . '</lastmod>' . PHP_EOL;
    $statesXml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
    $statesXml .= '    <priority>0.8</priority>' . PHP_EOL;
    $statesXml .= '  </url>' . PHP_EOL;
}

$statesXml .= '</urlset>';
file_put_contents($statesSitemap, $statesXml);

// 3. Cities sitemap
$citiesXml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$citiesXml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// Get all cities
$citiesSql = "SELECT DISTINCT c.city, s.state 
              FROM normalized_cities c 
              JOIN normalized_states s ON c.state_id = s.id 
              ORDER BY s.state, c.city";
$citiesResult = $conn->query($citiesSql);

// Add entries for each city
while ($row = $citiesResult->fetch_assoc()) {
    $city = $row['city'];
    $state = $row['state'];
    
    // Create SEO-friendly URLs
    $cityUrl = strtolower(str_replace(' ', '-', $city)) . '/' . strtolower(str_replace(' ', '-', $state)) . '-egg-rate';
    $lastMod = getLastModified($conn, $city, $state);
    
    $citiesXml .= '  <url>' . PHP_EOL;
    $citiesXml .= '    <loc>' . $baseUrl . '/' . $cityUrl . '</loc>' . PHP_EOL;
    $citiesXml .= '    <lastmod>' . $lastMod . '</lastmod>' . PHP_EOL;
    $citiesXml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
    $citiesXml .= '    <priority>0.7</priority>' . PHP_EOL;
    $citiesXml .= '  </url>' . PHP_EOL;
}

$citiesXml .= '</urlset>';
file_put_contents($citiesSitemap, $citiesXml);

// 4. Blogs sitemap
$blogsXml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$blogsXml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// Manually add blog entries - you could also fetch these from a database
$blogPosts = [
    '/blogs/understanding-todays-egg-rates' => '2025-05-01',
    '/blogs/understanding-egg-rates-in-india' => '2025-05-05',
    '/blogs/egg-rate-barwala' => '2025-05-07'
];

foreach ($blogPosts as $blogUrl => $publishDate) {
    $blogsXml .= '  <url>' . PHP_EOL;
    $blogsXml .= '    <loc>' . $baseUrl . $blogUrl . '</loc>' . PHP_EOL;
    $blogsXml .= '    <lastmod>' . date('c', strtotime($publishDate)) . '</lastmod>' . PHP_EOL;
    $blogsXml .= '    <changefreq>monthly</changefreq>' . PHP_EOL;
    $blogsXml .= '    <priority>0.6</priority>' . PHP_EOL;
    $blogsXml .= '  </url>' . PHP_EOL;
}

$blogsXml .= '</urlset>';
file_put_contents($blogsSitemap, $blogsXml);

// 5. Create sitemap index file
$sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$sitemapIndex .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// Add each sitemap to the index
$sitemaps = [
    'sitemaps/main-sitemap.xml',
    'sitemaps/states-sitemap.xml',
    'sitemaps/cities-sitemap.xml',
    'sitemaps/blogs-sitemap.xml',
    'webstories-sitemap.xml' // This is already being generated by another script
];

foreach ($sitemaps as $sitemap) {
    $sitemapIndex .= '  <sitemap>' . PHP_EOL;
    $sitemapIndex .= '    <loc>' . $baseUrl . '/' . $sitemap . '</loc>' . PHP_EOL;
    $sitemapIndex .= '    <lastmod>' . $currentDate . '</lastmod>' . PHP_EOL;
    $sitemapIndex .= '  </sitemap>' . PHP_EOL;
}

$sitemapIndex .= '</sitemapindex>';
file_put_contents($sitemapIndexFile, $sitemapIndex);

// Create a copy of the main sitemap for backward compatibility
file_put_contents($sitemapXmlFile, $mainXml);
file_put_contents($phpDirSitemapXml, $mainXml);

// Create a simple text sitemap with all URLs
$txtUrls = [];
$txtUrls[] = $baseUrl . '/';

// Add static pages
foreach ($staticPages as $page => $settings) {
    $txtUrls[] = $baseUrl . $page;
}

// Add state URLs
$statesResult = $conn->query($statesSql);
while ($row = $statesResult->fetch_assoc()) {
    $state = $row['state'];
    if ($state === 'special') continue;
    $stateUrl = strtolower(str_replace(' ', '-', $state)) . '-egg-rate';
    $txtUrls[] = $baseUrl . '/' . $stateUrl;
}

// Add city URLs
$citiesResult = $conn->query($citiesSql);
while ($row = $citiesResult->fetch_assoc()) {
    $city = $row['city'];
    $state = $row['state'];
    $cityUrl = strtolower(str_replace(' ', '-', $city)) . '/' . strtolower(str_replace(' ', '-', $state)) . '-egg-rate';
    $txtUrls[] = $baseUrl . '/' . $cityUrl;
}

// Add blog URLs
foreach ($blogPosts as $blogUrl => $publishDate) {
    $txtUrls[] = $baseUrl . $blogUrl;
}

// Write text sitemap
file_put_contents($sitemapTxtFile, implode(PHP_EOL, $txtUrls));

// Log the successful sitemap generation
$logMessage = date('Y-m-d H:i:s') . " - Sitemaps generated successfully with " . 
              count($txtUrls) . " total URLs\n";
file_put_contents(dirname(__DIR__) . '/error.log', $logMessage, FILE_APPEND);

echo "Sitemaps generated successfully!";

// Close the connection if it exists
if (isset($conn)) {
    $conn->close();
}
?>