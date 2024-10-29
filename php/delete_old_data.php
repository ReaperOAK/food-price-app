<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$servername = "localhost";
$username = "u901337298_test";
$password = "A12345678b*";
$dbname = "u901337298_test";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

// Calculate the date 10 days ago
$dateThreshold = date('Y-m-d', strtotime('-10 days'));

// SQL query to delete data older than 10 days
$sql = "DELETE FROM egg_rates WHERE date < '$dateThreshold'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => 'Old data deleted successfully']);
} else {
    echo json_encode(['error' => 'Error deleting data: ' . $conn->error]);
}

$conn->close();
?>