<?php
// Archive old egg rates data
// This script should be run periodically (e.g., monthly) via a cron job

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

// Set the threshold date (e.g., data older than 7 days will be archived)
$archiveThreshold = date('Y-m-d', strtotime('-7 days'));

// Begin transaction
$conn->begin_transaction();

try {
    // 1. Copy old data to archive table
    $archiveQuery = "INSERT INTO egg_rates_archive (city, state, date, rate)
                    SELECT city, state, date, rate 
                    FROM egg_rates 
                    WHERE date < ?";
                    
    $stmt = $conn->prepare($archiveQuery);
    $stmt->bind_param("s", $archiveThreshold);
    $stmt->execute();
    
    $archivedRows = $stmt->affected_rows;
    
    // 2. Delete the archived data from the main table
    $deleteQuery = "DELETE FROM egg_rates WHERE date < ?";
    $stmt = $conn->prepare($deleteQuery);
    $stmt->bind_param("s", $archiveThreshold);
    $stmt->execute();
    
    // 3. Archive data from the normalized table
    $archiveNormalizedQuery = "INSERT INTO egg_rates_archive (city, state, date, rate)
                              SELECT c.name, s.name, ern.date, ern.rate
                              FROM egg_rates_normalized ern
                              JOIN cities c ON ern.city_id = c.id
                              JOIN states s ON c.state_id = s.id
                              WHERE ern.date < ?";
                              
    $stmt = $conn->prepare($archiveNormalizedQuery);
    $stmt->bind_param("s", $archiveThreshold);
    $stmt->execute();
    
    $normalizedArchivedRows = $stmt->affected_rows;
    
    // 4. Delete archived normalized data
    $deleteNormalizedQuery = "DELETE FROM egg_rates_normalized WHERE date < ?";
    $stmt = $conn->prepare($deleteNormalizedQuery);
    $stmt->bind_param("s", $archiveThreshold);
    $stmt->execute();
    
    // Commit transaction
    $conn->commit();
    
    echo "Successfully archived " . ($archivedRows + $normalizedArchivedRows) . " records older than " . $archiveThreshold;
    echo "<br>Original table: " . $archivedRows . " records";
    echo "<br>Normalized table: " . $normalizedArchivedRows . " records";
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo "Error archiving data: " . $e->getMessage();
    
    // Log the error
    error_log("Archive error: " . $e->getMessage(), 0);
}

// Close connection
$conn->close();
?>