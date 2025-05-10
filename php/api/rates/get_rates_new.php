<?php
/**
 * get_rates.php
 * API endpoint to get historical rates for a city
 */

// Include the autoloader
require_once dirname(dirname(dirname(__FILE__))) . '/core/Autoloader.php';

// Import required classes
use FoodPriceApp\Core\Database\DatabaseConnection;
use FoodPriceApp\Core\Models\Rate;
use FoodPriceApp\Core\Utils\ApiUtils;
use FoodPriceApp\Core\Utils\Logger;

// Set error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);  // Don't display errors directly to users
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(dirname(__FILE__))) . '/error.log');

// Set up logger
$logger = new Logger('API_RATES');
$logger->debug('get_rates.php accessed');

try {
    // Set API headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header('Content-Type: application/json');
    
    // Validate required parameters
    $params = ApiUtils::getRequestParams(['city', 'state'], true);
    
    // Optional parameter with validation
    $days = $_GET['days'] ?? null;
    if ($days !== null) {
        $days = (int)$days;
        if ($days <= 0) {
            ApiUtils::sendErrorResponse("Days parameter must be a positive integer");
        }
    }
    
    // Get city and state
    $city = $params['city'];
    $state = $params['state'];
    
    // Get database connection
    $conn = DatabaseConnection::getInstance()->getConnection();
    
    // Create Rate model
    $rateModel = new Rate($conn);
    
    // Get rates for city
    $rates = $rateModel->getRatesForCity($city, $state, $days);
    
    // Return JSON response
    ApiUtils::sendSuccessResponse($rates);
    
} catch (Exception $e) {
    $logger->error("Error in get_rates.php: " . $e->getMessage());
    ApiUtils::sendErrorResponse("An error occurred: " . $e->getMessage());
}
?>
