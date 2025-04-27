<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

// Get query parameters
$state = isset($_GET['state']) ? trim($_GET['state']) : '';
$days = isset($_GET['days']) ? intval($_GET['days']) : 30; // Default to 30 days
$period = isset($_GET['period']) ? intval($_GET['period']) : $days; // For backward compatibility

// Log the request for debugging
error_log("get_average_rates_by_state.php called with state: $state, days/period: $days");

if (empty($state)) {
    echo json_encode(['error' => 'State parameter is required']);
    exit;
}

// Calculate the start date
$daysToLookBack = max(intval($period), intval($days)); // Use the larger value
$startDate = date('Y-m-d', strtotime("-$daysToLookBack days"));

// Try normalized tables first
$useNormalizedTables = true;
$averageRates = [];

try {
    if ($useNormalizedTables) {
        $sql = "
            SELECT ern.date, AVG(ern.rate) as avg_rate
            FROM egg_rates_normalized ern
            JOIN cities c ON ern.city_id = c.id
            JOIN states s ON c.state_id = s.id
            WHERE s.name = ? AND ern.date >= ?
            GROUP BY ern.date
            ORDER BY ern.date DESC
        ";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $state, $startDate);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $useNormalizedTables = false;
            error_log("No results from normalized tables for state: $state, falling back to original table");
        } else {
            while ($row = $result->fetch_assoc()) {
                $averageRates[] = [
                    'date' => $row['date'],
                    'avg_rate' => number_format((float)$row['avg_rate'], 2, '.', ''),
                    'average_rate' => number_format((float)$row['avg_rate'], 2, '.', '') // Include both naming conventions
                ];
            }
        }
    }
} catch (Exception $e) {
    $useNormalizedTables = false;
    error_log("Error using normalized tables: " . $e->getMessage());
}

// Fall back to original table if needed
if (!$useNormalizedTables) {
    try {
        $sql = "
            SELECT date, AVG(rate) as avg_rate 
            FROM egg_rates 
            WHERE state = ? AND date >= ?
            GROUP BY date
            ORDER BY date DESC
        ";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $state, $startDate);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $averageRates[] = [
                'date' => $row['date'],
                'avg_rate' => number_format((float)$row['avg_rate'], 2, '.', ''),
                'average_rate' => number_format((float)$row['avg_rate'], 2, '.', '') // Include both naming conventions
            ];
        }
    } catch (Exception $e) {
        error_log("Error using original table: " . $e->getMessage());
        echo json_encode([
            'error' => 'Failed to fetch average rates data',
            'state' => $state,
            'averageRates' => []
        ]);
        $conn->close();
        exit;
    }
}

// Also calculate some statistics
$statistics = [];
if (!empty($averageRates)) {
    $rates = array_column($averageRates, 'avg_rate');
    $statistics = [
        'min' => min($rates),
        'max' => max($rates),
        'average' => number_format(array_sum($rates) / count($rates), 2, '.', ''),
        'count' => count($rates),
        'period' => $daysToLookBack . ' days'
    ];
}

// Log response size for debugging
error_log("get_average_rates_by_state.php returning " . count($averageRates) . " results for state: $state");

// Return a consistent response format
$response = [
    'state' => $state,
    'averageRates' => $averageRates,
    'statistics' => $statistics
];

echo json_encode($response);
$conn->close();
?>
