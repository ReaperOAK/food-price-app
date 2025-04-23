<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

// Try normalized tables first
$useNormalizedTables = true;

try {
    if ($useNormalizedTables) {
        $sql = "
            SELECT c.name as city, ern.rate
            FROM egg_rates_normalized ern
            JOIN cities c ON ern.city_id = c.id
            JOIN states s ON c.state_id = s.id
            WHERE s.name = 'special'
            AND (c.id, ern.date) IN (
                SELECT city_id, MAX(date)
                FROM egg_rates_normalized ern2
                JOIN cities c2 ON ern2.city_id = c2.id
                JOIN states s2 ON c2.state_id = s2.id
                WHERE s2.name = 'special'
                GROUP BY city_id
            )
            ORDER BY c.name
        ";
        
        $result = $conn->query($sql);
        
        if (!$result || $result->num_rows === 0) {
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    $useNormalizedTables = false;
    error_log("Error using normalized tables: " . $e->getMessage());
}

// Fall back to original table if needed
if (!$useNormalizedTables) {
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
}

$specialRates = [];
while ($row = $result->fetch_assoc()) {
    $specialRates[] = $row;
}

echo json_encode($specialRates);

$conn->close();
?>