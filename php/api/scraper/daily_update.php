<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Make sure to properly include the database configuration
require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';
require_once dirname(dirname(dirname(__FILE__))) . '/config/CacheManager.php';

$cacheConfig = require dirname(dirname(dirname(__FILE__))) . '/config/cache_config.php';
$cacheManager = new CacheManager($cacheConfig['cache_path']);

// Verify that $conn exists, otherwise create the connection
if (!isset($conn) || $conn->connect_error) {
    // Connection details
    $servername = "localhost";
    $username = "u901337298_test";
    $password = "A12345678b*";
    $dbname = "u901337298_test";
    
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
    }
}

// Get today's date
$today = date('Y-m-d');

// Fetch the cities updated by update_from_e2necc.php
$updatedCitiesQuery = "SELECT city, state, rate FROM updated_cities WHERE date = ?";
$stmt = $conn->prepare($updatedCitiesQuery);
$stmt->bind_param("s", $today);
$stmt->execute();
$updatedCitiesResult = $stmt->get_result();

$updatedCities = [];
$stateRates = [];
if ($updatedCitiesResult->num_rows > 0) {
    while ($row = $updatedCitiesResult->fetch_assoc()) {
        $updatedCities[] = $row['city'];
        $state = $row['state'];
        $rate = $row['rate'];
        if (!isset($stateRates[$state])) {
            $stateRates[$state] = [];
        }
        $stateRates[$state][] = $rate;
    }
}

// Calculate the average rate for each state
$stateAverageRates = [];
foreach ($stateRates as $state => $rates) {
    $stateAverageRates[$state] = array_sum($rates) / count($rates);
}

// Try to use normalized tables first
try {
    $conn->begin_transaction();
    
    // Get all cities that need updates (not in updated_cities)
    $sql = "
        SELECT c.id AS city_id, c.name AS city, s.id AS state_id, s.name AS state
        FROM cities c
        JOIN states s ON c.state_id = s.id
        LEFT JOIN egg_rates_normalized er ON c.id = er.city_id AND er.date = CURRENT_DATE
        WHERE er.id IS NULL
    ";
    
    $result = $conn->query($sql);
    $updateCount = 0;
    $errors = [];
    $updatedRates = [];
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            try {
                // Calculate average rate for the state
                $avgSql = "
                    SELECT AVG(er.rate) as avg_rate
                    FROM egg_rates_normalized er
                    JOIN cities c ON er.city_id = c.id
                    WHERE c.state_id = ? AND er.date = CURRENT_DATE
                ";
                $stmt = $conn->prepare($avgSql);
                $stmt->bind_param("i", $row['state_id']);
                $stmt->execute();
                $avgResult = $stmt->get_result();
                $avgRow = $avgResult->fetch_assoc();
                $avgRate = $avgRow['avg_rate'];

                if (!$avgRate) {
                    // Try getting the most recent rate for this city
                    $recentSql = "
                        SELECT rate
                        FROM egg_rates_normalized
                        WHERE city_id = ?
                        ORDER BY date DESC
                        LIMIT 1
                    ";
                    $stmt = $conn->prepare($recentSql);
                    $stmt->bind_param("i", $row['city_id']);
                    $stmt->execute();
                    $recentResult = $stmt->get_result();
                    $recentRow = $recentResult->fetch_assoc();
                    $avgRate = $recentRow['rate'];
                }

                if ($avgRate) {
                    // Insert new rate
                    $insertSql = "
                        INSERT INTO egg_rates_normalized (city_id, date, rate)
                        VALUES (?, CURRENT_DATE, ?)
                    ";
                    $stmt = $conn->prepare($insertSql);
                    $stmt->bind_param("id", $row['city_id'], $avgRate);
                    $stmt->execute();

                    $updatedRates[] = [
                        'city' => $row['city'],
                        'state' => $row['state'],
                        'rate' => $avgRate
                    ];
                    $updateCount++;
                }
            } catch (Exception $e) {
                $errors[] = "Error updating {$row['city']}: " . $e->getMessage();
            }
        }
    }
    
    $conn->commit();
      // Invalidate all caches since rates have been updated
    if ($cacheConfig['cache_enabled']) {
        $cacheManager->invalidateAll();
    }

    $response = [
        'success' => true,
        'updated_count' => $updateCount,
        'updated_rates' => $updatedRates,
        'cache_invalidated' => true
    ];

    if (!empty($errors)) {
        $response['errors'] = $errors;
    }

    header('Content-Type: application/json');
    echo json_encode($response);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["error" => "Update failed: " . $e->getMessage()]);
}

$conn->close();
?>