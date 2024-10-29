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

$type = $data['type'];
$name = $conn->real_escape_string($data['name']);
$state = isset($data['state']) ? $conn->real_escape_string($data['state']) : null;

if ($type === 'state') {
    // Check if the state already exists
    $checkSql = "SELECT DISTINCT state FROM egg_rates WHERE state='$name'";
    $result = $conn->query($checkSql);
    if ($result->num_rows > 0) {
        echo json_encode(["error" => "State already exists"]);
        exit();
    }
    // Insert a new state with a placeholder city
    $sql = "INSERT INTO egg_rates (city, state, date, rate) VALUES ('placeholder', '$name', CURDATE(), 0)";
} else if ($type === 'city' && $state) {
    // Check if the city already exists in the state
    $checkSql = "SELECT * FROM egg_rates WHERE city='$name' AND state='$state'";
    $result = $conn->query($checkSql);
    if ($result->num_rows > 0) {
        echo json_encode(["error" => "City already exists in the state"]);
        exit();
    }
    // Insert a new city in the state
    $sql = "INSERT INTO egg_rates (city, state, date, rate) VALUES ('$name', '$state', CURDATE(), 0)";
} else {
    echo json_encode(["error" => "Invalid data provided"]);
    exit();
}

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "$type added successfully"]);
} else {
    echo json_encode(["error" => "Error adding $type: " . $conn->error]);
}

$conn->close();
?>