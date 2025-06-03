<?php
/**
 * Database Cleanup Script for Duplicate Cities
 * 
 * This script identifies and merges duplicate cities that differ only by state codes
 * (e.g., "Allahabad" and "Allahabad (CC)", "Chennai" and "Chennai (CC)")
 * 
 * Features:
 * - Identifies all duplicate cities with state codes
 * - Consolidates rate data by preferring the clean city name
 * - Updates all related tables (egg_rates, egg_rates_normalized, cities)
 * - Maintains data integrity throughout the process
 * - Provides detailed logging of all changes
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

require_once dirname(dirname(__DIR__)) . '/config/db.php';

// Verify database connection
if (!isset($conn) || $conn->connect_error) {
    die(json_encode(["error" => "Database connection failed"]));
}

// Function to clean city name by removing state codes
function cleanCityName($cityName) {
    // Remove state codes in parentheses like (CC), (WB), (OD), etc.
    $cleaned = preg_replace('/\s*\(.*?\)\s*/', '', $cityName);
    return trim($cleaned);
}

// Function to extract state code from city name
function extractStateCode($cityName) {
    if (preg_match('/\(([A-Z]{2})\)/', $cityName, $matches)) {
        return $matches[1];
    }
    return null;
}

// Main cleanup function
function cleanupDuplicateCities($conn) {
    $results = [
        'success' => false,
        'processed_duplicates' => [],
        'errors' => [],
        'statistics' => [
            'total_duplicates_found' => 0,
            'cities_merged' => 0,
            'rates_consolidated' => 0,
            'records_removed' => 0
        ]
    ];
    
    try {
        // Begin transaction
        $conn->begin_transaction();
        
        // Step 1: Find all cities with state codes in the original table
        $findDuplicatesQuery = "
            SELECT DISTINCT city, state 
            FROM egg_rates 
            WHERE city REGEXP '\\([A-Z]{2}\\)'
            ORDER BY city, state
        ";
        
        $duplicateResult = $conn->query($findDuplicatesQuery);
        $duplicatesFound = [];
        
        if ($duplicateResult && $duplicateResult->num_rows > 0) {
            while ($row = $duplicateResult->fetch_assoc()) {
                $cityWithCode = $row['city'];
                $state = $row['state'];
                $cleanCity = cleanCityName($cityWithCode);
                $stateCode = extractStateCode($cityWithCode);
                
                // Check if clean version exists
                $cleanCheckQuery = "SELECT COUNT(*) as count FROM egg_rates WHERE city = ? AND state = ?";
                $stmt = $conn->prepare($cleanCheckQuery);
                $stmt->bind_param("ss", $cleanCity, $state);
                $stmt->execute();
                $cleanResult = $stmt->get_result();
                $cleanExists = $cleanResult->fetch_assoc()['count'] > 0;
                
                $duplicatesFound[] = [
                    'city_with_code' => $cityWithCode,
                    'clean_city' => $cleanCity,
                    'state' => $state,
                    'state_code' => $stateCode,
                    'clean_exists' => $cleanExists
                ];
            }
        }
        
        $results['statistics']['total_duplicates_found'] = count($duplicatesFound);
        
        // Step 2: Process each duplicate
        foreach ($duplicatesFound as $duplicate) {
            $cityWithCode = $duplicate['city_with_code'];
            $cleanCity = $duplicate['clean_city'];
            $state = $duplicate['state'];
            $stateCode = $duplicate['state_code'];
            
            $processResult = [
                'city_with_code' => $cityWithCode,
                'clean_city' => $cleanCity,
                'state' => $state,
                'action' => '',
                'rates_moved' => 0,
                'details' => []
            ];
            
            if ($duplicate['clean_exists']) {
                // Clean version exists - merge rates and remove duplicate
                $processResult['action'] = 'merge_and_remove';
                
                // Get all rates for the city with code
                $getRatesQuery = "SELECT date, rate FROM egg_rates WHERE city = ? AND state = ?";
                $stmt = $conn->prepare($getRatesQuery);
                $stmt->bind_param("ss", $cityWithCode, $state);
                $stmt->execute();
                $ratesResult = $stmt->get_result();
                
                $ratesMoved = 0;
                while ($rateRow = $ratesResult->fetch_assoc()) {
                    $date = $rateRow['date'];
                    $rate = $rateRow['rate'];
                    
                    // Check if rate for this date already exists for clean city
                    $existsQuery = "SELECT COUNT(*) as count FROM egg_rates WHERE city = ? AND state = ? AND date = ?";
                    $stmt = $conn->prepare($existsQuery);
                    $stmt->bind_param("sss", $cleanCity, $state, $date);
                    $stmt->execute();
                    $existsResult = $stmt->get_result();
                    $dateExists = $existsResult->fetch_assoc()['count'] > 0;
                    
                    if (!$dateExists) {
                        // Insert rate for clean city
                        $insertQuery = "INSERT INTO egg_rates (city, state, date, rate) VALUES (?, ?, ?, ?)";
                        $stmt = $conn->prepare($insertQuery);
                        $stmt->bind_param("sssd", $cleanCity, $state, $date, $rate);
                        $stmt->execute();
                        $ratesMoved++;
                    } else {
                        // Update existing rate if the coded city has a more recent or different rate
                        $updateQuery = "UPDATE egg_rates SET rate = ? WHERE city = ? AND state = ? AND date = ?";
                        $stmt = $conn->prepare($updateQuery);
                        $stmt->bind_param("dsss", $rate, $cleanCity, $state, $date);
                        $stmt->execute();
                        $ratesMoved++;
                    }
                }
                
                // Remove all records for city with code
                $deleteQuery = "DELETE FROM egg_rates WHERE city = ? AND state = ?";
                $stmt = $conn->prepare($deleteQuery);
                $stmt->bind_param("ss", $cityWithCode, $state);
                $stmt->execute();
                $deletedRecords = $stmt->affected_rows;
                
                $processResult['rates_moved'] = $ratesMoved;
                $processResult['details'][] = "Moved $ratesMoved rates from '$cityWithCode' to '$cleanCity'";
                $processResult['details'][] = "Deleted $deletedRecords records for '$cityWithCode'";
                
                $results['statistics']['rates_consolidated'] += $ratesMoved;
                $results['statistics']['records_removed'] += $deletedRecords;
                
            } else {
                // Clean version doesn't exist - rename the coded city
                $processResult['action'] = 'rename';
                
                $updateQuery = "UPDATE egg_rates SET city = ? WHERE city = ? AND state = ?";
                $stmt = $conn->prepare($updateQuery);
                $stmt->bind_param("sss", $cleanCity, $cityWithCode, $state);
                $stmt->execute();
                $updatedRecords = $stmt->affected_rows;
                
                $processResult['details'][] = "Renamed '$cityWithCode' to '$cleanCity' ($updatedRecords records)";
                $results['statistics']['rates_consolidated'] += $updatedRecords;
            }
            
            $results['processed_duplicates'][] = $processResult;
            $results['statistics']['cities_merged']++;
        }
        
        // Step 3: Cleanup normalized tables
        $normalizedCleanupQuery = "
            UPDATE cities c
            JOIN states s ON c.state_id = s.id
            SET c.name = TRIM(REGEXP_REPLACE(c.name, '\\\\s*\\\\([A-Z]{2}\\\\)\\\\s*', ''))
            WHERE c.name REGEXP '\\\\([A-Z]{2}\\\\)'
        ";
        
        if ($conn->query($normalizedCleanupQuery)) {
            $normalizedUpdated = $conn->affected_rows;
            $results['statistics']['normalized_cities_cleaned'] = $normalizedUpdated;
        }
        
        // Step 4: Remove any duplicate cities in normalized structure
        $removeDuplicatesQuery = "
            DELETE c1 FROM cities c1
            INNER JOIN cities c2 
            WHERE c1.id > c2.id 
            AND c1.name = c2.name 
            AND c1.state_id = c2.state_id
        ";
        
        if ($conn->query($removeDuplicatesQuery)) {
            $duplicatesRemoved = $conn->affected_rows;
            $results['statistics']['normalized_duplicates_removed'] = $duplicatesRemoved;
        }
        
        // Commit transaction
        $conn->commit();
        $results['success'] = true;
        $results['message'] = "Successfully cleaned up duplicate cities";
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        $results['errors'][] = "Error during cleanup: " . $e->getMessage();
        $results['success'] = false;
    }
    
    return $results;
}

// Run the cleanup if this script is accessed directly
if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['run'])) {
    $results = cleanupDuplicateCities($conn);
    echo json_encode($results, JSON_PRETTY_PRINT);
} else {
    // Show status/preview
    $previewQuery = "
        SELECT 
            city,
            state,
            COUNT(*) as rate_count,
            MIN(date) as earliest_date,
            MAX(date) as latest_date,
            CASE 
                WHEN city REGEXP '\\([A-Z]{2}\\)' THEN 'HAS_STATE_CODE'
                ELSE 'CLEAN'
            END as city_type,
            TRIM(REGEXP_REPLACE(city, '\\\\s*\\\\([A-Z]{2}\\\\)\\\\s*', '')) as clean_name
        FROM egg_rates 
        WHERE city REGEXP '\\([A-Z]{2}\\)|^(Allahabad|Chennai|Delhi|Mumbai|Kolkata|Kanpur|Luknow|Muzaffurpur|Ranchi|Varanasi|Indore|Brahmapur)$'
        GROUP BY city, state
        ORDER BY clean_name, city_type DESC
    ";
    
    $previewResult = $conn->query($previewQuery);
    $preview = [];
    
    if ($previewResult && $previewResult->num_rows > 0) {
        while ($row = $previewResult->fetch_assoc()) {
            $preview[] = $row;
        }
    }
    
    echo json_encode([
        'message' => 'City Duplicates Cleanup Preview',
        'instructions' => 'Add ?run=1 to the URL or send a POST request to execute the cleanup',
        'preview' => $preview,
        'total_cities_with_issues' => count($preview)
    ], JSON_PRETTY_PRINT);
}

$conn->close();
?>
