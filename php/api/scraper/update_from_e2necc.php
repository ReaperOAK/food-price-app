<?php
header('Content-Type: application/json');

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(dirname(__FILE__))) . '/error.log'); // Use correct path to error log

// Database connection
require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

// Set a timeout for the HTTP request
$context = stream_context_create([
    'http' => [
        'timeout' => 60 // Timeout in seconds
    ]
]);

// Fetch the latest egg prices from eggprices.php
$url = 'https://todayeggrates.com/php/api/scraper/eggprices.php'; // Update with the correct API path URL
$response = @file_get_contents($url, false, $context);

if ($response !== false) {
    $data = json_decode($response, true);

    if (isset($data['rows']) && is_array($data['rows'])) {
        // Begin transaction
        $conn->begin_transaction();
        
        try {
            $updatedCount = 0;
            $errors = [];
            
            // Clear the updated_cities table for today's date
            $today = date('Y-m-d');
            $stmt = $conn->prepare("DELETE FROM updated_cities WHERE date = ?");
            $stmt->bind_param("s", $today);
            $stmt->execute();
            
            // Insert or update data in the database
            foreach ($data['rows'] as $row) {
                $city = $row['city'];
                $state = $row['state'];
                $date = $row['date'];
                $rate = $row['rate'];

                // Clean city name
                $city = preg_replace('/\s*\(.*?\)\s*/', '', $city);
                $city = trim($city);
                
                // Standardize city names with consistent capitalization
                if (strtolower($city) === 'bangalore' || strtolower($city) === 'bengaluru') {
                    $city = 'Bengaluru'; // Always use this capitalization
                }

                // Update egg rates in both original and normalized tables
                if (updateEggRate($conn, $city, $state, $date, $rate)) {
                    $updatedCount++;
                    
                    // Track updated cities
                    $stmt = $conn->prepare("INSERT INTO updated_cities (city, state, date, rate) VALUES (?, ?, ?, ?)");
                    $stmt->bind_param("sssd", $city, $state, $date, $rate);
                    $stmt->execute();
                } else {
                    $errors[] = "Failed to update rate for $city, $state";
                }
            }
            
            // Commit transaction
            $conn->commit();
            
            echo json_encode([
                'status' => 'success', 
                'message' => 'Data updated successfully',
                'updated' => $updatedCount,
                'errors' => $errors
            ]);
            
        } catch (Exception $e) {
            // Rollback on error
            $conn->rollback();
            error_log("Error updating data: " . $e->getMessage());
            echo json_encode(['error' => 'Transaction failed: ' . $e->getMessage()]);
        }
    } else {
        error_log("Invalid data format");
        echo json_encode(['error' => 'Invalid data format']);
    }
} else {
    error_log("Failed to retrieve the data");
    echo json_encode(['error' => 'Failed to retrieve the data']);
}

$conn->close();
?>