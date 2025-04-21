<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Only define getEnv function if it doesn't already exist
if (!function_exists('getEnv')) {
    // Function to get environment variable with fallback
    function getEnv($key, $default = null) {
        return isset($_ENV[$key]) ? $_ENV[$key] : 
               (getenv($key) ? getenv($key) : $default);
    }
}

// Load environment variables from .env file if it exists
$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments or empty lines
        if (empty(trim($line)) || strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Check if line contains an equals sign
        if (strpos($line, '=') === false) {
            continue;
        }
        
        // Parse ENV line
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        // Remove quotes if present
        if ((strpos($value, '"') === 0 && substr($value, -1) === '"') || 
            (strpos($value, "'") === 0 && substr($value, -1) === "'")) {
            $value = substr($value, 1, -1);
        }
        
        putenv("$name=$value");
        $_ENV[$name] = $value;
    }
}

// Log that we've attempted to load the environment file
error_log("Attempted to load environment file from: " . $envFile);
if (!file_exists($envFile)) {
    error_log("Warning: .env file not found. Using default database credentials.");
}

// Get database credentials from environment variables with fallbacks to original values
$servername = getEnv('DB_HOST', 'localhost');
$username = getEnv('DB_USERNAME', 'u901337298_test');
$password = getEnv('DB_PASSWORD', 'A12345678b*');
$dbname = getEnv('DB_NAME', 'u901337298_test');

// Log (without sensitive info) to help with debugging
error_log("Connecting to database: $dbname on $servername as $username");

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    die("Connection failed: " . $conn->connect_error);
}
?>