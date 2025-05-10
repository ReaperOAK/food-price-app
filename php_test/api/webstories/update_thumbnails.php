<?php
/**
 * API: Update Web Story Thumbnails
 * 
 * Updates thumbnails for all web stories
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../models/WebStory.php';

// Set headers
header('Content-Type: application/json');

try {
    $webStory = new WebStory();
    $result = $webStory->updateWebStoryThumbnails();
    
    if (isset($result['status']) && $result['status'] === 'success') {
        ApiResponse::success([
            'generated' => $result['generated'],
            'skipped' => $result['skipped'],
            'failed' => $result['failed'] ?? 0
        ], 'Web story thumbnails updated successfully');
    } else {
        $errorMessage = isset($result['message']) ? $result['message'] : 'Unknown error';
        ApiResponse::error('Failed to update web story thumbnails: ' . $errorMessage);
    }
} catch (Exception $e) {
    ApiResponse::error('Failed to update web story thumbnails: ' . $e->getMessage());
}
