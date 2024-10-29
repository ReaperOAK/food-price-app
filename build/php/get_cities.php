<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$servername = "localhost";
$username = "u901337298_test";
$password = "A12345678b*";
$dbname = "u901337298_test";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the selected state from the query parameter
$state = isset($_GET['state']) ? $_GET['state'] : '';

if ($state) {
    // Fetch cities based on the selected state
    $sql = "SELECT DISTINCT city FROM egg_rates WHERE state = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $state);
    $stmt->execute();
    $result = $stmt->get_result();

    $cities = [];
    while ($row = $result->fetch_assoc()) {
        $cities[] = $row['city'];
    }

    echo json_encode($cities);
} else {
    echo json_encode([]);
}

$conn->close();
?>
