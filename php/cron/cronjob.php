<?php
// Set error reporting and logging
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/error.log');

// Helper function to make API calls
function makeApiCall($endpoint, $action, $taskName) {
    $startTime = microtime(true);
    echo "Starting task: $taskName...\n";
    
    // Set up environment for API call
    $_GET['action'] = $action;
    $_SERVER['REQUEST_METHOD'] = 'GET';
    
    // Include the API file
    ob_start();
    require_once dirname(__DIR__) . '/api/core/BaseAPI.php';
    $apiFile = dirname(__DIR__) . "/api/$endpoint/index.php";
    
    if (!file_exists($apiFile)) {
        echo "❌ API file not found: $apiFile\n";
        error_log("CRON ERROR: API file not found: $apiFile");
        return false;
    }
    
    include $apiFile;
    $output = ob_get_clean();
    
    $endTime = microtime(true);
    $executionTime = round($endTime - $startTime, 2);
    
    // Check if the output is valid JSON
    $response = json_decode($output, true);
    
    if ($response === null) {
        echo "❌ Task failed: $taskName (took {$executionTime}s)\n";
        error_log("CRON ERROR: Invalid JSON response from $taskName");
        error_log("Output: " . $output);
        return false;
    }
    
    // Check for success
    $success = isset($response['success']) && $response['success'] === true;
    
    if (!$success) {
        echo "❌ Task failed: $taskName (took {$executionTime}s)\n";
        error_log("CRON ERROR: Task failed: $taskName");
        error_log("Output: " . $output);
    } else {
        echo "✅ Task completed: $taskName (took {$executionTime}s)\n";
        error_log("CRON SUCCESS: $taskName completed in {$executionTime}s");
    }
    
    // Add some delay between tasks to reduce server load
    sleep(10);
    
    return $success;
}

// List of tasks to run in sequence
$tasks = [
    // Data scraping and updates
    ['scraper', 'scrape-e2necc', 'Update from e2necc'],
    ['scraper', 'daily-update', 'Daily data update'],
    
    // Database maintenance
    ['maintenance', 'archive', 'Archive old data'],
    
    // Web stories tasks
    ['webstories', 'generate', 'Generate web stories'],
    ['webstories', 'update-thumbnails', 'Update web story thumbnails'],
    ['webstories', 'cleanup', 'Delete old web stories'],
    
    // SEO tools
    ['seo', 'sitemap', 'Generate main sitemap'],
    ['webstories', 'sitemap', 'Generate web stories sitemap']
];

// Log start of cron run
$date = date('Y-m-d H:i:s');
echo "===============================================\n";
echo "🔄 Starting scheduled tasks run at $date\n";
echo "===============================================\n";
error_log("CRON: Started daily scheduled tasks run at $date");

// Run each task in sequence
foreach ($tasks as [$endpoint, $action, $taskName]) {
    makeApiCall($endpoint, $action, $taskName);
}

// Log end of cron run
$date = date('Y-m-d H:i:s');
echo "===============================================\n";
echo "✅ Completed scheduled tasks run at $date\n";
echo "===============================================\n";
error_log("CRON: Completed daily scheduled tasks run at $date");