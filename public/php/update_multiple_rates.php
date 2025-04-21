<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

// Get the JSON payload
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data)) {
    echo json_encode(["error" => "No data provided"]);
    exit();
}

// Begin transaction to ensure all updates succeed or fail together
$conn->begin_transaction();

try {
    $errors = [];
    foreach ($data as $rate) {
        if (!isset($rate['state']) || !isset($rate['date']) || !isset($rate['rate']) || !isset($rate['city'])) {
            $errors[] = "Missing data for one or more fields";
            continue;
        }

        $state = $conn->real_escape_string($rate['state']);
        $date = $conn->real_escape_string($rate['date']);
        $rateValue = $conn->real_escape_string($rate['rate']);
        $city = $conn->real_escape_string($rate['city']);

        // Log the incoming data
        error_log("Processing rate for city: $city, state: $state, date: $date, rate: $rateValue");

        // 1. Update the original egg_rates table
        // Check if the rate already exists
        $checkSql = "SELECT * FROM egg_rates WHERE city='$city' AND state='$state' AND date='$date'";
        $result = $conn->query($checkSql);

        if ($result->num_rows > 0) {
            // Update existing rate
            $sql = "UPDATE egg_rates SET rate='$rateValue' WHERE city='$city' AND state='$state' AND date='$date'";
        } else {
            // Insert new rate
            $sql = "INSERT INTO egg_rates (city, state, date, rate) VALUES ('$city', '$state', '$date', '$rateValue')";
        }

        if (!$conn->query($sql)) {
            $errors[] = "Error updating original table for $city, $state: " . $conn->error;
        }

        // 2. Update the normalized tables
        try {
            // Get or create state ID
            $stateQuery = "SELECT id FROM states WHERE name = ?";
            $stmt = $conn->prepare($stateQuery);
            $stmt->bind_param("s", $state);
            $stmt->execute();
            $stateResult = $stmt->get_result();
            
            if ($stateResult->num_rows > 0) {
                $stateId = $stateResult->fetch_assoc()['id'];
            } else {
                // Insert new state
                $insertStateQuery = "INSERT INTO states (name) VALUES (?)";
                $stmt = $conn->prepare($insertStateQuery);
                $stmt->bind_param("s", $state);
                $stmt->execute();
                $stateId = $conn->insert_id;
            }
            
            // Get or create city ID
            $cityQuery = "SELECT id FROM cities WHERE name = ? AND state_id = ?";
            $stmt = $conn->prepare($cityQuery);
            $stmt->bind_param("si", $city, $stateId);
            $stmt->execute();
            $cityResult = $stmt->get_result();
            
            if ($cityResult->num_rows > 0) {
                $cityId = $cityResult->fetch_assoc()['id'];
            } else {
                // Insert new city
                $insertCityQuery = "INSERT INTO cities (name, state_id) VALUES (?, ?)";
                $stmt = $conn->prepare($insertCityQuery);
                $stmt->bind_param("si", $city, $stateId);
                $stmt->execute();
                $cityId = $conn->insert_id;
            }
            
            // Check if the rate already exists in normalized table
            $checkNormalizedSql = "SELECT id FROM egg_rates_normalized WHERE city_id = ? AND date = ?";
            $stmt = $conn->prepare($checkNormalizedSql);
            $stmt->bind_param("is", $cityId, $date);
            $stmt->execute();
            $normalizedResult = $stmt->get_result();
            
            if ($normalizedResult->num_rows > 0) {
                // Update existing normalized rate
                $rateId = $normalizedResult->fetch_assoc()['id'];
                $updateNormalizedSql = "UPDATE egg_rates_normalized SET rate = ? WHERE id = ?";
                $stmt = $conn->prepare($updateNormalizedSql);
                $stmt->bind_param("di", $rateValue, $rateId);
                $stmt->execute();
            } else {
                // Insert new normalized rate
                $insertNormalizedSql = "INSERT INTO egg_rates_normalized (city_id, date, rate) VALUES (?, ?, ?)";
                $stmt = $conn->prepare($insertNormalizedSql);
                $stmt->bind_param("isd", $cityId, $date, $rateValue);
                $stmt->execute();
            }
            
        } catch (Exception $e) {
            $errors[] = "Error updating normalized tables for $city, $state: " . $e->getMessage();
            error_log("Error updating normalized tables: " . $e->getMessage());
        }
    }

    // Commit transaction if no errors
    if (empty($errors)) {
        $conn->commit();
        echo json_encode(["success" => "Rates updated successfully in both original and normalized tables"]);
    } else {
        $conn->rollback();
        echo json_encode(["errors" => $errors]);
    }
    
} catch (Exception $e) {
    // Rollback on any error
    $conn->rollback();
    echo json_encode(["error" => "Transaction failed: " . $e->getMessage()]);
    error_log("Transaction error: " . $e->getMessage());
}

$conn->close();
?>