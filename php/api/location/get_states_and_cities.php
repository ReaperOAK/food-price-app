<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

// Try to use normalized tables first
$useNormalizedTables = true;
$statesAndCities = [];

try {
    if ($useNormalizedTables) {
        // Get all states
        $statesSql = "SELECT id, name FROM states ORDER BY name";
        $statesResult = $conn->query($statesSql);
        
        if ($statesResult && $statesResult->num_rows > 0) {
            while ($stateRow = $statesResult->fetch_assoc()) {
                $stateId = $stateRow['id'];
                $stateName = $stateRow['name'];
                
                // Get cities for this state
                $citiesSql = "SELECT name FROM cities WHERE state_id = ? ORDER BY name";
                $stmt = $conn->prepare($citiesSql);
                $stmt->bind_param("i", $stateId);
                $stmt->execute();
                $citiesResult = $stmt->get_result();
                
                $cities = [];
                while ($cityRow = $citiesResult->fetch_assoc()) {
                    $cities[] = $cityRow['name'];
                }
                
                $statesAndCities[$stateName] = $cities;
            }
        } else {
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    $useNormalizedTables = false;
    error_log("Error using normalized tables: " . $e->getMessage());
}

// Fall back to original tables if needed
if (!$useNormalizedTables) {
    $sql = "SELECT state, city FROM egg_rates";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $state = $row['state'];
            $city = $row['city'];
            
            if (!isset($statesAndCities[$state])) {
                $statesAndCities[$state] = [];
            }
            
            if (!in_array($city, $statesAndCities[$state])) {
                $statesAndCities[$state][] = $city;
            }
        }
    }
}

if (!empty($statesAndCities)) {
    echo json_encode($statesAndCities);
} else {
    echo json_encode(['error' => 'No data found']);
}

$conn->close();
?>