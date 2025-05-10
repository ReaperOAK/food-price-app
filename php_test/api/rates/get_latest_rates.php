<?php
/**
 * API: Get Latest Rates for Multiple Cities
 * 
 * Returns the latest egg rates for multiple cities
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../utils/Cache.php';
require_once __DIR__ . '/../../models/Rate.php';

// Set headers
header('Content-Type: application/json');

// Process input
$requestData = json_decode(file_get_contents('php://input'), true);

$cities = [];
$states = [];

if ($requestData && isset($requestData['cities']) && is_array($requestData['cities'])) {
    $cities = $requestData['cities'];
}

if ($requestData && isset($requestData['states']) && is_array($requestData['states'])) {
    $states = $requestData['states'];
}

try {
    // Generate cache key based on inputs
    $cacheKey = 'latest_rates';
    if (!empty($cities)) {
        $cacheKey .= '_cities_' . md5(implode(',', $cities));
    }
    if (!empty($states)) {
        $cacheKey .= '_states_' . md5(implode(',', $states));
    }
    
    // Use cache if enabled
    $rates = Cache::remember($cacheKey, function() use ($cities, $states) {
        $rateModel = new Rate();
        return $rateModel->getLatestRates($cities, $states);
    }, 3600); // Cache for 1 hour
    
    if (empty($rates)) {
        ApiResponse::success([], 'No rates found for the specified filters');
    } else {
        ApiResponse::success($rates, 'Rates retrieved successfully');
    }
} catch (Exception $e) {
    ApiResponse::error('Failed to retrieve rates: ' . $e->getMessage());
}
