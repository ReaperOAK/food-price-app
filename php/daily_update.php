<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$servername = "localhost";
$username = "u901337298_test";
$password = "A12345678b*";
$dbname = "u901337298_test";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get today's date
$today = date('Y-m-d');

// Fetch the cities updated by update_from_e2necc.php
$updatedCitiesQuery = "SELECT city, state, rate FROM updated_cities WHERE date = '$today'";
$updatedCitiesResult = $conn->query($updatedCitiesQuery);

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

// Fetch the cities that were not updated by update_from_e2necc.php
$sql = "
    SELECT city, state
    FROM egg_rates
    WHERE city NOT IN ('" . implode("','", $updatedCities) . "')
    GROUP BY city, state
";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $errors = [];
    while ($row = $result->fetch_assoc()) {
        $city = $conn->real_escape_string($row['city']);
        $state = $conn->real_escape_string($row['state']);
        $rate = $stateAverageRates[$state]; // Use the state average rate

        // Check if the rate already exists for today's date
        $checkSql = "SELECT * FROM egg_rates WHERE city='$city' AND state='$state' AND date='$today'";
        $checkResult = $conn->query($checkSql);

        if ($checkResult->num_rows > 0) {
            // Update existing rate for today's date
            $updateSql = "UPDATE egg_rates SET rate='$rate' WHERE city='$city' AND state='$state' AND date='$today'";
            if (!$conn->query($updateSql)) {
                $errors[] = "Error updating rate for $city, $state: " . $conn->error;
            }
        } else {
            // Insert new rate for today's date
            $insertSql = "INSERT INTO egg_rates (city, state, date, rate) VALUES ('$city', '$state', '$today', '$rate')";
            if (!$conn->query($insertSql)) {
                // If insertion fails, try to use the last available rate
                $lastAvailableRate = null;
                $dateToCheck = strtotime('-1 day', strtotime($today));

                while (!$lastAvailableRate) {
                    $previousDay = date('Y-m-d', $dateToCheck);
                    $previousRateSql = "SELECT rate FROM egg_rates WHERE city='$city' AND state='$state' AND date='$previousDay'";
                    $previousRateResult = $conn->query($previousRateSql);

                    if ($previousRateResult->num_rows > 0) {
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
                    // Insert new rate for today's date using the last available rate
                    $insertPreviousRateSql = "INSERT INTO egg_rates (city, state, date, rate) VALUES ('$city', '$state', '$today', '$lastAvailableRate')";
                    if (!$conn->query($insertPreviousRateSql)) {
                        $errors[] = "Error inserting last available rate for $city, $state: " . $conn->error;
                    }
                } else {
                    $errors[] = "No available rate found for $city, $state within the last 30 days";
                }
            }
        }
    }

    if (empty($errors)) {
        echo json_encode(["success" => "Rates updated successfully"]);
    } else {
        echo json_encode(["errors" => $errors]);
    }
} else {
    echo json_encode(["message" => "No rates found"]);
}

$conn->close();
?>