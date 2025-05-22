<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';
require_once dirname(dirname(dirname(__FILE__))) . '/config/CacheManager.php';

$cacheConfig = require dirname(dirname(dirname(__FILE__))) . '/config/cache_config.php';
$cacheManager = new CacheManager($cacheConfig['cache_path']);

$city = isset($_GET['city']) ? $conn->real_escape_string($_GET['city']) : '';
$state = isset($_GET['state']) ? $conn->real_escape_string($_GET['state']) : '';

if (empty($city) || empty($state)) {
    echo json_encode(["error" => "City and state parameters are required"]);
    exit;
}

// Check if cache should be skipped
$skipCache = false;
foreach ($cacheConfig['no_cache_params'] as $param) {
    if (isset($_GET[$param])) {
        $skipCache = true;
        break;
    }
}

// Try to get from cache first
if (!$skipCache && $cacheConfig['cache_enabled']) {
    $cacheKey = $cacheManager->getCacheKey([
        'endpoint' => 'get_latest_rate',
        'city' => $city,
        'state' => $state
    ]);

    $cachedData = $cacheManager->get($cacheKey);
    if ($cachedData !== null) {
        echo json_encode($cachedData);
        exit;
    }
}

// Try normalized tables first
$useNormalizedTables = true;

try {
    if ($useNormalizedTables) {
        $sql = "
            SELECT ern.id, c.name as city, s.name as state, ern.date, ern.rate
            FROM egg_rates_normalized ern
            JOIN cities c ON ern.city_id = c.id
            JOIN states s ON c.state_id = s.id
            WHERE c.name = ? AND s.name = ?
            ORDER BY ern.date DESC 
            LIMIT 1
        ";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $city, $state);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    $useNormalizedTables = false;
    error_log("Error using normalized tables: " . $e->getMessage());
}

// Fall back to original table if needed
if (!$useNormalizedTables) {
    $sql = "SELECT * FROM egg_rates WHERE city = ? AND state = ? ORDER BY date DESC LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $city, $state);
    $stmt->execute();
    $result = $stmt->get_result();
}

if ($result->num_rows > 0) {
    $latestRate = $result->fetch_assoc();
    
    // Cache the response if caching is enabled
    if ($cacheConfig['cache_enabled'] && !$skipCache) {
        $cacheManager->set($cacheKey, $latestRate, $cacheConfig['cache_ttl']);
    }
    
    echo json_encode($latestRate);
} else {
    $error = ["error" => "No rates found for $city, $state"];
    echo json_encode($error);
}

$conn->close();
?>