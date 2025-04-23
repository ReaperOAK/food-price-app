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

    // Begin transaction
    $conn->begin_transaction();
    
    try {
        // Update the rate in the original database
        $stmt = $conn->prepare("UPDATE egg_rates SET city = ?, state = ?, date = ?, rate = ? WHERE id = ?");
        $stmt->bind_param("sssdi", $city, $state, $date, $rate, $id);
        $stmt->execute();
        
        // Also update in normalized structure
        if (updateEggRate($conn, $city, $state, $date, $rate)) {
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Rate updated in both original and normalized tables']);
        } else {
            throw new Exception("Failed to update normalized tables");
        }
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid input - missing required fields']);
}

$conn->close();
?>