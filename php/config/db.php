<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost";
$username = "u901337298_test";
$password = "A12345678b*";
$dbname = "u901337298_test";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

/**
 * Get state_id from states table, insert if not exists
 * 
 * @param mysqli $conn Database connection
 * @param string $stateName Name of the state
 * @return int State ID
 */
function getStateId($conn, $stateName) {
    // Prepare statement to get state ID
    $stmt = $conn->prepare("SELECT id FROM states WHERE name = ?");
    $stmt->bind_param("s", $stateName);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // State exists, return ID
        $row = $result->fetch_assoc();
        return $row['id'];
    } else {
        // State doesn't exist, insert and return new ID
        $stmt = $conn->prepare("INSERT INTO states (name) VALUES (?)");
        $stmt->bind_param("s", $stateName);
        $stmt->execute();
        return $conn->insert_id;
    }
}

/**
 * Get city_id from cities table, insert if not exists
 * 
 * @param mysqli $conn Database connection
 * @param string $cityName Name of the city
 * @param int $stateId State ID
 * @return int City ID
 */
function getCityId($conn, $cityName, $stateId) {
    // Prepare statement to get city ID
    $stmt = $conn->prepare("SELECT id FROM cities WHERE name = ? AND state_id = ?");
    $stmt->bind_param("si", $cityName, $stateId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // City exists, return ID
        $row = $result->fetch_assoc();
        return $row['id'];
    } else {
        // City doesn't exist, insert and return new ID
        $stmt = $conn->prepare("INSERT INTO cities (name, state_id) VALUES (?, ?)");
        $stmt->bind_param("si", $cityName, $stateId);
        $stmt->execute();
        return $conn->insert_id;
    }
}

/**
 * Update egg rate in both original and normalized tables
 * 
 * @param mysqli $conn Database connection
 * @param string $cityName Name of the city
 * @param string $stateName Name of the state
 * @param string $date Date of the rate
 * @param float $rate Rate value
 * @return bool Success status
 */
function updateEggRate($conn, $cityName, $stateName, $date, $rate) {
    try {
        // Begin transaction
        $conn->begin_transaction();
        
        // 1. Update the original egg_rates table
        $stmt = $conn->prepare("SELECT id FROM egg_rates WHERE city = ? AND state = ? AND date = ?");
        $stmt->bind_param("sss", $cityName, $stateName, $date);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Update existing rate
            $stmt = $conn->prepare("UPDATE egg_rates SET rate = ? WHERE city = ? AND state = ? AND date = ?");
            $stmt->bind_param("dsss", $rate, $cityName, $stateName, $date);
            $stmt->execute();
        } else {
            // Insert new rate
            $stmt = $conn->prepare("INSERT INTO egg_rates (city, state, date, rate) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("sssd", $cityName, $stateName, $date, $rate);
            $stmt->execute();
        }
        
        // 2. Update the normalized tables
        $stateId = getStateId($conn, $stateName);
        $cityId = getCityId($conn, $cityName, $stateId);
        
        // Check if the rate already exists in normalized table
        $stmt = $conn->prepare("SELECT id FROM egg_rates_normalized WHERE city_id = ? AND date = ?");
        $stmt->bind_param("is", $cityId, $date);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Update existing normalized rate
            $rateId = $result->fetch_assoc()['id'];
            $stmt = $conn->prepare("UPDATE egg_rates_normalized SET rate = ? WHERE id = ?");
            $stmt->bind_param("di", $rate, $rateId);
            $stmt->execute();
        } else {
            // Insert new normalized rate
            $stmt = $conn->prepare("INSERT INTO egg_rates_normalized (city_id, date, rate) VALUES (?, ?, ?)");
            $stmt->bind_param("isd", $cityId, $date, $rate);
            $stmt->execute();
        }
        
        // Commit transaction
        $conn->commit();
        return true;
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        error_log("Error updating egg rate: " . $e->getMessage());
        return false;
    }
}
?>