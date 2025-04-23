<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once 'db.php';

// Try to use the normalized table first
try {
    // Fetch unique states from the normalized structure
    $sql = "SELECT name FROM states ORDER BY name";
    $result = $conn->query($sql);
    
    if (!$result || $result->num_rows === 0) {
        // Fall back to the original table
        $sql = "SELECT DISTINCT state FROM egg_rates ORDER BY state";
        $result = $conn->query($sql);
    }
} catch (Exception $e) {
    // Fall back to the original table
    $sql = "SELECT DISTINCT state FROM egg_rates ORDER BY state";
    $result = $conn->query($sql);
}

$states = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Check which table we're reading from
        $stateName = isset($row['name']) ? $row['name'] : $row['state'];
        $states[] = $stateName;
    }
}

echo json_encode($states);

$conn->close();
?>
