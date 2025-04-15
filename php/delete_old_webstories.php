<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
include 'db.php';

// Configuration
$storiesDir = '../webstories';
$imageDir = '../images/webstories';
$daysToKeep = 3; // Number of days to keep web stories

// Create a function to delete old web stories
function deleteOldWebStories($storiesDir, $imageDir, $daysToKeep, $conn) {
    // Check if the web stories directory exists
    if (!is_dir($storiesDir)) {
        echo "Web stories directory does not exist.<br>";
        return;
    }

    // Get current date for comparison
    $currentDate = new DateTime();
    
    // Get all city-date combinations from the database that are within the retention period
    $retentionDate = date('Y-m-d', strtotime("-$daysToKeep days"));
    $sql = "
        SELECT DISTINCT city, date 
        FROM egg_rates 
        WHERE date >= '$retentionDate'
    ";
    
    $result = $conn->query($sql);
    $activeCities = [];
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Create a URL-friendly city name
            $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $row['city']));
            $activeCities[$citySlug] = true;
        }
    }
    
    // Get all web story files
    $storyFiles = glob("$storiesDir/*.html");
    $deletedCount = 0;
    
    foreach ($storyFiles as $storyFile) {
        // Skip index.html
        if (basename($storyFile) === 'index.html') {
            continue;
        }
        
        $filename = basename($storyFile, '.html');
        
        // Extract city slug from filename (assuming format is city-egg-rate.html)
        if (preg_match('/^(.*)-egg-rate$/', $filename, $matches)) {
            $citySlug = $matches[1];
            
            // If the city is not in our active list, delete the story
            if (!isset($activeCities[$citySlug])) {
                if (unlink($storyFile)) {
                    $deletedCount++;
                    echo "Deleted old web story: " . basename($storyFile) . "<br>";
                    
                    // Also delete the associated thumbnail if it exists
                    $thumbnailFile = "$imageDir/thumbnail-$citySlug.jpg";
                    if (file_exists($thumbnailFile)) {
                        unlink($thumbnailFile);
                        echo "Deleted associated thumbnail: thumbnail-$citySlug.jpg<br>";
                    }
                } else {
                    echo "Failed to delete: " . basename($storyFile) . "<br>";
                }
            }
        }
    }
    
    // Regenerate the index file after deletion
    if ($deletedCount > 0) {
        echo "Total deleted web stories: $deletedCount<br>";
        return true; // Signal that we need to regenerate the index
    }
    
    return false; // No regeneration needed
}

// Call the function to delete old web stories
$needRegenerateIndex = deleteOldWebStories($storiesDir, $imageDir, $daysToKeep, $conn);

// Regenerate the index if needed
if ($needRegenerateIndex) {
    // Include the generate_web_stories.php file to use its function
    include_once 'generate_web_stories.php';
    
    // Assuming the function is available after including the file
    if (function_exists('generateWebStoryIndex')) {
        generateWebStoryIndex($storiesDir, $conn);
        echo "Web stories index regenerated.<br>";
    } else {
        echo "Could not regenerate web stories index.<br>";
    }
}

$conn->close();
echo "Old web stories cleanup completed.";
?>
