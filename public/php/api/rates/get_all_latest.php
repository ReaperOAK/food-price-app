<?php
// Simple GET endpoint to get all latest rates for home page
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Disable error reporting to prevent HTML output before JSON
error_reporting(0);
ini_set('display_errors', 0);

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

try {
    // Try normalized tables first
    $sql = "
        SELECT c.name as city, s.name as state, ern.rate, ern.date
        FROM egg_rates_normalized ern
        JOIN cities c ON ern.city_id = c.id
        JOIN states s ON c.state_id = s.id
        WHERE (ern.city_id, ern.date) IN (
            SELECT city_id, MAX(date)
            FROM egg_rates_normalized
            GROUP BY city_id
        )
        ORDER BY ern.date DESC
        LIMIT 20
    ";
    
    $result = $conn->query($sql);
    $rates = [];
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $rates[] = [
                'city' => $row['city'],
                'state' => $row['state'],
                'rate' => floatval($row['rate']),
                'date' => $row['date']
            ];
        }
    } else {
        // Fall back to original table
        $sql = "
            SELECT city, state, rate, date
            FROM egg_rates
            WHERE (city, date) IN (
                SELECT city, MAX(date)
                FROM egg_rates
                GROUP BY city
            )
            ORDER BY date DESC
            LIMIT 20
        ";
        
        $result = $conn->query($sql);
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $rates[] = [
                    'city' => $row['city'],
                    'state' => $row['state'],
                    'rate' => floatval($row['rate']),
                    'date' => $row['date']
                ];
            }
        }
    }
    
    echo json_encode($rates);
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    error_log("Error in get_all_latest.php: " . $e->getMessage());
}

$conn->close();
?>
