<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Include database connection
include 'db.php';

// Clear the updated_cities table for today's entries to avoid duplication
$today = date('Y-m-d');
$clearSql = "DELETE FROM updated_cities WHERE date = '$today'";
$conn->query($clearSql);

// Set a timeout for the HTTP request
$context = stream_context_create([
    'http' => [
        'timeout' => 60 // Timeout in seconds
    ]
]);

$url = 'https://e2necc.com/home/eggprice';
$html = @file_get_contents($url, false, $context);

if ($html === false) {
    die(json_encode(['error' => 'Failed to retrieve data from E2NECC']));
}

$dom = new DOMDocument();
@$dom->loadHTML($html);
$xpath = new DOMXPath($dom);

$table = $xpath->query('//table[@border="1px"]')->item(0);
if (!$table) {
    die(json_encode(['error' => 'Failed to find price table in the source page']));
}

$headers = [];
$rows = [];

// Get table headers
$headerNodes = $xpath->query('.//th', $table);
foreach ($headerNodes as $headerNode) {
    $headers[] = trim($headerNode->textContent);
}

// Get table rows
$rowNodes = $xpath->query('.//tr', $table);
foreach ($rowNodes as $rowIndex => $rowNode) {
    if ($rowIndex < 2) continue; // Skip the first two rows
    $cells = [];
    $cellNodes = $xpath->query('.//td', $rowNode);
    foreach ($cellNodes as $cellNode) {
        $cells[] = trim($cellNode->textContent);
    }
    if (!empty($cells)) {
        $rows[] = $cells;
    }
}

// City to state mapping
$cityToState = [
    "Ahmedabad" => "Gujarat",
    "Ajmer" => "Rajasthan",
    "Barwala" => "Haryana",
    "Bengaluru (CC)" => "Karnataka",
    "Bengaluru" => "Karnataka",
    "Bangalore" => "Karnataka",
    "Brahmapur (OD)" => "Odisha",
    "Chennai (CC)" => "Tamil Nadu",
    "Chittoor" => "Andhra Pradesh",
    "Delhi (CC)" => "Delhi",
    "E.Godavari" => "Andhra Pradesh",
    "Hospet" => "Karnataka",
    "Hyderabad" => "Telangana",
    "Jabalpur" => "Madhya Pradesh",
    "Kolkata (WB)" => "West Bengal",
    "Ludhiana" => "Punjab",
    "Mumbai (CC)" => "Maharashtra",
    "Mysuru" => "Karnataka",
    "Namakkal" => "Tamil Nadu",
    "Pune" => "Maharashtra",
    "Raipur" => "Chhattisgarh",
    "Surat" => "Gujarat",
    "Vijayawada" => "Andhra Pradesh",
    "Vizag" => "Andhra Pradesh",
    "W.Godavari" => "Andhra Pradesh",
    "Warangal" => "Telangana",
    "Allahabad (CC)" => "Uttar Pradesh",
    "Bhopal" => "Madhya Pradesh",
    "Indore (CC)" => "Madhya Pradesh",
    "Kanpur (CC)" => "Uttar Pradesh",
    "Luknow (CC)" => "Uttar Pradesh",
    "Muzaffurpur (CC)" => "Bihar",
    "Nagpur" => "Maharashtra",
    "Patna" => "Bihar",
    "Ranchi  (CC)" => "Jharkhand",
    "Varanasi (CC)" => "Uttar Pradesh"
];

// Standard city names mapping
$standardizeCityNames = [
    "bangalore" => "Bengaluru",
    "bangalore (cc)" => "Bengaluru",
    "bengaluru (cc)" => "Bengaluru"
];

// Get today's date and day of the month
$today = date('Y-m-d');
$dayOfMonth = date('j'); // Get the current day of the month (1-31)

$updatedCount = 0;
$errors = [];
$updatedCities = [];

// Begin transaction
$conn->begin_transaction();

try {
    // Get states and cities from normalized tables if they exist
    $statesMap = [];
    $citiesMap = [];
    
    try {
        $statesSql = "SELECT id, name FROM states";
        $statesResult = $conn->query($statesSql);
        
        if ($statesResult && $statesResult->num_rows > 0) {
            while ($row = $statesResult->fetch_assoc()) {
                $statesMap[strtolower($row['name'])] = $row['id'];
            }
            
            $citiesSql = "SELECT id, name, state_id FROM cities";
            $citiesResult = $conn->query($citiesSql);
            
            if ($citiesResult && $citiesResult->num_rows > 0) {
                while ($row = $citiesResult->fetch_assoc()) {
                    $citiesMap[strtolower($row['name']) . '_' . $row['state_id']] = $row['id'];
                }
            }
        }
    } catch (Exception $e) {
        // Ignore errors with normalized tables if they don't exist yet
    }
    
    // Process each row
    foreach ($rows as $row) {
        $city = $row[0];
        
        // Skip rows with "Prevailing Prices" or empty cities
        if (empty($city) || strtolower($city) === 'prevailing prices') {
            continue;
        }
        
        // Standardize city names
        $cityLower = strtolower($city);
        if (isset($standardizeCityNames[$cityLower])) {
            $city = $standardizeCityNames[$cityLower];
        }
        
        // Get the state for the city
        $state = isset($cityToState[$city]) ? $cityToState[$city] : 'Unknown';
        
        // Get today's rate from the row
        $rate = $row[$dayOfMonth]; // Get today's rate based on day of month
        
        // If today's rate is not available, find the last available rate
        if ($rate === '-' || $rate === '') {
            for ($i = $dayOfMonth - 1; $i > 0; $i--) {
                if (isset($row[$i]) && $row[$i] !== '-' && $row[$i] !== '') {
                    $rate = $row[$i];
                    break;
                }
            }
        }
        
        // Skip if we still don't have a valid rate
        if ($rate === '-' || $rate === '' || !is_numeric($rate)) {
            continue;
        }
        
        // Convert rate from paisa to rupees
        $rateInRupees = number_format($rate / 100, 2);
        
        // Escape values for SQL
        $cityEscaped = $conn->real_escape_string($city);
        $stateEscaped = $conn->real_escape_string($state);
        
        // Update or insert in original egg_rates table
        $checkSql = "SELECT * FROM egg_rates WHERE city='$cityEscaped' AND state='$stateEscaped' AND date='$today'";
        $checkResult = $conn->query($checkSql);
        
        if ($checkResult && $checkResult->num_rows > 0) {
            // Update existing record
            $updateSql = "UPDATE egg_rates SET rate='$rateInRupees' WHERE city='$cityEscaped' AND state='$stateEscaped' AND date='$today'";
            if ($conn->query($updateSql)) {
                $updatedCount++;
                $updatedCities[] = ['city' => $city, 'state' => $state, 'rate' => $rateInRupees];
            } else {
                $errors[] = "Error updating record for $city: " . $conn->error;
            }
        } else {
            // Insert new record
            $insertSql = "INSERT INTO egg_rates (city, state, date, rate) VALUES ('$cityEscaped', '$stateEscaped', '$today', '$rateInRupees')";
            if ($conn->query($insertSql)) {
                $updatedCount++;
                $updatedCities[] = ['city' => $city, 'state' => $state, 'rate' => $rateInRupees];
            } else {
                $errors[] = "Error inserting record for $city: " . $conn->error;
            }
        }
        
        // If normalized tables exist, also update them
        if (!empty($statesMap)) {
            $stateId = null;
            $cityId = null;
            
            // Find or insert state
            $stateLower = strtolower($state);
            if (isset($statesMap[$stateLower])) {
                $stateId = $statesMap[$stateLower];
            } else {
                $insertStateSql = "INSERT INTO states (name) VALUES ('$stateEscaped')";
                if ($conn->query($insertStateSql)) {
                    $stateId = $conn->insert_id;
                    $statesMap[$stateLower] = $stateId;
                } else {
                    $errors[] = "Error inserting state $state: " . $conn->error;
                }
            }
            
            // Find or insert city if we have a valid state ID
            if ($stateId) {
                $cityKey = strtolower($city) . '_' . $stateId;
                if (isset($citiesMap[$cityKey])) {
                    $cityId = $citiesMap[$cityKey];
                } else {
                    $insertCitySql = "INSERT INTO cities (name, state_id) VALUES ('$cityEscaped', $stateId)";
                    if ($conn->query($insertCitySql)) {
                        $cityId = $conn->insert_id;
                        $citiesMap[$cityKey] = $cityId;
                    } else {
                        $errors[] = "Error inserting city $city: " . $conn->error;
                    }
                }
                
                // Insert or update the rate in egg_rates_normalized if we have a valid city ID
                if ($cityId) {
                    $checkNormalizedSql = "SELECT * FROM egg_rates_normalized WHERE city_id=$cityId AND date='$today'";
                    $checkNormalizedResult = $conn->query($checkNormalizedSql);
                    
                    if ($checkNormalizedResult && $checkNormalizedResult->num_rows > 0) {
                        // Update existing record
                        $updateNormalizedSql = "UPDATE egg_rates_normalized SET rate='$rateInRupees' WHERE city_id=$cityId AND date='$today'";
                        if (!$conn->query($updateNormalizedSql)) {
                            $errors[] = "Error updating normalized record for $city: " . $conn->error;
                        }
                    } else {
                        // Insert new record
                        $insertNormalizedSql = "INSERT INTO egg_rates_normalized (city_id, date, rate) VALUES ($cityId, '$today', '$rateInRupees')";
                        if (!$conn->query($insertNormalizedSql)) {
                            $errors[] = "Error inserting normalized record for $city: " . $conn->error;
                        }
                    }
                }
            }
        }
        
        // Insert into updated_cities table to track which cities were updated from e2necc
        $insertUpdatedSql = "INSERT INTO updated_cities (city, state, date, rate) VALUES ('$cityEscaped', '$stateEscaped', '$today', '$rateInRupees')";
        $conn->query($insertUpdatedSql);
    }
    
    // Commit the transaction
    $conn->commit();
    
    echo json_encode([
        'success' => "Updated $updatedCount records",
        'updatedCities' => $updatedCities,
        'errors' => $errors
    ]);
    
} catch (Exception $e) {
    // Rollback the transaction in case of error
    $conn->rollback();
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>