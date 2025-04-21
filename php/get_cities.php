<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once 'db.php';

// Get the selected state from the query parameter
$state = isset($_GET['state']) ? $_GET['state'] : '';

if ($state) {
    // Try to use normalized tables first
    $useNormalizedTables = true;
    $cities = [];

    try {
        if ($useNormalizedTables) {
            // Fetch cities from the normalized tables
            $sql = "SELECT c.name FROM cities c
                    JOIN states s ON c.state_id = s.id
                    WHERE s.name = ?
                    ORDER BY c.name";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $state);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if (!$result) {
                throw new Exception($conn->error);
            }
            
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $cities[] = $row['name'];
                }
            } else {
                // If no results from normalized tables, fall back to original
                $useNormalizedTables = false;
            }
        }
    } catch (Exception $e) {
        // If there's an error with normalized tables, fall back to original
        $useNormalizedTables = false;
        error_log("Error using normalized tables in get_cities.php: " . $e->getMessage());
    }

    // Only use original tables if normalized tables didn't return results
    if (!$useNormalizedTables || empty($cities)) {
        // Fetch cities based on the selected state from original table
        $sql = "SELECT DISTINCT city FROM egg_rates WHERE state = ? ORDER BY city";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $state);
        $stmt->execute();
        $result = $stmt->get_result();

        $cities = [];
        while ($row = $result->fetch_assoc()) {
            $cities[] = $row['city'];
        }
    }

    echo json_encode($cities);
} else {
    echo json_encode([]);
}

$conn->close();
?>
