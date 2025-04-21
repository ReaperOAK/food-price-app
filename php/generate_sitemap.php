<?php
// This script generates a sitemap.xml file for the website

require_once 'db.php';

// Connect to database
$conn = connectDB();

// Helper function to format date for sitemap
function formatDateForSitemap($date) {
    // If date is not provided, use current date
    if (empty($date)) {
        $date = date('Y-m-d');
    }
    // Return date in W3C format (YYYY-MM-DDThh:mm:ss+00:00)
    return date('c', strtotime($date));
}

// Start XML document
$xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" 
                xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
                http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . PHP_EOL;

// Base URLs with priority and change frequency
$mainUrls = [
    ['loc' => '', 'priority' => '1.0', 'changefreq' => 'daily', 'image' => '/eggpic.png', 'title' => 'Today\'s Egg Rate - Live Egg Prices Across India'],
    ['loc' => 'about', 'priority' => '0.7', 'changefreq' => 'monthly', 'image' => '/tee.png', 'title' => 'About Today\'s Egg Rate - Our Mission'],
    ['loc' => 'contact', 'priority' => '0.5', 'changefreq' => 'monthly', 'image' => '/tee.png', 'title' => 'Contact Us - Today\'s Egg Rate'],
    ['loc' => 'privacy-policy', 'priority' => '0.3', 'changefreq' => 'yearly', 'image' => '/tee.png', 'title' => 'Privacy Policy - Today\'s Egg Rate'],
    ['loc' => 'terms', 'priority' => '0.3', 'changefreq' => 'yearly', 'image' => '/tee.png', 'title' => 'Terms of Service - Today\'s Egg Rate'],
    ['loc' => 'blog', 'priority' => '0.8', 'changefreq' => 'weekly', 'image' => '/eggpic.png', 'title' => 'Egg Price Blog - Market Updates and Analysis']
];

// Add main URLs to sitemap
foreach ($mainUrls as $url) {
    $todayDate = formatDateForSitemap(date('Y-m-d'));
    $xml .= "\t<url>\n";
    $xml .= "\t\t<loc>https://todayeggrates.com/{$url['loc']}</loc>\n";
    $xml .= "\t\t<lastmod>{$todayDate}</lastmod>\n";
    $xml .= "\t\t<priority>{$url['priority']}</priority>\n";
    $xml .= "\t\t<changefreq>{$url['changefreq']}</changefreq>\n";
    
    // Add image if available
    if (isset($url['image'])) {
        $xml .= "\t\t<image:image>\n";
        $xml .= "\t\t\t<image:loc>https://todayeggrates.com{$url['image']}</image:loc>\n";
        $xml .= "\t\t\t<image:title>{$url['title']}</image:title>\n";
        $xml .= "\t\t</image:image>\n";
    }
    
    $xml .= "\t</url>\n";
}

// Get all states
$query = "SELECT DISTINCT state FROM states_cities ORDER BY state";
$result = mysqli_query($conn, $query);

// Add state URLs to sitemap
while ($row = mysqli_fetch_assoc($result)) {
    $state = $row['state'];
    $stateSlug = strtolower(str_replace(' ', '-', $state));
    $todayDate = formatDateForSitemap(date('Y-m-d'));
    
    $xml .= "\t<url>\n";
    $xml .= "\t\t<loc>https://todayeggrates.com/state/{$stateSlug}-egg-rate</loc>\n";
    $xml .= "\t\t<lastmod>{$todayDate}</lastmod>\n";
    $xml .= "\t\t<priority>0.9</priority>\n";
    $xml .= "\t\t<changefreq>daily</changefreq>\n";
    
    // Add state image
    $xml .= "\t\t<image:image>\n";
    $xml .= "\t\t\t<image:loc>https://todayeggrates.com/eggrate2.jpg</image:loc>\n";
    $xml .= "\t\t\t<image:title>Egg Rates in {$state} - Daily Updates</image:title>\n";
    $xml .= "\t\t</image:image>\n";
    
    $xml .= "\t</url>\n";
}

// Get all cities with their states
$query = "SELECT c.city, s.state FROM cities c JOIN states_cities s ON c.state_id = s.id ORDER BY s.state, c.city";
$result = mysqli_query($conn, $query);

// Add city URLs to sitemap
while ($row = mysqli_fetch_assoc($result)) {
    $city = $row['city'];
    $state = $row['state'];
    $citySlug = strtolower(str_replace(' ', '-', $city));
    
    // Get the latest update date for this city
    $rateQuery = "SELECT MAX(timestamp) as last_update FROM rates WHERE city = ? AND state = ?";
    $stmt = mysqli_prepare($conn, $rateQuery);
    mysqli_stmt_bind_param($stmt, "ss", $city, $state);
    mysqli_stmt_execute($stmt);
    $rateResult = mysqli_stmt_get_result($stmt);
    $rateRow = mysqli_fetch_assoc($rateResult);
    
    $lastmod = formatDateForSitemap($rateRow['last_update'] ?? date('Y-m-d'));
    
    $xml .= "\t<url>\n";
    $xml .= "\t\t<loc>https://todayeggrates.com/{$citySlug}-egg-rate</loc>\n";
    $xml .= "\t\t<lastmod>{$lastmod}</lastmod>\n";
    $xml .= "\t\t<priority>0.8</priority>\n";
    $xml .= "\t\t<changefreq>daily</changefreq>\n";
    
    // Try to find a matching thumbnail
    $thumbnailPath = "/images/webstories/thumbnail-{$citySlug}.jpg";
    $serverThumbnailPath = $_SERVER['DOCUMENT_ROOT'] . $thumbnailPath;
    
    if (file_exists($serverThumbnailPath)) {
        $xml .= "\t\t<image:image>\n";
        $xml .= "\t\t\t<image:loc>https://todayeggrates.com{$thumbnailPath}</image:loc>\n";
        $xml .= "\t\t\t<image:title>Egg Rate in {$city}, {$state} - Daily Price Updates</image:title>\n";
        $xml .= "\t\t</image:image>\n";
    } else {
        // Use default image
        $xml .= "\t\t<image:image>\n";
        $xml .= "\t\t\t<image:loc>https://todayeggrates.com/eggchicken.jpg</image:loc>\n";
        $xml .= "\t\t\t<image:title>Egg Rate in {$city}, {$state} - Daily Price Updates</image:title>\n";
        $xml .= "\t\t</image:image>\n";
    }
    
    $xml .= "\t</url>\n";
}

// Close XML sitemap
$xml .= '</urlset>';

// Save sitemap to file
$sitemap_file = $_SERVER['DOCUMENT_ROOT'] . '/sitemap.xml';
file_put_contents($sitemap_file, $xml);

// Also create a compressed version for better performance
if (function_exists('gzencode')) {
    $compressed = gzencode($xml, 9);
    file_put_contents($sitemap_file . '.gz', $compressed);
}

// Create a text version for simple crawlers and as a backup
$sitemap_txt = '';
foreach ($mainUrls as $url) {
    $sitemap_txt .= "https://todayeggrates.com/{$url['loc']}\n";
}

// Add state URLs to text sitemap
mysqli_data_seek($result, 0); // Reset pointer
$query = "SELECT DISTINCT state FROM states_cities ORDER BY state";
$result = mysqli_query($conn, $query);
while ($row = mysqli_fetch_assoc($result)) {
    $state = $row['state'];
    $stateSlug = strtolower(str_replace(' ', '-', $state));
    $sitemap_txt .= "https://todayeggrates.com/state/{$stateSlug}-egg-rate\n";
}

// Add city URLs to text sitemap
$query = "SELECT c.city, s.state FROM cities c JOIN states_cities s ON c.state_id = s.id ORDER BY s.state, c.city";
$result = mysqli_query($conn, $query);
while ($row = mysqli_fetch_assoc($result)) {
    $city = $row['city'];
    $citySlug = strtolower(str_replace(' ', '-', $city));
    $sitemap_txt .= "https://todayeggrates.com/{$citySlug}-egg-rate\n";
}

// Save text sitemap
file_put_contents($_SERVER['DOCUMENT_ROOT'] . '/sitemap.txt', $sitemap_txt);

// Close database connection
mysqli_close($conn);

echo "Sitemap generated successfully!";
?>