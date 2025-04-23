<?php
// Delete old egg rates data
// This script should be run periodically (e.g., monthly) via a cron job

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

// Set the threshold date (e.g., data older than 10 days will be deleted)
$deleteThreshold = date('Y-m-d', strtotime('-10 days'));

// Begin transaction
$conn->begin_transaction();

try {
    // 1. Delete data from the original table
    $deleteQuery = "DELETE FROM egg_rates WHERE date < ?";
    $stmt = $conn->prepare($deleteQuery);
    $stmt->bind_param("s", $deleteThreshold);
    $stmt->execute();
    
    $deletedRows = $stmt->affected_rows;
    
    // 2. Delete data from the normalized table
    $deleteNormalizedQuery = "DELETE FROM egg_rates_normalized WHERE date < ?";
    $stmt = $conn->prepare($deleteNormalizedQuery);
    $stmt->bind_param("s", $deleteThreshold);
    $stmt->execute();
    
    $normalizedDeletedRows = $stmt->affected_rows;
    
    // Commit transaction
    $conn->commit();
    
    echo "Successfully deleted " . ($deletedRows + $normalizedDeletedRows) . " records older than " . $deleteThreshold;
    echo "<br>Original table: " . $deletedRows . " records";
    echo "<br>Normalized table: " . $normalizedDeletedRows . " records";
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo "Error deleting data: " . $e->getMessage();
    
    // Log the error
    error_log("Delete error: " . $e->getMessage(), 0);
}

// Close connection
$conn->close();
?>
