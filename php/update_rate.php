<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

// Get the input data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (isset($data['id']) && isset($data['city']) && isset($data['state']) && isset($data['date']) && isset($data['rate'])) {
    $id = $data['id'];
    $city = $data['city'];
    $state = $data['state'];
    $date = $data['date'];
    $rate = $data['rate'];

    // Start transaction
    $conn->begin_transaction();
    
    try {
        // 1. Update the rate in the original table
        $stmt = $conn->prepare("UPDATE egg_rates SET city = ?, state = ?, date = ?, rate = ? WHERE id = ?");
        $stmt->bind_param("ssssi", $city, $state, $date, $rate, $id);
        $stmt->execute();

        // 2. Update in the normalized tables
        // Check if this record exists in normalized tables
        // First, find the city_id
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
            
            // Check if there's a record for this city_id and date
            $sqlFindRate = "SELECT id FROM egg_rates_normalized WHERE city_id = ? AND date = ?";
            $stmtFindRate = $conn->prepare($sqlFindRate);
            $stmtFindRate->bind_param("is", $cityId, $date);
            $stmtFindRate->execute();
            $rateResult = $stmtFindRate->get_result();
            
            if ($rateResult->num_rows > 0) {
                // Update existing record in normalized table
                $normalizedId = $rateResult->fetch_assoc()['id'];
                $sqlUpdateNormalized = "UPDATE egg_rates_normalized SET rate = ? WHERE id = ?";
                $stmtUpdateNormalized = $conn->prepare($sqlUpdateNormalized);
                $stmtUpdateNormalized->bind_param("di", $rate, $normalizedId);
                $stmtUpdateNormalized->execute();
            } else {
                // Insert new record in normalized table
                $sqlInsertNormalized = "INSERT INTO egg_rates_normalized (city_id, date, rate) VALUES (?, ?, ?)";
                $stmtInsertNormalized = $conn->prepare($sqlInsertNormalized);
                $stmtInsertNormalized->bind_param("isd", $cityId, $date, $rate);
                $stmtInsertNormalized->execute();
            }
        } else {
            // City not found in the normalized tables, need to create it
            // First, check if the state exists
            $sqlFindState = "SELECT id FROM states WHERE name = ?";
            $stmtFindState = $conn->prepare($sqlFindState);
            $stmtFindState->bind_param("s", $state);
            $stmtFindState->execute();
            $stateResult = $stmtFindState->get_result();
            
            if ($stateResult->num_rows > 0) {
                $stateId = $stateResult->fetch_assoc()['id'];
            } else {
                // Insert new state
                $sqlInsertState = "INSERT INTO states (name) VALUES (?)";
                $stmtInsertState = $conn->prepare($sqlInsertState);
                $stmtInsertState->bind_param("s", $state);
                $stmtInsertState->execute();
                $stateId = $conn->insert_id;
            }
            
            // Insert new city
            $sqlInsertCity = "INSERT INTO cities (name, state_id) VALUES (?, ?)";
            $stmtInsertCity = $conn->prepare($sqlInsertCity);
            $stmtInsertCity->bind_param("si", $city, $stateId);
            $stmtInsertCity->execute();
            $cityId = $conn->insert_id;
            
            // Insert new rate in normalized table
            $sqlInsertNormalized = "INSERT INTO egg_rates_normalized (city_id, date, rate) VALUES (?, ?, ?)";
            $stmtInsertNormalized = $conn->prepare($sqlInsertNormalized);
            $stmtInsertNormalized->bind_param("isd", $cityId, $date, $rate);
            $stmtInsertNormalized->execute();
        }
        
        // Commit transaction
        $conn->commit();
        echo json_encode(['success' => true]);
        
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        error_log("Error updating rate: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
}

$conn->close();
?>