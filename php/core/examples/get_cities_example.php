<?php
/**
 * get_cities.php
 * API endpoint to get cities for a state
 * 
 * This is an example of a refactored API endpoint using the new architecture
 */

// Include the autoloader
require_once dirname(dirname(dirname(__FILE__))) . '/core/Autoloader.php';

use FoodPriceApp\Core\Database\DatabaseConnection;
use FoodPriceApp\Core\Models\City;
use FoodPriceApp\Core\Utils\ApiUtils;

// Set error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(dirname(__FILE__))) . '/error.log');

// Set headers for CORS and JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

try {
    // Get database connection
    $conn = DatabaseConnection::getInstance()->getConnection();
    
    // Get state parameter
    $state = isset($_GET['state']) ? $_GET['state'] : null;
    
    if (empty($state)) {
        ApiUtils::sendErrorResponse("State parameter is required");
    }
    
    // Create City model
    $cityModel = new City($conn);
    
    // Get cities for the state
    $cities = $cityModel->getCitiesForStateWithFallback($state);
    
    // Return JSON response
    ApiUtils::sendSuccessResponse($cities);
    
} catch (Exception $e) {
    ApiUtils::sendErrorResponse("An error occurred: " . $e->getMessage());
}
?>
