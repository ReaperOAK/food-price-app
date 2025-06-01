<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection - using require_once instead of include to avoid duplicate function declarations
require_once dirname(__DIR__) . '/config/db.php';

// Verify that $conn exists, otherwise create the connection
if (!isset($conn) || $conn->connect_error) {
    // Connection details
    $servername = "localhost";
    $username = "u901337298_test";
    $password = "A12345678b*";
    $dbname = "u901337298_test";
    
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
    }
}

// Configuration with absolute paths
$basePath = dirname(dirname(dirname(__FILE__))); // Go up to the public folder
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
if (!function_exists('deleteOldWebStories')) {
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
        $sql = "
            SELECT DISTINCT city, state, date 
            FROM egg_rates 
            WHERE date >= '$retentionDate'
        ";
        
        $result = $conn->query($sql);
        $activeCities = [];
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Create a URL-friendly city name using the new slug format
                $citySlug = generateCitySlug($row['city'], $row['state']);
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
                
                // Extract city slug from filename - handle both new and old patterns
                $citySlug = null;
                
                // New pattern: city-statecode--egg-rate.html (e.g., allahabad-cc--egg-rate.html)
                if (preg_match('/^(.+)--egg-rate$/', $filename, $matches)) {
                    $citySlug = $matches[1];
                }
                // Legacy pattern: city-egg-rate.html (e.g., allahabad-egg-rate.html)  
                elseif (preg_match('/^(.+)-egg-rate$/', $filename, $matches)) {
                    $citySlug = $matches[1];
                }
                
                if ($citySlug) {                if ($citySlug) {
                    // If the city is not in our active list, delete the story
                    if (!isset($activeCities[$citySlug])) {
                        if (unlink($storyFile)) {
                            $deletedCount++;
                            echo "Deleted old web story: " . basename($storyFile) . "<br>";
                            
                            // Also delete the associated thumbnail if it exists
                            $thumbnailFile = "$imageDir/thumbnail-$citySlug.webp";
                            if (file_exists($thumbnailFile)) {
                                unlink($thumbnailFile);
                                echo "Deleted associated thumbnail: thumbnail-$citySlug.webp<br>";
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
}

// Helper function to generate city slug with state code for proper file naming
if (!function_exists('generateCitySlug')) {
    function generateCitySlug($city, $state = null) {
        // First, check if the city name contains a state code in parentheses like "Allahabad (CC)"
        $stateCode = '';
        $cleanCity = $city;
        
        if (preg_match('/^(.+?)\s*\(([A-Z]{2})\)$/', $city, $matches)) {
            $cleanCity = trim($matches[1]);
            $stateCode = strtolower($matches[2]);
        } elseif ($state) {
            // If no state code in city name, try to derive from state name
            $stateCode = extractStateCodeFromStateName($state);
        }
        
        // Generate the base city slug
        $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $cleanCity));
        $citySlug = trim($citySlug, '-'); // Remove leading/trailing dashes
        
        // Add state code if available, using double dash pattern
        if ($stateCode) {
            $slug = $citySlug . '-' . $stateCode . '--egg-rate';
        } else {
            $slug = $citySlug . '-egg-rate';
        }
        
        return $slug;
    }
}

// Helper function to extract state code from state name
if (!function_exists('extractStateCodeFromStateName')) {
    function extractStateCodeFromStateName($stateName) {
        // Common state name to code mappings based on the data patterns observed
        $stateMapping = [
            'chhattisgarh' => 'cc',
            'odisha' => 'od', 
            'orissa' => 'od',
            'west bengal' => 'wb',
            'andhra pradesh' => 'ap',
            'telangana' => 'tg',
            'tamil nadu' => 'tn',
            'karnataka' => 'ka',
            'kerala' => 'kl',
            'maharashtra' => 'mh',
            'gujarat' => 'gj',
            'rajasthan' => 'rj',
            'madhya pradesh' => 'mp',
            'uttar pradesh' => 'up',
            'bihar' => 'br',
            'jharkhand' => 'jh',
            'punjab' => 'pb',
            'haryana' => 'hr',
            'himachal pradesh' => 'hp',
            'jammu and kashmir' => 'jk',
            'uttarakhand' => 'uk',
            'assam' => 'as',
            'manipur' => 'mn',
            'mizoram' => 'mz',
            'nagaland' => 'nl',
            'tripura' => 'tr',
            'meghalaya' => 'ml',
            'arunachal pradesh' => 'ar',
            'sikkim' => 'sk',
            'goa' => 'ga',
            'delhi' => 'dl'
        ];
        
        $stateLower = strtolower(trim($stateName));
        return isset($stateMapping[$stateLower]) ? $stateMapping[$stateLower] : '';
    }
}

/**
 * Generate web stories for all cities in the database
 *
 * @param mysqli $conn Database connection
 * @param string $storiesDir Directory where web stories will be stored
 * @param string $imageDir Directory where web story images will be stored
 * @return void
 */
if (!function_exists('generateWebStories')) {
    function generateWebStories($conn, $storiesDir, $imageDir) {
        // Get the list of cities from the database
        $sql = "SELECT DISTINCT city, state FROM egg_rates";
        $result = $conn->query($sql);
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $city = $row['city'];
                $state = $row['state'];
                
                // Generate the city slug
                $citySlug = generateCitySlug($city, $state);
                
                // Define the file paths
                $storyFile = "$storiesDir/$citySlug.html";
                $thumbnailFile = "$imageDir/thumbnail-$citySlug.webp";
                
                // Check if the story file already exists
                if (!file_exists($storyFile)) {
                    // Generate the web story content (simplified example)
                    $storyContent = "<html><body>";
                    $storyContent .= "<h1>Web Story for $city, $state</h1>";
                    $storyContent .= "<p>Latest egg rates and news.</p>";
                    $storyContent .= "</body></html>";
                    
                    // Save the story to a file
                    file_put_contents($storyFile, $storyContent);
                    echo "Generated new web story: " . basename($storyFile) . "<br>";
                }
                
                // Check if the thumbnail exists, if not, create a placeholder
                if (!file_exists($thumbnailFile)) {
                    // Create a placeholder image (1x1 pixel transparent GIF)
                    $placeholder = imagecreatetruecolor(1, 1);
                    $transparent = imagecolorallocatealpha($placeholder, 255, 255, 255, 127);
                    imagefill($placeholder, 0, 0, $transparent);
                    imagealphablending($placeholder, false);
                    imagesavealpha($placeholder, true);
                    
                    // Save the placeholder as a WebP file
                    imagewebp($placeholder, $thumbnailFile);
                    imagedestroy($placeholder);
                    echo "Generated placeholder thumbnail: thumbnail-$citySlug.webp<br>";
                }
            }
        }
    }
}

// Only run the script if called directly, not when included
if (basename($_SERVER['SCRIPT_FILENAME']) == basename(__FILE__)) {
    $needRegenerateIndex = deleteOldWebStories($storiesDir, $imageDir, $daysToKeep, $conn, true);
    
    // Regenerate the index if needed
    if ($needRegenerateIndex) {
        // Include the generate_web_stories.php file to use its function
        include_once 'generate_web_stories.php';
        echo "Web stories index regenerated.<br>";
    }
    
    echo "Old web stories cleanup completed.";
}}
?>
