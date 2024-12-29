<?php
header('Content-Type: application/json');

// Database connection
$servername = "localhost";
$username = "u901337298_test";
$password = "A12345678b*";
$dbname = "u901337298_test";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
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
            $stmt->bind_param("ss", $city, $date);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows == 0) {
                // Insert new data
                $insertQuery = "INSERT INTO egg_rates (city, date, rate) VALUES (?, ?, ?)";
                $stmt = $conn->prepare($insertQuery);
                $stmt->bind_param("sss", $city, $date, $rate);
                $stmt->execute();
            } else {
                // Update existing data
                $updateQuery = "UPDATE egg_rates SET rate = ? WHERE city = ? AND date = ?";
                $stmt = $conn->prepare($updateQuery);
                $stmt->bind_param("sss", $rate, $city, $date);
                $stmt->execute();
            }

            // Track updated cities
            $trackQuery = "INSERT INTO updated_cities (city, state, date) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($trackQuery);
            $stmt->bind_param("sss", $city, $state, $date);
            $stmt->execute();
        }

        echo json_encode(['status' => 'success', 'message' => 'Data updated successfully']);
    } else {
        echo json_encode(['error' => 'Invalid data format']);
    }
} else {
    echo json_encode(['error' => 'Failed to retrieve the data']);
}

$conn->close();
?>