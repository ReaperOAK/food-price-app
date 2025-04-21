<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

$city = isset($_GET['city']) ? $_GET['city'] : '';
$state = isset($_GET['state']) ? $_GET['state'] : '';

if (empty($city) || empty($state)) {
    echo json_encode(["error" => "Both city and state parameters are required"]);
    exit();
}

// Try to use normalized tables first
$useNormalizedTables = true;
$latestRate = null;

try {
    if ($useNormalizedTables) {
        // Get latest rate from normalized tables
        $sql = "SELECT ern.id, c.name as city, s.name as state, ern.date, ern.rate 
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE c.name = ? AND s.name = ?
                ORDER BY ern.date DESC 
                LIMIT 1";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $city, $state);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result && $result->num_rows > 0) {
            $latestRate = $result->fetch_assoc();
        } else {
            // If no results from normalized tables, fall back to original
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    // If there's an error with normalized tables, fall back to original
    $useNormalizedTables = false;
    error_log("Error using normalized tables in get_latest_rate.php: " . $e->getMessage());
}

// Only use original tables if normalized tables didn't return results
if (!$useNormalizedTables || !$latestRate) {
    $sql = "SELECT * FROM egg_rates WHERE city=? AND state=? ORDER BY date DESC LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $city, $state);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        $latestRate = $result->fetch_assoc();
    } else {
        echo json_encode(["error" => "No rates found for $city, $state"]);
        exit();
    }
}

echo json_encode($latestRate);

$conn->close();
?>