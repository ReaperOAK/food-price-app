<?php
/**
 * Autoloader.php
 * PSR-4 compatible autoloader for the Food Price App
 */

spl_autoload_register(function ($class) {
    // Define base namespace and directory
    $baseNamespace = 'FoodPriceApp\\Core\\';
    $baseDir = __DIR__ . '/';
    
    // Only process classes in our namespace
    if (strpos($class, $baseNamespace) !== 0) {
        return;
    }
    
    // Remove base namespace
    $relativeClass = substr($class, strlen($baseNamespace));
    
    // Replace namespace separators with directory separators
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    
    // If the file exists, require it
    if (file_exists($file)) {
        require $file;
    }
});

// For older PHP code that doesn't use namespaces, provide compatibility functions
if (!function_exists('getDatabaseConnection')) {
    /**
     * Get database connection using the singleton
     *
     * @return mysqli Database connection
     */
    function getDatabaseConnection() {
        return \FoodPriceApp\Core\Database\DatabaseConnection::getInstance()->getConnection();
    }
}

// Legacy function compatibility
if (!function_exists('getStateId')) {
    /**
     * Get state ID, creating if necessary
     *
     * @param mysqli $conn Database connection
     * @param string $stateName State name
     * @return int State ID
     */
    function getStateId($conn, $stateName) {
        $stateModel = new \FoodPriceApp\Core\Models\State($conn);
        return $stateModel->getStateId($stateName);
    }
}

if (!function_exists('getCityId')) {
    /**
     * Get city ID, creating if necessary
     *
     * @param mysqli $conn Database connection
     * @param string $cityName City name
     * @param int $stateId State ID
     * @return int City ID
     */
    function getCityId($conn, $cityName, $stateId) {
        $cityModel = new \FoodPriceApp\Core\Models\City($conn);
        return $cityModel->getCityId($cityName, $stateId);
    }
}

if (!function_exists('updateEggRate')) {
    /**
     * Update egg rate in both original and normalized tables
     *
     * @param mysqli $conn Database connection
     * @param string $cityName City name
     * @param string $stateName State name
     * @param string $date Date
     * @param float $rate Rate value
     * @return bool Success status
     */
    function updateEggRate($conn, $cityName, $stateName, $date, $rate) {
        $rateModel = new \FoodPriceApp\Core\Models\Rate($conn);
        return $rateModel->updateEggRate($cityName, $stateName, $date, $rate);
    }
}
?>
