<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

// Get the JSON payload
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data)) {
    echo json_encode(["error" => "No data provided"]);
    exit();
}

// Begin transaction to ensure all updates succeed or fail together
$conn->begin_transaction();

try {
    $errors = [];
    $successCount = 0;
    
    foreach ($data as $rate) {
        if (!isset($rate['state']) || !isset($rate['date']) || !isset($rate['rate']) || !isset($rate['city'])) {
            $errors[] = "Missing data for one or more fields";
            continue;
        }

        $state = $rate['state'];
        $date = $rate['date'];
        $rateValue = $rate['rate'];
        $city = $rate['city'];

        // Log the incoming data
        error_log("Processing rate for city: $city, state: $state, date: $date, rate: $rateValue");
        
        if (updateEggRate($conn, $city, $state, $date, $rateValue)) {
            $successCount++;
        } else {
            $errors[] = "Error updating rate for $city, $state on $date";
        }
    }

    // Commit transaction if no errors
    if (empty($errors)) {
        $conn->commit();
        echo json_encode([
            "success" => "Rates updated successfully in both original and normalized tables",
            "count" => $successCount
        ]);
    } else {
        $conn->rollback();
        echo json_encode(["errors" => $errors]);
    }
    
} catch (Exception $e) {
    // Rollback on any error
    $conn->rollback();
    echo json_encode(["error" => "Transaction failed: " . $e->getMessage()]);
    error_log("Transaction error: " . $e->getMessage());
}

$conn->close();
?>