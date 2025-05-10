<?php
/**
 * API: Get States
 * 
 * Returns a list of all states in the database
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../utils/Cache.php';
require_once __DIR__ . '/../../models/Location.php';

// Set headers
header('Content-Type: application/json');

try {
    // Use cache if enabled
    $states = Cache::remember('states_list', function() {
        $locationModel = new Location();
        return $locationModel->getAllStates();
    }, 3600); // Cache for 1 hour
    
    ApiResponse::success($states, 'States retrieved successfully');
} catch (Exception $e) {
    ApiResponse::error('Failed to retrieve states: ' . $e->getMessage());
}
