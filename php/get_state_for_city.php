<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

// Get city from query parameter
$city = isset($_GET['city']) ? $_GET['city'] : '';

if (empty($city)) {
    echo json_encode(['error' => 'City parameter is required']);
    exit;
}

// Try to use normalized tables first
$useNormalizedTables = true;

try {
    if ($useNormalizedTables) {
        // Get state from normalized tables
        $sql = "SELECT s.name AS state 
                FROM cities c
                JOIN states s ON c.state_id = s.id
                WHERE c.name = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $city);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if (!$result) {
            throw new Exception($conn->error);
        }
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode(['state' => $row['state']]);
            $stmt->close();
            $conn->close();
            exit;
        } else {
            // If no results from normalized tables, fall back to original
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    // If there's an error with normalized tables, fall back to original
    $useNormalizedTables = false;
    error_log("Error using normalized tables in get_state_for_city.php: " . $e->getMessage());
}

// Fall back to original table
$stmt = $conn->prepare("SELECT state FROM egg_rates WHERE city = ? LIMIT 1");
$stmt->bind_param("s", $city);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(['state' => $row['state']]);
} else {
    echo json_encode(['error' => 'No state found for the given city']);
}

// Close connection
$stmt->close();
$conn->close();
?>