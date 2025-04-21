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
$specialRates = [];

try {
    if ($useNormalizedTables) {
        // Get special rates from normalized tables
        // First, try to find the "special" state id
        $stateIdSql = "SELECT id FROM states WHERE name = 'special'";
        $stateResult = $conn->query($stateIdSql);
        
        if ($stateResult && $stateResult->num_rows > 0) {
            $stateId = $stateResult->fetch_assoc()['id'];
            
            // Get city IDs for cities in the "special" state
            $sql = "
                SELECT c.name as city, ern.rate
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                WHERE c.state_id = ?
                AND (c.id, ern.date) IN (
                    SELECT ern2.city_id, MAX(ern2.date)
                    FROM egg_rates_normalized ern2
                    JOIN cities c2 ON ern2.city_id = c2.id
                    WHERE c2.state_id = ?
                    GROUP BY ern2.city_id
                )
                ORDER BY c.name
            ";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('ii', $stateId, $stateId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $specialRates[] = $row;
                }
            } else {
                // If no results from normalized tables, fall back to original
                $useNormalizedTables = false;
            }
        } else {
            // If "special" state not found in normalized tables, fall back to original
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    // If there's an error with normalized tables, fall back to original
    $useNormalizedTables = false;
    error_log("Error using normalized tables in get_special_rates.php: " . $e->getMessage());
}

// Only use original tables if normalized tables didn't return results
if (!$useNormalizedTables || empty($specialRates)) {
    $sql = "
        SELECT city, rate
        FROM egg_rates
        WHERE state = 'special'
        AND (city, date) IN (
            SELECT city, MAX(date)
            FROM egg_rates
            WHERE state = 'special'
            GROUP BY city
        )
        ORDER BY city
    ";
    $result = $conn->query($sql);

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $specialRates[] = $row;
        }
    } else {
        error_log("Error querying original table in get_special_rates.php: " . $conn->error);
    }
}

echo json_encode($specialRates);

$conn->close();
?>