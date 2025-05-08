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
        // Handle web stories sitemap separately due to database connection issues
        if (strpos($scriptPath, 'generate_webstories_sitemap.php') !== false) {
            // For sitemap generation, include the database configuration
            require_once(dirname(__DIR__) . '/config/db.php');
            $conn = getDbConnection(); // Get a fresh connection
            
            // Set variables needed by the sitemap script
            $generateSitemapOnly = true;
            
            // Use include with @ to suppress fatal errors from stopping execution
            $result = @include($scriptPath);
        } else {
            // Use include with @ to suppress fatal errors from stopping execution
            $result = @include($scriptPath);
        }
        
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

// List of scripts to run in sequence
$scripts = [
    // Data scraping and updates
    ["$baseDir/api/scraper/update_from_e2necc.php", "Update from e2necc"],
    ["$baseDir/api/scraper/daily_update.php", "Daily data update"],
    
    // Database maintenance
    ["$baseDir/database/maintenance/archive_old_data.php", "Archive old data"],
    
    // Web stories generation and maintenance
    ["$baseDir/webstories/generate_web_stories.php", "Generate web stories"],
    ["$baseDir/webstories/update_webstory_thumbnails.php", "Update web story thumbnails"],
    ["$baseDir/webstories/delete_old_webstories.php", "Delete old web stories"],
    
    // SEO tools
    ["$baseDir/seo/generate_sitemap.php", "Generate main sitemap"],
    ["$baseDir/webstories/generate_webstories_sitemap.php", "Generate web stories sitemap"]
];

// Log start of cron run
$date = date('Y-m-d H:i:s');
echo "===============================================\n";
echo "🔄 Starting scheduled tasks run at $date\n";
echo "===============================================\n";
error_log("CRON: Started daily scheduled tasks run at $date");

// Run each script in sequence
foreach ($scripts as [$scriptPath, $taskName]) {
    if (file_exists($scriptPath)) {
        // Even if the script fails, continue with the next script
        $success = runScript($scriptPath, $taskName);
        // Add some delay between tasks to reduce server load
        sleep(10);
    } else {
        echo "❌ Script not found: $scriptPath\n";
        error_log("CRON ERROR: Script not found: $scriptPath");
    }
}

// Log end of cron run
$date = date('Y-m-d H:i:s');
echo "===============================================\n";
echo "✅ Completed scheduled tasks run at $date\n";
echo "===============================================\n";
error_log("CRON: Completed daily scheduled tasks run at $date");