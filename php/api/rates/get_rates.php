<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Include database connection
require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

// Get query parameters
$city = isset($_GET['city']) ? trim($_GET['city']) : null;
$state = isset($_GET['state']) ? trim($_GET['state']) : null;
$days = isset($_GET['days']) ? intval($_GET['days']) : null;

// Log the received parameters for debugging
error_log("get_rates.php called with city: " . ($city ?? 'null') . ", state: " . ($state ?? 'null') . ", days: " . ($days ?? 'null'));

// Initialize the response array
$response = [];

// Check if we have the necessary parameters
if (empty($city) && empty($state)) {
    // If neither city nor state provided, return the latest rates for all cities
    try {
        $sql = "SELECT city, state, date, rate FROM egg_rates 
                WHERE (city, state, date) IN (
                    SELECT city, state, MAX(date) 
                    FROM egg_rates 
                    GROUP BY city, state
                )
                ORDER BY state, city";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $response[] = $row;
        }
    } catch (Exception $e) {
        error_log("Error fetching all rates: " . $e->getMessage());
        $response = ["error" => "Failed to fetch rates data: " . $e->getMessage()];
    }
} else {
    // Try to get rates from the normalized tables first
    $useNormalizedTables = true;
    $rates = [];

    try {
        if ($useNormalizedTables) {
            // Build the WHERE clause based on available parameters
            $whereClause = [];
            $params = [];
            $types = "";
            
            if (!empty($city)) {
                $whereClause[] = "c.name = ?";
                $params[] = $city;
                $types .= "s";
            }
            
            if (!empty($state)) {
                $whereClause[] = "s.name = ?";
                $params[] = $state;
                $types .= "s";
            }
            
            // Using the normalized database structure
            $sql = "SELECT ern.date, ern.rate, c.name as city, s.name as state
                    FROM egg_rates_normalized ern
                    JOIN cities c ON ern.city_id = c.id
                    JOIN states s ON c.state_id = s.id";
            
            if (!empty($whereClause)) {
                $sql .= " WHERE " . implode(" AND ", $whereClause);
            }
            
            $sql .= " ORDER BY ern.date DESC";
            
            if ($days) {
                $sql .= " LIMIT ?";
                $params[] = $days;
                $types .= "i";
            }
            
            $stmt = $conn->prepare($sql);
            
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            // If no results from normalized tables, fall back to original table
            if ($result->num_rows === 0) {
                $useNormalizedTables = false;
                error_log("No results from normalized tables, falling back to original table");
            } else {
                while ($row = $result->fetch_assoc()) {
                    $rates[] = $row;
                }
            }
        }
    } catch (Exception $e) {
        // If there's an error with normalized tables, fall back to original
        $useNormalizedTables = false;
        error_log("Error using normalized tables: " . $e->getMessage());
    }

    // Fall back to original table if needed
    if (!$useNormalizedTables) {
        try {
            // Build the WHERE clause based on available parameters
            $whereClause = [];
            $params = [];
            $types = "";
            
            if (!empty($city)) {
                $whereClause[] = "city = ?";
                $params[] = $city;
                $types .= "s";
            }
            
            if (!empty($state)) {
                $whereClause[] = "state = ?";
                $params[] = $state;
                $types .= "s";
            }
            
            $sql = "SELECT date, rate, city, state FROM egg_rates";
            
            if (!empty($whereClause)) {
                $sql .= " WHERE " . implode(" AND ", $whereClause);
            }
            
            $sql .= " ORDER BY date DESC";
            
            if ($days) {
                $sql .= " LIMIT ?";
                $params[] = $days;
                $types .= "i";
            }
            
            $stmt = $conn->prepare($sql);
            
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            while ($row = $result->fetch_assoc()) {
                $rates[] = $row;
            }
        } catch (Exception $e) {
            error_log("Error using original tables: " . $e->getMessage());
            $rates = ["error" => "Failed to fetch rates data: " . $e->getMessage()];
        }
    }
    
    $response = $rates;
}

// Log the response count for debugging
error_log("get_rates.php returning " . (is_array($response) ? count($response) : 'non-array') . " results");

// Return JSON response
echo json_encode($response);
$conn->close();
?>