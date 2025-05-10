<?php
/**
 * Database: Archive Old Data
 * 
 * Archives egg rate data older than specified days
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../core/DatabaseConnection.php';
require_once __DIR__ . '/../../utils/Logger.php';

class DataArchiver {
    private $db;
    private $logger;
    private $daysToKeep;
    
    /**
     * Constructor
     * 
     * @param int $daysToKeep Number of days of data to keep in active tables
     */
    public function __construct($daysToKeep = null) {
        $this->db = DatabaseConnection::getInstance();
        $this->logger = Logger::getInstance();
        $this->daysToKeep = $daysToKeep ?? (defined('DATA_ARCHIVE_DAYS') ? DATA_ARCHIVE_DAYS : 10);
    }
    
    /**
     * Archive old data
     * 
     * @return array Result statistics
     */
    public function archive() {
        $result = [
            'archived' => 0,
            'originalArchived' => 0,
            'normalizedArchived' => 0
        ];
        
        $this->logger->info("Starting data archiving process. Days to keep: {$this->daysToKeep}", "DataArchiver");
        
        // Begin transaction
        $this->db->beginTransaction();
        
        try {
            // Calculate cutoff date
            $cutoffDate = date('Y-m-d', strtotime("-{$this->daysToKeep} days"));
            
            // Archive from normalized tables first
            $normalizedArchived = $this->archiveNormalizedData($cutoffDate);
            $result['normalizedArchived'] = $normalizedArchived;
            
            // Archive from original egg_rates table
            $originalArchived = $this->archiveOriginalData($cutoffDate);
            $result['originalArchived'] = $originalArchived;
            
            // Total archived
            $result['archived'] = $normalizedArchived + $originalArchived;
            
            // Commit transaction
            $this->db->commitTransaction();
            
            $this->logger->info("Data archiving completed. Total archived: {$result['archived']}", "DataArchiver");
            $result['status'] = 'success';
        } catch (Exception $e) {
            // Rollback on error
            $this->db->rollbackTransaction();
            $this->logger->error("Error archiving data: " . $e->getMessage(), "DataArchiver");
            
            $result['status'] = 'error';
            $result['message'] = $e->getMessage();
        }
        
        return $result;
    }
    
    /**
     * Archive data from normalized tables
     * 
     * @param string $cutoffDate Date before which to archive data
     * @return int Number of records archived
     */
    private function archiveNormalizedData($cutoffDate) {
        // Check if archive table exists, create if not
        $this->createArchiveTableIfNotExists('archived_normalized_rates');
        
        // Move old data to archive table
        $sql = "INSERT INTO archived_normalized_rates 
                SELECT * FROM normalized_rates 
                WHERE date < ?";
        
        $stmt = $this->db->executeQuery($sql, 's', [$cutoffDate]);
        
        if ($stmt === false) {
            throw new Exception("Failed to archive normalized rates");
        }
        
        $archiveCount = $stmt->affected_rows;
        $stmt->close();
        
        // Delete archived data from active table
        if ($archiveCount > 0) {
            $sql = "DELETE FROM normalized_rates WHERE date < ?";
            $stmt = $this->db->executeQuery($sql, 's', [$cutoffDate]);
            
            if ($stmt === false) {
                throw new Exception("Failed to delete archived normalized rates");
            }
            
            $stmt->close();
        }
        
        return $archiveCount;
    }
    
    /**
     * Archive data from original egg_rates table
     * 
     * @param string $cutoffDate Date before which to archive data
     * @return int Number of records archived
     */
    private function archiveOriginalData($cutoffDate) {
        // Check if archive table exists, create if not
        $this->createArchiveTableIfNotExists('archived_egg_rates');
        
        // Move old data to archive table
        $sql = "INSERT INTO archived_egg_rates 
                SELECT * FROM egg_rates 
                WHERE date < ?";
        
        $stmt = $this->db->executeQuery($sql, 's', [$cutoffDate]);
        
        if ($stmt === false) {
            throw new Exception("Failed to archive egg rates");
        }
        
        $archiveCount = $stmt->affected_rows;
        $stmt->close();
        
        // Delete archived data from active table
        if ($archiveCount > 0) {
            $sql = "DELETE FROM egg_rates WHERE date < ?";
            $stmt = $this->db->executeQuery($sql, 's', [$cutoffDate]);
            
            if ($stmt === false) {
                throw new Exception("Failed to delete archived egg rates");
            }
            
            $stmt->close();
        }
        
        return $archiveCount;
    }
    
    /**
     * Create archive table if it doesn't exist
     * 
     * @param string $tableName Archive table name
     * @return void
     */
    private function createArchiveTableIfNotExists($tableName) {
        // Check if table exists
        $sql = "SHOW TABLES LIKE ?";
        $exists = $this->db->fetchOne($sql, 's', [$tableName]);
        
        if (!$exists) {
            // Table doesn't exist, create it based on source table structure
            $sourceTable = ($tableName === 'archived_normalized_rates') ? 'normalized_rates' : 'egg_rates';
            
            $sql = "CREATE TABLE $tableName LIKE $sourceTable";
            $stmt = $this->db->executeQuery($sql);
            
            if ($stmt === false) {
                throw new Exception("Failed to create archive table: $tableName");
            }
            
            $stmt->close();
            $this->logger->info("Created archive table: $tableName", "DataArchiver");
        }
    }
}

// Execute archiver if this script is called directly
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    header('Content-Type: application/json');
    
    try {
        // Get days to keep from query parameter if provided
        $daysToKeep = isset($_GET['days']) && is_numeric($_GET['days']) ? (int)$_GET['days'] : null;
        
        $archiver = new DataArchiver($daysToKeep);
        $result = $archiver->archive();
        
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
}
