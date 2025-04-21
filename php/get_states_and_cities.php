<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

// Try to use normalized tables first
$useNormalizedTables = true;
$statesAndCities = [];

try {
    if ($useNormalizedTables) {
        // Get states and cities from normalized tables
        $sql = "SELECT s.name as state, c.name as city 
                FROM cities c
                JOIN states s ON c.state_id = s.id
                ORDER BY s.name, c.name";
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception($conn->error);
        }
        
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $state = $row['state'];
                $city = $row['city'];
                
                if (!isset($statesAndCities[$state])) {
                    $statesAndCities[$state] = [];
                }
                
                // Avoid duplicates
                if (!in_array($city, $statesAndCities[$state])) {
                    $statesAndCities[$state][] = $city;
                }
            }
        } else {
            // If no results from normalized tables, fall back to original
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    // If there's an error with normalized tables, fall back to original
    $useNormalizedTables = false;
    error_log("Error using normalized tables in get_states_and_cities.php: " . $e->getMessage());
}

// Only use original tables if normalized tables didn't return results
if (!$useNormalizedTables || empty($statesAndCities)) {
    // Fetch states and cities from original table
    $sql = "SELECT DISTINCT state, city FROM egg_rates ORDER BY state, city";
    $result = $conn->query($sql);

    $statesAndCities = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $state = $row['state'];
            $city = $row['city'];
            
            if (!isset($statesAndCities[$state])) {
                $statesAndCities[$state] = [];
            }
            
            // Avoid duplicates
            if (!in_array($city, $statesAndCities[$state])) {
                $statesAndCities[$state][] = $city;
            }
        }
    }
}

// Return the results
if (!empty($statesAndCities)) {
    echo json_encode($statesAndCities);
} else {
    echo json_encode(['error' => 'No data found']);
}

// Close connection
$conn->close();
?>