<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
include 'db.php';

// Configuration with absolute paths
$basePath = realpath($_SERVER['DOCUMENT_ROOT']);
$sitemapFile = $basePath . '/sitemap.xml';
$baseURL = 'https://todayeggrates.com';
$currentDate = date('Y-m-d');

// Create XML sitemap header with additional namespaces for image and news
$xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . PHP_EOL;
$xml .= '        xmlns:xhtml="http://www.w3.org/1999/xhtml"' . PHP_EOL;
$xml .= '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' . PHP_EOL;
$xml .= '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">' . PHP_EOL;

// Add static pages with improved descriptions
$staticPages = [
    '' => [
        'priority' => '1.0', 
        'changefreq' => 'daily',
        'title' => 'Today Egg Rates - Check Latest Egg Price in India',
        'desc' => 'Get updated egg rates across India. Check today\'s NECC egg prices, wholesale rates, and egg price list for all major cities and states.'
    ],
    'blog' => [
        'priority' => '0.8', 
        'changefreq' => 'weekly',
        'title' => 'Egg Price Blog - Latest News on Egg Market in India',
        'desc' => 'Read our blog posts about egg prices, market trends, and insights into the poultry industry in India.'
    ],
    'webstories' => [
        'priority' => '0.9', 
        'changefreq' => 'daily',
        'title' => 'Egg Price Web Stories - Visual Updates on Egg Rates',
        'desc' => 'View our visual web stories featuring the latest egg prices across different cities in India.'
    ],
    'privacy-policy' => [
        'priority' => '0.5', 
        'changefreq' => 'monthly',
        'title' => 'Privacy Policy - Today Egg Rates',
        'desc' => 'Our privacy policy outlining how we collect, use, and protect your information.'
    ],
    'disclaimer' => [
        'priority' => '0.5', 
        'changefreq' => 'monthly',
        'title' => 'Disclaimer - Today Egg Rates',
        'desc' => 'Disclaimer regarding the accuracy and use of egg price information on our website.'
    ],
    'terms' => [
        'priority' => '0.5', 
        'changefreq' => 'monthly',
        'title' => 'Terms of Service - Today Egg Rates',
        'desc' => 'Terms and conditions governing the use of the Today Egg Rates website.'
    ]
];

// Add image paths for standard content
$standardImages = [
    '' => '/eggrate2.jpg',
    'blog' => '/eggchicken.jpg',
    'webstories' => '/desiegg.jpg'
];

foreach ($staticPages as $page => $settings) {
    $xml .= '  <url>' . PHP_EOL;
    $xml .= '    <loc>' . $baseURL . '/' . $page . '</loc>' . PHP_EOL;
    $xml .= '    <lastmod>' . $currentDate . '</lastmod>' . PHP_EOL;
    $xml .= '    <changefreq>' . $settings['changefreq'] . '</changefreq>' . PHP_EOL;
    $xml .= '    <priority>' . $settings['priority'] . '</priority>' . PHP_EOL;
    
    // Add images if available
    if (isset($standardImages[$page])) {
        $imagePath = $standardImages[$page];
        $xml .= '    <image:image>' . PHP_EOL;
        $xml .= '      <image:loc>' . $baseURL . $imagePath . '</image:loc>' . PHP_EOL;
        $xml .= '      <image:caption>' . htmlspecialchars($settings['title']) . '</image:caption>' . PHP_EOL;
        $xml .= '      <image:title>' . htmlspecialchars($settings['title']) . '</image:title>' . PHP_EOL;
        $xml .= '    </image:image>' . PHP_EOL;
    }
    
    $xml .= '  </url>' . PHP_EOL;
}

// Get all states from database
$statesSql = "SELECT DISTINCT state FROM egg_rates WHERE state != 'special' ORDER BY state";
$statesResult = $conn->query($statesSql);

if ($statesResult && $statesResult->num_rows > 0) {
    while ($row = $statesResult->fetch_assoc()) {
        $state = $row['state'];
        $stateSlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $state));
        
        // Add state page URL with improved SEO title
        $xml .= '  <url>' . PHP_EOL;
        $xml .= '    <loc>' . $baseURL . '/state/' . $stateSlug . '-egg-rate</loc>' . PHP_EOL;
        $xml .= '    <lastmod>' . $currentDate . '</lastmod>' . PHP_EOL;
        $xml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
        $xml .= '    <priority>0.8</priority>' . PHP_EOL;
        
        // Add state image if available
        $stateImagePath = "/images/states/{$stateSlug}.jpg";
        if (file_exists($basePath . $stateImagePath)) {
            $xml .= '    <image:image>' . PHP_EOL;
            $xml .= '      <image:loc>' . $baseURL . $stateImagePath . '</image:loc>' . PHP_EOL;
            $xml .= '      <image:caption>Egg rates in ' . $state . '</image:caption>' . PHP_EOL;
            $xml .= '      <image:title>Today\'s Egg Rates in ' . $state . '</image:title>' . PHP_EOL;
            $xml .= '    </image:image>' . PHP_EOL;
        } else {
            // Use a default image if state-specific image not available
            $xml .= '    <image:image>' . PHP_EOL;
            $xml .= '      <image:loc>' . $baseURL . '/eggrate2.jpg</image:loc>' . PHP_EOL;
            $xml .= '      <image:caption>Egg rates in ' . $state . '</image:caption>' . PHP_EOL;
            $xml .= '      <image:title>Today\'s Egg Rates in ' . $state . '</image:title>' . PHP_EOL;
            $xml .= '    </image:image>' . PHP_EOL;
        }
        
        // Add links to home as alternate
        $xml .= '    <xhtml:link rel="alternate" hreflang="en" href="' . $baseURL . '/" />' . PHP_EOL;
        $xml .= '  </url>' . PHP_EOL;
        
        // Get cities for this state
        $citiesSql = "SELECT DISTINCT city FROM egg_rates WHERE state = '$state' ORDER BY city";
        $citiesResult = $conn->query($citiesSql);
        
        if ($citiesResult && $citiesResult->num_rows > 0) {
            while ($cityRow = $citiesResult->fetch_assoc()) {
                $city = $cityRow['city'];
                $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
                
                // Get last update date for this city specifically
                $lastUpdateSql = "SELECT MAX(date) as last_date FROM egg_rates WHERE city = '$city' AND state = '$state'";
                $lastUpdateResult = $conn->query($lastUpdateSql);
                $lastUpdateDate = $currentDate; // Default to today
                
                if ($lastUpdateResult && $lastUpdateResult->num_rows > 0) {
                    $lastUpdateRow = $lastUpdateResult->fetch_assoc();
                    if (!empty($lastUpdateRow['last_date'])) {
                        $lastUpdateDate = $lastUpdateRow['last_date'];
                    }
                }
                
                // Get latest rate for the city if available
                $rateSql = "SELECT rate FROM egg_rates WHERE city = '$city' AND state = '$state' ORDER BY date DESC LIMIT 1";
                $rateResult = $conn->query($rateSql);
                $rateInfo = '';
                
                if ($rateResult && $rateResult->num_rows > 0) {
                    $rateRow = $rateResult->fetch_assoc();
                    if (!empty($rateRow['rate'])) {
                        $rateInfo = " - ₹" . $rateRow['rate'] . " per egg";
                    }
                }
                
                // Add city page URL with better SEO structure
                $xml .= '  <url>' . PHP_EOL;
                $xml .= '    <loc>' . $baseURL . '/' . $citySlug . '-egg-rate</loc>' . PHP_EOL;
                $xml .= '    <lastmod>' . $lastUpdateDate . '</lastmod>' . PHP_EOL;
                $xml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
                $xml .= '    <priority>0.9</priority>' . PHP_EOL;
                
                // Add images for city if available
                $cityImagePath = "/images/cities/{$citySlug}.jpg";
                if (file_exists($basePath . $cityImagePath)) {
                    $xml .= '    <image:image>' . PHP_EOL;
                    $xml .= '      <image:loc>' . $baseURL . $cityImagePath . '</image:loc>' . PHP_EOL;
                    $xml .= '      <image:caption>Today\'s Egg Rate in ' . $city . ', ' . $state . $rateInfo . '</image:caption>' . PHP_EOL;
                    $xml .= '      <image:title>Egg Price in ' . $city . '</image:title>' . PHP_EOL;
                    $xml .= '    </image:image>' . PHP_EOL;
                } else {
                    // Use a default image if city-specific image not available
                    $xml .= '    <image:image>' . PHP_EOL;
                    $xml .= '      <image:loc>' . $baseURL . '/eggpic.png</image:loc>' . PHP_EOL;
                    $xml .= '      <image:caption>Today\'s Egg Rate in ' . $city . ', ' . $state . $rateInfo . '</image:caption>' . PHP_EOL;
                    $xml .= '      <image:title>Egg Price in ' . $city . '</image:title>' . PHP_EOL;
                    $xml .= '    </image:image>' . PHP_EOL;
                }
                
                // Add alternate links for city page to state page
                $xml .= '    <xhtml:link rel="alternate" hreflang="en" href="' . $baseURL . '/state/' . $stateSlug . '-egg-rate" />' . PHP_EOL;
                $xml .= '  </url>' . PHP_EOL;
            }
        }
    }
}

// Get all blog posts - improved with dynamic fetching from src/data/blogs.js
// Try to load the blogs from the JavaScript file
$blogsSrc = $basePath . '/../src/data/blogs.js';
$blogPosts = [];

if (file_exists($blogsSrc)) {
    $content = file_get_contents($blogsSrc);
    // Extract blog data using regex
    preg_match_all('/{\s*id:\s*[\'"]([^\'"]+)[\'"]\s*,\s*title:\s*[\'"]([^\'"]+)[\'"]\s*,\s*date:\s*[\'"]([^\'"]+)[\'"]/s', $content, $matches, PREG_SET_ORDER);
    
    foreach ($matches as $match) {
        $blogPosts[$match[1]] = [
            'date' => $match[3],
            'title' => $match[2]
        ];
    }
} else {
    // Fallback to known blog posts
    $blogPosts = [
        'egg-rate-barwala' => [
            'date' => '2023-08-15',
            'title' => 'Egg Rates in Barwala - Latest Updates'
        ],
        'blog-1' => [
            'date' => '2023-07-20',
            'title' => 'Understanding Egg Prices in India'
        ],
        'blog-2' => [
            'date' => '2023-09-05',
            'title' => 'Egg Market Trends 2023'
        ]
    ];
}

foreach ($blogPosts as $slug => $info) {
    $xml .= '  <url>' . PHP_EOL;
    $xml .= '    <loc>' . $baseURL . '/blog/' . $slug . '</loc>' . PHP_EOL;
    $xml .= '    <lastmod>' . $info['date'] . '</lastmod>' . PHP_EOL;
    $xml .= '    <changefreq>monthly</changefreq>' . PHP_EOL;
    $xml .= '    <priority>0.7</priority>' . PHP_EOL;
    
    // Add blog image if available
    $blogImagePath = "/images/blogs/{$slug}.jpg";
    if (file_exists($basePath . $blogImagePath)) {
        $xml .= '    <image:image>' . PHP_EOL;
        $xml .= '      <image:loc>' . $baseURL . $blogImagePath . '</image:loc>' . PHP_EOL;
        $xml .= '      <image:caption>' . htmlspecialchars($info['title']) . '</image:caption>' . PHP_EOL;
        $xml .= '      <image:title>' . htmlspecialchars($info['title']) . '</image:title>' . PHP_EOL;
        $xml .= '    </image:image>' . PHP_EOL;
    } else {
        // Default blog images
        $defaultImages = [
            'egg-rate-barwala' => '/desiegg.jpg',
            'blog-1' => '/eggchicken.jpg',
            'blog-2' => '/eggpic.png'
        ];
        
        $defaultImage = isset($defaultImages[$slug]) ? $defaultImages[$slug] : '/eggchicken.jpg';
        
        $xml .= '    <image:image>' . PHP_EOL;
        $xml .= '      <image:loc>' . $baseURL . $defaultImage . '</image:loc>' . PHP_EOL;
        $xml .= '      <image:caption>' . htmlspecialchars($info['title']) . '</image:caption>' . PHP_EOL;
        $xml .= '      <image:title>' . htmlspecialchars($info['title']) . '</image:title>' . PHP_EOL;
        $xml .= '    </image:image>' . PHP_EOL;
    }
    
    // Add news sitemap element for blog posts less than 2 days old
    $postDate = new DateTime($info['date']);
    $now = new DateTime();
    $interval = $now->diff($postDate);
    if ($interval->days < 2) {
        $xml .= '    <news:news>' . PHP_EOL;
        $xml .= '      <news:publication>' . PHP_EOL;
        $xml .= '        <news:name>Today Egg Rates</news:name>' . PHP_EOL;
        $xml .= '        <news:language>en</news:language>' . PHP_EOL;
        $xml .= '      </news:publication>' . PHP_EOL;
        $xml .= '      <news:publication_date>' . $info['date'] . '</news:publication_date>' . PHP_EOL;
        $xml .= '      <news:title>' . htmlspecialchars($info['title']) . '</news:title>' . PHP_EOL;
        $xml .= '    </news:news>' . PHP_EOL;
    }
    
    $xml .= '  </url>' . PHP_EOL;
}

// Get all web stories with improved image handling
$storiesDir = $basePath . '/webstories';
if (is_dir($storiesDir)) {
    $files = glob("$storiesDir/*.html");
    foreach ($files as $file) {
        // Skip index.html
        if (basename($file) === 'index.html') {
            continue;
        }
        
        $filename = basename($file);
        $storySlug = pathinfo($filename, PATHINFO_FILENAME);
        $lastMod = date('Y-m-d', filemtime($file));
        
        // Extract story title and cover image if possible
        $storyContent = file_get_contents($file);
        $title = '';
        $coverImage = '';
        $description = '';
        
        // Extract title
        if (preg_match('/<title>(.*?)<\/title>/s', $storyContent, $titleMatch)) {
            $title = $titleMatch[1];
        }
        
        // Extract description if available
        if (preg_match('/<meta\s+name="description"\s+content="([^"]+)"/', $storyContent, $descMatch)) {
            $description = $descMatch[1];
        }
        
        // Extract cover image
        if (preg_match('/<amp-story-page id="cover".*?<amp-img.*?src="(.*?)".*?>/s', $storyContent, $imgMatch)) {
            $coverImage = $imgMatch[1];
            // Make sure the path is absolute
            if (strpos($coverImage, 'http') !== 0) {
                $coverImage = $baseURL . '/' . ltrim($coverImage, '/');
            }
        }
        
        $xml .= '  <url>' . PHP_EOL;
        $xml .= '    <loc>' . $baseURL . '/webstory/' . $storySlug . '</loc>' . PHP_EOL;
        $xml .= '    <lastmod>' . $lastMod . '</lastmod>' . PHP_EOL;
        $xml .= '    <changefreq>daily</changefreq>' . PHP_EOL;
        $xml .= '    <priority>0.8</priority>' . PHP_EOL;
        
        // Add image information if available
        if (!empty($coverImage)) {
            $xml .= '    <image:image>' . PHP_EOL;
            $xml .= '      <image:loc>' . $coverImage . '</image:loc>' . PHP_EOL;
            if (!empty($title)) {
                $xml .= '      <image:title>' . htmlspecialchars($title) . '</image:title>' . PHP_EOL;
                $xml .= '      <image:caption>' . htmlspecialchars($description ?: $title) . '</image:caption>' . PHP_EOL;
            }
            $xml .= '    </image:image>' . PHP_EOL;
        }
        
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

// Create an index sitemap that includes both the main sitemap and webstories sitemap
$sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$sitemapIndex .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// Add main sitemap
$sitemapIndex .= '  <sitemap>' . PHP_EOL;
$sitemapIndex .= '    <loc>' . $baseURL . '/sitemap.xml</loc>' . PHP_EOL;
$sitemapIndex .= '    <lastmod>' . $currentDate . '</lastmod>' . PHP_EOL;
$sitemapIndex .= '  </sitemap>' . PHP_EOL;

// Add webstories sitemap
$webstoriesSitemapPath = $basePath . '/webstories-sitemap.xml';
if (file_exists($webstoriesSitemapPath)) {
    $webstoriesLastMod = date('Y-m-d', filemtime($webstoriesSitemapPath));
    $sitemapIndex .= '  <sitemap>' . PHP_EOL;
    $sitemapIndex .= '    <loc>' . $baseURL . '/webstories-sitemap.xml</loc>' . PHP_EOL;
    $sitemapIndex .= '    <lastmod>' . $webstoriesLastMod . '</lastmod>' . PHP_EOL;
    $sitemapIndex .= '  </sitemap>' . PHP_EOL;
}

$sitemapIndex .= '</sitemapindex>';

// Save sitemap index to file
file_put_contents($basePath . '/sitemap-index.xml', $sitemapIndex);

// Create a timestamp file for verification of last update
file_put_contents($basePath . '/sitemap-updated.txt', 'Sitemap last updated: ' . date('Y-m-d H:i:s'));

echo "Sitemap generated with " . count($urls) . " URLs.<br>";
echo "XML sitemap: <a href='/sitemap.xml' target='_blank'>/sitemap.xml</a><br>";
echo "Text sitemap: <a href='/sitemap.txt' target='_blank'>/sitemap.txt</a><br>";
echo "Sitemap index: <a href='/sitemap-index.xml' target='_blank'>/sitemap-index.xml</a>";

// Close database connection
$conn->close();
?>