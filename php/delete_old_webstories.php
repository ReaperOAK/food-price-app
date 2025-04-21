<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Only include db.php if this script is called directly, not when included in another file
if (!function_exists('deleteOldWebStories')) {
    include 'db.php';
}

// Configuration with absolute paths
$basePath = realpath($_SERVER['DOCUMENT_ROOT']);
$storiesDir = $basePath . '/webstories';
$imageDir = $basePath . '/images/webstories';
$daysToKeep = 3; // Number of days to keep web stories

/**
 * Delete web stories older than the specified number of days
 *
 * @param string $storiesDir Directory where web stories are stored
 * @param string $imageDir Directory where web story images are stored
 * @param int $daysToKeep Number of days to keep web stories
 * @param mysqli $conn Database connection
 * @param bool $closeConnection Whether to close the connection when done
 * @return bool True if index needs regeneration, false otherwise
 */
function deleteOldWebStories($storiesDir, $imageDir, $daysToKeep, $conn, $closeConnection = false) {
    // Check if the web stories directory exists
    if (!is_dir($storiesDir)) {
        echo "Web stories directory does not exist: $storiesDir<br>";
        return false;
    }

    // Get current date for comparison
    $currentDate = new DateTime();
    
    // Get all city-date combinations from the database that are within the retention period
    $retentionDate = date('Y-m-d', strtotime("-$daysToKeep days"));
    
    // Check if using the normalized database structure
    $tableExists = $conn->query("SHOW TABLES LIKE 'cities'");
    $usingNormalizedDB = $tableExists && $tableExists->num_rows > 0;
    
    // Get active cities based on database structure
    $activeCities = [];
    
    if ($usingNormalizedDB) {
        // Using normalized database - join cities and rates tables
        $sql = "
            SELECT DISTINCT c.city_name, r.rate_date 
            FROM cities c
            JOIN rates r ON c.city_id = r.city_id
            WHERE r.rate_date >= '$retentionDate'
        ";
    } else {
        // Using original database structure
        $sql = "
            SELECT DISTINCT city, date 
            FROM egg_rates 
            WHERE date >= '$retentionDate'
        ";
    }
    
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Get the city name from the appropriate field based on database structure
            $cityName = $usingNormalizedDB ? $row['city_name'] : $row['city'];
            
            // Create a URL-friendly city name
            $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $cityName));
            $activeCities[$citySlug] = true;
        }
    }
    
    // Get all web story files
    $storyFiles = glob("$storiesDir/*.html");
    $deletedCount = 0;
    
    if (is_array($storyFiles)) {
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
    }
    
    // Signal if we need to regenerate the index
    if ($deletedCount > 0) {
        echo "Total deleted web stories: $deletedCount<br>";
        return true; // Signal that we need to regenerate the index
    }
    
    // Close connection if requested
    if ($closeConnection) {
        $conn->close();
    }
    
    return false; // No regeneration needed
}

// Only run the script if called directly, not when included
if (basename($_SERVER['SCRIPT_FILENAME']) == basename(__FILE__)) {
    $basePath = realpath($_SERVER['DOCUMENT_ROOT']);
    $storiesDir = $basePath . '/webstories';
    $imageDir = $basePath . '/images/webstories';
    
    $needRegenerateIndex = deleteOldWebStories($storiesDir, $imageDir, $daysToKeep, $conn, true);
    
    // Regenerate the index if needed
    if ($needRegenerateIndex) {
        // Include the generate_web_stories.php file to use its function
        include_once 'generate_web_stories.php';
        echo "Web stories index regenerated.<br>";
    }
    
    echo "Old web stories cleanup completed.";
}
?>
