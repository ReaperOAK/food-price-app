<?php
/**
 * API: Get Web Stories
 * 
 * Returns a list of available web stories
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/ApiResponse.php';
require_once __DIR__ . '/../utils/Cache.php';
require_once __DIR__ . '/../models/WebStory.php';

// Set headers
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get limit parameter if provided
$limit = isset($_GET['limit']) && is_numeric($_GET['limit']) ? (int)$_GET['limit'] : null;

try {
    // Use cache if enabled
    $cacheKey = 'web_stories' . ($limit ? '_limit_' . $limit : '');
    
    $stories = Cache::remember($cacheKey, function() use ($limit) {
        $webStory = new WebStory();
        return $webStory->getWebStories($limit);
    }, 3600); // Cache for 1 hour
    
    ApiResponse::success($stories, 'Web stories retrieved successfully');
} catch (Exception $e) {
    ApiResponse::error('Failed to retrieve web stories: ' . $e->getMessage());
}
