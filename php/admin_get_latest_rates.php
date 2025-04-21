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

$results = [];
foreach ($data as $cityState) {
    $city = $cityState['city'] ?? '';
    $state = $cityState['state'] ?? '';
    
    if (empty($city) || empty($state)) {
        continue;
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
                $results[] = $latestRate;
                continue; // Skip to the next city-state pair
            } else {
                // If no results from normalized tables, fall back to original
                $useNormalizedTables = false;
            }
        }
    } catch (Exception $e) {
        // If there's an error with normalized tables, fall back to original
        $useNormalizedTables = false;
        error_log("Error using normalized tables in admin_get_latest_rates.php: " . $e->getMessage());
    }
    
    // Fall back to original table
    $sql = "SELECT * FROM egg_rates WHERE city=? AND state=? ORDER BY date DESC LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $city, $state);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        $latestRate = $result->fetch_assoc();
        $results[] = $latestRate;
    } else {
        $results[] = ["city" => $city, "state" => $state, "rate" => null];
    }
}

echo json_encode($results);

$conn->close();
?>