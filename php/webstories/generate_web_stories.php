<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(__FILE__)) . '/error.log');

// Set up server paths - this is where we'll find our assets in production
$serverRoot = dirname(dirname(dirname(__FILE__))); // Go up to the public folder
$webstoriesPath = $serverRoot . '/ampstory';
$webstoriesImagesPath = $serverRoot . '/images/ampstory';
$templatePath = $serverRoot . '/templates/webstory_template.html';

// Create directories if they don't exist
$dirsToCreate = [$webstoriesPath, $webstoriesImagesPath, dirname($templatePath)];
foreach ($dirsToCreate as $dir) {
    if (!file_exists($dir)) {
        debug_log("DIRS", "Creating directory: {$dir}");
        if (!mkdir($dir, 0777, true)) {
            $error = error_get_last();
            debug_log("ERROR", "Failed to create directory: {$dir}", $error);
            throw new Exception("Failed to create directory {$dir}: " . ($error['message'] ?? 'Unknown error'));
        }
        chmod($dir, 0777);
        debug_log("DIRS", "Successfully created directory: {$dir}");
    }
}

// Helper function for structured debugging
function debug_log($step, $message, $data = null) {
    $log = date('Y-m-d H:i:s') . " [WEB STORIES] " . $step . ": " . $message;
    if ($data !== null) {
        $log .= " - " . json_encode($data, JSON_UNESCAPED_SLASHES);
    }
    error_log($log);
}

// Helper function to ensure image URLs are properly formatted
function formatImagePath($imagePath) {
    // Strip any leading slashes if they exist
    $imagePath = ltrim($imagePath, '/');
      // Remove any duplicate path segments
    if (preg_match('#(^|/)images/ampstory/.*#', $imagePath)) {
        // Extract just the filename by finding the last occurrence of images/ampstory/
        $pattern = '#.*images/ampstory/([^/]+)$#';
        if (preg_match($pattern, $imagePath, $matches)) {
            $filename = $matches[1];
            return '/images/ampstory/' . $filename;
        }
    }    
    // If it's just a filename without path, add the path
    if (strpos($imagePath, '/') === false) {
        return '/images/ampstory/' . $imagePath;
    }
    
    // For other cases, ensure it has the correct prefix
    if (strpos($imagePath, 'images/ampstory/') === 0) {
        return '/' . $imagePath;
    }
    
    // Default case - add the standard path
    return '/images/ampstory/' . $imagePath;
}

// Helper function to generate city slug without state code for clean URLs
function generateCitySlug($city, $state = null) {
    debug_log("SLUG", "Generating slug for city: {$city}, state: {$state}");
    
    // Validate input - if city is empty or null, return a default
    if (empty($city) || !is_string($city)) {
        debug_log("SLUG", "Invalid city name provided, returning default slug");
        return 'unknown-city-egg-rate-today';
    }
    
    // Clean the city name by removing any state codes in parentheses like "Allahabad (CC)" or "Agra (UP)"
    $cleanCity = trim($city);
    
    // Handle various patterns of state codes in city names:
    // Pattern 1: "City (XX)" where XX is a 2-letter state code
    if (preg_match('/^(.+?)\s*\(([A-Z]{2})\)$/', $cleanCity, $matches)) {
        $cleanCity = trim($matches[1]);
        debug_log("SLUG", "Removed state code pattern (XX) from city name, using: {$cleanCity}");
    }
    // Pattern 2: "City (State Name)" - remove full state name in parentheses
    elseif (preg_match('/^(.+?)\s*\([^)]+\)$/', $cleanCity, $matches)) {
        $cleanCity = trim($matches[1]);
        debug_log("SLUG", "Removed state name in parentheses from city name, using: {$cleanCity}");
    }
    // Pattern 3: Check if city name already has state code embedded (like "Agra UP")
    elseif (preg_match('/^(.+?)\s+([A-Z]{2})$/', $cleanCity, $matches)) {
        $cleanCity = trim($matches[1]);
        debug_log("SLUG", "Removed embedded state code from city name, using: {$cleanCity}");
    }
    
    // Validate cleaned city name
    if (empty($cleanCity)) {
        debug_log("SLUG", "City name became empty after cleaning, using original");
        $cleanCity = $city;
    }
    
    // Generate the base city slug without state codes
    $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $cleanCity));
    $citySlug = trim($citySlug, '-'); // Remove leading/trailing dashes
    
    // Final validation - ensure we have a valid slug
    if (empty($citySlug)) {
        debug_log("SLUG", "Generated slug is empty, using fallback");
        $citySlug = 'unknown-city';
    }
    
    // Add -egg-rate-today suffix for consistency with sitemap and SEO
    $slug = $citySlug . '-egg-rate-today';
    
    debug_log("SLUG", "Generated full slug: {$slug}");
    return $slug;
}

// Use a try-catch block around the entire script to catch any unexpected errors
try {
    debug_log("START", "Beginning web stories generation");
    
    // Database connection - using require_once instead of include to avoid duplicate function declarations
    debug_log("DB", "Including database configuration");
    require_once dirname(__DIR__) . '/config/db.php';

    // Verify that $conn exists, otherwise create the connection
    if (!isset($conn) || $conn->connect_error) {
        debug_log("DB", "Creating new database connection");
        // Connection details
        $servername = "localhost";
        $username = "u901337298_test";
        $password = "A12345678b*";
        $dbname = "u901337298_test";
        
        // Create connection
        $conn = new mysqli($servername, $username, $password, $dbname);
        
        // Check connection
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        debug_log("DB", "New database connection created successfully");
    } else {
        debug_log("DB", "Using existing database connection");
    }    // Verify all required directories exist and are writable
    $requiredDirs = [
        $serverRoot . '/ampstory',
        $serverRoot . '/images/ampstory',
        $serverRoot . '/templates'
    ];

    foreach ($requiredDirs as $dir) {
        if (!file_exists($dir)) {
            debug_log("DIRS", "Directory already exists: {$dir}");
        } elseif (!is_writable($dir)) {
            debug_log("DIRS", "Directory not writable: {$dir}");
            chmod($dir, 0777);
            if (!is_writable($dir)) {
                throw new Exception("Directory not writable after chmod: {$dir}");
            }
            debug_log("DIRS", "Made directory writable: {$dir}");
        }
    }

    // Configuration - use server paths where the files will be served from
    $storiesDir = $webstoriesPath;
    $imageDir = $webstoriesImagesPath;
      // Template file locations to try, prioritizing server path
    $templateLocations = [
        $templatePath,  // Try server path first
        $serverRoot . '/templates/webstory_template.html',
        dirname(__DIR__) . '/templates/webstory_template.html',
        __DIR__ . '/templates/webstory_template.html'
    ];
    
    debug_log("CONFIG", "Looking for template file in multiple locations");
    
    $template = null;
    $templateFile = null;
    
    foreach ($templateLocations as $location) {
        debug_log("TEMPLATE", "Checking location: {$location}");
        if (file_exists($location)) {
            debug_log("TEMPLATE", "Found template at: {$location}");
            $template = file_get_contents($location);
            if ($template !== false) {
                $templateFile = $location;
                debug_log("TEMPLATE", "Successfully read template file");
                break;
            }
        }
    }
    
    if (!$template) {
        debug_log("ERROR", "Could not find or read template file in any location");
        throw new Exception("Web story template file not found in any location");
    }
    
    // Verify template has required elements
    if (!strpos($template, '<amp-story') || !strpos($template, '{{CITY_NAME}}')) {
        debug_log("ERROR", "Template file is invalid - missing required elements");
        throw new Exception("Web story template file is invalid - missing required elements");
    }
    
    debug_log("TEMPLATE", "Template file validated successfully");
    
    debug_log("CONFIG", "Paths configured", [
        "basePath" => $serverRoot,
        "storiesDir" => $storiesDir,
        "imageDir" => $imageDir,
        "templateFile" => $templateFile
    ]);

    // Function to generate web story index
    if (!function_exists('generateWebStoryIndex')) {
        debug_log("FUNCTIONS", "Defining generateWebStoryIndex function");
        function generateWebStoryIndex($storiesDir, $conn) {
            debug_log("INDEX", "Generating web stories index page");
            $indexFile = $storiesDir . '/index.html';
              // Try normalized table first for getting latest egg rates
            try {
                debug_log("INDEX", "Querying normalized tables for latest rates per city");
                $sql = "
                    SELECT c.name as city, s.name as state, ern.rate, ern.date 
                    FROM egg_rates_normalized ern
                    JOIN cities c ON ern.city_id = c.id
                    JOIN states s ON c.state_id = s.id
                    WHERE (ern.city_id, ern.date) IN (
                        SELECT city_id, MAX(date)
                        FROM egg_rates_normalized
                        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                        AND rate IS NOT NULL
                        AND rate > 0
                        GROUP BY city_id
                    )
                    ORDER BY c.name
                ";
                
                $result = $conn->query($sql);
                
                if (!$result || $result->num_rows === 0) {
                    debug_log("INDEX", "No results from normalized table, falling back to original table");
                    throw new Exception("No results from normalized table");
                }
            } catch (Exception $e) {
                // Fall back to original table
                debug_log("INDEX", "Using original table: " . $e->getMessage());
                $sql = "
                    SELECT city, state, rate, date 
                    FROM egg_rates 
                    WHERE (city, date) IN (
                        SELECT city, MAX(date) 
                        FROM egg_rates 
                        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                        AND rate IS NOT NULL
                        AND rate > 0
                        GROUP BY city
                    )
                    ORDER BY city
                ";
                $result = $conn->query($sql);
            }
            
            // Generate HTML for index file
            $html = "<!DOCTYPE html><html><head><title>Web Stories Index</title></head><body>";
            $html .= "<h1>Web Stories Index</h1><ul>";
              while ($row = $result->fetch_assoc()) {
                $city = $row['city'];
                $state = $row['state'];
                $rate = $row['rate'];
                $date = $row['date'];                debug_log("INDEX", "Adding index entry for {$city}, {$state}");                $citySlug = generateCitySlug($city, $state);
                
                // Validate slug generation for index
                if (empty($citySlug) || !is_string($citySlug)) {
                    debug_log("INDEX", "Failed to generate slug for {$city}, {$state} - skipping");
                    continue;
                }
                
                $html .= "<li><a href='{$citySlug}.html'>{$city}, {$state} - {$rate} ({$date})</a></li>";
            }
            
            $html .= "</ul></body></html>";
            
            debug_log("INDEX", "Saving index file to {$indexFile}");
            $writeResult = file_put_contents($indexFile, $html);
            if ($writeResult === false) {
                debug_log("INDEX", "Failed to write index file to {$indexFile}");
                throw new Exception("Failed to write index file to {$indexFile}");
            }
            debug_log("INDEX", "Web stories index page generated successfully");
        }
    }

    // Include the function to delete old web stories, we're using require_once to avoid duplicate declarations
    debug_log("INCLUDES", "Including delete_old_webstories.php");
    require_once __DIR__ . '/delete_old_webstories.php';    // Create or check necessary directories
    $buildWebstoriesPath = $serverRoot . '/ampstory';
    $buildImagesPath = $serverRoot . '/images/ampstory';

    foreach ([$buildWebstoriesPath, $buildImagesPath] as $dir) {
        if (!file_exists($dir)) {
            debug_log("DIRS", "Directory already exists: {$dir}");
        } elseif (!is_writable($dir)) {
            debug_log("DIRS", "Directory not writable: {$dir}");
            chmod($dir, 0777);
            if (!is_writable($dir)) {
                debug_log("ERROR", "Directory not writable and could not fix permissions: {$dir}");
                throw new Exception("Directory not writable and could not fix permissions: {$dir}");
            }
            debug_log("DIRS", "Fixed directory permissions: {$dir}");
        }
    }

    // Get and validate background images
    $backgroundImages = [];
    $defaultImageCreated = false;

    if (is_dir($imageDir)) {
        debug_log("IMAGES", "Scanning directory for background images: {$imageDir}");
        $files = scandir($imageDir);
        if ($files === false) {
            debug_log("ERROR", "Failed to scan image directory");
            throw new Exception("Failed to scan image directory: {$imageDir}");
        }
        
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            
            $filePath = $imageDir . '/' . $file;
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            
            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                continue;
            }

            // Skip thumbnail files
            if (strpos($file, 'thumbnail-') === 0) {
                continue;
            }

            // Validate image
            $imageInfo = @getimagesize($filePath);
            if ($imageInfo === false) {
                debug_log("ERROR", "Invalid image file: {$file}");
                continue;
            }

            $backgroundImages[] = $file;
            debug_log("IMAGES", "Added valid background image: {$file}");
        }
    }

    // Create default image if no valid images found
    if (empty($backgroundImages)) {
        debug_log("IMAGES", "No valid background images found, creating default");
        
        try {
            // Create a more visually appealing default image
            $width = 1200;
            $height = 1600;
            $img = imagecreatetruecolor($width, $height);
            
            // Create gradient background
            $topColor = imagecolorallocate($img, 51, 153, 255);    // Light blue
            $bottomColor = imagecolorallocate($img, 255, 255, 255); // White
            
            // Draw gradient
            for($i = 0; $i < $height; $i++) {
                $color = imagecolorallocate($img, 
                    51 + ($i/$height) * (255-51),
                    153 + ($i/$height) * (255-153),
                    255);
                imageline($img, 0, $i, $width, $i, $color);
            }
            
            // Add text
            $fontColor = imagecolorallocate($img, 33, 33, 33);
            $fontSize = 5;
            $text = "Egg Rate Updates";
            
            // Center the text
            $textWidth = strlen($text) * imagefontwidth($fontSize);
            $textHeight = imagefontheight($fontSize);
            $x = ($width - $textWidth) / 2;
            $y = ($height - $textHeight) / 2;
            
            imagestring($img, $fontSize, $x, $y, $text, $fontColor);
            
            // Save as WebP for better quality/compression
            $defaultImagePath = $imageDir . '/default.webp';
            imagewebp($img, $defaultImagePath, 80);
            imagedestroy($img);
            
            if (file_exists($defaultImagePath)) {
                $backgroundImages[] = 'default.webp';
                $defaultImageCreated = true;
                debug_log("IMAGES", "Successfully created default background image");
            }
        } catch (Exception $e) {
            debug_log("ERROR", "Failed to create default image: " . $e->getMessage());
            throw new Exception("Could not create default background image: " . $e->getMessage());
        }
    }

    if (empty($backgroundImages)) {
        debug_log("ERROR", "No valid background images available");
        throw new Exception("No valid background images available and could not create default");
    }

    // Get today's date
    $today = date('Y-m-d');
    debug_log("DATE", "Current date: {$today}");

    // Clean up old web stories first - but don't close the connection
    $daysToKeep = 3;
    debug_log("CLEANUP", "Cleaning up old web stories (keeping {$daysToKeep} days)");
    deleteOldWebStories($storiesDir, $imageDir, $daysToKeep, $conn, false);

    // After template validation code
    // Try normalized tables first with better error handling and retry logic
    $maxRetries = 3;
    $retryDelay = 1; // seconds
    $attempt = 0;
    
    while ($attempt < $maxRetries) {
        try {
            $attempt++;
            debug_log("DATA", "Querying normalized tables for egg rates (attempt {$attempt})");
            
            // Test connection before query
            if (!$conn->ping()) {
                debug_log("DB", "Database connection lost, attempting to reconnect");
                $conn->close();
                $conn = new mysqli($servername, $username, $password, $dbname);
                if ($conn->connect_error) {
                    throw new Exception("Failed to reconnect to database: " . $conn->connect_error);
                }
                debug_log("DB", "Successfully reconnected to database");
            }            // Try normalized tables first with proper city-specific latest data
            $sql = "
                SELECT c.name as city, s.name as state, ern.rate, ern.date
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE (ern.city_id, ern.date) IN (
                    SELECT city_id, MAX(date)
                    FROM egg_rates_normalized
                    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                    GROUP BY city_id
                )
                AND ern.rate IS NOT NULL
                AND ern.rate > 0
                ORDER BY c.name
            ";

            debug_log("SQL", "Executing query on normalized tables for latest city-specific rates");
            $result = $conn->query($sql);
            
            if (!$result) {
                throw new Exception("Query failed: " . $conn->error);
            }

            if ($result->num_rows === 0) {
                debug_log("DATA", "No results from normalized tables, falling back to original table");
                // Fallback to original table with proper latest data per city
                $sql = "
                    SELECT city, state, rate, date 
                    FROM egg_rates 
                    WHERE (city, date) IN (
                        SELECT city, MAX(date) 
                        FROM egg_rates 
                        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                        AND rate IS NOT NULL
                        AND rate > 0
                        GROUP BY city
                    )
                    ORDER BY city
                ";
                $result = $conn->query($sql);
                
                if (!$result) {
                    throw new Exception("Fallback query failed: " . $conn->error);
                }
            }

            debug_log("DATA", "Successfully retrieved " . $result->num_rows . " rows from normalized tables");
            break; // Success, exit retry loop

        } catch (Exception $e) {
            debug_log("ERROR", "Attempt {$attempt} failed: " . $e->getMessage());
            
            if ($attempt === $maxRetries) {
                // On last attempt, try the original table as fallback
                debug_log("DATA", "All normalized table attempts failed, trying original table");
                  $sql = "
                    SELECT city, state, rate, date 
                    FROM egg_rates 
                    WHERE (city, date) IN (
                        SELECT city, MAX(date) 
                        FROM egg_rates 
                        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                        AND rate IS NOT NULL
                        AND rate > 0
                        GROUP BY city
                    )
                    ORDER BY city
                ";
                
                $result = $conn->query($sql);
                
                if (!$result) {
                    debug_log("ERROR", "Both normalized and original table queries failed");
                    throw new Exception("Database queries failed for both tables: " . $conn->error);
                }                if ($result->num_rows === 0) {
                    debug_log("ERROR", "No egg rates found in either table within the last 7 days");
                    throw new Exception("No egg rates found in the database within the last 7 days");
                }
                
                debug_log("DATA", "Successfully retrieved " . $result->num_rows . " rows from original table");
                break;
            }
            
            // Wait before retrying
            sleep($retryDelay);
        }
    }

    if ($result && $result->num_rows > 0) {
        debug_log("PROCESS", "Found " . $result->num_rows . " cities to generate web stories for");
        $storiesGenerated = 0;        while ($row = $result->fetch_assoc()) {
            $city = $row['city'];
            $state = $row['state'];
            $rate = $row['rate'];
            $date = $row['date'];
            
            // Validate that we have proper data for this city
            if (empty($city) || empty($state) || empty($rate) || $rate <= 0) {
                debug_log("SKIP", "Skipping invalid data - City: '{$city}', State: '{$state}', Rate: '{$rate}'");
                continue;
            }
            
            // Generate the proper city slug with state code
            $citySlug = generateCitySlug($city, $state);
            
            // Additional validation to ensure slug was generated properly
            if (empty($citySlug) || !is_string($citySlug)) {
                debug_log("ERROR", "Failed to generate valid slug for city: {$city}, state: {$state}");
                continue;
            }
            
            debug_log("STORY", "Processing city: {$city}, {$state} - Rate: ₹{$rate} - Slug: {$citySlug}");
            
            // Skip if the rate is from more than 7 days ago
            if (strtotime($date) < strtotime('-7 days')) {
                debug_log("SKIP", "Skipping {$city} - rate is too old (from {$date})");
                continue;
            }
              // Assign random background images for each story page
            $coverImage = $backgroundImages[array_rand($backgroundImages)];
            $trayPriceImage = $backgroundImages[array_rand($backgroundImages)];
            $ctaImage = $backgroundImages[array_rand($backgroundImages)];
            
            debug_log("IMAGES", "Assigned images - Cover: {$coverImage}, Tray: {$trayPriceImage}, CTA: {$ctaImage}");
              // Replace template variables - using correct placeholders that match the template
            $story = $template;
            
            // Log the original city data for debugging
            debug_log("TEMPLATE", "Replacing variables for {$city}, {$state} with rate ₹{$rate}");
              // Replace all city-specific variables with actual data
            $story = str_replace('{{CITY_NAME}}', htmlspecialchars($city, ENT_QUOTES, 'UTF-8'), $story);
            $story = str_replace('{{STATE_NAME}}', htmlspecialchars($state, ENT_QUOTES, 'UTF-8'), $story);            $story = str_replace('{{EGG_RATE}}', number_format((float)$rate, 2), $story);
            $story = str_replace('{{TRAY_RATE}}', number_format(((float)$rate * 30), 2), $story);            $story = str_replace('{{CITY_SLUG}}', $citySlug, $story);
            $story = str_replace('{{CITY_SLUG_CLEAN}}', $citySlug, $story);
            
            // Generate city slug without the -egg-rate-today suffix for original source linking
            $citySlugWithoutSuffix = str_replace('-egg-rate-today', '', $citySlug);
            $story = str_replace('{{CITY_SLUG_WITHOUT_SUFFIX}}', $citySlugWithoutSuffix, $story);
            
            $story = str_replace('{{DATE}}', date('F j, Y', strtotime($date)), $story);
            $story = str_replace('{{ISO_DATE}}', date('c', strtotime($date)), $story);
            
            // Add date slug for uniqueness
            $dateSlug = date('Y-m-d', strtotime($date));
            $story = str_replace('{{DATE_SLUG}}', $dateSlug, $story);
            
            // Generate state code (simple mapping for major states)
            $stateCodes = [
                'Andhra Pradesh' => 'AP', 'Telangana' => 'TG', 'Karnataka' => 'KA',
                'Tamil Nadu' => 'TN', 'Kerala' => 'KL', 'Maharashtra' => 'MH',
                'Gujarat' => 'GJ', 'Rajasthan' => 'RJ', 'Uttar Pradesh' => 'UP',
                'Bihar' => 'BR', 'West Bengal' => 'WB', 'Odisha' => 'OR',
                'Jharkhand' => 'JH', 'Chhattisgarh' => 'CT', 'Madhya Pradesh' => 'MP',
                'Punjab' => 'PB', 'Haryana' => 'HR', 'Himachal Pradesh' => 'HP',
                'Delhi' => 'DL', 'Assam' => 'AS', 'Meghalaya' => 'ML',
                'Manipur' => 'MN', 'Mizoram' => 'MZ', 'Nagaland' => 'NL',
                'Tripura' => 'TR', 'Arunachal Pradesh' => 'AR', 'Sikkim' => 'SK',
                'Goa' => 'GA', 'Uttarakhand' => 'UT', 'Jammu and Kashmir' => 'JK'            ];
            $stateCode = isset($stateCodes[$state]) ? $stateCodes[$state] : 'IN';
            $story = str_replace('{{STATE_CODE}}', $stateCode, $story);
            
            // Add approximate geographic coordinates for major cities (for enhanced local SEO)
            $cityCoordinates = [
                'mumbai' => ['lat' => '19.0760', 'lon' => '72.8777'],
                'delhi' => ['lat' => '28.7041', 'lon' => '77.1025'],
                'bangalore' => ['lat' => '12.9716', 'lon' => '77.5946'],
                'hyderabad' => ['lat' => '17.3850', 'lon' => '78.4867'],
                'chennai' => ['lat' => '13.0827', 'lon' => '80.2707'],
                'kolkata' => ['lat' => '22.5726', 'lon' => '88.3639'],
                'pune' => ['lat' => '18.5204', 'lon' => '73.8567'],
                'ahmedabad' => ['lat' => '23.0225', 'lon' => '72.5714'],
                'jaipur' => ['lat' => '26.9124', 'lon' => '75.7873'],
                'lucknow' => ['lat' => '26.8467', 'lon' => '80.9462'],
                'kanpur' => ['lat' => '26.4499', 'lon' => '80.3319'],
                'nagpur' => ['lat' => '21.1458', 'lon' => '79.0882'],
                'indore' => ['lat' => '22.7196', 'lon' => '75.8577'],
                'thane' => ['lat' => '19.2183', 'lon' => '72.9781'],
                'bhopal' => ['lat' => '23.2599', 'lon' => '77.4126'],
                'visakhapatnam' => ['lat' => '17.6868', 'lon' => '83.2185'],
                'pimpri' => ['lat' => '18.6298', 'lon' => '73.8131'],
                'patna' => ['lat' => '25.5941', 'lon' => '85.1376'],
                'vadodara' => ['lat' => '22.3072', 'lon' => '73.1812'],
                'ghaziabad' => ['lat' => '28.6692', 'lon' => '77.4538'],
                'ludhiana' => ['lat' => '30.9010', 'lon' => '75.8573'],
                'agra' => ['lat' => '27.1767', 'lon' => '78.0081'],
                'nashik' => ['lat' => '19.9975', 'lon' => '73.7898'],
                'faridabad' => ['lat' => '28.4089', 'lon' => '77.3178'],
                'meerut' => ['lat' => '28.9845', 'lon' => '77.7064'],
                'rajkot' => ['lat' => '22.3039', 'lon' => '70.8022'],
                'kalyan' => ['lat' => '19.2437', 'lon' => '73.1355'],
                'vasai' => ['lat' => '19.4911', 'lon' => '72.8054'],
                'varanasi' => ['lat' => '25.3176', 'lon' => '82.9739'],
                'srinagar' => ['lat' => '34.0837', 'lon' => '74.7973'],
                'aurangabad' => ['lat' => '19.8762', 'lon' => '75.3433'],
                'dhanbad' => ['lat' => '23.7957', 'lon' => '86.4304'],
                'amritsar' => ['lat' => '31.6340', 'lon' => '74.8723'],
                'navi' => ['lat' => '19.0330', 'lon' => '73.0297'],
                'allahabad' => ['lat' => '25.4358', 'lon' => '81.8463'],
                'ranchi' => ['lat' => '23.3441', 'lon' => '85.3096'],
                'howrah' => ['lat' => '22.5958', 'lon' => '88.2636'],
                'coimbatore' => ['lat' => '11.0168', 'lon' => '76.9558'],
                'jabalpur' => ['lat' => '23.1815', 'lon' => '79.9864'],
                'gwalior' => ['lat' => '26.2183', 'lon' => '78.1828'],
                'vijayawada' => ['lat' => '16.5062', 'lon' => '80.6480'],
                'jodhpur' => ['lat' => '26.2389', 'lon' => '73.0243'],
                'madurai' => ['lat' => '9.9252', 'lon' => '78.1198'],
                'raipur' => ['lat' => '21.2514', 'lon' => '81.6296'],
                'kota' => ['lat' => '25.2138', 'lon' => '75.8648']
            ];
            
            $cityKey = strtolower(str_replace([' ', '-'], '', $city));
            $cityKey = preg_replace('/[^a-z]/', '', $cityKey); // Remove non-alphabetic characters
            
            $coords = isset($cityCoordinates[$cityKey]) ? $cityCoordinates[$cityKey] : ['lat' => '20.5937', 'lon' => '78.9629']; // Default to India center
            $story = str_replace('{{CITY_LAT}}', $coords['lat'], $story);
            $story = str_replace('{{CITY_LON}}', $coords['lon'], $story);
            
            // Log to verify replacements worked
            debug_log("TEMPLATE", "Variables replaced successfully for {$city}");
            
            // Verify that the template actually contains unique content now
            if (strpos($story, '{{CITY_NAME}}') !== false || strpos($story, '{{STATE_NAME}}') !== false) {
                debug_log("ERROR", "Template replacement failed for {$city} - placeholders still exist");
                continue;
            }
            
            // Format image paths for each page
            $coverImagePath = formatImagePath($coverImage);
            $trayPriceImagePath = formatImagePath($trayPriceImage);
            $ctaImagePath = formatImagePath($ctaImage);
            
            // Replace image placeholders with correct names from template
            $story = str_replace('{{COVER_BACKGROUND_IMAGE}}', $coverImagePath, $story);
            $story = str_replace('{{TRAY_BACKGROUND_IMAGE}}', $trayPriceImagePath, $story);
            $story = str_replace('{{CTA_BACKGROUND_IMAGE}}', $ctaImagePath, $story);
            
            // Legacy placeholder support (if any old templates still use these)
            $story = str_replace('{{COVER_IMAGE}}', $coverImagePath, $story);
            $story = str_replace('{{TRAY_PRICE_IMAGE}}', $trayPriceImagePath, $story);
            $story = str_replace('{{CTA_IMAGE}}', $ctaImagePath, $story);            // Save web story with unique content verification
            $storyPath = $storiesDir . '/' . $citySlug . '.html';
            debug_log("SAVE", "Saving web story to {$storyPath}");
            
            // Verify the story contains unique city-specific content before saving
            $contentCheck = [
                'city_in_title' => (strpos($story, htmlspecialchars($city, ENT_QUOTES, 'UTF-8')) !== false),
                'rate_in_content' => (strpos($story, number_format((float)$rate, 2)) !== false),
                'unique_slug' => (strpos($story, $citySlug) !== false)
            ];
            
            if (!$contentCheck['city_in_title'] || !$contentCheck['rate_in_content'] || !$contentCheck['unique_slug']) {
                debug_log("ERROR", "Content verification failed for {$city}", $contentCheck);
                continue;
            }
            
            if (file_put_contents($storyPath, $story) === false) {
                debug_log("ERROR", "Failed to save web story for {$city}");
                continue;
            }
            
            // Verify file was actually created and has content
            if (!file_exists($storyPath) || filesize($storyPath) < 1000) {
                debug_log("ERROR", "Web story file for {$city} was not created properly or is too small");
                continue;
            }
            
            $storiesGenerated++;
            debug_log("SUCCESS", "Generated unique web story for {$city} with ₹{$rate} rate");
        }
        
        // Generate an index file for all web stories
        debug_log("INDEX", "Generating index file for {$storiesGenerated} web stories");
        generateWebStoryIndex($storiesDir, $conn);
        
        debug_log("COMPLETE", "Generated {$storiesGenerated} web stories successfully");
        echo "Generated {$storiesGenerated} web stories successfully.<br>";
          // Set flag to prevent connection closure in update_webstory_thumbnails_simple.php
        $suppressConnectionClose = true;

        // Include simplified webstory processing script (no thumbnail generation)
        debug_log("THUMBNAILS", "Including simplified webstory processing script");
        include_once __DIR__ . '/update_webstory_thumbnails_simple.php';

        debug_log("COMPLETE", "Generation process completed");
        // Close connection at the very end
        $conn->close();
        
        // Create new database connection for sitemap
        debug_log("SITEMAP", "Creating new database connection for sitemap");
        require_once dirname(__DIR__) . '/config/db.php';
        
        if (!$conn || $conn->connect_error) {
            throw new Exception("Failed to create new database connection for sitemap: " . ($conn ? $conn->connect_error : "Connection is null"));
        }
        
        // Generate sitemap with new connection
        debug_log("SITEMAP", "Generating sitemap");
        require_once __DIR__ . '/generate_webstories_sitemap.php';
        
        // Success message
        debug_log("SUCCESS", "Web stories generation completed successfully");
        return true;
        
    } else {
        debug_log("ERROR", "No egg rates found in the database");
        echo "No egg rates found in the database. Please check your data.";
        return false;
    }

} catch (Exception $e) {
    // Log any exceptions that occur
    debug_log("ERROR", "Web stories generation error: " . $e->getMessage(), ["trace" => $e->getTraceAsString()]);
    echo "Error generating web stories: " . $e->getMessage();
    return false;
}
?>
