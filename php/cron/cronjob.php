<?php
// Set error reporting and logging
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/error.log');

// Helper function to run a script and log the result
function runScript($scriptPath, $taskName) {
    $startTime = microtime(true);
    echo "Starting task: $taskName...\n";
    
    // Include the script using output buffering to capture output and errors
    ob_start();
    
    // Use try-catch to prevent script termination on fatal errors
    try {
        // Use include with @ to suppress fatal errors from stopping execution
        $result = @include($scriptPath);
        $output = ob_get_clean();
        
        $endTime = microtime(true);
        $executionTime = round($endTime - $startTime, 2);
        
        if ($result === false) {
            echo "❌ Task failed: $taskName (took {$executionTime}s)\n";
            error_log("CRON ERROR: Failed running $taskName");
            error_log("Output: " . $output);
            return false;
        } else {
            echo "✅ Task completed: $taskName (took {$executionTime}s)\n";
            error_log("CRON SUCCESS: $taskName completed in {$executionTime}s");
            return true;
        }
    } catch (Throwable $e) {
        // Catch any exceptions or errors that might occur
        $output = ob_get_clean();
        $endTime = microtime(true);
        $executionTime = round($endTime - $startTime, 2);
        
        echo "❌ Task failed with exception: $taskName (took {$executionTime}s)\n";
        error_log("CRON ERROR: Exception in $taskName: " . $e->getMessage());
        error_log("Output: " . $output);
        return false;
    }
    
    // In case we didn't return in the try-catch
    $output = ob_get_clean();
    $endTime = microtime(true);
    $executionTime = round($endTime - $startTime, 2);
    echo "⚠️ Task ended abnormally: $taskName (took {$executionTime}s)\n";
    error_log("CRON WARNING: Task ended abnormally: $taskName");
    error_log("Output: " . $output);
    return false;
}

// Base directory
$baseDir = dirname(__DIR__);

// Helper function to make API calls using direct include
function makeApiCall($endpoint, $action) {
    $startTime = microtime(true);
    
    // Include required files
    require_once dirname(__DIR__) . '/api/core/BaseAPI.php';
    $apiFile = dirname(__DIR__) . "/api/$endpoint/index.php";
    
    if (!file_exists($apiFile)) {
        error_log("API file not found: $apiFile");
        return [
            'success' => false,
            'error' => "API endpoint not found: $endpoint"
        ];
    }
    
    // Set up the environment
    $_GET['action'] = $action;
    $_SERVER['REQUEST_METHOD'] = 'GET';
      // Capture output and errors
    ob_start();
    try {
        include $apiFile;
        $output = ob_get_clean();
    } catch (Throwable $e) {
        $output = ob_get_clean();
        error_log("CRON ERROR: Exception in API call: " . $e->getMessage());
        error_log("API Output: " . $output);
        return [
            'success' => false,
            'error' => $e->getMessage(),
            'response' => $output,
            'executionTime' => 0
        ];
    }
    
    $endTime = microtime(true);
    $executionTime = round($endTime - $startTime, 2);    // Try to decode JSON response
    $response = json_decode($output, true);
    
    // Log the raw output for debugging
    error_log("CRON DEBUG: Raw API output for $endpoint/$action: " . $output);
    
    // Check if we have a valid JSON response
    if ($response === null) {
        error_log("API Response is not valid JSON: " . $output);
        return [
            'success' => false,
            'response' => $output,
            'executionTime' => $executionTime,
            'error' => 'Invalid JSON response'
        ];
    }
    
    // Consider it a success if response has success=true or contains expected data
    $isSuccess = (isset($response['success']) && $response['success'] === true) || 
                 (!isset($response['error']) && !empty($response));
    
    if (!$isSuccess) {
        error_log("CRON DEBUG: API call failed. Response: " . json_encode($response));
    }
    
    return [
        'success' => $isSuccess,
        'response' => $output,
        'executionTime' => $executionTime,
        'error' => isset($response['error']) ? $response['error'] : null
    ];
}

// List of tasks to run in sequence
$tasks = [
    // Data scraping and updates
    ['scraper', 'scrape-e2necc', 'Update from e2necc'],
    ['scraper', 'daily-update', 'Daily data update'],
    
    // Database maintenance
    ['maintenance', 'archive', 'Archive old data', "$baseDir/database/maintenance/archive_old_data.php"],
    
    // Web stories tasks
    ['webstories', 'generate', 'Generate web stories'],
    ['webstories', 'update-thumbnails', 'Update web story thumbnails'],
    ['webstories', 'cleanup', 'Delete old web stories'],
    
    // SEO tools
    ['seo', 'sitemap', 'Generate main sitemap', "$baseDir/seo/generate_sitemap.php"],
    ['webstories', 'sitemap', 'Generate web stories sitemap']
];

// Log start of cron run
$date = date('Y-m-d H:i:s');
echo "===============================================\n";
echo "🔄 Starting scheduled tasks run at $date\n";
echo "===============================================\n";
error_log("CRON: Started daily scheduled tasks run at $date");    // Run each task in sequence
foreach ($tasks as $index => $task) {
    $endpoint = $task[0];
    $action = $task[1];
    $taskName = $task[2];
    $scriptPath = $task[3] ?? null;
    
    error_log("CRON DEBUG: Starting task {$index} of " . count($tasks) . ": $taskName");
    
    $startTime = microtime(true);
    echo "Starting task: $taskName...\n";
      if ($scriptPath) {
        // For tasks that still need direct file inclusion
        if (file_exists($scriptPath)) {
            $success = runScript($scriptPath, $taskName);
        } else {
            echo "❌ Script not found: $scriptPath\n";
            error_log("CRON ERROR: Script not found: $scriptPath");
            continue;
        }
    } else {
        // For API endpoint tasks
        $result = makeApiCall($endpoint, $action);
        $success = $result['success'];
        
    if (!$success) {
            echo "❌ Task failed: $taskName\n";
            error_log("CRON ERROR: Failed running $taskName. Response: " . $result['response']);
            if (isset($result['error'])) {
                error_log("CRON ERROR: " . $result['error']);
            }
            // Don't stop on failure, continue with next task
        } else {
            echo "✅ Task completed: $taskName (took {$result['executionTime']}s)\n";
            error_log("CRON SUCCESS: $taskName completed in {$result['executionTime']}s");
        }
        
        // Always continue to next task regardless of success/failure
        continue;
    }
    
    // Add some delay between tasks to reduce server load
    sleep(10);
}

// Log end of cron run
$date = date('Y-m-d H:i:s');
echo "===============================================\n";
echo "✅ Completed scheduled tasks run at $date\n";
echo "===============================================\n";
error_log("CRON: Completed daily scheduled tasks run at $date");