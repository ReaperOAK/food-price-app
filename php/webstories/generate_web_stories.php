<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(__FILE__)) . '/error.log');

// Helper function for logging
function log_message($message) {
    error_log(date('Y-m-d H:i:s') . " [WEBSTORIES] " . $message);
    echo $message . "<br>";
}

try {
    log_message("Starting web story generation");

    // Database connection
    require_once dirname(__DIR__) . '/config/db.php';
    
    // Set up directories
    $basePath = dirname(dirname(dirname(__FILE__)));
    $templatePath = $basePath . '/templates/webstory_template.html';
    $outputDir = $basePath . '/webstories';
    
    // Create output directory if it doesn't exist
    if (!file_exists($outputDir)) {
        mkdir($outputDir, 0777, true);
        log_message("Created output directory: " . $outputDir);
    }
    
    // Read template file
    if (!file_exists($templatePath)) {
        throw new Exception("Template file not found: " . $templatePath);
    }
    
    $template = file_get_contents($templatePath);
    if ($template === false) {
        throw new Exception("Failed to read template file");
    }
    
    log_message("Template loaded successfully");
    
    // Get the most recent egg rates for each city
    $sql = "
        SELECT er.city, er.state, er.rate, er.date, 
               COALESCE(prev.rate, 0) as previous_rate
        FROM egg_rates er
        INNER JOIN (
            SELECT city, MAX(date) as max_date
            FROM egg_rates
            GROUP BY city
        ) latest ON er.city = latest.city AND er.date = latest.max_date
        LEFT JOIN egg_rates prev ON er.city = prev.city AND prev.date < er.date
        ORDER BY er.city
    ";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Database query failed: " . $conn->error);
    }
    
    $storiesGenerated = 0;
    
    while ($row = $result->fetch_assoc()) {
        $city = $row['city'];
        $state = $row['state'];
        $rate = $row['rate'];
        $date = $row['date'];
        $previousRate = $row['previous_rate'];
        
        // Create URL-friendly city name for file naming
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
        
        // Calculate rate change
        $rateChange = $rate - $previousRate;
        $rateChangePercentage = ($previousRate > 0) ? ($rateChange / $previousRate * 100) : 0;
        $rateChangeText = ($rateChange >= 0) ? "increased by ₹$rateChange" : "decreased by ₹" . abs($rateChange);
        
        if ($previousRate == 0) {
            $rateChangeText = "no previous data available for comparison";
        }
        
        // Format date for display
        $displayDate = date('F j, Y', strtotime($date));
        
        // Replace placeholders in template
        $storyContent = $template;
        $storyContent = str_replace('{{CITY}}', $city, $storyContent);
        $storyContent = str_replace('{{STATE}}', $state, $storyContent);
        $storyContent = str_replace('{{RATE}}', $rate, $storyContent);
        $storyContent = str_replace('{{DATE}}', $displayDate, $storyContent);
        $storyContent = str_replace('{{RATE_CHANGE}}', $rateChangeText, $storyContent);
        $storyContent = str_replace('{{RATE_CHANGE_PERCENTAGE}}', round($rateChangePercentage, 2), $storyContent);
        
        // Determine trend (up or down)
        $trend = ($rateChange > 0) ? 'up' : (($rateChange < 0) ? 'down' : 'stable');
        $storyContent = str_replace('{{TREND}}', $trend, $storyContent);
        
        // Generate file path
        $filePath = $outputDir . '/' . $slug . '.html';
        
        // Write to file
        if (file_put_contents($filePath, $storyContent) === false) {
            log_message("Failed to write story file: " . $filePath);
        } else {
            $storiesGenerated++;
            log_message("Generated story for " . $city . ", " . $state);
        }
    }
    
    log_message("Web story generation complete - created " . $storiesGenerated . " stories");
    
    // Generate thumbnails
    log_message("Generating thumbnails...");
    include_once __DIR__ . '/update_webstory_thumbnails.php';
    
} catch (Exception $e) {
    log_message("Error: " . $e->getMessage());
}
?>
