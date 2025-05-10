<?php
/**
 * API: Generate All Sitemaps
 * 
 * Generates all sitemaps for the website
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/ApiResponse.php';
require_once __DIR__ . '/../../models/WebStory.php';
require_once __DIR__ . '/../../seo/generate_sitemap.php';

// Set headers
header('Content-Type: application/json');

try {
    // Generate main sitemap
    $sitemapGenerator = new SitemapGenerator();
    $mainResult = $sitemapGenerator->generate();
    
    // Generate web stories sitemap
    $webStory = new WebStory();
    $webStoryResult = $webStory->generateSitemap();
    
    // Combine results
    $results = [
        'main_sitemap' => [
            'status' => $mainResult['status'],
            'urls' => $mainResult['urls'],
            'states' => $mainResult['states'],
            'cities' => $mainResult['cities'],
            'webstories' => $mainResult['webstories'],
            'static' => $mainResult['static']
        ],
        'webstories_sitemap' => [
            'status' => $webStoryResult['status'],
            'urls' => $webStoryResult['stories']
        ]
    ];
    
    // Check if both were successful
    if ($mainResult['status'] === 'success' && $webStoryResult['status'] === 'success') {
        ApiResponse::success($results, 'All sitemaps generated successfully');
    } else {
        // Identify which one failed
        if ($mainResult['status'] !== 'success') {
            $error = 'Main sitemap generation failed: ' . ($mainResult['message'] ?? 'Unknown error');
        } else {
            $error = 'Web stories sitemap generation failed: ' . ($webStoryResult['message'] ?? 'Unknown error');
        }
        
        ApiResponse::error($error, null, $results);
    }
} catch (Exception $e) {
    ApiResponse::error('Failed to generate sitemaps: ' . $e->getMessage());
}
