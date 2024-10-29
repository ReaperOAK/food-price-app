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
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['city']) && !empty($data['state']) && !empty($data['date']) && !empty($data['rate'])) {
    $city = $conn->real_escape_string($data['city']);
    $state = $conn->real_escape_string($data['state']);
    $date = $conn->real_escape_string($data['date']);
    $rate = $conn->real_escape_string($data['rate']);
    
    $sql = "INSERT INTO egg_rates (city, state, date, rate) VALUES ('$city', '$state', '$date', '$rate')";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Rate added successfully"]);
    } else {
        echo json_encode(["error" => "Error: " . $conn->error]);
    }
} else {
    echo json_encode(["error" => "Invalid input"]);
}

$conn->close();
?>