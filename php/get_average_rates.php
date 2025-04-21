<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

$state = $_GET['state'] ?? '';

if (empty($state)) {
    echo json_encode(['error' => 'State parameter is required']);
    exit;
}

// Try to use normalized tables first
$useNormalizedTables = true;
$averageRates = [];

try {
    if ($useNormalizedTables) {
        // First, get the state ID
        $stateIdSql = "SELECT id FROM states WHERE name = ?";
        $stmtStateId = $conn->prepare($stateIdSql);
        $stmtStateId->bind_param("s", $state);
        $stmtStateId->execute();
        $stateResult = $stmtStateId->get_result();
        
        if ($stateResult && $stateResult->num_rows > 0) {
            $stateId = $stateResult->fetch_assoc()['id'];
            
            // Get average rates from normalized tables
            $sql = "
                SELECT ern.date, AVG(ern.rate) as averageRate 
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                WHERE c.state_id = ?
                GROUP BY ern.date
                ORDER BY ern.date DESC
            ";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $stateId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $averageRates[] = $row;
                }
            } else {
                // If no results from normalized tables, fall back to original
                $useNormalizedTables = false;
            }
        } else {
            // If state not found in normalized tables, fall back to original
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    // If there's an error with normalized tables, fall back to original
    $useNormalizedTables = false;
    error_log("Error using normalized tables in get_average_rates.php: " . $e->getMessage());
}

// Only use original tables if normalized tables didn't return results
if (!$useNormalizedTables || empty($averageRates)) {
    $sql = "SELECT date, AVG(rate) as averageRate FROM egg_rates WHERE state = ? GROUP BY date ORDER BY date DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $state);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $averageRates[] = $row;
        }
    } else {
        error_log("Error querying original table in get_average_rates.php: " . $conn->error);
    }
}

echo json_encode(['averageRates' => $averageRates]);

$conn->close();
?>