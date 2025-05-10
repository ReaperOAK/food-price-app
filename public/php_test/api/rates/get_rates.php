<?php
/**
 * API: Get Historical Rates
 * 
 * Returns historical egg rate data for a specific city and state
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
$days = isset($_GET['days']) && is_numeric($_GET['days']) ? (int)$_GET['days'] : 0;

try {
    // Generate cache key
    $cacheKey = 'rate_history_' . strtolower(str_replace(' ', '_', $city)) . '_' . 
                strtolower(str_replace(' ', '_', $state)) . '_days_' . $days;
    
    // Use cache if enabled
    $rates = Cache::remember($cacheKey, function() use ($city, $state, $days) {
        $rateModel = new Rate();
        return $rateModel->getRateHistory($city, $state, $days);
    }, 3600); // Cache for 1 hour
    
    if (empty($rates)) {
        ApiResponse::success([], 'No historical rates found for the specified city and state');
    } else {
        ApiResponse::success($rates, 'Historical rates retrieved successfully');
    }
} catch (Exception $e) {
    ApiResponse::error('Failed to retrieve historical rates: ' . $e->getMessage());
}
