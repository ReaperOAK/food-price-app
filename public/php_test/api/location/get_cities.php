<?php
/**
 * API: Get Cities for a State
 * 
 * Returns a list of cities for a specific state
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../utils/Cache.php';
require_once __DIR__ . '/../../models/Location.php';

// Set headers
header('Content-Type: application/json');

// Validate input
if (!isset($_GET['state']) || empty($_GET['state'])) {
    ApiResponse::error('State parameter is required');
}

$state = $_GET['state'];

try {
    // Use cache if enabled
    $cacheKey = 'cities_for_state_' . strtolower(str_replace(' ', '_', $state));
    
    $cities = Cache::remember($cacheKey, function() use ($state) {
        $locationModel = new Location();
        return $locationModel->getCitiesForState($state);
    }, 3600); // Cache for 1 hour
    
    ApiResponse::success($cities, 'Cities retrieved successfully');
} catch (Exception $e) {
    ApiResponse::error('Failed to retrieve cities: ' . $e->getMessage());
}
