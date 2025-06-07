<?php
/**
 * Server-side meta tag injection for improved SEO
 * This script can be included in index.php on Hostinger to inject proper meta tags
 * before the React app loads, helping search engines see the correct titles immediately
 */

function injectSEOMetaTags() {
    // Get current URL path
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path = rtrim($path, '/');
    
    // Default values
    $title = "India Egg Rates: Live NECC Prices | Today";
    $description = "Check latest egg rates in India today. Live NECC egg prices updated daily. Compare egg prices across cities and states. Get wholesale and retail egg rates.";
    $keywords = "egg rates today, NECC prices, egg price India, live egg rates";
    
    // Parse city and state from URL
    $segments = explode('/', trim($path, '/'));
    $state = null;
    $city = null;
    
    if (count($segments) >= 1 && $segments[0] && $segments[0] !== 'blog' && $segments[0] !== 'webstories') {
        $state = ucfirst(str_replace('-', ' ', $segments[0]));
        if (count($segments) >= 2 && $segments[1]) {
            $city = ucfirst(str_replace('-', ' ', $segments[1]));
        }
    }
    
    // Try to get current egg rate from database (if available)
    $currentRate = getCurrentEggRate($city, $state);
    $rateText = $currentRate ? "₹{$currentRate}/egg" : "Live Prices";
    
    // Generate optimized titles based on URL structure
    if ($city) {
        $title = "{$city} Egg Rate: {$rateText} | " . date('M j');
        $description = "Today's egg rate in {$city}, {$state}: {$rateText}. Check latest NECC egg prices, weekly trends, and market updates for {$city}. Updated " . date('F j, Y') . ".";
        $keywords = "{$city} egg rate, {$city} egg price today, NECC {$city}, {$state} egg rates, egg price {$city}";
    } elseif ($state) {
        $title = "{$state} Egg Rate: {$rateText} | " . date('M j');
        $description = "Latest egg rates in {$state} today: {$rateText}. Check NECC egg prices across {$state} cities. Compare wholesale and retail egg rates in {$state}.";
        $keywords = "{$state} egg rate, {$state} egg price, NECC {$state}, egg rate today {$state}";
    }
    
    // Ensure title is under 60 characters for optimal SEO
    if (strlen($title) > 60) {
        $title = substr($title, 0, 57) . '...';
    }
    
    // Output the meta tags
    echo "
    <title>{$title}</title>
    <meta name=\"description\" content=\"{$description}\" />
    <meta name=\"keywords\" content=\"{$keywords}\" />
    <meta name=\"title\" content=\"{$title}\" />
    <meta property=\"og:title\" content=\"{$title}\" />
    <meta property=\"og:description\" content=\"{$description}\" />
    <meta name=\"twitter:title\" content=\"{$title}\" />
    <meta name=\"twitter:description\" content=\"{$description}\" />
    <meta name=\"last-modified\" content=\"" . date('c') . "\" />
    ";
}

function getCurrentEggRate($city = null, $state = null) {
    // This would connect to your database and get the current rate
    // For now, return a fallback rate
    try {
        // Include your database config
        // require_once 'config/db.php';
        // $database = new Database();
        // $pdo = $database->getConnection();
        
        // Query for current rate based on city/state
        // This is just a placeholder - you'll need to adapt this to your database structure
        /*
        if ($city && $state) {
            $stmt = $pdo->prepare("SELECT rate FROM egg_rates WHERE city = ? AND state = ? ORDER BY date DESC LIMIT 1");
            $stmt->execute([$city, $state]);
        } elseif ($state) {
            $stmt = $pdo->prepare("SELECT AVG(rate) as rate FROM egg_rates WHERE state = ? AND date = CURDATE()");
            $stmt->execute([$state]);
        } else {
            $stmt = $pdo->prepare("SELECT AVG(rate) as rate FROM egg_rates WHERE date = CURDATE()");
            $stmt->execute();
        }
        
        $result = $stmt->fetch();
        return $result ? number_format($result['rate'], 2) : null;
        */
        
        // Fallback rate if database is not available
        return "5.50";
        
    } catch (Exception $e) {
        // Return fallback rate on error
        return "5.50";
    }
}

// Usage in your index.php or template file:
// Just call injectSEOMetaTags() in the <head> section before React loads
?>

<!-- Example usage in index.php: -->
<!--
<!DOCTYPE html>
<html lang="en-IN" dir="ltr">
<head>
    <meta charset="utf-8" />
    <?php injectSEOMetaTags(); ?>
    <!-- Rest of your head tags -->
</head>
<body>
    <!-- Your React app -->
</body>
</html>
-->
