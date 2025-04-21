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
    if ($useNormalizedTables) {
        if (empty($data)) {
            // Query to get the latest rate for each city from normalized tables
            $sql = "
                SELECT c.name as city, s.name as state, ern.rate, ern.date
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE (c.id, ern.date) IN (
                    SELECT ern2.city_id, MAX(ern2.date)
                    FROM egg_rates_normalized ern2
                    GROUP BY ern2.city_id
                )
                ORDER BY ern.date DESC
            ";
        } else {
            // Prepare the query to get the latest rate for specific cities
            $conditions = [];
            $params = [];
            $types = "";
            
            foreach ($data as $cityState) {
                if (isset($cityState['city']) && isset($cityState['state'])) {
                    $city = $cityState['city'];
                    $state = $cityState['state'];
                    $conditions[] = "(c.name = ? AND s.name = ?)";
                    $params[] = $city;
                    $params[] = $state;
                    $types .= "ss";
                }
            }

            if (empty($conditions)) {
                echo json_encode(["error" => "No valid city-state pairs provided"]);
                exit();
            }

            $conditionStr = implode(' OR ', $conditions);
            $sql = "
                SELECT c.name as city, s.name as state, ern.rate, ern.date
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE ($conditionStr) AND (c.id, ern.date) IN (
                    SELECT ern2.city_id, MAX(ern2.date)
                    FROM egg_rates_normalized ern2
                    GROUP BY ern2.city_id
                )
                ORDER BY ern.date DESC
            ";
            
            $stmt = $conn->prepare($sql);
            
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $rates[] = [
                        'city' => $row['city'],
                        'state' => $row['state'],
                        'rate' => $row['rate'],
                        'date' => $row['date']
                    ];
                }
            } else {
                // If no results from normalized tables, fallback to original
                $useNormalizedTables = false;
            }
        }
    }
} catch (Exception $e) {
    // If there's an error with normalized tables, fallback to original
    $useNormalizedTables = false;
    error_log("Error using normalized tables in get_latest_rates.php: " . $e->getMessage());
}

// Only use original tables if normalized tables didn't return results
if (!$useNormalizedTables || empty($rates)) {
    if (empty($data)) {
        // Query to get the latest rate for each city
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
    } else {
        // Prepare the query to get the latest rate for specific cities
        $conditions = [];
        foreach ($data as $cityState) {
            if (isset($cityState['city']) && isset($cityState['state'])) {
                $city = $conn->real_escape_string($cityState['city']);
                $state = $conn->real_escape_string($cityState['state']);
                $conditions[] = "(city='$city' AND state='$state')";
            }
        }

        if (empty($conditions)) {
            echo json_encode(["error" => "No valid city-state pairs provided"]);
            exit();
        }

        $conditionStr = implode(' OR ', $conditions);
        $sql = "
            SELECT city, state, rate, date
            FROM egg_rates
            WHERE ($conditionStr) AND (city, date) IN (
                SELECT city, MAX(date)
                FROM egg_rates
                GROUP BY city
            )
            ORDER BY date DESC
        ";
        
        $result = $conn->query($sql);
    }

    $rates = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $rates[] = [
                'city' => $row['city'],
                'state' => $row['state'],
                'rate' => $row['rate'],
                'date' => $row['date']
            ];
        }
    } else {
        echo json_encode(["message" => "No rates found"]);
        exit();
    }
}

// Output the rates as JSON
echo json_encode($rates);

// Close the database connection
$conn->close();
?>