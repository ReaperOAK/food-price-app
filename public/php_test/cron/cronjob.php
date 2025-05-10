<?php
/**
 * Cron Job Controller
 * 
 * Centralized script for running all scheduled tasks
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../api/scraper/update_from_e2necc.php';
require_once __DIR__ . '/../api/scraper/daily_update.php';
require_once __DIR__ . '/../database/maintenance/archive_old_data.php';
require_once __DIR__ . '/../models/WebStory.php';

class CronJobController {
    private $logger;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->logger = Logger::getInstance();
    }
    
    /**
     * Run all scheduled tasks
     * 
     * @return array Result statistics
     */
    public function run() {
        $startTime = microtime(true);
        $this->logger->info("Starting cronjob execution", "CronJob");
        
        $result = [
            'status' => 'success',
            'tasks' => []
        ];
        
        try {
            // 1. Update egg rates from e2necc
            $result['tasks']['e2necc_update'] = $this->runTask(function() {
                $updater = new E2NeccUpdater();
                return $updater->update();
            }, "e2necc data update");
            
            // Get updated cities
            $updatedCities = isset($result['tasks']['e2necc_update']['updated_cities']) ? 
                $result['tasks']['e2necc_update']['updated_cities'] : [];
            
            // 2. Run daily data update for remaining cities
            $result['tasks']['daily_update'] = $this->runTask(function() use ($updatedCities) {
                $updater = new DailyUpdater();
                return $updater->update($updatedCities);
            }, "daily data update");
            
            // 3. Archive old data
            $result['tasks']['archive_data'] = $this->runTask(function() {
                $archiver = new DataArchiver();
                return $archiver->archive();
            }, "archiving old data");
            
            // 4. Generate web stories
            $result['tasks']['generate_web_stories'] = $this->runTask(function() {
                $webStory = new WebStory();
                return $webStory->generateWebStories();
            }, "generating web stories");
            
            // 5. Update web story thumbnails
            $result['tasks']['update_thumbnails'] = $this->runTask(function() {
                $webStory = new WebStory();
                return $webStory->updateWebStoryThumbnails();
            }, "updating thumbnails");
            
            // 6. Delete old web stories
            $result['tasks']['delete_old_web_stories'] = $this->runTask(function() {
                $webStory = new WebStory();
                return $webStory->deleteOldWebStories();
            }, "deleting old web stories");
            
            // 7. Generate web stories sitemap
            $result['tasks']['generate_web_stories_sitemap'] = $this->runTask(function() {
                $webStory = new WebStory();
                return $webStory->generateSitemap();
            }, "generating web stories sitemap");
            
            // 8. Generate main sitemap
            $result['tasks']['generate_sitemap'] = $this->runTask(function() {
                require_once __DIR__ . '/../seo/generate_sitemap.php';
                $sitemapGenerator = new SitemapGenerator();
                return $sitemapGenerator->generate();
            }, "generating main sitemap");
            
        } catch (Exception $e) {
            $this->logger->error("Cronjob execution failed: " . $e->getMessage(), "CronJob");
            $result['status'] = 'error';
            $result['message'] = $e->getMessage();
        }
        
        $executionTime = microtime(true) - $startTime;
        $result['execution_time'] = round($executionTime, 2) . " seconds";
        
        $this->logger->info("Cronjob execution completed in " . $result['execution_time'], "CronJob");
        
        return $result;
    }
    
    /**
     * Run a task with timing and error handling
     * 
     * @param callable $task The task to run
     * @param string $description Task description for logging
     * @return array Task result
     */
    private function runTask($task, $description) {
        $taskStartTime = microtime(true);
        $this->logger->info("Starting $description", "CronJob");
        
        try {
            $result = $task();
            $executionTime = microtime(true) - $taskStartTime;
            
            $this->logger->info(
                "Completed $description in " . round($executionTime, 2) . " seconds", 
                "CronJob"
            );
            
            if (is_array($result)) {
                $result['execution_time'] = round($executionTime, 2) . " seconds";
            }
            
            return $result;
        } catch (Exception $e) {
            $executionTime = microtime(true) - $taskStartTime;
            $this->logger->error(
                "Failed $description in " . round($executionTime, 2) . " seconds: " . $e->getMessage(), 
                "CronJob"
            );
            
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'execution_time' => round($executionTime, 2) . " seconds"
            ];
        }
    }
}

// Execute cronjob if this script is called directly
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    // Check if output format is specified
    $outputFormat = isset($_GET['format']) ? strtolower($_GET['format']) : 'json';
    
    try {
        $cronController = new CronJobController();
        $result = $cronController->run();
        
        if ($outputFormat === 'text') {
            header('Content-Type: text/plain');
            echo "Cronjob Execution Report\n";
            echo "======================\n\n";
            echo "Status: {$result['status']}\n";
            echo "Total Execution Time: {$result['execution_time']}\n\n";
            
            foreach ($result['tasks'] as $taskName => $taskResult) {
                echo strtoupper(str_replace('_', ' ', $taskName)) . "\n";
                echo str_repeat('-', strlen($taskName)) . "\n";
                
                if (isset($taskResult['status'])) {
                    echo "Status: {$taskResult['status']}\n";
                }
                
                if (isset($taskResult['execution_time'])) {
                    echo "Execution Time: {$taskResult['execution_time']}\n";
                }
                
                if (isset($taskResult['message'])) {
                    echo "Message: {$taskResult['message']}\n";
                }
                
                echo "\n";
            }
        } else {
            // Default to JSON output
            header('Content-Type: application/json');
            echo json_encode($result, JSON_PRETTY_PRINT);
        }
    } catch (Exception $e) {
        if ($outputFormat === 'text') {
            header('Content-Type: text/plain');
            echo "Cronjob Execution Failed\n";
            echo "=======================\n\n";
            echo "Error: " . $e->getMessage() . "\n";
        } else {
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'error',
                'message' => 'Cronjob execution failed: ' . $e->getMessage()
            ]);
        }
    }
}
