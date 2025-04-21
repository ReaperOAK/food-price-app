<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');

require_once 'db.php'; // Include the database connection

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['id'])) {
    $id = $conn->real_escape_string($data['id']);
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // First, get the city, state, and date from the original table
        $getInfoSql = "SELECT city, state, date FROM egg_rates WHERE id='$id'";
        $result = $conn->query($getInfoSql);
        
        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $city = $row['city'];
            $state = $row['state'];
            $date = $row['date'];
            
            // Delete from the original table
            $deleteSql = "DELETE FROM egg_rates WHERE id='$id'";
            if (!$conn->query($deleteSql)) {
                throw new Exception("Error deleting from original table: " . $conn->error);
            }
            
            // Try to also delete from the normalized table
            try {
                // Find the city_id
                $sqlFindCity = "SELECT c.id 
                                FROM cities c 
                                JOIN states s ON c.state_id = s.id 
                                WHERE c.name = ? AND s.name = ?";
                $stmtFindCity = $conn->prepare($sqlFindCity);
                $stmtFindCity->bind_param("ss", $city, $state);
                $stmtFindCity->execute();
                $cityResult = $stmtFindCity->get_result();
                
                if ($cityResult->num_rows > 0) {
                    $cityId = $cityResult->fetch_assoc()['id'];
                    
                    // Delete from normalized table
                    $sqlDeleteNormalized = "DELETE FROM egg_rates_normalized 
                                          WHERE city_id = ? AND date = ?";
                    $stmtDeleteNormalized = $conn->prepare($sqlDeleteNormalized);
                    $stmtDeleteNormalized->bind_param("is", $cityId, $date);
                    $stmtDeleteNormalized->execute();
                }
            } catch (Exception $e) {
                // Just log the error but continue with the transaction
                error_log("Error deleting from normalized table: " . $e->getMessage());
            }
            
            // Commit transaction
            $conn->commit();
            echo json_encode(["message" => "Rate deleted successfully"]);
            
        } else {
            throw new Exception("Record not found");
        }
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Invalid input"]);
}

$conn->close();
?>