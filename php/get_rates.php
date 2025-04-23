<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

// Get query parameters
$city = $_GET['city'] ?? '';
$state = $_GET['state'] ?? '';
$days = $_GET['days'] ?? '';

// Try to get rates from the normalized tables first
$useNormalizedTables = true;

try {
    if ($useNormalizedTables) {
        // Using the normalized database structure
        if ($days) {
            $sql = "SELECT ern.date, ern.rate 
                    FROM egg_rates_normalized ern
                    JOIN cities c ON ern.city_id = c.id
                    JOIN states s ON c.state_id = s.id
                    WHERE c.name = ? AND s.name = ?
                    ORDER BY ern.date DESC LIMIT ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssi", $city, $state, $days);
        } else {
            $sql = "SELECT ern.date, ern.rate 
                    FROM egg_rates_normalized ern
                    JOIN cities c ON ern.city_id = c.id
                    JOIN states s ON c.state_id = s.id
                    WHERE c.name = ? AND s.name = ?
                    ORDER BY ern.date DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $city, $state);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        // If no results from normalized tables, fall back to original table
        if ($result->num_rows === 0) {
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    // If there's an error with normalized tables, fall back to original
    $useNormalizedTables = false;
    error_log("Error using normalized tables: " . $e->getMessage());
}

// Fall back to original table if needed
if (!$useNormalizedTables) {
    if ($days) {
        $sql = "SELECT date, rate FROM egg_rates WHERE city = ? AND state = ? ORDER BY date DESC LIMIT ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssi", $city, $state, $days);
    } else {
        $sql = "SELECT date, rate FROM egg_rates WHERE city = ? AND state = ? ORDER BY date DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $city, $state);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
}

// Process results
$rates = [];
while ($row = $result->fetch_assoc()) {
    $rates[] = $row;
}

echo json_encode($rates);
$conn->close();
?>