<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$servername = "localhost";
$username = "u901337298_test";
$password = "A12345678b*";
$dbname = "u901337298_test";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get the JSON payload
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data)) {
    echo json_encode(["error" => "No data provided"]);
    exit();
}

$errors = [];
foreach ($data as $rate) {
    if (!isset($rate['state']) || !isset($rate['date']) || !isset($rate['rate']) || !isset($rate['city'])) {
        $errors[] = "Missing data for one or more fields";
        continue;
    }

    $state = $conn->real_escape_string($rate['state']);
    $date = $conn->real_escape_string($rate['date']);
    $rateValue = $conn->real_escape_string($rate['rate']);
    $city = $conn->real_escape_string($rate['city']);

    // Log the incoming data
    error_log("Processing rate for city: $city, state: $state, date: $date, rate: $rateValue");

    // Check if the rate already exists for the city, state, and date
    $checkSql = "SELECT * FROM egg_rates WHERE city='$city' AND state='$state' AND date='$date'";
    $result = $conn->query($checkSql);

    if ($result->num_rows > 0) {
        // Update existing rate
        $sql = "UPDATE egg_rates SET rate='$rateValue' WHERE city='$city' AND state='$state' AND date='$date'";
    } else {
        // Insert new rate
        $sql = "INSERT INTO egg_rates (city, state, date, rate) VALUES ('$city', '$state', '$date', '$rateValue')";
    }

    if (!$conn->query($sql)) {
        $errors[] = "Error updating rate for $city, $state: " . $conn->error;
    }
}

if (empty($errors)) {
    echo json_encode(["success" => "Rates updated successfully"]);
} else {
    echo json_encode(["errors" => $errors]);
}

$conn->close();
?>