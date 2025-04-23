<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

// Get the JSON payload
$data = json_decode(file_get_contents('php://input'), true);

// Try to use normalized tables first
$useNormalizedTables = true;
$rates = [];

try {
    if (empty($data)) {
        // Query to get the latest rate for each city
        if ($useNormalizedTables) {
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
            ";
            $result = $conn->query($sql);
            
            if (!$result || $result->num_rows === 0) {
                $useNormalizedTables = false;
            } else {
                while ($row = $result->fetch_assoc()) {
                    $rates[] = [
                        'city' => $row['city'],
                        'state' => $row['state'],
                        'rate' => $row['rate'],
                        'date' => $row['date']
                    ];
                }
            }
        }
        
        // Fall back to original table if needed
        if (!$useNormalizedTables) {
            $sql = "
                SELECT city, state, rate, date
                FROM egg_rates
                WHERE (city, date) IN (
                    SELECT city, MAX(date)
                    FROM egg_rates
                    GROUP BY city
                )
                ORDER BY date DESC
            ";
            $result = $conn->query($sql);
            
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $rates[] = [
                        'city' => $row['city'],
                        'state' => $row['state'],
                        'rate' => $row['rate'],
                        'date' => $row['date']
                    ];
                }
            }
        }
    } else {
        // Prepare the query to get the latest rate for specific cities
        $placeholders = [];
        $params = [];
        $types = '';
        
        foreach ($data as $cityState) {
            if (isset($cityState['city']) && isset($cityState['state'])) {
                $city = $cityState['city'];
                $state = $cityState['state'];
                
                $placeholders[] = "(c.name = ? AND s.name = ?)";
                $params[] = $city;
                $params[] = $state;
                $types .= 'ss';
            }
        }
        
        if (empty($placeholders)) {
            echo json_encode(["error" => "No valid city-state pairs provided"]);
            exit();
        }
        
        $conditionStr = implode(' OR ', $placeholders);
        
        if ($useNormalizedTables) {
            $sql = "
                SELECT c.name as city, s.name as state, ern.rate, ern.date
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE ($conditionStr) AND (ern.city_id, ern.date) IN (
                    SELECT city_id, MAX(date)
                    FROM egg_rates_normalized
                    GROUP BY city_id
                )
                ORDER BY ern.date DESC
            ";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if (!$result || $result->num_rows === 0) {
                $useNormalizedTables = false;
            } else {
                while ($row = $result->fetch_assoc()) {
                    $rates[] = [
                        'city' => $row['city'],
                        'state' => $row['state'],
                        'rate' => $row['rate'],
                        'date' => $row['date']
                    ];
                }
            }
        }
        
        // Fall back to original table if needed
        if (!$useNormalizedTables) {
            $originalPlaceholders = [];
            $originalParams = [];
            $originalTypes = '';
            
            foreach ($data as $cityState) {
                if (isset($cityState['city']) && isset($cityState['state'])) {
                    $city = $cityState['city'];
                    $state = $cityState['state'];
                    
                    $originalPlaceholders[] = "(city = ? AND state = ?)";
                    $originalParams[] = $city;
                    $originalParams[] = $state;
                    $originalTypes .= 'ss';
                }
            }
            
            $originalConditionStr = implode(' OR ', $originalPlaceholders);
            
            $sql = "
                SELECT city, state, rate, date
                FROM egg_rates
                WHERE ($originalConditionStr) AND (city, date) IN (
                    SELECT city, MAX(date)
                    FROM egg_rates
                    GROUP BY city
                )
                ORDER BY date DESC
            ";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($originalTypes, ...$originalParams);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $rates[] = [
                        'city' => $row['city'],
                        'state' => $row['state'],
                        'rate' => $row['rate'],
                        'date' => $row['date']
                    ];
                }
            }
        }
    }
    
    if (empty($rates)) {
        echo json_encode(["message" => "No rates found"]);
    } else {
        echo json_encode($rates);
    }
} catch (Exception $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    error_log("Error in get_latest_rates.php: " . $e->getMessage());
}

$conn->close();
?>