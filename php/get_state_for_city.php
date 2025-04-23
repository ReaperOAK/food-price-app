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

// Try normalized tables first
$useNormalizedTables = true;

try {
    if ($useNormalizedTables) {
        $sql = "SELECT s.name as state 
                FROM states s
                JOIN cities c ON s.id = c.state_id
                WHERE c.name = ?
                LIMIT 1";
                
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $city);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    $useNormalizedTables = false;
    error_log("Error using normalized tables: " . $e->getMessage());
}

// Fall back to original table if needed
if (!$useNormalizedTables) {
    $sql = "SELECT state FROM egg_rates WHERE city = ? LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $city);
    $stmt->execute();
    $result = $stmt->get_result();
}

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(['state' => $row['state']]);
} else {
    echo json_encode(['error' => 'No state found for the given city']);
}

$conn->close();
?>