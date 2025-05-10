<?php
/**
 * API: Add State or City
 * 
 * Adds a new state or city to the database
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../utils/Cache.php';
require_once __DIR__ . '/../../models/Location.php';

// Set headers
header('Content-Type: application/json');

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::error('Method not allowed', 405);
}

// Validate input
$requestData = json_decode(file_get_contents('php://input'), true);

if (!$requestData) {
    $requestData = $_POST; // Fallback to form data
}

if (!isset($requestData['type']) || empty($requestData['type']) || 
    !isset($requestData['name']) || empty($requestData['name'])) {
    ApiResponse::error('Type and name parameters are required');
}

$type = strtolower($requestData['type']);
$name = $requestData['name'];
$state = isset($requestData['state']) ? $requestData['state'] : null;

// Validate type
if ($type !== 'state' && $type !== 'city') {
    ApiResponse::error('Type must be "state" or "city"');
}

// Validate state for city
if ($type === 'city' && (empty($state) || !is_string($state))) {
    ApiResponse::error('State parameter is required for cities');
}

try {
    $locationModel = new Location();
    $id = $locationModel->addLocation($type, $name, $state);
    
    if ($id === false) {
        ApiResponse::error("Failed to add $type: $name");
    }
    
    // Clear relevant caches
    if ($type === 'state') {
        Cache::delete('states_list');
        Cache::delete('states_and_cities');
    } else {
        $cacheKey = 'cities_for_state_' . strtolower(str_replace(' ', '_', $state));
        Cache::delete($cacheKey);
        Cache::delete('states_and_cities');
    }
    
    ApiResponse::success(['id' => $id], "$type added successfully");
} catch (Exception $e) {
    ApiResponse::error('Failed to add location: ' . $e->getMessage());
}
