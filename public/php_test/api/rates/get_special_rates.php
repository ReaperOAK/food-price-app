<?php
/**
 * API: Get Special Rates
 * 
 * Returns egg rates for cities marked with state "special"
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../utils/Cache.php';
require_once __DIR__ . '/../../models/Rate.php';

// Set headers
header('Content-Type: application/json');

try {
    // Use cache if enabled
    $rates = Cache::remember('special_rates', function() {
        $rateModel = new Rate();
        return $rateModel->getSpecialRates();
    }, 3600); // Cache for 1 hour
    
    if (empty($rates)) {
        ApiResponse::success([], 'No special rates found');
    } else {
        ApiResponse::success($rates, 'Special rates retrieved successfully');
    }
} catch (Exception $e) {
    ApiResponse::error('Failed to retrieve special rates: ' . $e->getMessage());
}
