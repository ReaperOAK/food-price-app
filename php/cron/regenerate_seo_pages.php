<?php
/**
 * Daily cron job to regenerate prerendered pages for SEO
 * This ensures search engines always see up-to-date titles and content
 * 
 * Add to crontab:
 * 0 6 * * * /usr/bin/php /path/to/your/site/public/php/cron/regenerate_seo_pages.php
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../error.log');

// Set execution time limit
set_time_limit(300); // 5 minutes

// Include the SEO page generator
require_once __DIR__ . '/../seo/generate_prerendered_pages.php';

// Log start of operation
$logMessage = "[" . date('Y-m-d H:i:s') . "] Starting daily SEO page regeneration\n";
error_log($logMessage);
echo $logMessage;

try {
    // Get database connection
    $database = new Database();
    $pdo = $database->getConnection();
    
    if (!$pdo) {
        throw new Exception("Database connection failed");
    }
    
    // Clean up old prerendered files first
    $prerenderedDir = __DIR__ . '/../../prerendered';
    if (is_dir($prerenderedDir)) {
        // Remove old files but keep directory structure
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($prerenderedDir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'html') {
                unlink($file->getPathname());
            }
        }
        
        $logMessage = "[" . date('Y-m-d H:i:s') . "] Cleaned up old prerendered files\n";
        error_log($logMessage);
        echo $logMessage;
    }
    
    // Regenerate all pages
    $generator = new SeoPageGenerator($pdo);
    $generatedPages = $generator->generateAllPages();
    
    // Log success
    $logMessage = "[" . date('Y-m-d H:i:s') . "] Successfully regenerated " . count($generatedPages) . " SEO pages\n";
    error_log($logMessage);
    echo $logMessage;
    
    // Also update sitemap to include new pages
    if (file_exists(__DIR__ . '/../seo/generate_sitemap.php')) {
        include __DIR__ . '/../seo/generate_sitemap.php';
        $logMessage = "[" . date('Y-m-d H:i:s') . "] Updated sitemap\n";
        error_log($logMessage);
        echo $logMessage;
    }
    
    // Send notification email (optional)
    $subject = "SEO Pages Regenerated Successfully - " . date('Y-m-d');
    $message = "Daily SEO page regeneration completed successfully.\n\n";
    $message .= "Generated pages: " . count($generatedPages) . "\n";
    $message .= "Timestamp: " . date('Y-m-d H:i:s') . "\n\n";
    $message .= "This should help improve SERP title adoption by providing search engines with static HTML containing proper titles.";
    
    // Uncomment the line below if you want email notifications
    // mail('your-email@domain.com', $subject, $message);
    
} catch (Exception $e) {
    $errorMessage = "[" . date('Y-m-d H:i:s') . "] ERROR in SEO page regeneration: " . $e->getMessage() . "\n";
    error_log($errorMessage);
    echo $errorMessage;
    
    // Send error notification email (optional)
    $subject = "ERROR: SEO Page Regeneration Failed - " . date('Y-m-d');
    $message = "Daily SEO page regeneration failed.\n\n";
    $message .= "Error: " . $e->getMessage() . "\n";
    $message .= "Timestamp: " . date('Y-m-d H:i:s') . "\n\n";
    $message .= "Please check the logs and fix the issue.";
    
    // Uncomment the line below if you want error email notifications
    // mail('your-email@domain.com', $subject, $message);
    
    exit(1);
}

$logMessage = "[" . date('Y-m-d H:i:s') . "] SEO page regeneration completed\n";
error_log($logMessage);
echo $logMessage;
?>
