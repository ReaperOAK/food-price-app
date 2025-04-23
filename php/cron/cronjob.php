<?php
// Set error reporting and logging
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/error.log');

// Helper function to run a script and log the result
function runScript($scriptPath, $taskName) {
    $startTime = microtime(true);
    echo "Starting task: $taskName...\n";
    
    // Include the script
    ob_start();
    $result = include($scriptPath);
    $output = ob_get_clean();
    
    $endTime = microtime(true);
    $executionTime = round($endTime - $startTime, 2);
    
    // Log the result
    if ($result === false) {
        echo "❌ Task failed: $taskName (took {$executionTime}s)\n";
        error_log("CRON ERROR: Failed running $taskName");
        error_log("Output: " . $output);
    } else {
        echo "✅ Task completed: $taskName (took {$executionTime}s)\n";
        error_log("CRON SUCCESS: $taskName completed in {$executionTime}s");
    }
    
    // Add some delay between tasks to reduce server load
    sleep(10);
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
        runScript($scriptPath, $taskName);
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