<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Include database connection
require_once 'db.php';

// Calculate the date 10 days ago
$dateThreshold = date('Y-m-d', strtotime('-10 days'));

// Begin transaction to ensure consistency
$conn->begin_transaction();

try {
    // First archive the data before deleting
    // Copy old records to the archive table
    $archiveSql = "
        INSERT INTO egg_rates_archive (city, state, date, rate)
        SELECT city, state, date, rate 
        FROM egg_rates 
        WHERE date < '$dateThreshold'
    ";
    
    if ($conn->query($archiveSql) === FALSE) {
        throw new Exception("Error archiving data: " . $conn->error);
    }
    
    // Get the count of archived records
    $archivedCount = $conn->affected_rows;
    
    // If using normalized tables, also archive data from egg_rates_normalized
    try {
        $archiveNormalizedSql = "
            INSERT INTO egg_rates_archive (city, state, date, rate)
            SELECT c.name as city, s.name as state, r.date, r.rate
            FROM egg_rates_normalized r
            JOIN cities c ON r.city_id = c.id
            JOIN states s ON c.state_id = s.id
            WHERE r.date < '$dateThreshold'
            AND NOT EXISTS (
                SELECT 1 FROM egg_rates_archive a
                WHERE a.city = c.name AND a.date = r.date
            )
        ";
        
        $conn->query($archiveNormalizedSql);
        $archivedNormalizedCount = $conn->affected_rows;
    } catch (Exception $e) {
        // Ignore errors with normalized tables, as they might not exist yet
        $archivedNormalizedCount = 0;
    }
    
    // Delete data from original table
    $deleteSql = "DELETE FROM egg_rates WHERE date < '$dateThreshold'";
    
    if ($conn->query($deleteSql) === FALSE) {
        throw new Exception("Error deleting data: " . $conn->error);
    }
    
    $deletedCount = $conn->affected_rows;
    
    // Delete data from normalized table if it exists
    try {
        $deleteNormalizedSql = "DELETE FROM egg_rates_normalized WHERE date < '$dateThreshold'";
        $conn->query($deleteNormalizedSql);
        $deletedNormalizedCount = $conn->affected_rows;
    } catch (Exception $e) {
        // Ignore errors with normalized tables, as they might not exist yet
        $deletedNormalizedCount = 0;
    }
    
    // Commit the transaction
    $conn->commit();
    
    echo json_encode([
        'success' => 'Data processed successfully',
        'archived' => [
            'original' => $archivedCount,
            'normalized' => $archivedNormalizedCount
        ],
        'deleted' => [
            'original' => $deletedCount,
            'normalized' => $deletedNormalizedCount
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback the transaction in case of error
    $conn->rollback();
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>