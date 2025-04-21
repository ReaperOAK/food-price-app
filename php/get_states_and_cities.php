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

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

// Fetch states and cities
$sql = "SELECT state, city FROM egg_rates";
$result = $conn->query($sql);

$statesAndCities = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $state = $row['state'];
        $city = $row['city'];
        
        if (!isset($statesAndCities[$state])) {
            $statesAndCities[$state] = [];
        }
        
        $statesAndCities[$state][] = $city;
    }
    echo json_encode($statesAndCities);
} else {
    echo json_encode(['error' => 'No data found']);
}

// Close connection
$conn->close();
?>