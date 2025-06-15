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

// Get query parameters
$city = $_GET['city'] ?? '';
$state = $_GET['state'] ?? '';
$days = $_GET['days'] ?? '';

// Validate that we have at least one parameter (city or state)
if (empty($city) && empty($state)) {
    echo json_encode(['error' => 'Either city or state parameter is required']);
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
        'endpoint' => 'get_rates',
        'city' => $city,
        'state' => $state,
        'days' => $days
    ]);

    $cachedData = $cacheManager->get($cacheKey);
    if ($cachedData !== null) {
        echo json_encode($cachedData);
        exit;
    }
}

// Try to get rates from the normalized tables first
$useNormalizedTables = true;

try {
    if ($useNormalizedTables) {
        // Using the normalized database structure
        if ($city && $state) {
            // Both city and state provided
            if ($days) {
                $sql = "SELECT ern.date, ern.rate 
                        FROM egg_rates_normalized ern
                        JOIN cities c ON ern.city_id = c.id
                        JOIN states s ON c.state_id = s.id
                        WHERE c.name = ? AND s.name = ?
                        ORDER BY ern.date DESC LIMIT ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssi", $city, $state, $days);
            } else {
                $sql = "SELECT ern.date, ern.rate 
                        FROM egg_rates_normalized ern
                        JOIN cities c ON ern.city_id = c.id
                        JOIN states s ON c.state_id = s.id
                        WHERE c.name = ? AND s.name = ?
                        ORDER BY ern.date DESC";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ss", $city, $state);
            }
        } elseif ($city) {
            // Only city provided
            if ($days) {
                $sql = "SELECT ern.date, ern.rate 
                        FROM egg_rates_normalized ern
                        JOIN cities c ON ern.city_id = c.id
                        WHERE c.name = ?
                        ORDER BY ern.date DESC LIMIT ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $city, $days);
            } else {
                $sql = "SELECT ern.date, ern.rate 
                        FROM egg_rates_normalized ern
                        JOIN cities c ON ern.city_id = c.id
                        WHERE c.name = ?
                        ORDER BY ern.date DESC";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("s", $city);
            }
        } elseif ($state) {
            // Only state provided - get latest rates for all cities in the state
            if ($days) {
                $sql = "SELECT c.name as city, ern.date, ern.rate 
                        FROM egg_rates_normalized ern
                        JOIN cities c ON ern.city_id = c.id
                        JOIN states s ON c.state_id = s.id
                        WHERE s.name = ?
                        AND (c.id, ern.date) IN (
                            SELECT city_id, MAX(date)
                            FROM egg_rates_normalized ern2
                            JOIN cities c2 ON ern2.city_id = c2.id
                            JOIN states s2 ON c2.state_id = s2.id
                            WHERE s2.name = ?
                            GROUP BY city_id
                        )
                        ORDER BY ern.date DESC, c.name";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ss", $state, $state);
            } else {
                $sql = "SELECT c.name as city, ern.date, ern.rate 
                        FROM egg_rates_normalized ern
                        JOIN cities c ON ern.city_id = c.id
                        JOIN states s ON c.state_id = s.id
                        WHERE s.name = ?
                        AND (c.id, ern.date) IN (
                            SELECT city_id, MAX(date)
                            FROM egg_rates_normalized ern2
                            JOIN cities c2 ON ern2.city_id = c2.id
                            JOIN states s2 ON c2.state_id = s2.id
                            WHERE s2.name = ?
                            GROUP BY city_id
                        )
                        ORDER BY ern.date DESC, c.name";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ss", $state, $state);
            }
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        // If no results from normalized tables, fall back to original table
        if ($result->num_rows === 0) {
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    // If there's an error with normalized tables, fall back to original
    $useNormalizedTables = false;
    error_log("Error using normalized tables: " . $e->getMessage());
}

// Fall back to original table if needed
if (!$useNormalizedTables) {
    if ($city && $state) {
        // Both city and state provided
        if ($days) {
            $sql = "SELECT date, rate FROM egg_rates WHERE city = ? AND state = ? ORDER BY date DESC LIMIT ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssi", $city, $state, $days);
        } else {
            $sql = "SELECT date, rate FROM egg_rates WHERE city = ? AND state = ? ORDER BY date DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $city, $state);
        }
    } elseif ($city) {
        // Only city provided
        if ($days) {
            $sql = "SELECT date, rate FROM egg_rates WHERE city = ? ORDER BY date DESC LIMIT ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("si", $city, $days);
        } else {
            $sql = "SELECT date, rate FROM egg_rates WHERE city = ? ORDER BY date DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $city);
        }
    } elseif ($state) {
        // Only state provided - get latest rates for all cities in the state
        $sql = "SELECT city, date, rate FROM egg_rates 
                WHERE state = ? 
                AND (city, date) IN (
                    SELECT city, MAX(date) 
                    FROM egg_rates 
                    WHERE state = ? 
                    GROUP BY city
                )
                ORDER BY date DESC, city";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $state, $state);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
}

// Process results
$rates = [];
while ($row = $result->fetch_assoc()) {
    $rates[] = $row;
}

// Cache the response if caching is enabled
if ($cacheConfig['cache_enabled'] && !$skipCache) {
    $cacheManager->set($cacheKey, $rates, $cacheConfig['cache_ttl']);
}

echo json_encode($rates);
$conn->close();
?>

echo json_encode($rates);
$conn->close();
?>