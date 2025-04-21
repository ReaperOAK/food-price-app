<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
include 'db.php';

// Include the function to delete old web stories
include_once 'delete_old_webstories.php';

// Configuration - use absolute paths to avoid permission issues
$basePath = realpath($_SERVER['DOCUMENT_ROOT']);
$storiesDir = $basePath . '/webstories';
$imageDir = $basePath . '/images/webstories';
$templateFile = $basePath . '/templates/webstory_template.html';
$baseURL = 'https://todayeggrates.com'; // Define base URL for canonical links

// Create the stories directory if it doesn't exist with proper error handling
if (!file_exists($storiesDir)) {
    try {
        if (!mkdir($storiesDir, 0755, true)) {
            error_log("Failed to create directory: $storiesDir");
            echo "Failed to create directory: $storiesDir. Please check permissions.<br>";
        }
    } catch (Exception $e) {
        error_log("Exception creating directory: " . $e->getMessage());
        echo "Error creating directory: " . $e->getMessage() . "<br>";
    }
}

// Get all available background images
$backgroundImages = [];
if (is_dir($imageDir)) {
    $files = scandir($imageDir);
    foreach ($files as $file) {
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif']) && $file !== '.' && $file !== '..') {
            // Skip thumbnail files
            if (strpos($file, 'thumbnail-') === 0) {
                continue;
            }
            $backgroundImages[] = '/images/webstories/' . $file;
        }
    }
}

// If no images found, use a default image
if (empty($backgroundImages)) {
    $backgroundImages[] = '/images/webstories/eggpic.png';
}

// Get the web story template with error handling
if (file_exists($templateFile)) {
    $template = file_get_contents($templateFile);
    if (!$template) {
        die("Error: Could not read template file $templateFile");
    }
} else {
    // Check alternative locations
    $alternateTemplateFile = $basePath . '/public_html/templates/webstory_template.html';
    if (file_exists($alternateTemplateFile)) {
        $template = file_get_contents($alternateTemplateFile);
        if (!$template) {
            die("Error: Could not read template file $alternateTemplateFile");
        }
    } else {
        die("Error: Template file not found at $templateFile or $alternateTemplateFile. Please check the path.");
    }
}

// Get today's date
$today = date('Y-m-d');

// Clean up old web stories first - but don't close the connection
$daysToKeep = 7; // Increased from 3 to 7 days for better SEO indexing
deleteOldWebStories($storiesDir, $imageDir, $daysToKeep, $conn, false);

// Function to create URL-friendly slugs
function createSlug($string) {
    $string = strtolower($string);
    $string = preg_replace('/[^a-z0-9\s-]/', '', $string);
    $string = preg_replace('/[\s-]+/', '-', $string);
    $string = trim($string, '-');
    return $string;
}

// Function to generate a thumbnail for the webstory
function generateThumbnail($city, $state, $rate) {
    // Create slug for file naming
    $citySlug = createSlug($city);
    
    // Set paths
    $templatesPath = $_SERVER['DOCUMENT_ROOT'] . '/templates/';
    $outputPath = $_SERVER['DOCUMENT_ROOT'] . '/images/webstories/';
    $fontFile = $templatesPath . 'arial.ttf';
    
    // Create directory if it doesn't exist
    if (!file_exists($outputPath)) {
        mkdir($outputPath, 0755, true);
    }
    
    // Create a 1200x1200 image (optimal for social sharing)
    $image = imagecreatetruecolor(1200, 1200);
    
    // Set colors
    $bgColor = imagecolorallocate($image, 255, 252, 240); // Light cream background
    $textColor = imagecolorallocate($image, 30, 30, 30); // Dark text
    $accentColor = imagecolorallocate($image, 245, 158, 11); // Amber accent
    $priceColor = imagecolorallocate($image, 220, 38, 38); // Price in red
    
    // Fill background
    imagefill($image, 0, 0, $bgColor);
    
    // Add decorative elements - top bar
    imagefilledrectangle($image, 0, 0, 1200, 80, $accentColor);
    
    // Add site logo/name
    $logoText = "TODAY EGG RATES";
    imagettftext($image, 40, 0, 50, 60, $bgColor, $fontFile, $logoText);
    
    // Add headline
    $headline = "Egg Rate in " . $city . ", " . $state;
    $headlineSize = 70;
    $headlineBox = imagettfbbox($headlineSize, 0, $fontFile, $headline);
    $headlineWidth = $headlineBox[2] - $headlineBox[0];
    $headlineX = (1200 - $headlineWidth) / 2;
    imagettftext($image, $headlineSize, 0, $headlineX, 300, $textColor, $fontFile, $headline);
    
    // Add date
    $date = date("F j, Y");
    $dateSize = 40;
    $dateBox = imagettfbbox($dateSize, 0, $fontFile, $date);
    $dateWidth = $dateBox[2] - $dateBox[0];
    $dateX = (1200 - $dateWidth) / 2;
    imagettftext($image, $dateSize, 0, $dateX, 380, $textColor, $fontFile, $date);
    
    // Add price
    $priceText = "₹" . $rate;
    $priceSize = 150;
    $priceBox = imagettfbbox($priceSize, 0, $fontFile, $priceText);
    $priceWidth = $priceBox[2] - $priceBox[0];
    $priceX = (1200 - $priceWidth) / 2;
    
    // Add a background circle for the price
    $centerX = 600;
    $centerY = 650;
    $radius = 250;
    imagefilledellipse($image, $centerX, $centerY, $radius*2, $radius*2, $accentColor);
    
    // Add price text
    imagettftext($image, $priceSize, 0, $priceX, 700, $bgColor, $fontFile, $priceText);
    
    // Add per egg text
    $perEggText = "per egg";
    $perEggSize = 40;
    $perEggBox = imagettfbbox($perEggSize, 0, $fontFile, $perEggText);
    $perEggWidth = $perEggBox[2] - $perEggBox[0];
    $perEggX = (1200 - $perEggWidth) / 2;
    imagettftext($image, $perEggSize, 0, $perEggX, 770, $bgColor, $fontFile, $perEggText);
    
    // Add call to action at bottom
    $ctaText = "Visit todayeggrates.com for more updates";
    $ctaSize = 35;
    $ctaBox = imagettfbbox($ctaSize, 0, $fontFile, $ctaText);
    $ctaWidth = $ctaBox[2] - $ctaBox[0];
    $ctaX = (1200 - $ctaWidth) / 2;
    
    // Add a bottom bar for CTA
    imagefilledrectangle($image, 0, 1080, 1200, 1200, $accentColor);
    imagettftext($image, $ctaSize, 0, $ctaX, 1150, $bgColor, $fontFile, $ctaText);
    
    // Generate optimized filename with keywords
    $outputFilename = "thumbnail-" . $citySlug . ".jpg";
    $outputFile = $outputPath . $outputFilename;
    
    // Save image with 90% quality (good balance between size and quality)
    imagejpeg($image, $outputFile, 90);
    
    // Clean up
    imagedestroy($image);
    
    return $outputFilename;
}

// Function to generate Web Story HTML
function generateWebStory($city, $state, $rate, $rateYesterday, $averageRate, $thumbnailName) {
    // Create city slug for file naming
    $citySlug = createSlug($city);
    
    // Calculate rate change
    $change = $rate - $rateYesterday;
    $changeText = "No change from yesterday";
    $changeClass = "unchanged";
    
    if ($change > 0) {
        $changeText = "Up ₹" . number_format($change, 2) . " from yesterday";
        $changeClass = "up";
    } else if ($change < 0) {
        $changeText = "Down ₹" . number_format(abs($change), 2) . " from yesterday";
        $changeClass = "down";
    }
    
    // Get template
    $templatePath = $_SERVER['DOCUMENT_ROOT'] . '/templates/webstory_template.html';
    $template = file_get_contents($templatePath);
    
    // Format date
    $date = date("F j, Y");
    $isoDate = date("c"); // ISO 8601 date for structured data
    
    // Calculate tray price (30 eggs)
    $trayPrice = $rate * 30;
    
    // Replace variables in template
    $template = str_replace('{{CITY_NAME}}', $city, $template);
    $template = str_replace('{{STATE_NAME}}', $state, $template);
    $template = str_replace('{{DATE}}', $date, $template);
    $template = str_replace('{{RATE}}', $rate, $template);
    $template = str_replace('{{RATE_YESTERDAY}}', $rateYesterday, $template);
    $template = str_replace('{{CHANGE_TEXT}}', $changeText, $template);
    $template = str_replace('{{CHANGE_CLASS}}', $changeClass, $template);
    $template = str_replace('{{AVERAGE_RATE}}', $averageRate, $template);
    $template = str_replace('{{TRAY_PRICE}}', number_format($trayPrice, 2), $template);
    $template = str_replace('{{CITY_SLUG}}', $citySlug, $template);
    $template = str_replace('{{THUMBNAIL_PATH}}', '/images/webstories/' . $thumbnailName, $template);
    
    // Add structured data for better SEO
    $canonicalUrl = "https://todayeggrates.com/webstories/" . $citySlug . "-egg-rate";
    $structuredData = <<<JSON
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Egg Rate in {$city}, {$state} - {$date}",
        "image": [
            "https://todayeggrates.com/images/webstories/{$thumbnailName}",
            "https://todayeggrates.com/eggpic.png"
        ],
        "datePublished": "{$isoDate}",
        "dateModified": "{$isoDate}",
        "author": {
            "@type": "Organization",
            "name": "Today Egg Rates",
            "url": "https://todayeggrates.com"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Today Egg Rates",
            "logo": {
                "@type": "ImageObject",
                "url": "https://todayeggrates.com/tee.png",
                "width": "512",
                "height": "512"
            }
        },
        "description": "Current egg price in {$city}, {$state} is ₹{$rate} per egg. {$changeText}. Check daily updates on egg prices in India.",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "{$canonicalUrl}"
        },
        "speakable": {
           "@type": "SpeakableSpecification",
           "cssSelector": [".story-content", ".story-headline"]
        },
        "about": [
            {
                "@type": "Thing",
                "name": "Egg Prices",
                "sameAs": "https://en.wikipedia.org/wiki/Egg_as_food"
            },
            {
                "@type": "Place",
                "name": "{$city}, {$state}, India"
            }
        ]
    }
JSON;
    
    $template = str_replace('{{STRUCTURED_DATA}}', $structuredData, $template);
    $template = str_replace('{{CANONICAL_URL}}', $canonicalUrl, $template);
    
    // Add meta tags for better SEO
    $metaTags = <<<HTML
    <meta name="description" content="Today's egg rate in {$city}, {$state} is ₹{$rate} per egg. {$changeText}. Get daily updates on egg prices in India.">
    <meta name="keywords" content="egg rate, egg price, {$city} egg rate, {$state} egg price, egg market price, poultry rates, today egg price, {$date} egg rate">
    <meta property="og:title" content="Egg Rate in {$city}, {$state} - {$date}">
    <meta property="og:description" content="Today's egg rate in {$city}, {$state} is ₹{$rate} per egg. {$changeText}. Get daily updates on egg prices in India.">
    <meta property="og:image" content="https://todayeggrates.com/images/webstories/{$thumbnailName}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="1200">
    <meta property="og:url" content="{$canonicalUrl}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Today Egg Rates">
    <meta property="article:published_time" content="{$isoDate}">
    <meta property="article:modified_time" content="{$isoDate}">
    <meta property="article:tag" content="egg rates">
    <meta property="article:tag" content="{$city}">
    <meta property="article:tag" content="{$state}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Egg Rate in {$city}, {$state} - {$date}">
    <meta name="twitter:description" content="Today's egg rate in {$city}, {$state} is ₹{$rate} per egg. Get daily updates on egg prices.">
    <meta name="twitter:image" content="https://todayeggrates.com/images/webstories/{$thumbnailName}">
    <link rel="canonical" href="{$canonicalUrl}">
HTML;
    
    $template = str_replace('{{META_TAGS}}', $metaTags, $template);
    
    // Create output directory if it doesn't exist
    $outputDir = $_SERVER['DOCUMENT_ROOT'] . '/webstories/';
    if (!file_exists($outputDir)) {
        mkdir($outputDir, 0755, true);
    }
    
    // Write to file
    $outputFile = $outputDir . $citySlug . '-egg-rate.html';
    file_put_contents($outputFile, $template);
    
    return $citySlug . '-egg-rate.html';
}

// Get all cities with rates
$query = "SELECT r1.city, r1.state, r1.rate, r1.timestamp, 
          (SELECT rate FROM rates r2 WHERE r2.city = r1.city AND r2.state = r1.state AND r2.timestamp < r1.timestamp ORDER BY r2.timestamp DESC LIMIT 1) as yesterday_rate,
          (SELECT AVG(rate) FROM rates r3 WHERE r3.city = r1.city AND r3.state = r1.state AND r3.timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as average_rate
          FROM rates r1
          WHERE (r1.city, r1.state, r1.timestamp) IN (
              SELECT city, state, MAX(timestamp) 
              FROM rates 
              GROUP BY city, state
          )
          ORDER BY r1.state, r1.city";

$result = $conn->query($query);

$createdStories = [];

while ($row = $result->fetch_assoc()) {
    $city = $row['city'];
    $state = $row['state'];
    $rate = $row['rate'];
    $yesterdayRate = $row['yesterday_rate'] ?? $rate;
    $averageRate = $row['average_rate'] ?? $rate;
    
    // Generate thumbnail
    $thumbnailName = generateThumbnail($city, $state, $rate);
    
    // Generate Web Story
    $storyFile = generateWebStory($city, $state, $rate, $yesterdayRate, $averageRate, $thumbnailName);
    
    $createdStories[] = [
        'city' => $city,
        'state' => $state,
        'file' => $storyFile
    ];
    
    echo "Generated web story for $city, $state<br>";
}

// Close database connection
$conn->close();

// Return count of stories generated
echo "<hr>Total webstories generated: " . count($createdStories);
?>
