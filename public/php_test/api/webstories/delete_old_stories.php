<?php
/**
 * API: Delete Old Web Stories
 * 
 * Deletes web stories with outdated egg rates
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../models/WebStory.php';

// Set headers
header('Content-Type: application/json');

try {
    $webStory = new WebStory();
    $result = $webStory->deleteOldWebStories();
    
    if (isset($result['status']) && $result['status'] === 'success') {
        ApiResponse::success([
            'deleted' => $result['deleted'],
            'kept' => $result['kept']
        ], 'Old web stories deleted successfully');
    } else {
        $errorMessage = isset($result['message']) ? $result['message'] : 'Unknown error';
        ApiResponse::error('Failed to delete old web stories: ' . $errorMessage);
    }
} catch (Exception $e) {
    ApiResponse::error('Failed to delete old web stories: ' . $e->getMessage());
}
