<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');

include 'db.php'; // Include the database connection

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['city']) && isset($data['state']) && isset($data['date']) && isset($data['rate'])) {
    $city = $data['city'];
    $state = $data['state'];
    $date = $data['date'];
    $rate = $data['rate'];

    $stmt = $conn->prepare("UPDATE egg_rates SET rate = ? WHERE city = ? AND state = ? AND date = ?");
    $stmt->bind_param("dsss", $rate, $city, $state, $date);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Rate updated successfully."]);
    } else {
        echo json_encode(["error" => "Error updating rate: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "Invalid input."]);
}

$conn->close();
?>
