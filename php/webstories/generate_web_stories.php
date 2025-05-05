<?php
// Simple error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(__FILE__)) . '/error.log');

// Helper function for logging
function log_message($message) {
    error_log(date('Y-m-d H:i:s') . " [WEB STORIES] " . $message);
    echo $message . "<br>";
}

// Helper function to format image path
function format_image_path($image) {
    if (strpos($image, '/') === 0) {
        return $image;
    }
    return '/images/webstories/' . $image;
}

// Completely rewrite the AMP story validation function to be more robust
function validate_amp_story($html) {
    // Simple string check for standalone attribute
    if (strpos($html, '<amp-story standalone') === false && strpos($html, '<amp-story ') !== false) {
        $html = str_replace('<amp-story ', '<amp-story standalone ', $html);
        log_message("Added missing standalone attribute to amp-story tag");
    }
    
    // Fix poster-portrait-src attribute if it's missing the proper path
    if (strpos($html, 'poster-portrait-src="/images/webstories/thumbnail-') === false) {
        $html = preg_replace('/(poster-portrait-src=")(?!\/images\/webstories\/thumbnail-)([^"]+)"/', '$1/images/webstories/thumbnail-$2"', $html);
    }

    // Simple count to check if tags are balanced
    $openTags = substr_count($html, '<amp-story');
    $closeTags = substr_count($html, '</amp-story>');
    
    if ($openTags > $closeTags) {
        log_message("Found $openTags opening amp-story tags but only $closeTags closing tags. Adding missing closing tags.");
        // Add missing closing tags
        $html .= str_repeat('</amp-story>', $openTags - $closeTags);
    } else if ($closeTags > $openTags) {
        log_message("Found $closeTags closing amp-story tags but only $openTags opening tags. Removing extra closing tags.");
        // Remove extra closing tags using a simple approach
        $pattern = '/<\/amp-story>/';
        $replacement = '';
        $count = $closeTags - $openTags;
        $html = preg_replace($pattern, $replacement, $html, $count);
    }

    // Use DOMDocument for more advanced cleanup
    $dom = new DOMDocument();
    libxml_use_internal_errors(true); // Suppress warnings for malformed HTML
    $dom->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();
    
    // Make sure amp-story has standalone attribute
    $ampStories = $dom->getElementsByTagName('amp-story');
    if ($ampStories->length > 0) {
        $mainStory = $ampStories->item(0);
        if (!$mainStory->hasAttribute('standalone')) {
            $mainStory->setAttribute('standalone', '');
            log_message("Added standalone attribute via DOM manipulation");
        }
        
        // Remove any nested amp-story elements (which are invalid)
        for ($i = 1; $i < $ampStories->length; $i++) {
            $nestedStory = $ampStories->item($i);
            $nestedStory->parentNode->removeChild($nestedStory);
            log_message("Removed invalid nested amp-story element");
            // Need to decrement because removing changes the NodeList
            $i--;
        }
    }
    
    // Generate clean HTML
    $html = $dom->saveHTML();
    
    return $html;
}

// Clean up a specific string before writing it to a file
function clean_final_output($html) {
    // Remove duplicate opening amp-story tags - safer approach
    $pattern = '/(<amp-story\s+[^>]*standalone[^>]*>).*?(<amp-story\s+[^>]*>)/s';
    while (preg_match($pattern, $html)) {
        $html = preg_replace($pattern, '$1', $html);
    }
    
    // Make sure there's exactly one amp-story opening and closing tag
    $html = preg_replace('/<amp-story\s+[^>]*>(?=.*<amp-story\s)/s', '<!-- removed duplicate amp-story -->', $html);
    
    // Remove any extra closing tags that might be there
    $openTags = substr_count($html, '<amp-story');
    $closeTags = substr_count($html, '</amp-story>');
    if ($openTags == 1 && $closeTags > 1) {
        // Keep just the last closing tag
        $lastPos = strrpos($html, '</amp-story>');
        $html = substr($html, 0, $lastPos) . str_replace('</amp-story>', '', substr($html, 0, $lastPos)) . substr($html, $lastPos);
    }
    
    return $html;
}

try {
    log_message("Starting web stories generation");
    
    // Database connection
    require_once dirname(__DIR__) . '/config/db.php';
    
    // If $conn is not set, create a connection
    if (!isset($conn) || $conn->connect_error) {
        $servername = "localhost";
        $username = "u901337298_test";
        $password = "A12345678b*";
        $dbname = "u901337298_test";
        
        $conn = new mysqli($servername, $username, $password, $dbname);
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
    }
    
    // Set up directories
    $basePath = dirname(dirname(dirname(__FILE__)));
    $storiesDir = $basePath . '/webstories';
    $imageDir = $basePath . '/images/webstories';
    $templateFile = $basePath . '/templates/webstory_template.html';
    
    // Create directories if they don't exist
    foreach ([$storiesDir, $imageDir] as $dir) {
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
    }
    
    // Get background images
    $backgroundImages = [];
    if (is_dir($imageDir)) {
        $files = scandir($imageDir);
        foreach ($files as $file) {
            $extension = pathinfo($file, PATHINFO_EXTENSION);
            if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif']) && $file !== '.' && $file !== '..' && strpos($file, 'thumbnail-') !== 0) {
                $backgroundImages[] = $file;
            }
        }
    }
    
    // Use default image if no images found
    if (empty($backgroundImages)) {
        log_message("No background images found");
        $backgroundImages[] = 'eggpic.png';
    }
    
    // Read template file
    if (!file_exists($templateFile)) {
        throw new Exception("Template file not found at: " . $templateFile);
    }
    
    $template = file_get_contents($templateFile);
    if ($template === false) {
        throw new Exception("Could not read template file: " . $templateFile);
    }
    
    // Verify template has standalone attribute
    if (strpos($template, '<amp-story standalone') === false) {
        log_message("WARNING: Template is missing standalone attribute on amp-story tag!");
    }
    
    // Get egg rates data
    try {
        // First try normalized tables
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
            ORDER BY c.name
        ";
        
        $result = $conn->query($sql);
        
        if (!$result || $result->num_rows === 0) {
            throw new Exception("No results from normalized tables");
        }
    } catch (Exception $e) {
        // Fall back to original table
        log_message("Falling back to original table: " . $e->getMessage());
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
    }
    
    // Generate web stories for each city
    $storiesGenerated = 0;
    
    while ($row = $result->fetch_assoc()) {
        $city = $row['city'];
        $state = $row['state'];
        $rate = $row['rate'];
        $date = $row['date'];
        
        log_message("Processing: " . $city . ", " . $state);
        
        // Skip outdated rates (more than 3 days old)
        if (strtotime($date) < strtotime('-3 days')) {
            log_message("Skipping " . $city . " - rate is too old");
            continue;
        }
        
        // Create URL-friendly city name
        $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
        
        // Select random images for different pages
        shuffle($backgroundImages);
        $coverImage = format_image_path($backgroundImages[0]);
        $trayImage = format_image_path($backgroundImages[1 % count($backgroundImages)]);
        $ctaImage = format_image_path($backgroundImages[2 % count($backgroundImages)]);
        
        // Calculate tray price (30 eggs)
        $trayPrice = number_format($rate * 30, 1);
        
        // Format date for display
        $displayDate = date('F j, Y', strtotime($date));
        
        // Replace placeholders
        $story = $template;
        $story = str_replace('{{CITY_NAME}}', $city, $story);
        $story = str_replace('{{STATE_NAME}}', $state, $story);
        $story = str_replace('{{EGG_RATE}}', $rate, $story);
        $story = str_replace('{{TRAY_PRICE}}', $trayPrice, $story);
        $story = str_replace('{{DATE}}', $displayDate, $story);
        $story = str_replace('{{CITY_SLUG}}', $citySlug, $story);
        $story = str_replace('{{COVER_BACKGROUND_IMAGE}}', $coverImage, $story);
        $story = str_replace('{{TRAY_BACKGROUND_IMAGE}}', $trayImage, $story);
        $story = str_replace('{{CTA_BACKGROUND_IMAGE}}', $ctaImage, $story);
        
        // Run enhanced AMP validation to fix common issues
        $story = validate_amp_story($story);
        
        // Final cleanup before saving
        $story = clean_final_output($story);
        
        // One last check - absolutely ensure standalone attribute is present
        if (strpos($story, '<amp-story standalone') === false) {
            log_message("CRITICAL ERROR: Still missing standalone attribute for {$city}");
            $story = str_replace('<amp-story ', '<amp-story standalone ', $story);
        }
        
        // Save the web story
        $filename = $storiesDir . '/' . $citySlug . '-egg-rate.html';
        $writeResult = file_put_contents($filename, $story);
        
        if ($writeResult !== false) {
            $storiesGenerated++;
            log_message("Web story saved for " . $city);
        } else {
            log_message("Error saving web story for " . $city);
        }
    }
    
    // Generate an index file
    log_message("Generating index file");
    $indexFile = $storiesDir . '/index.html';
    $html = "<!DOCTYPE html><html><head><title>Web Stories Index</title></head><body>";
    $html .= "<h1>Web Stories Index</h1><ul>";
    
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
    
    while ($row = $result->fetch_assoc()) {
        $city = $row['city'];
        $state = $row['state'];
        $rate = $row['rate'];
        $date = $row['date'];
        
        $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $city));
        $html .= "<li><a href='{$citySlug}-egg-rate.html'>{$city}, {$state} - {$rate} ({$date})</a></li>";
    }
    
    $html .= "</ul></body></html>";
    file_put_contents($indexFile, $html);
    
    log_message("Generation complete - created " . $storiesGenerated . " web stories");
    
    // Generate thumbnails
    include_once __DIR__ . '/update_webstory_thumbnails.php';
    
    // Generate sitemap
    include_once __DIR__ . '/generate_webstories_sitemap.php';
    
} catch (Exception $e) {
    log_message("Error: " . $e->getMessage());
}
?>
