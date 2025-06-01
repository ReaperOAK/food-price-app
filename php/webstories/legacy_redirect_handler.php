<?php
/**
 * Legacy Web Stories URL Redirect Handler
 * 
 * This script handles redirects for legacy web story URLs that are causing 404 errors.
 * It maps old URL patterns (city-statecode--egg-rate.html) to new ones (city-egg-rate)
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Function to extract city name from legacy URL
function extractCityFromLegacyUrl($requestUri) {
    // Pattern: /webstories/city-statecode--egg-rate.html
    if (preg_match('#/webstories/([a-z0-9-]+)-[a-z]{2}--egg-rate\.html$#i', $requestUri, $matches)) {
        return $matches[1];
    }
    
    // Pattern: /webstories/city--egg-rate.html (double hyphen, no state code)
    if (preg_match('#/webstories/([a-z0-9-]+)--egg-rate\.html$#i', $requestUri, $matches)) {
        return $matches[1];
    }
    
    // Handle direct file access patterns
    if (preg_match('#([a-z0-9-]+)-[a-z]{2}--egg-rate\.html$#i', $requestUri, $matches)) {
        return $matches[1];
    }
    
    if (preg_match('#([a-z0-9-]+)--egg-rate\.html$#i', $requestUri, $matches)) {
        return $matches[1];
    }
    
    return null;
}

// Function to check if a web story exists
function webStoryExists($slug) {
    $storiesDir = dirname(dirname(dirname(__FILE__))) . '/webstories';
    $storyFile = $storiesDir . '/' . $slug . '-egg-rate.html';
    return file_exists($storyFile);
}

// Main redirect logic
function handleLegacyRedirect($requestUri) {
    $citySlug = extractCityFromLegacyUrl($requestUri);
    
    if (!$citySlug) {
        return false; // Not a legacy URL we can handle
    }
    
    // Check if the corrected web story exists
    if (webStoryExists($citySlug)) {
        $newUrl = '/webstory/' . $citySlug . '-egg-rate';
        
        // Perform 301 redirect
        header("HTTP/1.1 301 Moved Permanently");
        header("Location: " . $newUrl);
        header("Cache-Control: max-age=3600"); // Cache for 1 hour
        
        // Log the redirect for monitoring
        error_log("Legacy web story redirect: {$requestUri} -> {$newUrl}");
        
        exit();
    }
    
    return false; // Story doesn't exist
}

// Auto-execute if this file is called directly
if (basename($_SERVER['SCRIPT_NAME']) === basename(__FILE__)) {
    $requestUri = $_SERVER['REQUEST_URI'] ?? '';
    
    if (!handleLegacyRedirect($requestUri)) {
        // If we can't handle the redirect, return 404
        header("HTTP/1.1 404 Not Found");
        echo "Web story not found";
        exit();
    }
}
?>
