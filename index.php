<?php
/**
 * Enhanced index.php for better SEO on Hostinger
 * This file can be used instead of the static index.html to provide
 * server-side meta tag injection for better SERP title adoption
 */

// Include the meta injector
require_once 'php/seo/meta_injector.php';

// Get the current path for dynamic SEO
$currentPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$isHomePage = $currentPath === '/' || $currentPath === '';

// Basic SEO data extraction from URL
$pathSegments = array_filter(explode('/', trim($currentPath, '/')));
$state = isset($pathSegments[0]) && $pathSegments[0] !== 'blog' && $pathSegments[0] !== 'webstories' ? $pathSegments[0] : null;
$city = isset($pathSegments[1]) ? $pathSegments[1] : null;

// Convert URL format to display format
$stateDisplay = $state ? ucwords(str_replace('-', ' ', $state)) : null;
$cityDisplay = $city ? ucwords(str_replace('-', ' ', $city)) : null;

// Generate basic title and description
$baseTitle = "India Egg Rates: Live NECC Prices | Today";
$baseDescription = "Check latest egg rates in India today. Live NECC egg prices updated daily. Compare egg prices across cities and states.";

if ($cityDisplay && $stateDisplay) {
    $baseTitle = "{$cityDisplay} Egg Rate: Live Prices | " . date('M j');
    $baseDescription = "Today's egg rate in {$cityDisplay}, {$stateDisplay}. Check latest NECC egg prices, trends, and market updates. Updated " . date('F j, Y') . ".";
} elseif ($stateDisplay) {
    $baseTitle = "{$stateDisplay} Egg Rate: Live Prices | " . date('M j');
    $baseDescription = "Latest egg rates in {$stateDisplay} today. Check NECC egg prices across {$stateDisplay} cities. Updated " . date('F j, Y') . ".";
}

// Ensure title is SEO optimized
if (strlen($baseTitle) > 60) {
    $baseTitle = substr($baseTitle, 0, 57) . '...';
}
?>
<!DOCTYPE html>
<html lang="en-IN" dir="ltr">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="content-language" content="en-IN" />
    
    <!-- Server-side injected SEO meta tags for better SERP adoption -->
    <title><?php echo htmlspecialchars($baseTitle); ?></title>
    <meta name="description" content="<?php echo htmlspecialchars($baseDescription); ?>" />
    <meta name="title" content="<?php echo htmlspecialchars($baseTitle); ?>" />
    <meta property="og:title" content="<?php echo htmlspecialchars($baseTitle); ?>" />
    <meta property="og:description" content="<?php echo htmlspecialchars($baseDescription); ?>" />
    <meta name="twitter:title" content="<?php echo htmlspecialchars($baseTitle); ?>" />
    <meta name="twitter:description" content="<?php echo htmlspecialchars($baseDescription); ?>" />
    
    <!-- SEO optimizations -->
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta name="last-modified" content="<?php echo date('c'); ?>" />
    <link rel="canonical" href="https://todayeggrates.com<?php echo $currentPath; ?>" />
    
    <!-- Favicons and basic meta -->
    <link rel="icon" href="/Favicon.ico" sizes="any" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/eggpic.webp" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="theme-color" content="#007bff" />
    <meta name="author" content="Today Egg Rates" />
    
    <!-- Performance optimizations -->
    <link rel="preload" href="/eggpic.webp" as="image" type="image/webp" fetchpriority="high" />
    <link rel="preload" href="/logo.webp" as="image" type="image/webp" fetchpriority="high" />
    <link rel="preconnect" href="https://www.google-analytics.com" crossorigin />
    <link rel="dns-prefetch" href="//www.google-analytics.com" />
    
    <!-- Additional Open Graph tags -->
    <meta property="og:site_name" content="Today Egg Rates" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://todayeggrates.com<?php echo htmlspecialchars($currentPath); ?>" />
    <meta property="og:image" content="https://todayeggrates.com/eggpic.webp" />
    <meta property="og:locale" content="en_IN" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@todayeggrates" />
    <meta name="twitter:image" content="https://todayeggrates.com/eggpic.webp" />
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Today Egg Rates",
        "url": "https://todayeggrates.com",
        "description": "<?php echo htmlspecialchars($baseDescription); ?>",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://todayeggrates.com/{search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }
    </script>
    
    <!-- PWA Support -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="apple-mobile-web-app-title" content="Egg Rates" />
    <meta name="application-name" content="Egg Rates" />
    
    <!-- Critical CSS would be inlined here -->
    <!-- React app will load CSS chunks dynamically -->
    
    <!-- SEO Title Enforcement Script -->
    <script>
    // Ensure title consistency before React loads
    (function() {
        var expectedTitle = '<?php echo addslashes($baseTitle); ?>';
        if (document.title !== expectedTitle) {
            document.title = expectedTitle;
        }
        
        // Monitor for title changes and enforce consistency
        var titleCheckCount = 0;
        var maxChecks = 5;
        var checkInterval = setInterval(function() {
            titleCheckCount++;
            if (document.title !== expectedTitle && titleCheckCount < maxChecks) {
                document.title = expectedTitle;
            }
            if (titleCheckCount >= maxChecks) {
                clearInterval(checkInterval);
            }
        }, 200);
    })();
    </script>
</head>
<body>
    <noscript>
        <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
            <h1><?php echo htmlspecialchars($baseTitle); ?></h1>
            <p><?php echo htmlspecialchars($baseDescription); ?></p>
            <p>You need to enable JavaScript to run this app.</p>
        </div>
    </noscript>
    <div id="root"></div>
    
    <!-- React app bundle will be injected here by build process -->
</body>
</html>
