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

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get the JSON payload
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data)) {
    // Query to get the latest rate for each city
    $sql = "
        SELECT city, state, rate, date
        FROM egg_rates
        WHERE (city, date) IN (
            SELECT city, MAX(date)
            FROM egg_rates
            GROUP BY city
        )
        ORDER BY date DESC
    ";
} else {
    // Prepare the query to get the latest rate for specific cities
    $conditions = [];
    foreach ($data as $cityState) {
        if (isset($cityState['city']) && isset($cityState['state'])) {
            $city = $conn->real_escape_string($cityState['city']);
            $state = $conn->real_escape_string($cityState['state']);
            $conditions[] = "(city='$city' AND state='$state')";
        }
    }

    if (empty($conditions)) {
        echo json_encode(["error" => "No valid city-state pairs provided"]);
        exit();
    }

    $conditionStr = implode(' OR ', $conditions);
    $sql = "
        SELECT city, state, rate, date
        FROM egg_rates
        WHERE ($conditionStr) AND (city, date) IN (
            SELECT city, MAX(date)
            FROM egg_rates
            GROUP BY city
        )
        ORDER BY date DESC
    ";
}

$result = $conn->query($sql);

$rates = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $rates[] = [
            'city' => $row['city'],
            'state' => $row['state'],
            'rate' => $row['rate'],
            'date' => $row['date']
        ];
    }
} else {
    echo json_encode(["message" => "No rates found"]);
    exit();
}

// Output the rates as JSON
echo json_encode($rates);

// Close the database connection
$conn->close();
?>