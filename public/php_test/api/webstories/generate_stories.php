<?php
/**
 * API: Generate Web Stories
 * 
 * Generates web stories for all cities with latest egg rates
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../models/WebStory.php';

// Set headers
header('Content-Type: application/json');

try {
    $webStory = new WebStory();
    $result = $webStory->generateWebStories();
    
    if (isset($result['status']) && $result['status'] === 'success') {
        ApiResponse::success([
            'generated' => $result['generated'],
            'skipped' => $result['skipped'],
            'failed' => $result['failed'] ?? 0
        ], 'Web stories generated successfully');
    } else {
        $errorMessage = isset($result['message']) ? $result['message'] : 'Unknown error';
        ApiResponse::error('Failed to generate web stories: ' . $errorMessage);
    }
} catch (Exception $e) {
    ApiResponse::error('Failed to generate web stories: ' . $e->getMessage());
}
