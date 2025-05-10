<?php
/**
 * API: Update Rate
 * 
 * Updates an existing egg rate record
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../utils/Cache.php';
require_once __DIR__ . '/../../models/Rate.php';

// Set headers
header('Content-Type: application/json');

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::error('Method not allowed', 405);
}

// Process input
$requestData = json_decode(file_get_contents('php://input'), true);

if (!$requestData) {
    $requestData = $_POST; // Fallback to form data
}

// Validate required fields
if (!isset($requestData['id']) || !is_numeric($requestData['id']) ||
    !isset($requestData['city']) || empty($requestData['city']) ||
    !isset($requestData['state']) || empty($requestData['state']) ||
    !isset($requestData['rate']) || !is_numeric($requestData['rate'])) {
    ApiResponse::error('ID, city, state and rate are required. ID and rate must be numeric.');
}

$id = (int)$requestData['id'];
$city = $requestData['city'];
$state = $requestData['state'];
$rate = (float)$requestData['rate'];
$date = isset($requestData['date']) && !empty($requestData['date']) ? $requestData['date'] : date('Y-m-d');

// Validate date format
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    ApiResponse::error('Date must be in YYYY-MM-DD format');
}

try {
    $rateModel = new Rate();
    $success = $rateModel->updateRate($id, $city, $state, $rate, $date);
    
    if (!$success) {
        ApiResponse::error('Failed to update rate');
    }
    
    // Clear relevant caches
    Cache::delete('latest_rates');
    Cache::delete('latest_rate_' . strtolower(str_replace(' ', '_', $city)) . '_' . strtolower(str_replace(' ', '_', $state)));
    Cache::delete('rate_history_' . strtolower(str_replace(' ', '_', $city)) . '_' . strtolower(str_replace(' ', '_', $state)) . '_days_0');
    Cache::delete('all_rates');
    Cache::delete('all_rates_date_' . $date);
    
    if (strtolower($state) === 'special') {
        Cache::delete('special_rates');
    }
    
    $responseData = [
        'id' => $id,
        'city' => $city,
        'state' => $state,
        'rate' => $rate,
        'date' => $date
    ];
    
    ApiResponse::success($responseData, 'Rate updated successfully');
} catch (Exception $e) {
    ApiResponse::error('Failed to update rate: ' . $e->getMessage());
}
