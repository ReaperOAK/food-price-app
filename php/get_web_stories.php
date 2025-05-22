<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once __DIR__ . '/config/db.php';

// Directory where web stories are stored with absolute path
$basePath = dirname(dirname(__FILE__)); // Go up one level from php dir
$storiesDir = $basePath . '/webstories';

// Get limit parameter if provided
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;

// Try normalized tables first
$useNormalizedTables = true;
$stories = [];

try {
    if ($useNormalizedTables) {
        // Get the latest egg rates for all cities
        $sql = "
            SELECT c.name as city, s.name as state, ern.rate, ern.date
            FROM egg_rates_normalized ern
            JOIN cities c ON ern.city_id = c.id
            JOIN states s ON c.state_id = s.id
            WHERE (ern.city_id, ern.date) IN (
                SELECT city_id, MAX(date)
                FROM egg_rates_normalized
                GROUP BY city_id
            )
            ORDER BY ern.date DESC, c.name ASC
        ";
        
        // Add limit if specified
        if ($limit) {
            $sql .= " LIMIT " . $limit;
        }
        
        $result = $conn->query($sql);
        
        if (!$result || $result->num_rows === 0) {
            $useNormalizedTables = false;
        }
    }
} catch (Exception $e) {
    $useNormalizedTables = false;
    error_log("Error using normalized tables: " . $e->getMessage());
}

// Fall back to original table if needed
if (!$useNormalizedTables) {
    $sql = "
        SELECT city, state, rate, date 
        FROM egg_rates 
        WHERE (city, date) IN (
            SELECT city, MAX(date) 
            FROM egg_rates 
            GROUP BY city
        )
        ORDER BY date DESC, city ASC
    ";
    
    // Add limit if specified
    if ($limit) {
        $sql .= " LIMIT " . $limit;
    }
    
    $result = $conn->query($sql);
}

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $city = $row['city'];
        $state = $row['state'];
        $rate = $row['rate'];
        $date = $row['date'];
        
        // Skip if the rate is from more than 3 days ago
        if (strtotime($date) < strtotime('-3 days')) {
            continue;
        }
        
        // Create a URL-friendly city name
        $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
        
        // Format date for display
        $displayDate = date('F j, Y', strtotime($date));
        
        // Check if the web story file exists
        $storyFilename = $storiesDir . '/' . $citySlug . '-egg-rate.html';
        if (file_exists($storyFilename)) {
            // Add to stories array
            $stories[] = [
                'title' => "Egg Rate in $city, $state",
                'slug' => $citySlug . '-egg-rate',
                'thumbnail' => "/images/webstories/thumbnail-$citySlug.webp",
                'date' => $displayDate,
                'rate' => $rate,
                'city' => $city,
                'state' => $state
            ];
        }
    }
}

echo json_encode($stories);
$conn->close();
?>
