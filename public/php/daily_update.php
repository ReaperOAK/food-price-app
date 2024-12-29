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

// Get today's date
$today = date('Y-m-d');

// Fetch the cities updated by update_from_e2necc.php
$updatedCitiesQuery = "SELECT city, state FROM updated_cities WHERE date = '$today'";
$updatedCitiesResult = $conn->query($updatedCitiesQuery);

$updatedCities = [];
if ($updatedCitiesResult->num_rows > 0) {
    while ($row = $updatedCitiesResult->fetch_assoc()) {
        $updatedCities[] = $row['city'];
    }
}

// Fetch the latest available rates for each city and state that were not updated by update_from_e2necc.php
$sql = "
    SELECT city, state, rate, MAX(date) as latest_date
    FROM egg_rates
    WHERE city NOT IN ('" . implode("','", $updatedCities) . "')
    GROUP BY city, state
";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $errors = [];
    while ($row = $result->fetch_assoc()) {
        $city = $conn->real_escape_string($row['city']);
        $state = $conn->real_escape_string($row['state']);
        $rate = $conn->real_escape_string($row['rate']);
        $latest_date = $conn->real_escape_string($row['latest_date']);

        // Check if the rate already exists for today's date
        $checkSql = "SELECT * FROM egg_rates WHERE city='$city' AND state='$state' AND date='$today'";
        $checkResult = $conn->query($checkSql);

        if ($checkResult->num_rows > 0) {
            // Update existing rate for today's date
            $updateSql = "UPDATE egg_rates SET rate='$rate' WHERE city='$city' AND state='$state' AND date='$today'";
            if (!$conn->query($updateSql)) {
                $errors[] = "Error updating rate for $city, $state: " . $conn->error;
            }
        } else {
            // Insert new rate for today's date
            $insertSql = "INSERT INTO egg_rates (city, state, date, rate) VALUES ('$city', '$state', '$today', '$rate')";
            if (!$conn->query($insertSql)) {
                $errors[] = "Error inserting rate for $city, $state: " . $conn->error;
            }
        }
    }

    if (empty($errors)) {
        echo json_encode(["success" => "Rates updated successfully"]);
    } else {
        echo json_encode(["errors" => $errors]);
    }
} else {
    echo json_encode(["message" => "No rates found"]);
}

$conn->close();
?>