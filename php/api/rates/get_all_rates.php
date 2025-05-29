<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';
require_once dirname(dirname(dirname(__FILE__))) . '/config/CacheManager.php';

$cacheConfig = require dirname(dirname(dirname(__FILE__))) . '/config/cache_config.php';
$cacheManager = new CacheManager($cacheConfig['cache_path']);

// Get the date parameter from the query string
$date = isset($_GET['date']) ? $conn->real_escape_string($_GET['date']) : null;

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
        'endpoint' => 'get_all_rates',
        'date' => $date
    ]);

    $cachedData = $cacheManager->get($cacheKey);
    if ($cachedData !== null) {
        echo json_encode($cachedData);
        exit;
    }
}

// Try normalized tables first
$useNormalizedTables = true;
$rates = [];

try {
    if ($useNormalizedTables) {
        if ($date) {
            $sql = "
                SELECT c.name as city, s.name as state, ern.date, ern.rate, ern.id
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE ern.date = ?
                ORDER BY s.name, c.name
            ";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $date);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $sql = "
                SELECT c.name as city, s.name as state, ern.date, ern.rate, ern.id
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                ORDER BY ern.date DESC, s.name, c.name
            ";
            $result = $conn->query($sql);
        }
        
        if (!$result || $result->num_rows === 0) {
            $useNormalizedTables = false;
        } else {
            while ($row = $result->fetch_assoc()) {
                $rates[] = [
                    'id' => $row['id'],
                    'city' => $row['city'],
                    'state' => $row['state'],
                    'date' => $row['date'],
                    'rate' => $row['rate']
                ];
            }
        }
    }
} catch (Exception $e) {
    $useNormalizedTables = false;
    error_log("Error using normalized tables: " . $e->getMessage());
}

// Fall back to original tables if needed
if (!$useNormalizedTables) {
    if ($date) {
        $sql = "SELECT * FROM egg_rates WHERE date = '$date' ORDER BY state, city";
    } else {
        $sql = "SELECT * FROM egg_rates ORDER BY date DESC, state, city";
    }
    
    $result = $conn->query($sql);
    
    if (!$result) {
        // Log the SQL error
        error_log("SQL Error: " . $conn->error);
        echo json_encode(["error" => "Error executing query"]);
        exit;
    }
    
    $rates = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $rates[] = $row;
        }
    }
}

// Cache the response if caching is enabled
if ($cacheConfig['cache_enabled'] && !$skipCache) {
    $cacheManager->set($cacheKey, $rates, $cacheConfig['cache_ttl']);
}

// Return the rates as JSON
echo json_encode($rates);

$conn->close();
?>