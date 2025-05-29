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

// Helper function to make API calls
function makeApiCall($endpoint, $action, $method = 'GET') {
    $url = "http://localhost/api/$endpoint/index.php?action=$action";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, 1);
    }
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'success' => $httpCode >= 200 && $httpCode < 300,
        'response' => $response,
        'httpCode' => $httpCode
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
error_log("CRON: Started daily scheduled tasks run at $date");

// Run each task in sequence
foreach ($tasks as $task) {
    $endpoint = $task[0];
    $action = $task[1];
    $taskName = $task[2];
    $scriptPath = $task[3] ?? null;
    
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
            echo "❌ Task failed: $taskName (HTTP {$result['httpCode']})\n";
            error_log("CRON ERROR: Failed running $taskName. Response: " . $result['response']);
        } else {
            $endTime = microtime(true);
            $executionTime = round($endTime - $startTime, 2);
            echo "✅ Task completed: $taskName (took {$executionTime}s)\n";
            error_log("CRON SUCCESS: $taskName completed in {$executionTime}s");
        }
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