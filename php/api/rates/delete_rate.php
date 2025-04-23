<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');

include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['id'])) {
    $id = $conn->real_escape_string($data['id']);
    
    // Begin transaction
    $conn->begin_transaction();
    
    try {
        // First, get the city, state, and date information for the rate
        $stmt = $conn->prepare("SELECT city, state, date FROM egg_rates WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $city = $row['city'];
            $state = $row['state'];
            $date = $row['date'];
            
            // Delete from original table
            $stmt = $conn->prepare("DELETE FROM egg_rates WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            
            // Now delete from normalized tables
            // First get the city_id
            $stmt = $conn->prepare("
                SELECT ern.id 
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE c.name = ? AND s.name = ? AND ern.date = ?
            ");
            $stmt->bind_param("sss", $city, $state, $date);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $normalizedId = $row['id'];
                
                // Delete from normalized table
                $stmt = $conn->prepare("DELETE FROM egg_rates_normalized WHERE id = ?");
                $stmt->bind_param("i", $normalizedId);
                $stmt->execute();
            }
            
            $conn->commit();
            echo json_encode(["success" => true, "message" => "Rate deleted successfully from both original and normalized tables"]);
        } else {
            throw new Exception("Rate not found");
        }
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["success" => false, "error" => "Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Invalid input - missing ID"]);
}

$conn->close();
?>