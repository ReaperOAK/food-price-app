<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

// Get query parameters
$state = $_GET['state'] ?? '';
$period = $_GET['period'] ?? '30'; // Default to 30 days if not specified

if (empty($state)) {
    echo json_encode(['error' => 'State parameter is required']);
    exit;
}

// Convert period to integer
$daysToLookBack = intval($period);
$startDate = date('Y-m-d', strtotime("-$daysToLookBack days"));

// Try normalized tables first
$useNormalizedTables = true;

try {
    if ($useNormalizedTables) {
        $sql = "
            SELECT ern.date, AVG(ern.rate) as averageRate
            FROM egg_rates_normalized ern
            JOIN cities c ON ern.city_id = c.id
            JOIN states s ON c.state_id = s.id
            WHERE s.name = ? AND ern.date >= ?
            GROUP BY ern.date
            ORDER BY ern.date
        ";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $state, $startDate);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
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
        SELECT date, AVG(rate) as averageRate 
        FROM egg_rates 
        WHERE state = ? AND date >= ?
        GROUP BY date
        ORDER BY date
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $state, $startDate);
    $stmt->execute();
    $result = $stmt->get_result();
}

$averageRates = [];
while ($row = $result->fetch_assoc()) {
    $averageRates[] = [
        'date' => $row['date'],
        'averageRate' => number_format((float)$row['averageRate'], 2, '.', '')
    ];
}

// Also calculate some statistics
$statistics = [];
if (!empty($averageRates)) {
    $rates = array_column($averageRates, 'averageRate');
    $statistics = [
        'min' => min($rates),
        'max' => max($rates),
        'average' => number_format(array_sum($rates) / count($rates), 2, '.', ''),
        'count' => count($rates),
        'period' => $daysToLookBack . ' days'
    ];
}

echo json_encode([
    'state' => $state,
    'averageRates' => $averageRates,
    'statistics' => $statistics
]);

$conn->close();
?>
