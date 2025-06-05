<?php
/**
 * Server-side Meta Tag Generator for SEO
 * Generates proper meta tags with actual prices for search engines
 * Updated to provide better SERP title adoption
 */

header('Content-Type: application/json');
header('Cache-Control: public, max-age=3600'); // Cache for 1 hour

// Include database configuration and SEO utilities
require_once '../config/db.php';
require_once 'seo_utils.php';

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
            
            // Use optimized SEO functions
            $response['title'] = generateOptimizedSeoTitle($city, $state, $todayRate);
            $response['description'] = generateOptimizedSeoDescription($city, $state, $todayRate);
            $response['todayRate'] = $todayRate;
            $response['trayPrice'] = $trayPrice;
        } else {
            // No data found, use fallback with default rate
            $fallbackRate = 5.50;
            $response['title'] = generateOptimizedSeoTitle($city, $state, null);
            $response['description'] = generateOptimizedSeoDescription($city, $state, null);
            $response['todayRate'] = 'N/A';
            $response['trayPrice'] = 'N/A';
        }
          } else if ($state) {
        // State-specific query - get average rate for the state
        $stmt = $conn->prepare("
            SELECT AVG(rate) as avg_rate 
            FROM egg_rates 
            WHERE LOWER(state) = LOWER(?) 
            AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAYS)
        ");
        $stmt->bind_param("s", $state);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        
        $avgRate = $result && $result['avg_rate'] ? floatval($result['avg_rate']) : null;
        
        $response['title'] = generateOptimizedSeoTitle('', $state, $avgRate);
        $response['description'] = generateOptimizedSeoDescription('', $state, $avgRate);
        $response['todayRate'] = $avgRate ? number_format($avgRate, 2) : 'N/A';
        $response['trayPrice'] = $avgRate ? number_format($avgRate * 30, 2) : 'N/A';
        
    } else {
        // National/home page - get national average
        $stmt = $conn->prepare("
            SELECT AVG(rate) as avg_rate 
            FROM egg_rates 
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 3 DAYS)
        ");
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        
        $nationalAvg = $result && $result['avg_rate'] ? floatval($result['avg_rate']) : 5.50;
        
        $response['title'] = generateOptimizedSeoTitle('', '', $nationalAvg);
        $response['description'] = generateOptimizedSeoDescription('', '', $nationalAvg);
        $response['todayRate'] = number_format($nationalAvg, 2);
        $response['trayPrice'] = number_format($nationalAvg * 30, 2);
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
