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
    die("Connection failed: " . $conn->connect_error);
}

// Get the date parameter from the query string
$date = isset($_GET['date']) ? $conn->real_escape_string($_GET['date']) : null;

// SQL query to fetch egg rates
if ($date) {
    $sql = "SELECT * FROM egg_rates WHERE date = '$date'";
} else {
    $sql = "SELECT * FROM egg_rates";
}

$result = $conn->query($sql);

if (!$result) {
    // Log the SQL error
    error_log("SQL Error: " . $conn->error);
    echo json_encode(["error" => "Error executing query"]);
    exit;
}

$rates = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $rates[] = $row;
    }
}

// Return the rates as JSON
echo json_encode($rates);

$conn->close();
?>