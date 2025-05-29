<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['city']) && !empty($data['state']) && !empty($data['date']) && !empty($data['rate'])) {
    $city = $data['city'];
    $state = $data['state'];
    $date = $data['date'];
    $rate = $data['rate'];
    
    if (updateEggRate($conn, $city, $state, $date, $rate)) {
        echo json_encode(["success" => true, "message" => "Rate added successfully to both original and normalized tables"]);
    } else {
        echo json_encode(["success" => false, "error" => "Failed to add rate"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Invalid input - missing required fields"]);
}

$conn->close();
?>