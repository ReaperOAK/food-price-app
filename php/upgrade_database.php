<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error_upgrade.log');

echo "=== Database Upgrade Script ===\n";
echo "Starting database upgrade process...\n";

// Load database connection
require_once 'db.php';

// Initialize upgrade log
$logFile = __DIR__ . '/upgrade_log.txt';
$logHandler = fopen($logFile, 'a');
fwrite($logHandler, "\n=== Database Upgrade Script - " . date('Y-m-d H:i:s') . " ===\n");

/**
 * Helper function to log messages
 */
function logMessage($message) {
    global $logHandler;
    echo $message . "\n";
    fwrite($logHandler, $message . "\n");
}

/**
 * Execute a SQL query with error handling
 */
function executeSql($conn, $sql, $description) {
    logMessage("\nExecuting: $description");
    
    try {
        if ($conn->query($sql) === TRUE) {
            logMessage("Success: $description");
            return true;
        } else {
            logMessage("ERROR: $description - " . $conn->error);
            return false;
        }
    } catch (Exception $e) {
        logMessage("EXCEPTION: $description - " . $e->getMessage());
        return false;
    }
}

/**
 * Check if a table exists
 */
function tableExists($conn, $tableName) {
    $result = $conn->query("SHOW TABLES LIKE '$tableName'");
    return $result->num_rows > 0;
}

// Start upgrade process
logMessage("Starting database upgrade process...");

// Begin transaction for database modifications
$conn->begin_transaction();

try {
    // 1. Create normalized tables structure if they don't exist
    
    // Create states table
    if (!tableExists($conn, 'states')) {
        $createStatesTable = "
            CREATE TABLE IF NOT EXISTS states (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ";
        executeSql($conn, $createStatesTable, "Creating states table");
    } else {
        logMessage("States table already exists");
    }
    
    // Create cities table with foreign key to states
    if (!tableExists($conn, 'cities')) {
        $createCitiesTable = "
            CREATE TABLE IF NOT EXISTS cities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                state_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
                UNIQUE KEY unique_city_state (name, state_id)
            )
        ";
        executeSql($conn, $createCitiesTable, "Creating cities table");
    } else {
        logMessage("Cities table already exists");
    }
    
    // Create new normalized egg_rates_normalized table
    if (!tableExists($conn, 'egg_rates_normalized')) {
        $createRatesTable = "
            CREATE TABLE IF NOT EXISTS egg_rates_normalized (
                id INT AUTO_INCREMENT PRIMARY KEY,
                city_id INT NOT NULL,
                date DATE NOT NULL,
                rate DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
                UNIQUE KEY unique_city_date (city_id, date)
            )
        ";
        executeSql($conn, $createRatesTable, "Creating egg_rates_normalized table");
    } else {
        logMessage("Egg rates normalized table already exists");
    }
    
    // 2. Add indexes to improve query performance for original table
    executeSql($conn, "CREATE INDEX IF NOT EXISTS idx_egg_rates_date ON egg_rates (date)", 
               "Adding date index to egg_rates");
    executeSql($conn, "CREATE INDEX IF NOT EXISTS idx_egg_rates_state ON egg_rates (state)", 
               "Adding state index to egg_rates");
    executeSql($conn, "CREATE INDEX IF NOT EXISTS idx_egg_rates_city ON egg_rates (city)", 
               "Adding city index to egg_rates");
    executeSql($conn, "CREATE INDEX IF NOT EXISTS idx_egg_rates_normalized_date ON egg_rates_normalized (date)", 
               "Adding date index to egg_rates_normalized");
    
    // 3. Create archival table for historical data
    if (!tableExists($conn, 'egg_rates_archive')) {
        $createArchiveTable = "
            CREATE TABLE IF NOT EXISTS egg_rates_archive (
                id INT AUTO_INCREMENT PRIMARY KEY,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                date DATE NOT NULL,
                rate DECIMAL(10,2) NOT NULL,
                archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ";
        executeSql($conn, $createArchiveTable, "Creating egg_rates_archive table");
    } else {
        logMessage("Egg rates archive table already exists");
    }
    
    // 4. Check if we need to migrate data (if normalized tables are empty)
    $checkStatesCount = $conn->query("SELECT COUNT(*) as count FROM states");
    $statesCount = $checkStatesCount->fetch_assoc()['count'];
    
    // Only populate if tables are empty
    if ($statesCount == 0) {
        logMessage("Normalized tables are empty, beginning data migration");
        
        // Insert states from existing data
        executeSql($conn, "INSERT IGNORE INTO states (name) SELECT DISTINCT state FROM egg_rates", 
                  "Migrating states data");
        
        // Insert cities from existing data
        executeSql($conn, "INSERT IGNORE INTO cities (name, state_id)
                          SELECT DISTINCT e.city, s.id 
                          FROM egg_rates e
                          JOIN states s ON e.state = s.name", 
                  "Migrating cities data");
        
        // Insert rates into the normalized table
        executeSql($conn, "INSERT IGNORE INTO egg_rates_normalized (city_id, date, rate)
                          SELECT c.id, e.date, e.rate
                          FROM egg_rates e
                          JOIN cities c ON e.city = c.name
                          JOIN states s ON e.state = s.name AND c.state_id = s.id", 
                  "Migrating rates data");
    } else {
        logMessage("Normalized tables already contain data, skipping initial migration");
    }
    
    // 5. Create indexes for archive table
    executeSql($conn, "CREATE INDEX IF NOT EXISTS idx_egg_rates_archive_date ON egg_rates_archive (date)", 
               "Adding date index to egg_rates_archive");
    executeSql($conn, "CREATE INDEX IF NOT EXISTS idx_egg_rates_archive_state ON egg_rates_archive (state)", 
               "Adding state index to egg_rates_archive");
    executeSql($conn, "CREATE INDEX IF NOT EXISTS idx_egg_rates_archive_city ON egg_rates_archive (city)", 
               "Adding city index to egg_rates_archive");
    
    // Commit all changes
    $conn->commit();
    logMessage("Database upgrade completed successfully!");
    logMessage("Normalized database structure is now ready to use.");
    
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    logMessage("DATABASE UPGRADE FAILED: " . $e->getMessage());
    logMessage("All changes have been rolled back to ensure database integrity.");
}

// Close log file and connection
fclose($logHandler);
$conn->close();
echo "\nDatabase upgrade process completed. See upgrade_log.txt for details.\n";
?>