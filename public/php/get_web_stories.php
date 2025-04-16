<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Database connection
include 'db.php';

// Directory where web stories are stored with absolute path
$basePath = realpath($_SERVER['DOCUMENT_ROOT']);
$storiesDir = $basePath . '/webstories';

// Get limit parameter if provided
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;

// Get the latest egg rates for all cities
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
$stories = [];

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
                'thumbnail' => "/images/webstories/thumbnail-$citySlug.jpg",
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
