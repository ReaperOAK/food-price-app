<?php
// Upgrade database structure from original to normalized
// This script should be run once to migrate existing data to the new structure

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

// Begin transaction
$conn->begin_transaction();

try {
    // Check if normalized tables already exist
    $tablesExistQuery = "
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
        AND table_name IN ('states', 'cities', 'egg_rates_normalized')
    ";
    $result = $conn->query($tablesExistQuery);
    $row = $result->fetch_assoc();
    
    if ($row['count'] == 3) {
        echo "Normalized tables already exist. Checking data consistency...<br>";
        
        // Check data consistency
        $dataConsistencyQuery = "
            SELECT 
                (SELECT COUNT(*) FROM egg_rates) as original_count,
                (SELECT COUNT(*) FROM egg_rates_normalized) as normalized_count
        ";
        
        $result = $conn->query($dataConsistencyQuery);
        $row = $result->fetch_assoc();
        
        if ($row['normalized_count'] >= $row['original_count']) {
            echo "Data consistency check passed. No migration needed.<br>";
            echo "Original table count: " . $row['original_count'] . "<br>";
            echo "Normalized table count: " . $row['normalized_count'] . "<br>";
            $conn->commit();
            exit;
        } else {
            echo "Data inconsistency detected. Proceeding with data migration...<br>";
            echo "Original table count: " . $row['original_count'] . "<br>";
            echo "Normalized table count: " . $row['normalized_count'] . "<br>";
        }
    } else {
        // Create the normalized tables if they don't exist
        echo "Creating normalized tables structure...<br>";
        
        // Create states table
        $createStatesTable = "
            CREATE TABLE IF NOT EXISTS states (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        ";
        $conn->query($createStatesTable);
        
        // Create cities table
        $createCitiesTable = "
            CREATE TABLE IF NOT EXISTS cities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                state_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY city_state (name, state_id),
                FOREIGN KEY (state_id) REFERENCES states(id)
            ) ENGINE=InnoDB
        ";
        $conn->query($createCitiesTable);
        
        // Create egg_rates_normalized table
        $createRatesTable = "
            CREATE TABLE IF NOT EXISTS egg_rates_normalized (
                id INT AUTO_INCREMENT PRIMARY KEY,
                city_id INT NOT NULL,
                date DATE NOT NULL,
                rate DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY city_date (city_id, date),
                FOREIGN KEY (city_id) REFERENCES cities(id)
            ) ENGINE=InnoDB
        ";
        $conn->query($createRatesTable);
        
        echo "Normalized tables created successfully.<br>";
    }
    
    // Migrate existing data
    echo "Migrating data from original structure to normalized structure...<br>";
    
    // First, get all distinct states from the original table
    $distinctStatesQuery = "SELECT DISTINCT state FROM egg_rates";
    $statesResult = $conn->query($distinctStatesQuery);
    
    $statesInserted = 0;
    $citiesInserted = 0;
    $ratesInserted = 0;
    
    while ($stateRow = $statesResult->fetch_assoc()) {
        $stateName = $stateRow['state'];
        
        // Insert state if it doesn't exist
        $stateId = getStateId($conn, $stateName);
        $statesInserted++;
        
        // Get all cities for this state
        $citiesQuery = "SELECT DISTINCT city FROM egg_rates WHERE state = ?";
        $stmt = $conn->prepare($citiesQuery);
        $stmt->bind_param("s", $stateName);
        $stmt->execute();
        $citiesResult = $stmt->get_result();
        
        while ($cityRow = $citiesResult->fetch_assoc()) {
            $cityName = $cityRow['city'];
            
            // Insert city if it doesn't exist
            $cityId = getCityId($conn, $cityName, $stateId);
            $citiesInserted++;
            
            // Get all rates for this city and state
            $ratesQuery = "SELECT date, rate FROM egg_rates WHERE city = ? AND state = ?";
            $stmt = $conn->prepare($ratesQuery);
            $stmt->bind_param("ss", $cityName, $stateName);
            $stmt->execute();
            $ratesResult = $stmt->get_result();
            
            while ($rateRow = $ratesResult->fetch_assoc()) {
                $date = $rateRow['date'];
                $rate = $rateRow['rate'];
                
                // Insert rate if it doesn't exist
                $stmt = $conn->prepare("
                    INSERT IGNORE INTO egg_rates_normalized (city_id, date, rate)
                    VALUES (?, ?, ?)
                ");
                $stmt->bind_param("isd", $cityId, $date, $rate);
                $stmt->execute();
                
                if ($stmt->affected_rows > 0) {
                    $ratesInserted++;
                }
            }
        }
    }
    
    // Add indexes for better performance
    echo "Adding indexes for performance...<br>";
    
    $addIndexes = [
        "ALTER TABLE egg_rates_normalized ADD INDEX idx_date (date)",
        "ALTER TABLE egg_rates_normalized ADD INDEX idx_city_id (city_id)",
        "ALTER TABLE cities ADD INDEX idx_state_id (state_id)"
    ];
    
    foreach ($addIndexes as $indexQuery) {
        try {
            $conn->query($indexQuery);
        } catch (Exception $e) {
            // Index might already exist, just continue
            echo "Note: " . $e->getMessage() . "<br>";
        }
    }
    
    // Commit transaction
    $conn->commit();
    
    echo "Database upgrade completed successfully!<br>";
    echo "States inserted: $statesInserted<br>";
    echo "Cities inserted: $citiesInserted<br>";
    echo "Rates inserted: $ratesInserted<br>";
    
    // Verify data consistency
    $dataConsistencyQuery = "
        SELECT 
            (SELECT COUNT(*) FROM egg_rates) as original_count,
            (SELECT COUNT(*) FROM egg_rates_normalized) as normalized_count
    ";
    
    $result = $conn->query($dataConsistencyQuery);
    $row = $result->fetch_assoc();
    
    echo "Final data counts:<br>";
    echo "Original table: " . $row['original_count'] . " records<br>";
    echo "Normalized table: " . $row['normalized_count'] . " records<br>";
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo "Error upgrading database: " . $e->getMessage() . "<br>";
    
    // Log the error
    error_log("Database upgrade error: " . $e->getMessage(), 0);
}

// Close connection
$conn->close();
?>
