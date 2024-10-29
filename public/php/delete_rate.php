<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');

include 'db.php'; // Include the database connection


if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['id'])) {
    $id = $conn->real_escape_string($data['id']);
    
    $sql = "DELETE FROM egg_rates WHERE id='$id'";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Rate deleted successfully"]);
    } else {
        echo json_encode(["error" => "Error: " . $conn->error]);
    }
} else {
    echo json_encode(["error" => "Invalid input"]);
}

$conn->close();
?>