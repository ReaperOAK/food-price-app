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
    $sql = "DELETE FROM egg_rates WHERE state='$name'";
} else if ($type === 'city' && $state) {
    $sql = "DELETE FROM egg_rates WHERE city='$name' AND state='$state'";
} else {
    echo json_encode(["error" => "Invalid data provided"]);
    exit();
}

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "$type removed successfully"]);
} else {
    echo json_encode(["error" => "Error removing $type: " . $conn->error]);
}

$conn->close();
?>