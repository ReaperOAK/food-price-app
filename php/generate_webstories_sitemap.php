<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
include_once 'db.php';

// Configuration - use absolute paths for consistency
$basePath = realpath($_SERVER['DOCUMENT_ROOT']);
$storyDataFile = $basePath . '/webstories/story-data.json';
$sitemapFile = $basePath . '/webstories-sitemap.xml';
$baseURL = 'https://todayeggrates.com';

// Check if story data file exists
if (!file_exists($storyDataFile)) {
    die("Error: Story data file not found at $storyDataFile. Run generate_web_stories.php first.");
}

// Load story data
$storyData = json_decode(file_get_contents($storyDataFile), true);
if (!$storyData) {
    die("Error: Failed to parse story data from $storyDataFile.");
}

// Create sitemap XML
$xml = new DOMDocument('1.0', 'UTF-8');
$xml->formatOutput = true;

// Create the urlset element with namespaces
$urlset = $xml->createElement('urlset');
$urlset->setAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
$urlset->setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
$urlset->setAttribute('xmlns:image', 'http://www.google.com/schemas/sitemap-image/1.1');
$urlset->setAttribute('xmlns:news', 'http://www.google.com/schemas/sitemap-news/0.9');
$urlset->setAttribute('xmlns:video', 'http://www.google.com/schemas/sitemap-video/1.1');
$urlset->setAttribute('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd');

$xml->appendChild($urlset);

// Add webstories index page as highest priority
$indexUrl = $xml->createElement('url');
$indexLoc = $xml->createElement('loc', "$baseURL/webstories/");
$indexUrl->appendChild($indexLoc);

$indexLastmod = $xml->createElement('lastmod', date('Y-m-d'));
$indexUrl->appendChild($indexLastmod);

$indexChangefreq = $xml->createElement('changefreq', 'daily');
$indexUrl->appendChild($indexChangefreq);

$indexPriority = $xml->createElement('priority', '1.0');
$indexUrl->appendChild($indexPriority);

// Add image for index page
$indexImage = $xml->createElement('image:image');
$indexImageLoc = $xml->createElement('image:loc', "$baseURL/eggrate2.jpg");
$indexImage->appendChild($indexImageLoc);
$indexImageCaption = $xml->createElement('image:caption', 'Egg Rate Web Stories Collection');
$indexImage->appendChild($indexImageCaption);
$indexUrl->appendChild($indexImage);

$urlset->appendChild($indexUrl);

// Process each story
foreach ($storyData as $story) {
    $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $story['city']));
    
    // Get the story URL
    $storyURL = "$baseURL/webstory/$citySlug-egg-rate";
    
    // Create url element
    $url = $xml->createElement('url');
    
    // Add location
    $loc = $xml->createElement('loc', $storyURL);
    $url->appendChild($loc);
    
    // Add last modified date
    $lastmod = $xml->createElement('lastmod', $story['lastmod']);
    $url->appendChild($lastmod);
    
    // Add change frequency - set to daily for stories with recent updates
    $todayDate = date('Y-m-d');
    $lastUpdateDays = (strtotime($todayDate) - strtotime($story['lastmod'])) / (60 * 60 * 24);
    
    if ($lastUpdateDays <= 2) {
        $changefreq = $xml->createElement('changefreq', 'daily');
    } else if ($lastUpdateDays <= 7) {
        $changefreq = $xml->createElement('changefreq', 'weekly');
    } else {
        $changefreq = $xml->createElement('changefreq', 'monthly');
    }
    $url->appendChild($changefreq);
    
    // Add priority - higher priority for newer content
    if ($lastUpdateDays <= 2) {
        $priority = $xml->createElement('priority', '0.9');
    } else if ($lastUpdateDays <= 7) {
        $priority = $xml->createElement('priority', '0.8');
    } else {
        $priority = $xml->createElement('priority', '0.7');
    }
    $url->appendChild($priority);
    
    // Add image data for rich media sitemaps
    $imageURL = "$baseURL/images/webstories/thumbnail-$citySlug.jpg";
    
    $image = $xml->createElement('image:image');
    $imageLoc = $xml->createElement('image:loc', $imageURL);
    $image->appendChild($imageLoc);
    
    $imageTitle = $xml->createElement('image:title', "Egg Rate in {$story['city']}, {$story['state']}");
    $image->appendChild($imageTitle);
    
    $imageCaption = $xml->createElement('image:caption', "Current egg price in {$story['city']}, {$story['state']} - Today Egg Rates");
    $image->appendChild($imageCaption);
    
    $url->appendChild($image);
    
    // Add news data for news sitemaps when stories are recent (less than 2 days old)
    if ($lastUpdateDays <= 2) {
        $news = $xml->createElement('news:news');
        
        $publication = $xml->createElement('news:publication');
        $name = $xml->createElement('news:name', 'Today Egg Rates');
        $publication->appendChild($name);
        
        $language = $xml->createElement('news:language', 'en');
        $publication->appendChild($language);
        
        $news->appendChild($publication);
        
        $pubDate = $xml->createElement('news:publication_date', date('c', strtotime($story['lastmod'])));
        $news->appendChild($pubDate);
        
        $title = $xml->createElement('news:title', "Egg Rate in {$story['city']}, {$story['state']}");
        $news->appendChild($title);
        
        $keywords = $xml->createElement('news:keywords', "egg price, {$story['city']}, {$story['state']}, poultry prices, egg rates");
        $news->appendChild($keywords);
        
        $url->appendChild($news);
    }
    
    // Add URL to urlset
    $urlset->appendChild($url);
}

// Save the sitemap
if ($xml->save($sitemapFile)) {
    echo "Webstories sitemap saved to $sitemapFile<br>";
    
    // Also copy to document root for direct access
    $docRootSitemapFile = $basePath . '/webstories-sitemap.xml';
    if (copy($sitemapFile, $docRootSitemapFile)) {
        echo "Sitemap copied to document root at $docRootSitemapFile<br>";
    } else {
        echo "Warning: Failed to copy sitemap to document root<br>";
    }
    
    // Ping search engines to notify them of the updated sitemap
    $pingURLs = [
        "https://www.google.com/ping?sitemap=" . urlencode("$baseURL/webstories-sitemap.xml"),
        "https://www.bing.com/ping?sitemap=" . urlencode("$baseURL/webstories-sitemap.xml")
    ];
    
    foreach ($pingURLs as $pingURL) {
        $ch = curl_init($pingURL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_exec($ch);
        curl_close($ch);
    }
    
    echo "Search engines pinged about sitemap update<br>";
    
    // Also update the sitemap index file if it exists
    updateSitemapIndex($basePath, $baseURL);
    
} else {
    echo "Error: Failed to save sitemap to $sitemapFile<br>";
}

// Update sitemap index to include webstories sitemap
function updateSitemapIndex($basePath, $baseURL) {
    $sitemapIndexFile = $basePath . '/sitemap-index.xml';
    
    if (!file_exists($sitemapIndexFile)) {
        // Create a new sitemap index if it doesn't exist
        $xml = new DOMDocument('1.0', 'UTF-8');
        $xml->formatOutput = true;
        
        $sitemapIndex = $xml->createElement('sitemapindex');
        $sitemapIndex->setAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
        $xml->appendChild($sitemapIndex);
        
        // Add main sitemap
        $sitemap = $xml->createElement('sitemap');
        $loc = $xml->createElement('loc', "$baseURL/sitemap.xml");
        $sitemap->appendChild($loc);
        $lastmod = $xml->createElement('lastmod', date('Y-m-d'));
        $sitemap->appendChild($lastmod);
        $sitemapIndex->appendChild($sitemap);
        
        // Add webstories sitemap
        $sitemap = $xml->createElement('sitemap');
        $loc = $xml->createElement('loc', "$baseURL/webstories-sitemap.xml");
        $sitemap->appendChild($loc);
        $lastmod = $xml->createElement('lastmod', date('Y-m-d'));
        $sitemap->appendChild($lastmod);
        $sitemapIndex->appendChild($sitemap);
        
        $xml->save($sitemapIndexFile);
        echo "Created new sitemap index at $sitemapIndexFile<br>";
    } else {
        // Update existing sitemap index
        $xml = new DOMDocument('1.0', 'UTF-8');
        $xml->preserveWhiteSpace = false;
        $xml->formatOutput = true;
        
        if ($xml->load($sitemapIndexFile)) {
            $sitemapIndex = $xml->documentElement;
            
            // Check if webstories sitemap already exists in the index
            $webstoriesSitemapExists = false;
            $sitemaps = $sitemapIndex->getElementsByTagName('sitemap');
            
            foreach ($sitemaps as $sitemap) {
                $locNodes = $sitemap->getElementsByTagName('loc');
                if ($locNodes->length > 0) {
                    $loc = $locNodes->item(0)->textContent;
                    if (strpos($loc, 'webstories-sitemap.xml') !== false) {
                        $webstoriesSitemapExists = true;
                        
                        // Update lastmod
                        $lastmodNodes = $sitemap->getElementsByTagName('lastmod');
                        if ($lastmodNodes->length > 0) {
                            $lastmodNodes->item(0)->textContent = date('Y-m-d');
                        } else {
                            $lastmod = $xml->createElement('lastmod', date('Y-m-d'));
                            $sitemap->appendChild($lastmod);
                        }
                        break;
                    }
                }
            }
            
            // Add webstories sitemap if it doesn't exist
            if (!$webstoriesSitemapExists) {
                $sitemap = $xml->createElement('sitemap');
                $loc = $xml->createElement('loc', "$baseURL/webstories-sitemap.xml");
                $sitemap->appendChild($loc);
                $lastmod = $xml->createElement('lastmod', date('Y-m-d'));
                $sitemap->appendChild($lastmod);
                $sitemapIndex->appendChild($sitemap);
            }
            
            $xml->save($sitemapIndexFile);
            echo "Updated sitemap index at $sitemapIndexFile<br>";
        } else {
            echo "Error: Failed to load existing sitemap index from $sitemapIndexFile<br>";
        }
    }
}

// Close the database connection
$conn->close();
?>
