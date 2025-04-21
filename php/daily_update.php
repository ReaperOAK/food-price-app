<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

include 'db.php';

// Get today's date
$today = date('Y-m-d');

// Begin transaction
$conn->begin_transaction();

try {
    // Fetch the cities updated by update_from_e2necc.php
    $updatedCitiesQuery = "SELECT city, state, rate FROM updated_cities WHERE date = '$today'";
    $updatedCitiesResult = $conn->query($updatedCitiesQuery);

    $updatedCities = [];
    $stateRates = [];
    if ($updatedCitiesResult && $updatedCitiesResult->num_rows > 0) {
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

    // Process original egg_rates table
    $errors = [];
    
    // Fetch the cities that were not updated by update_from_e2necc.php
    if (!empty($updatedCities)) {
        $citiesPlaceholder = "'" . implode("','", array_map([$conn, 'real_escape_string'], $updatedCities)) . "'";
        $sql = "
            SELECT city, state
            FROM egg_rates
            WHERE city NOT IN ($citiesPlaceholder)
            GROUP BY city, state
        ";
    } else {
        $sql = "
            SELECT city, state
            FROM egg_rates
            GROUP BY city, state
        ";
    }

    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $city = $conn->real_escape_string($row['city']);
            $state = $conn->real_escape_string($row['state']);
            
            // Check if the state has an average rate calculated
            if (isset($stateAverageRates[$state])) {
                $rate = $stateAverageRates[$state]; // Use the state average rate
            } else {
                // If no average rate is available, use the last available rate
                $lastAvailableRate = null;
                $dateToCheck = strtotime('-1 day', strtotime($today));

                while (!$lastAvailableRate) {
                    $previousDay = date('Y-m-d', $dateToCheck);
                    $previousRateSql = "SELECT rate FROM egg_rates WHERE city='$city' AND state='$state' AND date='$previousDay'";
                    $previousRateResult = $conn->query($previousRateSql);

                    if ($previousRateResult && $previousRateResult->num_rows > 0) {
                        $previousRateRow = $previousRateResult->fetch_assoc();
                        $lastAvailableRate = $previousRateRow['rate'];
                    } else {
                        $dateToCheck = strtotime('-1 day', $dateToCheck);
                        if ($dateToCheck < strtotime('-30 days', strtotime($today))) {
                            // Break the loop if no rate is found within the last 30 days
                            break;
                        }
                    }
                }

                if ($lastAvailableRate) {
                    $rate = $lastAvailableRate;
                } else {
                    $errors[] = "No available rate found for $city, $state within the last 30 days";
                    continue;
                }
            }

            // Check if the rate already exists for today's date
            $checkSql = "SELECT * FROM egg_rates WHERE city='$city' AND state='$state' AND date='$today'";
            $checkResult = $conn->query($checkSql);

            if ($checkResult && $checkResult->num_rows > 0) {
                // Update existing rate for today's date
                $updateSql = "UPDATE egg_rates SET rate='$rate' WHERE city='$city' AND state='$state' AND date='$today'";
                if (!$conn->query($updateSql)) {
                    $errors[] = "Error updating rate for $city, $state: " . $conn->error;
                }
            } else {
                // Insert new rate for today's date
                $insertSql = "INSERT INTO egg_rates (city, state, date, rate) VALUES ('$city', '$state', '$today', '$rate')";
                if (!$conn->query($insertSql)) {
                    $errors[] = "Error inserting rate for $city, $state: " . $conn->error;
                }
            }
        }
    }
    
    // Now process the normalized tables if they exist
    try {
        // Check if normalized tables exist
        $checkTablesResult = $conn->query("SHOW TABLES LIKE 'cities'");
        
        if ($checkTablesResult && $checkTablesResult->num_rows > 0) {
            // Get all cities that don't have rates for today
            $normalizedSql = "
                SELECT c.id AS city_id, c.name AS city_name, s.id AS state_id, s.name AS state_name
                FROM cities c
                JOIN states s ON c.state_id = s.id
                LEFT JOIN egg_rates_normalized r ON c.id = r.city_id AND r.date = '$today'
                WHERE r.id IS NULL
            ";
            
            $normalizedResult = $conn->query($normalizedSql);
            
            if ($normalizedResult && $normalizedResult->num_rows > 0) {
                while ($row = $normalizedResult->fetch_assoc()) {
                    $cityId = $row['city_id'];
                    $cityName = $row['city_name'];
                    $stateName = $row['state_name'];
                    
                    // Get rate using the same logic as for the original table
                    $rate = null;
                    
                    // Try to use state average first
                    if (isset($stateAverageRates[$stateName])) {
                        $rate = $stateAverageRates[$stateName];
                    } else {
                        // Try to get the last rate for this city from normalized table
                        $lastRateSql = "
                            SELECT rate 
                            FROM egg_rates_normalized 
                            WHERE city_id = $cityId 
                            ORDER BY date DESC 
                            LIMIT 1
                        ";
                        
                        $lastRateResult = $conn->query($lastRateSql);
                        
                        if ($lastRateResult && $lastRateResult->num_rows > 0) {
                            $lastRateRow = $lastRateResult->fetch_assoc();
                            $rate = $lastRateRow['rate'];
                        } else {
                            // If no rate in normalized table, try the original table
                            $originalRateSql = "
                                SELECT rate 
                                FROM egg_rates 
                                WHERE city = '$cityName' AND state = '$stateName' 
                                ORDER BY date DESC 
                                LIMIT 1
                            ";
                            
                            $originalRateResult = $conn->query($originalRateSql);
                            
                            if ($originalRateResult && $originalRateResult->num_rows > 0) {
                                $originalRateRow = $originalRateResult->fetch_assoc();
                                $rate = $originalRateRow['rate'];
                            }
                        }
                    }
                    
                    if ($rate !== null) {
                        // Insert the rate into the normalized table
                        $insertNormalizedSql = "
                            INSERT INTO egg_rates_normalized (city_id, date, rate) 
                            VALUES ($cityId, '$today', '$rate')
                        ";
                        
                        if (!$conn->query($insertNormalizedSql)) {
                            $errors[] = "Error inserting normalized rate for $cityName: " . $conn->error;
                        }
                    } else {
                        $errors[] = "Could not determine rate for normalized city: $cityName";
                    }
                }
            }
        }
    } catch (Exception $e) {
        // Ignore errors with normalized tables if they don't exist yet
        $errors[] = "Normalized tables error: " . $e->getMessage();
    }
    
    // Commit transaction
    $conn->commit();
    
    if (empty($errors)) {
        echo json_encode(["success" => "Rates updated successfully"]);
    } else {
        echo json_encode(["success" => "Rates updated with some errors", "errors" => $errors]);
    }
} catch (Exception $e) {
    // Rollback the transaction in case of error
    $conn->rollback();
    echo json_encode(["error" => "Transaction failed: " . $e->getMessage()]);
}

$conn->close();
?>