<?php
/**
 * Server-side Meta Tag Generator for SEO
 * Generates proper meta tags with actual prices for search engines
 */

header('Content-Type: application/json');

// Include database configuration
require_once '../config/db.php';

try {
    // Get parameters
    $city = isset($_GET['city']) ? trim($_GET['city']) : '';
    $state = isset($_GET['state']) ? trim($_GET['state']) : '';
    
    // Remove -egg-rate suffix if present
    $city = str_replace('-egg-rate', '', $city);
    $state = str_replace('-egg-rate', '', $state);
    
    // List of pages that should not be treated as cities
    $nonCityPages = ['blog', 'egg-rates', 'webstories', 'privacy', 'disclaimer', 'contact', 'about'];
    
    if (in_array($city, $nonCityPages)) {
        $city = '';
    }
    
    // Get current date
    $today = date('j M Y');
    
    // Initialize response
    $response = [
        'title' => '',
        'description' => '',
        'todayRate' => 'N/A',
        'trayPrice' => 'N/A'
    ];
    
    // Fetch egg rate data using the existing connection
    if ($city && $state) {
        // City-specific query
        $stmt = $conn->prepare("
            SELECT rate 
            FROM egg_rates 
            WHERE LOWER(city) = LOWER(?) 
            AND LOWER(state) = LOWER(?) 
            ORDER BY date DESC 
            LIMIT 1
        ");
        $stmt->bind_param("ss", $city, $state);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        
        if ($result && $result['rate']) {
            $todayRate = floatval($result['rate']);
            $trayPrice = $todayRate * 30;
            
            // Format prices
            $formattedRate = number_format($todayRate, 2);
            $formattedTrayPrice = number_format($trayPrice, 2);
            
            // Generate optimized title (under 60 characters)
            $response['title'] = "Today Egg Rate in " . ucfirst($city) . ": ₹{$formattedRate}/egg | {$today}";
            
            // Generate optimized description (150-160 characters)
            $response['description'] = "Today egg rate " . ucfirst($city) . ": ₹{$formattedRate}/egg, ₹{$formattedTrayPrice}/tray ({$today}). Live NECC prices & market updates.";
            
            $response['todayRate'] = $todayRate;
            $response['trayPrice'] = $trayPrice;
        } else {
            // No data found, use fallback
            $response['title'] = "Today Egg Rate in " . ucfirst($city) . " - Live NECC Prices ({$today})";
            $response['description'] = "Live egg rates in " . ucfirst($city) . " ({$today}). Check today's NECC egg prices, wholesale & retail rates.";
        }
        
    } else if ($state) {
        // State-specific
        $response['title'] = "Today Egg Rate in " . ucfirst($state) . ": Live Price Updates ({$today})";
        $response['description'] = "Live egg rates " . ucfirst($state) . " ({$today}): NECC prices from major markets. Daily egg rate updates & wholesale prices.";
        
    } else {
        // National/home page
        $response['title'] = "🥚 Today Egg Rate India: Live NECC Price List ({$today}) | Egg Rate Today";
        $response['description'] = "Live egg rates India ({$today}): NECC prices from 100+ cities. Compare today's egg rates, daily prices & wholesale rates.";
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to generate meta tags',
        'title' => 'Today Egg Rate India - Live NECC Prices',
        'description' => 'Live egg rates India: NECC prices from major cities. Daily egg rate updates & wholesale prices.'
    ]);
}
?>
