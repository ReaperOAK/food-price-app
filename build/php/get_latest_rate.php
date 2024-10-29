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

$city = $conn->real_escape_string($_GET['city']);
$state = $conn->real_escape_string($_GET['state']);

$sql = "SELECT * FROM egg_rates WHERE city='$city' AND state='$state' ORDER BY date DESC LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $latestRate = $result->fetch_assoc();
    echo json_encode($latestRate);
} else {
    echo json_encode(["error" => "No rates found for $city, $state"]);
}

$conn->close();
?>