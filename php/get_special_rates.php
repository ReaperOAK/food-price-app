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
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$sql = "
    SELECT city, rate
    FROM egg_rates
    WHERE state = 'special'
    AND (city, date) IN (
        SELECT city, MAX(date)
        FROM egg_rates
        WHERE state = 'special'
        GROUP BY city
    )
    ORDER BY city
";
$result = $conn->query($sql);

$specialRates = [];
while ($row = $result->fetch_assoc()) {
    $specialRates[] = $row;
}

echo json_encode($specialRates);

$conn->close();
?>