<?php
// Disable error reporting for production to prevent HTML output before JSON
error_reporting(0);
ini_set('display_errors', 0);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';
require_once dirname(dirname(dirname(__FILE__))) . '/config/CacheManager.php';

$cacheConfig = require dirname(dirname(dirname(__FILE__))) . '/config/cache_config.php';
$cacheManager = new CacheManager($cacheConfig['cache_path']);

// Check if cache should be skipped
$skipCache = false;
foreach ($cacheConfig['no_cache_params'] as $param) {
    if (isset($_GET[$param])) {
        $skipCache = true;
        break;
    }
}

// Get the JSON payload
$data = json_decode(file_get_contents('php://input'), true);
$cacheKey = $cacheManager->getCacheKey([
    'endpoint' => 'get_latest_rates',
    'data' => $data
]);

// Try to get from cache first
if (!$skipCache) {
    $cachedData = $cacheManager->get($cacheKey);
    if ($cachedData !== null) {
        echo json_encode($cachedData);
        exit;
    }
}

// Try to use normalized tables first
$useNormalizedTables = true;
$rates = [];

try {
    if (empty($data)) {
        // Query to get the latest rate for each city
        if ($useNormalizedTables) {
            $sql = "
                SELECT c.name as city, s.name as state, ern.rate, ern.date
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE (ern.city_id, ern.date) IN (
                    SELECT city_id, MAX(date)
                    FROM egg_rates_normalized
                    GROUP BY city_id
                )
                ORDER BY ern.date DESC
            ";
            $result = $conn->query($sql);
            
            if (!$result || $result->num_rows === 0) {
                $useNormalizedTables = false;
            } else {
                while ($row = $result->fetch_assoc()) {
                    $rates[] = [
                        'city' => $row['city'],
                        'state' => $row['state'],
                        'rate' => $row['rate'],
                        'date' => $row['date']
                    ];
                }
            }
        }
        
        // Fall back to original table if needed
        if (!$useNormalizedTables) {
            $sql = "
                SELECT city, state, rate, date
                FROM egg_rates
                WHERE (city, date) IN (
                    SELECT city, MAX(date)
                    FROM egg_rates
                    GROUP BY city
                )
                ORDER BY date DESC
            ";
            $result = $conn->query($sql);
            
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $rates[] = [
                        'city' => $row['city'],
                        'state' => $row['state'],
                        'rate' => $row['rate'],
                        'date' => $row['date']
                    ];
                }
            }
        }
    } else {
        // Prepare the query to get the latest rate for specific cities
        $placeholders = [];
        $params = [];
        $types = '';
        
        foreach ($data as $cityState) {
            if (isset($cityState['city']) && isset($cityState['state'])) {
                $city = $cityState['city'];
                $state = $cityState['state'];
                
                $placeholders[] = "(c.name = ? AND s.name = ?)";
                $params[] = $city;
                $params[] = $state;
                $types .= 'ss';
            }
        }
        
        if (empty($placeholders)) {
            echo json_encode(["error" => "No valid city-state pairs provided"]);
            exit();
        }
        
        $conditionStr = implode(' OR ', $placeholders);
        
        if ($useNormalizedTables) {
            $sql = "
                SELECT c.name as city, s.name as state, ern.rate, ern.date
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE ($conditionStr) AND (ern.city_id, ern.date) IN (
                    SELECT city_id, MAX(date)
                    FROM egg_rates_normalized
                    GROUP BY city_id
                )
                ORDER BY ern.date DESC
            ";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if (!$result || $result->num_rows === 0) {
                $useNormalizedTables = false;
            } else {
                while ($row = $result->fetch_assoc()) {
                    $rates[] = [
                        'city' => $row['city'],
                        'state' => $row['state'],
                        'rate' => $row['rate'],
                        'date' => $row['date']
                    ];
                }
            }
        }
        
        // Fall back to original table if needed
        if (!$useNormalizedTables) {
            $originalPlaceholders = [];
            $originalParams = [];
            $originalTypes = '';
            
            foreach ($data as $cityState) {
                if (isset($cityState['city']) && isset($cityState['state'])) {
                    $city = $cityState['city'];
                    $state = $cityState['state'];
                    
                    $originalPlaceholders[] = "(city = ? AND state = ?)";
                    $originalParams[] = $city;
                    $originalParams[] = $state;
                    $originalTypes .= 'ss';
                }
            }
            
            $originalConditionStr = implode(' OR ', $originalPlaceholders);
            
            $sql = "
                SELECT city, state, rate, date
                FROM egg_rates
                WHERE ($originalConditionStr) AND (city, date) IN (
                    SELECT city, MAX(date)
                    FROM egg_rates
                    GROUP BY city
                )
                ORDER BY date DESC
            ";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($originalTypes, ...$originalParams);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $rates[] = [
                        'city' => $row['city'],
                        'state' => $row['state'],
                        'rate' => $row['rate'],
                        'date' => $row['date']
                    ];
                }
            }
        }
    }
      $response = empty($rates) ? 
        ["message" => "No rates found"] : 
        $rates;

    // Cache the response
    if ($cacheConfig['cache_enabled'] && !$skipCache) {
        $cacheManager->set($cacheKey, $response, $cacheConfig['cache_ttl']);
    }

    echo json_encode($response);
} catch (Exception $e) {
    $error = ["error" => "Database error: " . $e->getMessage()];
    echo json_encode($error);
    error_log("Error in get_latest_rates.php: " . $e->getMessage());
}

$conn->close();
?>