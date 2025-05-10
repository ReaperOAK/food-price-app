<?php
/**
 * Daily Update Executable
 * 
 * This script runs all daily update tasks in the correct order:
 * 1. Update egg rates from e2necc.com
 * 2. Update any remaining cities with state averages
 * 3. Generate web stories
 * 4. Update web story thumbnails
 * 5. Delete old web stories
 * 6. Update web stories sitemap
 * 7. Update main sitemap
 * 8. Archive old data
 * 
 * Run this script once daily via cron job.
 * Example cron entry:
 * 0 6 * * * php /path/to/php_test/daily_update.php >> /path/to/update.log 2>&1
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/utils/Logger.php';

// Set script execution time to unlimited
set_time_limit(0);

// Initialize logger
$logger = Logger::getInstance();
$logger->info('Starting daily update process', 'DailyUpdate');

$startTime = microtime(true);
$results = [];

// Helper function to execute a task with proper error handling
function runTask($name, $callback) {
    global $logger, $results;
    
    $taskStartTime = microtime(true);
    $logger->info("Starting task: $name", 'DailyUpdate');
    
    try {
        $result = $callback();
        $executionTime = microtime(true) - $taskStartTime;
        
        $logger->info("Completed task: $name in " . round($executionTime, 2) . " seconds", 'DailyUpdate');
        
        $result['execution_time'] = round($executionTime, 2);
        $results[$name] = $result;
        
        return $result;
    } catch (Exception $e) {
        $executionTime = microtime(true) - $taskStartTime;
        $logger->error("Task failed: $name in " . round($executionTime, 2) . " seconds - " . $e->getMessage(), 'DailyUpdate');
        
        $results[$name] = [
            'status' => 'error',
            'message' => $e->getMessage(),
            'execution_time' => round($executionTime, 2)
        ];
        
        return $results[$name];
    }
}

// 1. Update egg rates from e2necc.com
$e2neccResult = runTask('e2necc_update', function() {
    require_once __DIR__ . '/api/scraper/update_from_e2necc.php';
    $updater = new E2NeccUpdater();
    return $updater->update();
});

// 2. Update any remaining cities with state averages
$dailyUpdateResult = runTask('daily_update', function() use ($e2neccResult) {
    require_once __DIR__ . '/api/scraper/daily_update.php';
    $updatedCities = isset($e2neccResult['updated_cities']) ? $e2neccResult['updated_cities'] : [];
    $updater = new DailyUpdater();
    return $updater->update($updatedCities);
});

// 3. Generate web stories
$webStoriesResult = runTask('generate_web_stories', function() {
    require_once __DIR__ . '/models/WebStory.php';
    $webStory = new WebStory();
    return $webStory->generateWebStories();
});

// 4. Update web story thumbnails
$thumbnailsResult = runTask('update_thumbnails', function() {
    require_once __DIR__ . '/models/WebStory.php';
    $webStory = new WebStory();
    return $webStory->updateWebStoryThumbnails();
});

// 5. Delete old web stories
$deleteStoriesResult = runTask('delete_old_stories', function() {
    require_once __DIR__ . '/models/WebStory.php';
    $webStory = new WebStory();
    return $webStory->deleteOldWebStories();
});

// 6. Update web stories sitemap
$webstorySitemapResult = runTask('generate_webstories_sitemap', function() {
    require_once __DIR__ . '/models/WebStory.php';
    $webStory = new WebStory();
    return $webStory->generateSitemap();
});

// 7. Update main sitemap
$mainSitemapResult = runTask('generate_main_sitemap', function() {
    require_once __DIR__ . '/seo/generate_sitemap.php';
    $sitemapGenerator = new SitemapGenerator();
    return $sitemapGenerator->generate();
});

// 8. Archive old data
$archiveResult = runTask('archive_old_data', function() {
    require_once __DIR__ . '/database/maintenance/archive_old_data.php';
    $archiver = new DataArchiver();
    return $archiver->archive();
});

// Calculate total execution time
$totalExecutionTime = microtime(true) - $startTime;
$logger->info('Daily update process completed in ' . round($totalExecutionTime, 2) . ' seconds', 'DailyUpdate');

// Determine overall status
$hasErrors = false;
foreach ($results as $taskResult) {
    if (isset($taskResult['status']) && $taskResult['status'] === 'error') {
        $hasErrors = true;
        break;
    }
}

// Output results
$output = [
    'status' => $hasErrors ? 'completed_with_errors' : 'success',
    'execution_time' => round($totalExecutionTime, 2),
    'tasks' => $results
];

echo json_encode($output, JSON_PRETTY_PRINT);
