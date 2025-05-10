<?php
/**
 * API: Get All Rates
 * 
 * Returns all egg rate records, optionally filtered by date
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../utils/Cache.php';
require_once __DIR__ . '/../../models/Rate.php';

// Set headers
header('Content-Type: application/json');

// Process date parameter if provided
$date = isset($_GET['date']) && !empty($_GET['date']) ? $_GET['date'] : null;

// Validate date format if provided
if ($date !== null && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    ApiResponse::error('Date must be in YYYY-MM-DD format');
}

try {
    // Generate cache key
    $cacheKey = 'all_rates' . ($date ? '_date_' . $date : '');
    
    // Use cache if enabled
    $rates = Cache::remember($cacheKey, function() use ($date) {
        $rateModel = new Rate();
        return $rateModel->getAllRates($date);
    }, 3600); // Cache for 1 hour
    
    if (empty($rates)) {
        ApiResponse::success([], 'No rates found' . ($date ? ' for the specified date' : ''));
    } else {
        ApiResponse::success(
            $rates, 
            'Rates retrieved successfully' . ($date ? ' for ' . $date : '')
        );
    }
} catch (Exception $e) {
    ApiResponse::error('Failed to retrieve rates: ' . $e->getMessage());
}
