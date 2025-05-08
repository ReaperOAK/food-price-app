<?php
// Egg Rate Data Maintenance - Automatic Archive Script
// This script automatically archives data older than 10 days
// Intended to be run as a cronjob

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

// Verify that $conn exists, otherwise create the connection
if (!isset($conn) || $conn->connect_error) {
    // Connection details
    $servername = "localhost";
    $username = "u901337298_test";
    $password = "A12345678b*";
    $dbname = "u901337298_test";
    
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
    }
}

// Set threshold to 10 days
$threshold = date('Y-m-d', strtotime('-10 days'));

// Begin transaction
$conn->begin_transaction();

try {
    $originalTableAffectedRows = 0;
    $normalizedTableAffectedRows = 0;
    
    // 1. Copy old data to archive table from original table
    $archiveQuery = "INSERT INTO egg_rates_archive (city, state, date, rate)
                    SELECT city, state, date, rate 
                    FROM egg_rates 
                    WHERE date < ?";
                    
    $stmt = $conn->prepare($archiveQuery);
    $stmt->bind_param("s", $threshold);
    $stmt->execute();
    $originalTableAffectedRows = $stmt->affected_rows;
    
    // 2. Copy old data from normalized table to archive
    $archiveNormalizedQuery = "INSERT INTO egg_rates_archive (city, state, date, rate)
                              SELECT c.name, s.name, ern.date, ern.rate
                              FROM egg_rates_normalized ern
                              JOIN cities c ON ern.city_id = c.id
                              JOIN states s ON c.state_id = s.id
                              WHERE ern.date < ?";
                              
    $stmt = $conn->prepare($archiveNormalizedQuery);
    $stmt->bind_param("s", $threshold);
    $stmt->execute();
    $normalizedTableAffectedRows = $stmt->affected_rows;
    
    // Commit transaction
    $conn->commit();
    
    // Log results
    $totalArchived = $originalTableAffectedRows + $normalizedTableAffectedRows;
    $message = date('Y-m-d H:i:s') . " - Archived $totalArchived records older than $threshold\n";
    $message .= "Original table: $originalTableAffectedRows records\n";
    $message .= "Normalized table: $normalizedTableAffectedRows records\n";
    
    // Write to log file
    file_put_contents(
        dirname(dirname(dirname(__FILE__))) . '/error.log', 
        $message, 
        FILE_APPEND
    );
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    // Log the error
    error_log("Data archiving error: " . $e->getMessage(), 0);
}

// Close connection
$conn->close();
?>