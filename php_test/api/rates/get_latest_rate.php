<?php
/**
 * API: Get Latest Rate for a City
 * 
 * Returns the latest egg rate for a specific city
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../utils/Cache.php';
require_once __DIR__ . '/../../models/Rate.php';

// Set headers
header('Content-Type: application/json');

// Validate input
if (!isset($_GET['city']) || empty($_GET['city']) || 
    !isset($_GET['state']) || empty($_GET['state'])) {
    ApiResponse::error('City and state parameters are required');
}

$city = $_GET['city'];
$state = $_GET['state'];

try {
    // Use cache if enabled
    $cacheKey = 'latest_rate_' . strtolower(str_replace(' ', '_', $city)) . '_' . strtolower(str_replace(' ', '_', $state));
    
    $rate = Cache::remember($cacheKey, function() use ($city, $state) {
        $rateModel = new Rate();
        return $rateModel->getLatestRate($city, $state);
    }, 3600); // Cache for 1 hour
    
    if (!$rate) {
        ApiResponse::error("No rate found for $city, $state", 404);
    }
    
    ApiResponse::success($rate, 'Rate retrieved successfully');
} catch (Exception $e) {
    ApiResponse::error('Failed to retrieve rate: ' . $e->getMessage());
}
