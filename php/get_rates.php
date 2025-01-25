<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$username = "u901337298_test";
$password = "A12345678b*";
$dbname = "u901337298_test";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
    exit();
}

$city = $_GET['city'] ?? '';
$state = $_GET['state'] ?? '';
$days = $_GET['days'] ?? '';

if ($days) {
    $sql = "SELECT date, rate FROM egg_rates WHERE city = ? AND state = ? ORDER BY date DESC LIMIT ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $city, $state, $days);
} else {
    $sql = "SELECT date, rate FROM egg_rates WHERE city = ? AND state = ? ORDER BY date DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $city, $state);
}

$stmt->execute();
$result = $stmt->get_result();

$rates = [];
while ($row = $result->fetch_assoc()) {
    $rates[] = $row;
}

echo json_encode($rates);
$conn->close();
?>