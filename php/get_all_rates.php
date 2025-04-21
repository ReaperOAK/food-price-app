<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

// Get the date parameter from the query string
$date = isset($_GET['date']) ? $conn->real_escape_string($_GET['date']) : null;

// Try to use normalized tables first
$useNormalizedTables = true;
$rates = [];

try {
    if ($useNormalizedTables) {
        // SQL query to fetch egg rates from normalized tables
        if ($date) {
            $sql = "SELECT ern.id, c.name as city, s.name as state, ern.date, ern.rate
                    FROM egg_rates_normalized ern
                    JOIN cities c ON ern.city_id = c.id
                    JOIN states s ON c.state_id = s.id
                    WHERE ern.date = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $date);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $sql = "SELECT ern.id, c.name as city, s.name as state, ern.date, ern.rate
                    FROM egg_rates_normalized ern
                    JOIN cities c ON ern.city_id = c.id
                    JOIN states s ON c.state_id = s.id";
            
            $result = $conn->query($sql);
        }
        
        if (!$result) {
            throw new Exception($conn->error);
        }
        
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $rates[] = $row;
            }
        } else {
            // If no results from normalized tables, fall back to original
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    // If there's an error with normalized tables, fall back to original
    $useNormalizedTables = false;
    error_log("Error using normalized tables in get_all_rates.php: " . $e->getMessage());
}

// Only use original tables if normalized tables didn't return results
if (!$useNormalizedTables || empty($rates)) {
    // SQL query to fetch egg rates from original table
    if ($date) {
        $sql = "SELECT * FROM egg_rates WHERE date = '$date'";
    } else {
        $sql = "SELECT * FROM egg_rates";
    }

    $result = $conn->query($sql);

    if (!$result) {
        // Log the SQL error
        error_log("SQL Error: " . $conn->error);
        echo json_encode(["error" => "Error executing query"]);
        exit;
    }

    $rates = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $rates[] = $row;
        }
    }
}

// Return the rates as JSON
echo json_encode($rates);

$conn->close();
?>