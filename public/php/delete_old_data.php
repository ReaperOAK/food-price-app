<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db.php';

// Calculate the date 10 days ago
$dateThreshold = date('Y-m-d', strtotime('-10 days'));

// Begin transaction
$conn->begin_transaction();

try {
    // Delete from the original egg_rates table
    $stmt = $conn->prepare("DELETE FROM egg_rates WHERE date < ?");
    $stmt->bind_param("s", $dateThreshold);
    $stmt->execute();
    $originalRowsDeleted = $stmt->affected_rows;
    
    // Delete from the normalized table
    $stmt = $conn->prepare("DELETE FROM egg_rates_normalized WHERE date < ?");
    $stmt->bind_param("s", $dateThreshold);
    $stmt->execute();
    $normalizedRowsDeleted = $stmt->affected_rows;
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => 'Old data deleted successfully', 
        'original_rows_deleted' => $originalRowsDeleted,
        'normalized_rows_deleted' => $normalizedRowsDeleted
    ]);
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode(['error' => 'Error deleting data: ' . $e->getMessage()]);
}

$conn->close();
?>