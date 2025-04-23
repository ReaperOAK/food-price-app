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

// Begin transaction
$conn->begin_transaction();

try {
    if ($type === 'state') {
        // First, delete from the original table
        $stmt = $conn->prepare("DELETE FROM egg_rates WHERE state = ?");
        $stmt->bind_param("s", $name);
        $stmt->execute();
        
        // Get state ID
        $stmt = $conn->prepare("SELECT id FROM states WHERE name = ?");
        $stmt->bind_param("s", $name);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $stateId = $result->fetch_assoc()['id'];
            
            // Get all cities in this state
            $stmt = $conn->prepare("SELECT id FROM cities WHERE state_id = ?");
            $stmt->bind_param("i", $stateId);
            $stmt->execute();
            $citiesResult = $stmt->get_result();
            
            while ($cityRow = $citiesResult->fetch_assoc()) {
                $cityId = $cityRow['id'];
                
                // Delete from egg_rates_normalized for this city
                $stmt = $conn->prepare("DELETE FROM egg_rates_normalized WHERE city_id = ?");
                $stmt->bind_param("i", $cityId);
                $stmt->execute();
            }
            
            // Delete all cities in this state
            $stmt = $conn->prepare("DELETE FROM cities WHERE state_id = ?");
            $stmt->bind_param("i", $stateId);
            $stmt->execute();
            
            // Finally, delete the state
            $stmt = $conn->prepare("DELETE FROM states WHERE id = ?");
            $stmt->bind_param("i", $stateId);
            $stmt->execute();
        }
    } else if ($type === 'city' && $state) {
        // First, delete from the original table
        $stmt = $conn->prepare("DELETE FROM egg_rates WHERE city = ? AND state = ?");
        $stmt->bind_param("ss", $name, $state);
        $stmt->execute();
        
        // Get state ID
        $stmt = $conn->prepare("SELECT id FROM states WHERE name = ?");
        $stmt->bind_param("s", $state);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $stateId = $result->fetch_assoc()['id'];
            
            // Get city ID
            $stmt = $conn->prepare("SELECT id FROM cities WHERE name = ? AND state_id = ?");
            $stmt->bind_param("si", $name, $stateId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $cityId = $result->fetch_assoc()['id'];
                
                // Delete from egg_rates_normalized
                $stmt = $conn->prepare("DELETE FROM egg_rates_normalized WHERE city_id = ?");
                $stmt->bind_param("i", $cityId);
                $stmt->execute();
                
                // Delete the city
                $stmt = $conn->prepare("DELETE FROM cities WHERE id = ?");
                $stmt->bind_param("i", $cityId);
                $stmt->execute();
            }
        }
    } else {
        throw new Exception("Invalid data provided");
    }
    
    $conn->commit();
    echo json_encode(["success" => "$type removed successfully from both original and normalized tables"]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["error" => "Error removing $type: " . $e->getMessage()]);
}

$conn->close();
?>