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

$state = $_GET['state'];

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$sql = "SELECT date, AVG(rate) as averageRate FROM egg_rates WHERE state = ? GROUP BY date";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $state);
$stmt->execute();
$result = $stmt->get_result();

$averageRates = [];
while ($row = $result->fetch_assoc()) {
    $averageRates[] = $row;
}

echo json_encode(['averageRates' => $averageRates]);

$stmt->close();
$conn->close();
?>