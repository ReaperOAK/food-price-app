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
            
            // Generate optimized title (under 60 characters) - remove redundant words
            $cityName = ucfirst($city);
            $title = "{$cityName} Egg Rate: ₹{$formattedRate}/egg | {$today}";
            
            // Truncate if too long
            if (strlen($title) > 60) {
                $title = substr($title, 0, 57) . '...';
            }
            $response['title'] = $title;
            
            // Generate optimized description (under 155 characters)
            $description = "{$cityName} egg rate: ₹{$formattedRate}/egg, ₹{$formattedTrayPrice}/tray ({$today}). Live NECC prices & rates.";
            if (strlen($description) > 155) {
                $description = substr($description, 0, 152) . '...';
            }
            $response['description'] = $description;
            
            $response['todayRate'] = $todayRate;
            $response['trayPrice'] = $trayPrice;
        } else {
            // No data found, use fallback
            $cityName = ucfirst($city);
            $title = "{$cityName} Egg Rate Today - Live NECC Prices";
            if (strlen($title) > 60) {
                $title = substr($title, 0, 57) . '...';
            }
            $response['title'] = $title;
            
            $description = "Live egg rates {$cityName} ({$today}). Check NECC prices, wholesale & retail rates.";
            if (strlen($description) > 155) {
                $description = substr($description, 0, 152) . '...';
            }
            $response['description'] = $description;
        }
        
    } else if ($state) {
        // State-specific - use shorter format
        $stateName = ucfirst($state);
        
        // Handle long state names
        $stateShortNames = [
            'andhra-pradesh' => 'AP',
            'arunachal-pradesh' => 'Arunachal',
            'himachal-pradesh' => 'HP',
            'jammu-and-kashmir' => 'J&K',
            'madhya-pradesh' => 'MP',
            'tamil-nadu' => 'TN',
            'uttar-pradesh' => 'UP',
            'west-bengal' => 'WB'
        ];
        
        $shortStateName = isset($stateShortNames[$state]) ? $stateShortNames[$state] : $stateName;
        
        $title = "{$shortStateName} Egg Rate: Live Prices {$today}";
        if (strlen($title) > 60) {
            $title = substr($title, 0, 57) . '...';
        }
        $response['title'] = $title;
        
        $description = "Live egg rates {$stateName} ({$today}): NECC prices from major markets. Daily updates & rates.";
        if (strlen($description) > 155) {
            $description = substr($description, 0, 152) . '...';
        }
        $response['description'] = $description;
        
    } else {
        // National/home page
        $response['title'] = "🥚 India Egg Rates: Live NECC Prices | {$today}";
        $response['description'] = "Live egg rates India ({$today}): NECC prices from 100+ cities. Compare today's rates & wholesale prices.";
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
