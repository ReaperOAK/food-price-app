<?php
/**
 * API: Generate Web Stories Sitemap
 * 
 * Generates a sitemap specifically for web stories
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../models/WebStory.php';

// Set headers
header('Content-Type: application/json');

try {
    $webStory = new WebStory();
    $result = $webStory->generateSitemap();
    
    if ($result['status'] === 'success') {
        ApiResponse::success([
            'count' => $result['stories']
        ], 'Web stories sitemap generated successfully');
    } else {
        ApiResponse::error($result['message'] ?? 'Failed to generate web stories sitemap');
    }
} catch (Exception $e) {
    ApiResponse::error('Failed to generate web stories sitemap: ' . $e->getMessage());
}
