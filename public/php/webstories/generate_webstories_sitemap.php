<?php
// Generate a sitemap specifically for web stories
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(__FILE__)) . '/error.log');

// Helper function for structured debugging - only declare if it doesn't already exist
if (!function_exists('debug_log')) {
    function debug_log($step, $message, $data = null) {
        $log = date('Y-m-d H:i:s') . " [SITEMAP] " . $step . ": " . $message;
        if ($data !== null) {
            $log .= " - " . json_encode($data, JSON_UNESCAPED_SLASHES);
        }
        error_log($log);
    }
}

debug_log("START", "Beginning web stories sitemap generation");

// Configuration paths
$basePath = dirname(dirname(dirname(__FILE__))); // Go up two levels from webstories dir
$storiesDir = $basePath . '/webstories';
$sitemapFile = $basePath . '/webstories-sitemap.xml';

debug_log("CONFIG", "Paths configured", [
    "basePath" => $basePath,
    "storiesDir" => $storiesDir,
    "sitemapFile" => $sitemapFile
]);

// Start the XML sitemap
$sitemap = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
$sitemap .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' . 
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' . 
            'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 ' .
            'http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"' . 
            '>' . "\n";

// Scan the web stories directory
if (file_exists($storiesDir) && is_dir($storiesDir)) {
    debug_log("SCAN", "Scanning web stories directory: {$storiesDir}");
    $files = scandir($storiesDir);
    
    if ($files === false) {
        debug_log("ERROR", "Failed to scan directory: {$storiesDir}");
        echo "Error: Failed to scan the web stories directory.";
        exit(1);
    }
    
    $storyCount = 0;
    
    foreach ($files as $file) {
        // Skip directories and non-HTML files
        if ($file === '.' || $file === '..' || !preg_match('/\.html$/', $file) || $file === 'index.html') {
            continue;
        }
        
        // Get the file's last modification time
        $filePath = $storiesDir . '/' . $file;
        $lastMod = filemtime($filePath);
        
        if ($lastMod === false) {
            debug_log("ERROR", "Failed to get modification time for: {$filePath}");
            $lastMod = time(); // Use current time as fallback
        }
        
        // Format the URL properly with clean URL structure
        $url = 'https://todayeggrates.com/webstories/' . $file;
        $lastModDate = date('c', $lastMod); // ISO 8601 date format (required by Google)
        
        // Add this URL to the sitemap with appropriate change frequency and priority
        $sitemap .= "  <url>\n";
        $sitemap .= "    <loc>" . htmlspecialchars($url) . "</loc>\n";
        $sitemap .= "    <lastmod>" . $lastModDate . "</lastmod>\n";
        $sitemap .= "    <changefreq>daily</changefreq>\n";
        $sitemap .= "    <priority>0.8</priority>\n";
        $sitemap .= "  </url>\n";
        
        $storyCount++;
    }
    
    // Close the sitemap
    $sitemap .= '</urlset>';
    
    // Save the sitemap
    debug_log("SAVE", "Saving sitemap to: {$sitemapFile}");
    $writeResult = file_put_contents($sitemapFile, $sitemap);
    
    if ($writeResult === false) {
        debug_log("ERROR", "Failed to write sitemap file: {$sitemapFile}");
        echo "Error: Failed to save the sitemap file.";
        exit(1);
    }
    
    debug_log("SUCCESS", "Sitemap generated successfully with {$storyCount} web stories");
    echo "Sitemap generated successfully with {$storyCount} web stories.<br>";
    
    // Add reference to this sitemap in the main sitemap index if it exists
    $mainSitemapIndexFile = $basePath . '/sitemap.xml';
    
    if (file_exists($mainSitemapIndexFile)) {
        debug_log("INDEX", "Checking main sitemap index: {$mainSitemapIndexFile}");
        
        $mainSitemapIndex = file_get_contents($mainSitemapIndexFile);
        
        if ($mainSitemapIndex !== false) {
            // Check if webstories sitemap is already included
            if (strpos($mainSitemapIndex, 'webstories-sitemap.xml') === false) {
                debug_log("INDEX", "Adding webstories sitemap to main sitemap index");
                
                // Extract the closing tag
                $indexContent = preg_replace('/<\/sitemapindex>\s*$/', '', $mainSitemapIndex);
                
                // Add our sitemap
                $indexContent .= "  <sitemap>\n";
                $indexContent .= "    <loc>https://todayeggrates.com/webstories-sitemap.xml</loc>\n";
                $indexContent .= "    <lastmod>" . date('c') . "</lastmod>\n";
                $indexContent .= "  </sitemap>\n";
                $indexContent .= "</sitemapindex>\n";
                
                // Save updated sitemap index
                $writeResult = file_put_contents($mainSitemapIndexFile, $indexContent);
                
                if ($writeResult === false) {
                    debug_log("ERROR", "Failed to update main sitemap index");
                    echo "Warning: Failed to update the main sitemap index.<br>";
                } else {
                    debug_log("SUCCESS", "Updated main sitemap index successfully");
                    echo "Updated main sitemap index successfully.<br>";
                }
            } else {
                debug_log("INDEX", "Web stories sitemap already included in main sitemap index");
                echo "Web stories sitemap already included in main sitemap index.<br>";
            }
        } else {
            debug_log("ERROR", "Failed to read main sitemap index");
            echo "Warning: Failed to read the main sitemap index.<br>";
        }
    } else {
        debug_log("INFO", "Main sitemap index not found, skipping integration");
        echo "Note: Main sitemap index not found, skipping integration.<br>";
    }
    
    debug_log("END", "Web stories sitemap generation completed");
} else {
    debug_log("ERROR", "Web stories directory not found: {$storiesDir}");
    echo "Error: Web stories directory not found: {$storiesDir}";
    exit(1);
}
?>
