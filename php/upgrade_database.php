<?php
// Database Upgrade Script
// This script will upgrade the database to the new normalized structure
// Run this from the command line with: php upgrade_database.php

// Display header
echo "========================================================\n";
echo "Egg Price App - Database Upgrade Script\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n";
echo "========================================================\n\n";

// Include database connection
require_once 'db.php';

// 1. Check if we can connect to the database
echo "Step 1: Checking database connection...\n";
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connection successful.\n\n";

// Function to safely run SQL from a file
function runSQLScript($conn, $sql) {
    $queries = explode(';', $sql);
    $success = true;
    
    foreach ($queries as $query) {
        $query = trim($query);
        if (empty($query)) continue;
        
        if (!$conn->query($query)) {
            echo "Error executing query: " . $conn->error . "\n";
            echo "Query: " . $query . "\n\n";
            $success = false;
        }
    }
    
    return $success;
}

// 2. Read the SQL from the enhancement file
echo "Step 2: Reading SQL script file...\n";
$sqlScriptPath = __DIR__ . '/db_enhancements.sql';

if (!file_exists($sqlScriptPath)) {
    die("Error: SQL script file not found at: $sqlScriptPath\n");
}

$sqlScript = file_get_contents($sqlScriptPath);
echo "SQL script loaded successfully.\n\n";

// 3. Create tables and indexes
echo "Step 3: Creating new tables and indexes...\n";
try {
    // Extract CREATE TABLE statements
    preg_match_all('/CREATE TABLE IF NOT EXISTS (.*?);/s', $sqlScript, $createTableMatches);
    
    foreach ($createTableMatches[0] as $createTableQuery) {
        if ($conn->query($createTableQuery)) {
            // Extract table name from query
            preg_match('/CREATE TABLE IF NOT EXISTS (\w+)/', $createTableQuery, $matches);
            $tableName = $matches[1] ?? 'unknown';
            echo "Created table: $tableName\n";
        } else {
            echo "Error creating table: " . $conn->error . "\n";
            echo "Query: " . $createTableQuery . "\n\n";
        }
    }
    
    // Extract CREATE INDEX statements
    preg_match_all('/CREATE INDEX (.*?);/s', $sqlScript, $createIndexMatches);
    
    foreach ($createIndexMatches[0] as $createIndexQuery) {
        if ($conn->query($createIndexQuery)) {
            // Extract index name from query
            preg_match('/CREATE INDEX (\w+)/', $createIndexQuery, $matches);
            $indexName = $matches[1] ?? 'unknown';
            echo "Created index: $indexName\n";
        } else {
            echo "Error creating index: " . $conn->error . "\n";
            echo "Query: " . $createIndexQuery . "\n\n";
        }
    }
    
    echo "Tables and indexes created successfully.\n\n";
} catch (Exception $e) {
    echo "Error creating tables and indexes: " . $e->getMessage() . "\n\n";
}

// 4. Import data from existing tables
echo "Step 4: Migrating data to the new structure...\n";

try {
    // Begin transaction for data migration
    $conn->begin_transaction();
    
    // Extract INSERT statements
    preg_match_all('/INSERT IGNORE INTO (.*?);/s', $sqlScript, $insertMatches);
    
    foreach ($insertMatches[0] as $insertQuery) {
        if ($conn->query($insertQuery)) {
            // Extract table name from query
            preg_match('/INSERT IGNORE INTO (\w+)/', $insertQuery, $matches);
            $tableName = $matches[1] ?? 'unknown';
            echo "Inserted data into: $tableName\n";
        } else {
            echo "Error inserting data: " . $conn->error . "\n";
            echo "Query: " . $insertQuery . "\n\n";
            throw new Exception("Error inserting data");
        }
    }
    
    // Commit transaction
    $conn->commit();
    echo "Data migration completed successfully.\n\n";
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    echo "Error during data migration: " . $e->getMessage() . "\n";
    echo "Changes have been rolled back.\n\n";
}

// 5. Verify data in the new tables
echo "Step 5: Verifying data in the new tables...\n";

try {
    // Check states table
    $statesResult = $conn->query("SELECT COUNT(*) as count FROM states");
    $statesCount = $statesResult->fetch_assoc()['count'];
    echo "States table contains $statesCount records.\n";
    
    // Check cities table
    $citiesResult = $conn->query("SELECT COUNT(*) as count FROM cities");
    $citiesCount = $citiesResult->fetch_assoc()['count'];
    echo "Cities table contains $citiesCount records.\n";
    
    // Check egg_rates_normalized table
    $ratesResult = $conn->query("SELECT COUNT(*) as count FROM egg_rates_normalized");
    $ratesCount = $ratesResult->fetch_assoc()['count'];
    echo "Egg rates normalized table contains $ratesCount records.\n\n";
    
    // Compare with original table
    $originalRatesResult = $conn->query("SELECT COUNT(*) as count FROM egg_rates");
    $originalRatesCount = $originalRatesResult->fetch_assoc()['count'];
    echo "Original egg rates table contains $originalRatesCount records.\n";
    
    if ($ratesCount < $originalRatesCount) {
        echo "Warning: The normalized table has fewer records than the original table.\n";
        echo "This might be due to duplicates in the original table that were deduplicated.\n\n";
    }
} catch (Exception $e) {
    echo "Error verifying data: " . $e->getMessage() . "\n\n";
}

// 6. Create archival script
echo "Step 6: Checking archival script...\n";
$archiveScriptPath = __DIR__ . '/archive_old_data.php';

if (file_exists($archiveScriptPath)) {
    echo "Archive script found at: $archiveScriptPath\n";
    echo "You can run this script periodically to archive old data.\n\n";
} else {
    echo "Warning: Archive script not found at: $archiveScriptPath\n";
    echo "Please ensure the archive_old_data.php script is properly installed.\n\n";
}

// 7. Final step
echo "Database upgrade complete!\n";
echo "The application now has a normalized database structure with proper indexing.\n";
echo "The application will continue to use both the original and new tables during the transition.\n\n";

echo "Next steps:\n";
echo "1. Monitor the application for any issues\n";
echo "2. Schedule regular runs of archive_old_data.php to maintain performance\n";
echo "3. Once confirmed stable, you can optionally remove the old tables\n\n";

echo "========================================================\n";
echo "Upgrade completed at: " . date('Y-m-d H:i:s') . "\n";
echo "========================================================\n";

// Close the connection
$conn->close();
?>