<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

$result = [];

try {
    // Check states table
    $states_count = $conn->query("SELECT COUNT(*) as count FROM states")->fetch_assoc()['count'];
    $result['states_count'] = $states_count;
    
    // Check cities table
    $cities_count = $conn->query("SELECT COUNT(*) as count FROM cities")->fetch_assoc()['count'];
    $result['cities_count'] = $cities_count;
    
    // Check egg_rates table
    $rates_count = $conn->query("SELECT COUNT(*) as count FROM egg_rates")->fetch_assoc()['count'];
    $result['egg_rates_count'] = $rates_count;
    
    // Check egg_rates_normalized table
    $rates_norm_count = $conn->query("SELECT COUNT(*) as count FROM egg_rates_normalized")->fetch_assoc()['count'];
    $result['egg_rates_normalized_count'] = $rates_norm_count;
    
    // Get sample data
    $sample_state = $conn->query("SELECT * FROM states LIMIT 1")->fetch_assoc();
    $result['sample_state'] = $sample_state;
    
    $sample_city = $conn->query("SELECT * FROM cities LIMIT 1")->fetch_assoc();
    $result['sample_city'] = $sample_city;
    
    $sample_rate = $conn->query("SELECT * FROM egg_rates LIMIT 1")->fetch_assoc();
    $result['sample_rate'] = $sample_rate;
    
    $result['status'] = 'success';
    
} catch (Exception $e) {
    $result['status'] = 'error';
    $result['error'] = $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT);
$conn->close();
?>
