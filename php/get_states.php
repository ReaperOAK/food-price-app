<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once 'db.php';

// Try to use normalized tables first
$useNormalizedTables = true;
$states = [];

try {
    if ($useNormalizedTables) {
        // Fetch states from the normalized states table
        $sql = "SELECT name FROM states ORDER BY name";
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception($conn->error);
        }
        
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $states[] = $row['name'];
            }
        } else {
            // If no results from normalized tables, fall back to original
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    // If there's an error with normalized tables, fall back to original
    $useNormalizedTables = false;
    error_log("Error using normalized tables in get_states.php: " . $e->getMessage());
}

// Only use original tables if normalized tables didn't return results
if (!$useNormalizedTables || empty($states)) {
    // Fetch unique states from the original table
    $sql = "SELECT DISTINCT state FROM egg_rates ORDER BY state";
    $result = $conn->query($sql);

    $states = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $states[] = $row['state'];
        }
    }
}

echo json_encode($states);

$conn->close();
?>
