<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once 'db.php';

// Get the selected state from the query parameter
$state = isset($_GET['state']) ? $_GET['state'] : '';

if ($state) {
    // Try normalized tables first
    try {
        $sql = "SELECT c.name 
                FROM cities c
                JOIN states s ON c.state_id = s.id
                WHERE s.name = ?
                ORDER BY c.name";
                
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $state);
        $stmt->execute();
        $result = $stmt->get_result();
        
        // If no results from normalized tables, fall back to original
        if ($result->num_rows === 0) {
            throw new Exception("No cities found in normalized tables");
        }
    } catch (Exception $e) {
        // Fall back to original table
        $sql = "SELECT DISTINCT city FROM egg_rates WHERE state = ? ORDER BY city";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $state);
        $stmt->execute();
        $result = $stmt->get_result();
    }

    $cities = [];
    while ($row = $result->fetch_assoc()) {
        $cities[] = $row['name'] ?? $row['city'];
    }

    echo json_encode($cities);
} else {
    echo json_encode([]);
}

$conn->close();
?>
