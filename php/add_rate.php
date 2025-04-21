<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['city']) && !empty($data['state']) && !empty($data['date']) && !empty($data['rate'])) {
    $city = $data['city'];
    $state = $data['state'];
    $date = $data['date'];
    $rate = $data['rate'];
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // 1. Insert into original egg_rates table
        $originalSql = "INSERT INTO egg_rates (city, state, date, rate) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($originalSql);
        $stmt->bind_param("ssss", $city, $state, $date, $rate);
        
        if (!$stmt->execute()) {
            throw new Exception("Error inserting into original table: " . $conn->error);
        }
        
        // 2. Insert into normalized tables
        // Check if state exists
        $stateIdSql = "SELECT id FROM states WHERE name = ?";
        $stmtStateId = $conn->prepare($stateIdSql);
        $stmtStateId->bind_param("s", $state);
        $stmtStateId->execute();
        $stateResult = $stmtStateId->get_result();
        
        if ($stateResult->num_rows > 0) {
            $stateId = $stateResult->fetch_assoc()['id'];
        } else {
            // Insert new state
            $insertStateSql = "INSERT INTO states (name) VALUES (?)";
            $stmtInsertState = $conn->prepare($insertStateSql);
            $stmtInsertState->bind_param("s", $state);
            $stmtInsertState->execute();
            $stateId = $conn->insert_id;
        }
        
        // Check if city exists
        $cityIdSql = "SELECT id FROM cities WHERE name = ? AND state_id = ?";
        $stmtCityId = $conn->prepare($cityIdSql);
        $stmtCityId->bind_param("si", $city, $stateId);
        $stmtCityId->execute();
        $cityResult = $stmtCityId->get_result();
        
        if ($cityResult->num_rows > 0) {
            $cityId = $cityResult->fetch_assoc()['id'];
        } else {
            // Insert new city
            $insertCitySql = "INSERT INTO cities (name, state_id) VALUES (?, ?)";
            $stmtInsertCity = $conn->prepare($insertCitySql);
            $stmtInsertCity->bind_param("si", $city, $stateId);
            $stmtInsertCity->execute();
            $cityId = $conn->insert_id;
        }
        
        // Insert rate into normalized table
        $insertRateSql = "INSERT INTO egg_rates_normalized (city_id, date, rate) VALUES (?, ?, ?)";
        $stmtInsertRate = $conn->prepare($insertRateSql);
        $stmtInsertRate->bind_param("isd", $cityId, $date, $rate);
        
        if (!$stmtInsertRate->execute()) {
            throw new Exception("Error inserting into normalized table: " . $conn->error);
        }
        
        // Commit transaction
        $conn->commit();
        echo json_encode(["message" => "Rate added successfully to both original and normalized tables"]);
        
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        error_log("Error adding rate: " . $e->getMessage());
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Invalid input"]);
}

$conn->close();
?>