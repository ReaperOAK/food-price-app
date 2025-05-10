<?php
/**
 * API: Get All States with Their Cities
 * 
 * Returns all states with their associated cities
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../utils/Cache.php';
require_once __DIR__ . '/../../models/Location.php';

// Set headers
header('Content-Type: application/json');

try {
    // Use cache if enabled
    $statesAndCities = Cache::remember('states_and_cities', function() {
        $locationModel = new Location();
        return $locationModel->getAllStatesAndCities();
    }, 3600); // Cache for 1 hour
    
    ApiResponse::success($statesAndCities, 'States and cities retrieved successfully');
} catch (Exception $e) {
    ApiResponse::error('Failed to retrieve states and cities: ' . $e->getMessage());
}
