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
        // Check if the state already exists in normalized table
        $checkStateSql = "SELECT id FROM states WHERE name = ?";
        $stmtCheckState = $conn->prepare($checkStateSql);
        $stmtCheckState->bind_param("s", $name);
        $stmtCheckState->execute();
        $stateResult = $stmtCheckState->get_result();
        
        if ($stateResult->num_rows > 0) {
            echo json_encode(["error" => "State already exists"]);
            exit();
        }
        
        // Insert into normalized states table
        $insertStateSql = "INSERT INTO states (name) VALUES (?)";
        $stmtInsertState = $conn->prepare($insertStateSql);
        $stmtInsertState->bind_param("s", $name);
        
        if (!$stmtInsertState->execute()) {
            throw new Exception("Error adding state to normalized table: " . $conn->error);
        }
        
        // Also insert into original table with a placeholder city for backward compatibility
        $originalSql = "INSERT INTO egg_rates (city, state, date, rate) VALUES ('placeholder', ?, CURDATE(), 0)";
        $stmtOriginal = $conn->prepare($originalSql);
        $stmtOriginal->bind_param("s", $name);
        
        if (!$stmtOriginal->execute()) {
            throw new Exception("Error adding state to original table: " . $conn->error);
        }
        
    } else if ($type === 'city' && $state) {
        // First, find the state ID in the normalized table
        $findStateSql = "SELECT id FROM states WHERE name = ?";
        $stmtFindState = $conn->prepare($findStateSql);
        $stmtFindState->bind_param("s", $state);
        $stmtFindState->execute();
        $stateResult = $stmtFindState->get_result();
        
        if ($stateResult->num_rows == 0) {
            // State doesn't exist in normalized table, create it
            $insertStateSql = "INSERT INTO states (name) VALUES (?)";
            $stmtInsertState = $conn->prepare($insertStateSql);
            $stmtInsertState->bind_param("s", $state);
            
            if (!$stmtInsertState->execute()) {
                throw new Exception("Error adding state to normalized table: " . $conn->error);
            }
            
            $stateId = $conn->insert_id;
        } else {
            $stateId = $stateResult->fetch_assoc()['id'];
        }
        
        // Check if city already exists in normalized table
        $checkCitySql = "SELECT id FROM cities WHERE name = ? AND state_id = ?";
        $stmtCheckCity = $conn->prepare($checkCitySql);
        $stmtCheckCity->bind_param("si", $name, $stateId);
        $stmtCheckCity->execute();
        $cityResult = $stmtCheckCity->get_result();
        
        if ($cityResult->num_rows > 0) {
            echo json_encode(["error" => "City already exists in the state"]);
            exit();
        }
        
        // Insert city into normalized cities table
        $insertCitySql = "INSERT INTO cities (name, state_id) VALUES (?, ?)";
        $stmtInsertCity = $conn->prepare($insertCitySql);
        $stmtInsertCity->bind_param("si", $name, $stateId);
        
        if (!$stmtInsertCity->execute()) {
            throw new Exception("Error adding city to normalized table: " . $conn->error);
        }
        
        // Also insert into original table for backward compatibility
        $originalSql = "INSERT INTO egg_rates (city, state, date, rate) VALUES (?, ?, CURDATE(), 0)";
        $stmtOriginal = $conn->prepare($originalSql);
        $stmtOriginal->bind_param("ss", $name, $state);
        
        if (!$stmtOriginal->execute()) {
            throw new Exception("Error adding city to original table: " . $conn->error);
        }
    } else {
        echo json_encode(["error" => "Invalid data provided"]);
        exit();
    }
    
    // Commit transaction
    $conn->commit();
    echo json_encode(["success" => "$type added successfully to both original and normalized tables"]);
    
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();
?>