<?php
header('Content-Type: application/json');

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/error.log'); // Update with the correct path to your error log file

// Database connection
$servername = "localhost";
$username = "u901337298_test";
$password = "A12345678b*";
$dbname = "u901337298_test";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    die(json_encode(['error' => "Connection failed: " . $conn->connect_error]));
}

// Set a timeout for the HTTP request
$context = stream_context_create([
    'http' => [
        'timeout' => 60 // Timeout in seconds
    ]
]);

// Fetch the latest egg prices from eggprices.php
$url = 'https://todayeggrates.com/php/eggprices.php'; // Update with the correct URL
$response = @file_get_contents($url, false, $context);

if ($response !== false) {
    $data = json_decode($response, true);

    if (isset($data['rows']) && is_array($data['rows'])) {
        // Insert or update data in the database
        foreach ($data['rows'] as $row) {
            $city = $row['city'];
            $date = $row['date'];
            $rate = $row['rate'];

            // Check if data for today already exists
            $checkQuery = "SELECT * FROM egg_rates WHERE city = ? AND date = ?";
            $stmt = $conn->prepare($checkQuery);
            if (!$stmt) {
                error_log("Prepare failed: " . $conn->error);
                die(json_encode(['error' => "Prepare failed: " . $conn->error]));
            }
            $stmt->bind_param("ss", $city, $date);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows == 0) {
                // Insert new data
                $insertQuery = "INSERT INTO egg_rates (city, date, rate) VALUES (?, ?, ?)";
                $stmt = $conn->prepare($insertQuery);
                if (!$stmt) {
                    error_log("Prepare failed: " . $conn->error);
                    die(json_encode(['error' => "Prepare failed: " . $conn->error]));
                }
                $stmt->bind_param("sss", $city, $date, $rate);
                $stmt->execute();
            } else {
                // Update existing data
                $updateQuery = "UPDATE egg_rates SET rate = ? WHERE city = ? AND date = ?";
                $stmt = $conn->prepare($updateQuery);
                if (!$stmt) {
                    error_log("Prepare failed: " . $conn->error);
                    die(json_encode(['error' => "Prepare failed: " . $conn->error]));
                }
                $stmt->bind_param("sss", $rate, $city, $date);
                $stmt->execute();
            }

            // Track updated cities
            $trackQuery = "INSERT INTO updated_cities (city, state, date) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($trackQuery);
            if (!$stmt) {
                error_log("Prepare failed: " . $conn->error);
                die(json_encode(['error' => "Prepare failed: " . $conn->error]));
            }
            $stmt->bind_param("sss", $city, $state, $date);
            $stmt->execute();
        }

        echo json_encode(['status' => 'success', 'message' => 'Data updated successfully']);
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