<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(__FILE__)) . '/error.log');

// Helper function for structured debugging
if (!function_exists('debug_log')) {
    function debug_log($step, $message, $data = null) {
        $log = date('Y-m-d H:i:s') . " [WEBSTORIES-SIMPLE] " . $step . ": " . $message;
        if ($data !== null) {
            $log .= " - " . json_encode($data, JSON_UNESCAPED_SLASHES);
        }
        error_log($log);
    }
}

// Helper function to generate city slug with -egg-rate-today suffix for consistency with sitemap
if (!function_exists('generateCitySlug')) {
    function generateCitySlug($city, $state = null) {
        // Clean the city name by removing any state codes in parentheses
        $cleanCity = $city;
        if (preg_match('/^(.+?)\s*\(([A-Z]{2})\)$/', $city, $matches)) {
            $cleanCity = trim($matches[1]);
        }
        
        // Generate base slug
        $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $cleanCity));
        $citySlug = trim($citySlug, '-');
        
        // Add -egg-rate-today suffix for consistency with sitemap and SEO
        return $citySlug . '-egg-rate-today';
    }
}

debug_log("START", "Beginning simplified webstory processing (no thumbnail generation)");

// Configuration with absolute paths
$serverRoot = dirname(dirname(dirname(__FILE__))); // Go up to the public folder
$basePath = $serverRoot;
$webstoriesDir = $basePath . '/ampstory';
$buildWebstoriesDir = $basePath . '/build/ampstory';

debug_log("CONFIG", "Configuration initialized", [
    "basePath" => $basePath,
    "webstoriesDir" => $webstoriesDir,
    "buildWebstoriesDir" => $buildWebstoriesDir
]);

// Check webstories directories
$webstoriesDirExists = false;

// Check main webstories directory
if (file_exists($webstoriesDir) && is_dir($webstoriesDir)) {
    $webstoriesDirExists = true;
    debug_log("DIRS", "Found main webstories directory: {$webstoriesDir}");
}

// Check build webstories directory
if (file_exists($buildWebstoriesDir) && is_dir($buildWebstoriesDir)) {
    $webstoriesDirExists = true;
    $webstoriesDir = $buildWebstoriesDir; // Use build directory instead
    debug_log("DIRS", "Found build webstories directory: {$buildWebstoriesDir}");
}

if (!$webstoriesDirExists) {
    debug_log("ERROR", "No webstories directory found. Creating at {$webstoriesDir}");
    if (!mkdir($webstoriesDir, 0777, true)) {
        $error = error_get_last();
        debug_log("ERROR", "Failed to create webstories directory", $error);
        die("Failed to create webstories directory. Error: " . ($error['message'] ?? 'Unknown error'));
    }
    chmod($webstoriesDir, 0777);
}

// Database connection
debug_log("DB", "Including database configuration");
require_once dirname(__DIR__) . '/config/db.php';

// Verify that $conn exists, otherwise create the connection
if (!isset($conn) || $conn->connect_error) {
    debug_log("DB", "Creating new database connection");
    // Connection details
    $servername = "localhost";
    $username = "u901337298_test";
    $password = "A12345678b*";
    $dbname = "u901337298_test";
    
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        debug_log("ERROR", "Database connection failed: " . $conn->connect_error);
        die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
    }
    debug_log("DB", "Database connection created successfully");
} else {
    debug_log("DB", "Using existing database connection");
}

// Get all cities from database
try {
    debug_log("DB", "Querying normalized tables for cities");
    $sql = "
        SELECT DISTINCT c.name AS city, s.name AS state 
        FROM cities c
        JOIN states s ON c.state_id = s.id
        ORDER BY c.name
    ";
    $result = $conn->query($sql);
    
    if (!$result || $result->num_rows === 0) {
        debug_log("DB", "No results from normalized tables, falling back to original table");
        throw new Exception("No results from normalized tables");
    }
} catch (Exception $e) {
    // Fall back to original table
    debug_log("DB", "Querying original egg_rates table");
    $sql = "SELECT DISTINCT city, state FROM egg_rates ORDER BY city";
    $result = $conn->query($sql);
    
    if (!$result) {
        debug_log("ERROR", "Database query failed: " . $conn->error);
        die("Database error: " . $conn->error);
    }
}

$processedCities = 0;
$skippedCities = 0;
$errorCities = 0;

debug_log("PROCESS", "Beginning processing of " . ($result ? $result->num_rows : 0) . " cities");

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $city = $row['city'];
        $state = $row['state'];
        $citySlug = generateCitySlug($city, $state);
        
        debug_log("CITY", "Processing city: {$city}, {$state}", [
            "citySlug" => $citySlug
        ]);
        
        // Check webstory file
        $webstoryFile = $webstoriesDir . '/' . $citySlug . '.html';
        
        debug_log("FILES", "Checking files", [
            "webstoryFile" => $webstoryFile,
            "webstoryExists" => file_exists($webstoryFile)
        ]);
        
        // Skip if webstory doesn't exist
        if (!file_exists($webstoryFile)) {
            debug_log("SKIP", "Skipping {$city} - no webstory file exists");
            $skippedCities++;
            continue;
        }

        try {
            // No thumbnail generation - just process webstory files if needed
            debug_log("SUCCESS", "Webstory exists for {$city}, {$state}");
            $processedCities++;
            
        } catch (Exception $e) {
            debug_log("ERROR", "Exception processing {$city}: " . $e->getMessage());
            $errorCities++;
        }
    }
    
    debug_log("COMPLETE", "Webstory processing completed", [
        "processed" => $processedCities,
        "skipped" => $skippedCities,
        "errors" => $errorCities
    ]);
    
    echo "<hr>All operations completed.<br>";
    echo "Processed " . $processedCities . " webstories.<br>";
    echo "Skipped " . $skippedCities . " cities (no webstory file).<br>";
    echo "Errors encountered for " . $errorCities . " cities.<br>";
} else {
    debug_log("ERROR", "No cities found in the database");
    echo "No cities found in the database.";
}

debug_log("END", "Simplified webstory process completed");

// Only close the connection if it wasn't passed from another script
if (!isset($suppressConnectionClose)) {
    $conn->close();
    debug_log("DB", "Closed database connection");
}
?>
