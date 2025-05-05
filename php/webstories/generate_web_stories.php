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

// Fixed validation function that will work properly with DOM
function validate_amp_story($html) {
    // First, fix common issues with a simple find & replace before DOM parsing
    if (strpos($html, '<amp-story standalone') === false && strpos($html, '<amp-story') !== false) {
        $html = preg_replace('/<amp-story(\s+|>)/', '<amp-story standalone$1', $html, 1);
        log_message("Added missing standalone attribute");
    }
    
    // Count amp-story tags before DOM parsing (for debugging)
    $openTagsCount = substr_count($html, '<amp-story');
    $closeTagsCount = substr_count($html, '</amp-story>');
    if ($openTagsCount != 1 || $closeTagsCount != 1) {
        log_message("Before DOM fix: Found $openTagsCount opening tags and $closeTagsCount closing tags");
    }

    // Use a simple regex approach first to clean up obviously duplicated amp-story tags
    $pattern = '/(<amp-story\s+[^>]*>)(?=.*<amp-story\s)/';
    $html = preg_replace($pattern, '<!-- removed duplicate amp-story tag -->', $html);
    
    // Load HTML into DOMDocument with error suppression
    $dom = new DOMDocument('1.0', 'UTF-8');
    $dom->formatOutput = true;
    libxml_use_internal_errors(true); // Suppress warnings
    
    // Use loadHTML with options to avoid adding doctype and html/body tags
    $dom->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();
    
    // Find all amp-story elements
    $ampStories = $dom->getElementsByTagName('amp-story');
    
    // If there are multiple amp-story elements (which is invalid), keep only the first one
    if ($ampStories->length > 1) {
        log_message("DOM found {$ampStories->length} amp-story elements, fixing...");
        
        // Keep only the first amp-story element
        $mainStory = $ampStories->item(0);
        
        // Get all children from other amp-story elements and move them to the first one
        for ($i = 1; $i < $ampStories->length; $i++) {
            $extraStory = $ampStories->item($i);
            
            // Move all children to the main story
            while ($extraStory->childNodes->length > 0) {
                $child = $extraStory->childNodes->item(0);
                $extraStory->removeChild($child);
                $mainStory->appendChild($child);
            }
            
            // Remove the extra amp-story element
            $extraStory->parentNode->removeChild($extraStory);
            
            // Need to get elements again as the DOM has changed
            $ampStories = $dom->getElementsByTagName('amp-story');
            $i--;
        }
    }
    
    // Ensure the main amp-story element has the standalone attribute
    if ($ampStories->length > 0) {
        $mainStory = $ampStories->item(0);
        if (!$mainStory->hasAttribute('standalone')) {
            $mainStory->setAttribute('standalone', '');
            log_message("Added standalone attribute via DOM");
        }
    } else {
        log_message("ERROR: No amp-story element found!");
    }
    
    // Convert the DOM back to HTML
    $cleanedHtml = $dom->saveHTML();
    
    // Final regex cleanup - one last check to ensure correct tags
    $cleanedHtml = preg_replace('/<amp-story(?!\s+standalone)/', '<amp-story standalone ', $cleanedHtml);
    
    return $cleanedHtml;
}

// Simple function to directly fix the HTML string without DOM manipulation
function direct_fix_amp_story($html) {
    // Step 1: Remove all but the first opening amp-story tag
    $firstPos = strpos($html, '<amp-story');
    if ($firstPos !== false) {
        $beforeTag = substr($html, 0, $firstPos);
        $afterTag = substr($html, $firstPos);
        
        // Replace all additional amp-story opening tags
        $afterTag = preg_replace('/<amp-story(?![^>]*standalone)([^>]*)>/', '<amp-story standalone$1>', $afterTag, 1);
        $afterTag = preg_replace('/<amp-story[^>]*>/', '<!-- removed -->', $afterTag, -1, $count, PREG_OFFSET_CAPTURE);
        if ($count > 0) {
            log_message("Removed $count duplicate amp-story tags");
        }
        
        $html = $beforeTag . $afterTag;
    }
    
    // Step 2: Ensure there's exactly one closing amp-story tag at the end
    $html = preg_replace('/<\/amp-story>/', '', $html);
    $html = $html . '</amp-story>';
    
    return $html;
}

try {
    log_message("Starting web stories generation");
    
    // Database connection
    require_once dirname(__DIR__) . '/config/db.php';
    
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
    
    // Verify template is valid before starting
    if (strpos($template, '<amp-story standalone') === false) {
        log_message("WARNING: Template is missing standalone attribute on amp-story tag! Adding it now.");
        $template = preg_replace('/<amp-story(\s+|>)/', '<amp-story standalone$1', $template, 1);
    }
    
    // Pre-check the template for proper tag structure
    $openTags = substr_count($template, '<amp-story');
    $closeTags = substr_count($template, '</amp-story>');
    if ($openTags != 1 || $closeTags != 1) {
        log_message("Template has $openTags opening amp-story tags and $closeTags closing tags. Fixing...");
        $template = validate_amp_story($template);
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
        
        // Apply a much simpler direct fix that works reliably
        $story = direct_fix_amp_story($story);
        
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
