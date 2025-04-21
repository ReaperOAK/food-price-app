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

$type = $data['type'];
$name = $conn->real_escape_string($data['name']);
$state = isset($data['state']) ? $conn->real_escape_string($data['state']) : null;

// Start transaction to ensure consistency across tables
$conn->begin_transaction();

try {
    if ($type === 'state') {
        // First delete from normalized tables
        
        // Get state ID 
        $stateIdSql = "SELECT id FROM states WHERE name = ?";
        $stmtStateId = $conn->prepare($stateIdSql);
        $stmtStateId->bind_param("s", $name);
        $stmtStateId->execute();
        $stateResult = $stmtStateId->get_result();
        
        if ($stateResult->num_rows > 0) {
            $stateId = $stateResult->fetch_assoc()['id'];
            
            // Delete all rates associated with cities in this state
            $deleteRatesSql = "DELETE ern FROM egg_rates_normalized ern
                              JOIN cities c ON ern.city_id = c.id
                              WHERE c.state_id = ?";
            $stmtDeleteRates = $conn->prepare($deleteRatesSql);
            $stmtDeleteRates->bind_param("i", $stateId);
            $stmtDeleteRates->execute();
            
            // Delete all cities in this state
            $deleteCitiesSql = "DELETE FROM cities WHERE state_id = ?";
            $stmtDeleteCities = $conn->prepare($deleteCitiesSql);
            $stmtDeleteCities->bind_param("i", $stateId);
            $stmtDeleteCities->execute();
            
            // Delete the state
            $deleteStateSql = "DELETE FROM states WHERE id = ?";
            $stmtDeleteState = $conn->prepare($deleteStateSql);
            $stmtDeleteState->bind_param("i", $stateId);
            $stmtDeleteState->execute();
        }
        
        // Also delete from original table
        $originalSql = "DELETE FROM egg_rates WHERE state = ?";
        $stmtOriginal = $conn->prepare($originalSql);
        $stmtOriginal->bind_param("s", $name);
        
        if (!$stmtOriginal->execute()) {
            throw new Exception("Error removing state from original table: " . $conn->error);
        }
        
    } else if ($type === 'city' && $state) {
        // Delete from normalized tables
        
        // Get state ID
        $stateIdSql = "SELECT id FROM states WHERE name = ?";
        $stmtStateId = $conn->prepare($stateIdSql);
        $stmtStateId->bind_param("s", $state);
        $stmtStateId->execute();
        $stateResult = $stmtStateId->get_result();
        
        if ($stateResult->num_rows > 0) {
            $stateId = $stateResult->fetch_assoc()['id'];
            
            // Get city ID
            $cityIdSql = "SELECT id FROM cities WHERE name = ? AND state_id = ?";
            $stmtCityId = $conn->prepare($cityIdSql);
            $stmtCityId->bind_param("si", $name, $stateId);
            $stmtCityId->execute();
            $cityResult = $stmtCityId->get_result();
            
            if ($cityResult->num_rows > 0) {
                $cityId = $cityResult->fetch_assoc()['id'];
                
                // Delete rates for this city
                $deleteRatesSql = "DELETE FROM egg_rates_normalized WHERE city_id = ?";
                $stmtDeleteRates = $conn->prepare($deleteRatesSql);
                $stmtDeleteRates->bind_param("i", $cityId);
                $stmtDeleteRates->execute();
                
                // Delete the city
                $deleteCitySql = "DELETE FROM cities WHERE id = ?";
                $stmtDeleteCity = $conn->prepare($deleteCitySql);
                $stmtDeleteCity->bind_param("i", $cityId);
                $stmtDeleteCity->execute();
            }
        }
        
        // Also delete from original table
        $originalSql = "DELETE FROM egg_rates WHERE city = ? AND state = ?";
        $stmtOriginal = $conn->prepare($originalSql);
        $stmtOriginal->bind_param("ss", $name, $state);
        
        if (!$stmtOriginal->execute()) {
            throw new Exception("Error removing city from original table: " . $conn->error);
        }
    } else {
        echo json_encode(["error" => "Invalid data provided"]);
        exit();
    }
    
    // Commit transaction
    $conn->commit();
    echo json_encode(["success" => "$type removed successfully from both original and normalized tables"]);
    
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();
?>