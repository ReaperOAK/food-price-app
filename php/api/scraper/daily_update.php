<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

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
        WHERE c.name NOT IN ('" . implode("','", $updatedCities) . "')
    ";
    
    $result = $conn->query($sql);
    $updateCount = 0;
    $errors = [];
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $cityId = $row['city_id'];
            $city = $row['city'];
            $stateId = $row['state_id'];
            $state = $row['state'];
            
            // Check if the state has an average rate calculated
            if (isset($stateAverageRates[$state])) {
                $rate = $stateAverageRates[$state]; // Use the state average rate
            } else {
                // If no average rate is available, use the last available rate
                $lastRateSql = "
                    SELECT rate 
                    FROM egg_rates_normalized 
                    WHERE city_id = ? 
                    ORDER BY date DESC 
                    LIMIT 1
                ";
                $stmt = $conn->prepare($lastRateSql);
                $stmt->bind_param("i", $cityId);
                $stmt->execute();
                $lastRateResult = $stmt->get_result();
                
                if ($lastRateResult->num_rows > 0) {
                    $lastRateRow = $lastRateResult->fetch_assoc();
                    $rate = $lastRateRow['rate'];
                } else {
                    // No rate found, check the original table
                    $fallbackSql = "
                        SELECT rate
                        FROM egg_rates
                        WHERE city = ? AND state = ?
                        ORDER BY date DESC
                        LIMIT 1
                    ";
                    $stmt = $conn->prepare($fallbackSql);
                    $stmt->bind_param("ss", $city, $state);
                    $stmt->execute();
                    $fallbackResult = $stmt->get_result();
                    
                    if ($fallbackResult->num_rows > 0) {
                        $fallbackRow = $fallbackResult->fetch_assoc();
                        $rate = $fallbackRow['rate'];
                    } else {
                        $errors[] = "No available rate found for $city, $state";
                        continue;
                    }
                }
            }
            
            // Update in both tables using the helper function
            if (updateEggRate($conn, $city, $state, $today, $rate)) {
                $updateCount++;
            } else {
                $errors[] = "Error updating rate for $city, $state";
            }
        }
    }
    
    $conn->commit();
    
    if (empty($errors)) {
        echo json_encode([
            "success" => "Rates updated successfully",
            "count" => $updateCount
        ]);
    } else {
        echo json_encode([
            "partial_success" => "Some rates were updated",
            "count" => $updateCount,
            "errors" => $errors
        ]);
    }
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["error" => "Update failed: " . $e->getMessage()]);
}

$conn->close();
?>