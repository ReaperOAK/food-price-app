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
        // Check if the state already exists in original table
        $checkSql = "SELECT DISTINCT state FROM egg_rates WHERE state = ?";
        $stmt = $conn->prepare($checkSql);
        $stmt->bind_param("s", $name);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            throw new Exception("State already exists in original table");
        }
        
        // Check if the state already exists in normalized table
        $checkNormalizedSql = "SELECT id FROM states WHERE name = ?";
        $stmt = $conn->prepare($checkNormalizedSql);
        $stmt->bind_param("s", $name);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            throw new Exception("State already exists in normalized table");
        }
        
        // Insert a new state with a placeholder city in original table
        $sql = "INSERT INTO egg_rates (city, state, date, rate) VALUES ('placeholder', ?, CURDATE(), 0)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $name);
        $stmt->execute();
        
        // Insert into normalized structure
        $stmt = $conn->prepare("INSERT INTO states (name) VALUES (?)");
        $stmt->bind_param("s", $name);
        $stmt->execute();
        $stateId = $conn->insert_id;
        
        // Add a placeholder city in the normalized structure too
        $placeholderCity = 'placeholder';
        $stmt = $conn->prepare("INSERT INTO cities (name, state_id) VALUES (?, ?)");
        $stmt->bind_param("si", $placeholderCity, $stateId);
        $stmt->execute();
        $cityId = $conn->insert_id;
        
        // Add a placeholder rate
        $today = date('Y-m-d');
        $rate = 0;
        $stmt = $conn->prepare("INSERT INTO egg_rates_normalized (city_id, date, rate) VALUES (?, ?, ?)");
        $stmt->bind_param("isd", $cityId, $today, $rate);
        $stmt->execute();
        
    } else if ($type === 'city' && $state) {
        // Check if the city already exists in the state
        $checkSql = "SELECT * FROM egg_rates WHERE city = ? AND state = ?";
        $stmt = $conn->prepare($checkSql);
        $stmt->bind_param("ss", $name, $state);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            throw new Exception("City already exists in this state");
        }
        
        // Insert a new city in the state in original table
        $sql = "INSERT INTO egg_rates (city, state, date, rate) VALUES (?, ?, CURDATE(), 0)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $name, $state);
        $stmt->execute();
        
        // Insert into normalized structure
        // First get the state_id
        $stmt = $conn->prepare("SELECT id FROM states WHERE name = ?");
        $stmt->bind_param("s", $state);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $stateId = $result->fetch_assoc()['id'];
            
            // Check if city already exists in this state
            $stmt = $conn->prepare("SELECT id FROM cities WHERE name = ? AND state_id = ?");
            $stmt->bind_param("si", $name, $stateId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                throw new Exception("City already exists in this state in normalized table");
            }
            
            // Insert the city
            $stmt = $conn->prepare("INSERT INTO cities (name, state_id) VALUES (?, ?)");
            $stmt->bind_param("si", $name, $stateId);
            $stmt->execute();
            $cityId = $conn->insert_id;
            
            // Add a placeholder rate
            $today = date('Y-m-d');
            $rate = 0;
            $stmt = $conn->prepare("INSERT INTO egg_rates_normalized (city_id, date, rate) VALUES (?, ?, ?)");
            $stmt->bind_param("isd", $cityId, $today, $rate);
            $stmt->execute();
        } else {
            throw new Exception("State not found in normalized structure");
        }
    } else {
        throw new Exception("Invalid data provided");
    }
    
    $conn->commit();
    echo json_encode(["success" => "$type added successfully to both original and normalized tables"]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["error" => "Error adding $type: " . $e->getMessage()]);
}

$conn->close();
?>