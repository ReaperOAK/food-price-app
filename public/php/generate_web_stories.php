<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
include 'db.php';

// Include the function to delete old web stories
include_once 'delete_old_webstories.php';

// Configuration
$storiesDir = '../webstories';
$templateFile = '../templates/webstory_template.html';
$backgroundImages = [
    'default' => '/images/webstories/eggpic.png',
];

// Create the stories directory if it doesn't exist
if (!file_exists($storiesDir)) {
    mkdir($storiesDir, 0755, true);
}

// Get the web story template
$template = file_get_contents($templateFile);
if (!$template) {
    die("Error: Could not load template file");
}

// Get today's date
$today = date('Y-m-d');

// Clean up old web stories first - but don't close the connection
$imageDir = '../images/webstories';
$daysToKeep = 3;
deleteOldWebStories($storiesDir, $imageDir, $daysToKeep, $conn, false);

// Get the latest egg rates
$sql = "
    SELECT city, state, rate, date 
    FROM egg_rates 
    WHERE (city, date) IN (
        SELECT city, MAX(date) 
        FROM egg_rates 
        GROUP BY city
    )
    ORDER BY city
";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $storiesGenerated = 0;
    
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
        
        // Select background image
        $backgroundImage = $backgroundImages['default'];
        $cityLower = strtolower($city);
        if (isset($backgroundImages[$cityLower])) {
            $backgroundImage = $backgroundImages[$cityLower];
        }
        
        // Format date for display
        $displayDate = date('F j, Y', strtotime($date));
        
        // Replace placeholders in the template
        $story = $template;
        $story = str_replace('{{CITY_NAME}}', $city, $story);
        $story = str_replace('{{STATE_NAME}}', $state, $story);
        $story = str_replace('{{EGG_RATE}}', $rate, $story);
        $story = str_replace('{{EGG_RATE * 30}}', ($rate * 30), $story);
        $story = str_replace('{{DATE}}', $displayDate, $story);
        $story = str_replace('{{BACKGROUND_IMAGE}}', $backgroundImage, $story);
        $story = str_replace('{{CITY_SLUG}}', $citySlug, $story);
        
        // Save the web story
        $filename = $storiesDir . '/' . $citySlug . '-egg-rate.html';
        if (file_put_contents($filename, $story)) {
            $storiesGenerated++;
        } else {
            echo "Error: Could not write to file $filename<br>";
        }
    }
    
    // Generate an index file for all web stories
    generateWebStoryIndex($storiesDir, $conn);
    
    echo "Generated $storiesGenerated web stories successfully.";
} else {
    echo "No egg rates found.";
}

// Function to generate an index file for all web stories
function generateWebStoryIndex($storiesDir, $conn) {
    $indexFile = $storiesDir . '/index.html';
    
    // Get the latest egg rates for all cities
    $sql = "
        SELECT city, state, rate, date 
        FROM egg_rates 
        WHERE (city, date) IN (
            SELECT city, MAX(date) 
            FROM egg_rates 
            GROUP BY city
        )
        ORDER BY city
    ";
    
    $result = $conn->query($sql);
    
    $html = '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Egg Rate Web Stories - Today Egg Rates</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .stories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }
        .story-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s ease;
        }
        .story-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .story-thumbnail {
            height: 150px;
            background-size: cover;
            background-position: center;
            position: relative;
        }
        .story-info {
            padding: 15px;
        }
        .story-title {
            font-weight: bold;
            font-size: 18px;
            margin: 0 0 10px 0;
        }
        .story-date {
            color: #666;
            font-size: 14px;
        }
        .story-rate {
            color: #e63946;
            font-weight: bold;
        }
        a {
            text-decoration: none;
            color: inherit;
        }
    </style>
</head>
<body>
    <h1>Egg Rate Web Stories</h1>
    <div class="stories-grid">';
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $city = $row['city'];
            $state = $row['state'];
            $rate = $row['rate'];
            $date = $row['date'];
            
            // Create a URL-friendly city name
            $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
            
            // Format date for display
            $displayDate = date('F j, Y', strtotime($date));
            
            // Add card to grid
            $html .= '
        <a href="/' . $citySlug . '-egg-rate.html" class="story-card">
            <div class="story-thumbnail" style="background-image: url(\'/images/webstories/thumbnail-' . $citySlug . '.jpg\');">
            </div>
            <div class="story-info">
                <h3 class="story-title">Egg Rate in ' . $city . ', ' . $state . '</h3>
                <p class="story-date">' . $displayDate . '</p>
                <p class="story-rate">₹' . $rate . ' per egg</p>
            </div>
        </a>';
        }
    }
    
    $html .= '
    </div>
</body>
</html>';
    
    file_put_contents($indexFile, $html);
}

// Close connection at the end of this script
$conn->close();
?>
