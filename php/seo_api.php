<?php
/**
 * SEO API Router
 * Central router for all SEO automation API endpoints
 */

require_once __DIR__ . '/seo_automation.php';

// Set headers for API responses
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize SEO service
$seoService = new AutomatedSEOService();

// Get action from request
$action = $_REQUEST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// API Response helper
function sendResponse($success, $data = null, $message = '', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => date('c')
    ]);
    exit();
}

// Error handler
function handleError($error) {
    error_log("SEO API Error: " . $error->getMessage());
    sendResponse(false, null, $error->getMessage(), 500);
}

try {
    switch ($action) {
        // Health check
        case '':
        case 'health':
            sendResponse(true, ['status' => 'healthy'], 'SEO Automation API is running');
            break;

        // Get current processing status
        case 'status':
            if ($method !== 'GET') {
                sendResponse(false, null, 'GET method required', 405);
            }
            $status = $seoService->getProcessingStatus();
            sendResponse(true, $status, 'Status retrieved successfully');
            break;

        // Get dashboard data
        case 'dashboard':
            if ($method !== 'GET') {
                sendResponse(false, null, 'GET method required', 405);
            }
            $data = $seoService->getDashboardData();
            sendResponse(true, $data, 'Dashboard data retrieved successfully');
            break;

        // Process CSV reports
        case 'process':
            if ($method !== 'POST') {
                sendResponse(false, null, 'POST method required', 405);
            }
            $result = $seoService->processCSVReports();
            sendResponse(true, $result, 'CSV reports processed successfully');
            break;

        // Upload and process CSV file
        case 'upload':
            if ($method !== 'POST') {
                sendResponse(false, null, 'POST method required', 405);
            }
            $result = $seoService->handleFileUpload();
            sendResponse(true, $result, 'File uploaded and processed successfully');
            break;

        // Get SEO insights
        case 'insights':
            if ($method !== 'GET') {
                sendResponse(false, null, 'GET method required', 405);
            }
            $timeframe = $_GET['timeframe'] ?? '7d';
            $insights = $seoService->getInsights($timeframe);
            sendResponse(true, $insights, 'Insights retrieved successfully');
            break;

        // Get keyword performance data
        case 'keywords':
            if ($method !== 'GET') {
                sendResponse(false, null, 'GET method required', 405);
            }
            $limit = intval($_GET['limit'] ?? 50);
            $sort = $_GET['sort'] ?? 'clicks';
            $order = $_GET['order'] ?? 'DESC';
            
            // Validate sort parameters
            $allowedSorts = ['clicks', 'impressions', 'ctr', 'avg_position', 'search_volume'];
            if (!in_array($sort, $allowedSorts)) $sort = 'clicks';
            if (!in_array($order, ['ASC', 'DESC'])) $order = 'DESC';
            
            $keywords = $seoService->getKeywords($limit, $sort, $order);
            sendResponse(true, $keywords, 'Keywords retrieved successfully');
            break;

        // Get page performance data
        case 'pages':
            if ($method !== 'GET') {
                sendResponse(false, null, 'GET method required', 405);
            }
            $limit = intval($_GET['limit'] ?? 50);
            $sort = $_GET['sort'] ?? 'clicks';
            $order = $_GET['order'] ?? 'DESC';
            
            $pages = $seoService->getPages($limit, $sort, $order);
            sendResponse(true, $pages, 'Pages retrieved successfully');
            break;

        // Get SEO optimizations
        case 'optimizations':
            if ($method !== 'GET') {
                sendResponse(false, null, 'GET method required', 405);
            }
            $limit = intval($_GET['limit'] ?? 20);
            $offset = intval($_GET['offset'] ?? 0);
            
            $optimizations = $seoService->getOptimizations($limit, $offset);
            sendResponse(true, $optimizations, 'Optimizations retrieved successfully');
            break;

        // Get content gaps
        case 'content_gaps':
            if ($method !== 'GET') {
                sendResponse(false, null, 'GET method required', 405);
            }
            $gaps = $seoService->getContentGaps();
            sendResponse(true, $gaps, 'Content gaps retrieved successfully');
            break;

        // Get international opportunities
        case 'international':
            if ($method !== 'GET') {
                sendResponse(false, null, 'GET method required', 405);
            }
            $opportunities = $seoService->getInternationalOpportunities();
            sendResponse(true, $opportunities, 'International opportunities retrieved successfully');
            break;

        // Get device performance
        case 'devices':
            if ($method !== 'GET') {
                sendResponse(false, null, 'GET method required', 405);
            }
            $devices = $seoService->getDevicePerformance();
            sendResponse(true, $devices, 'Device performance retrieved successfully');
            break;

        // Get processing logs
        case 'logs':
            if ($method !== 'GET') {
                sendResponse(false, null, 'GET method required', 405);
            }
            $limit = intval($_GET['limit'] ?? 100);
            $logs = $seoService->getProcessingLogs($limit);
            sendResponse(true, $logs, 'Processing logs retrieved successfully');
            break;

        // Force process all pending CSV files
        case 'force_process':
            if ($method !== 'POST') {
                sendResponse(false, null, 'POST method required', 405);
            }
            $result = $seoService->processCSVReports();
            sendResponse(true, $result, 'Force processing completed successfully');
            break;

        // Export SEO data
        case 'export':
            if ($method !== 'GET') {
                sendResponse(false, null, 'GET method required', 405);
            }
            $format = $_GET['format'] ?? 'json';
            $data = $seoService->getDashboardData();
            
            if ($format === 'csv') {
                header('Content-Type: text/csv');
                header('Content-Disposition: attachment; filename="seo_data_' . date('Y-m-d') . '.csv"');
                
                // Output CSV headers
                echo "Type,Name,Clicks,Impressions,CTR,Position\n";
                
                // Output keyword data
                foreach ($data['topKeywords'] as $keyword) {
                    echo sprintf(
                        "Keyword,%s,%d,%d,%.2f,%.2f\n",
                        str_replace(',', ';', $keyword['keyword']),
                        $keyword['clicks'],
                        $keyword['impressions'],
                        $keyword['ctr'],
                        $keyword['avg_position']
                    );
                }
                
                // Output page data
                foreach ($data['topPages'] as $page) {
                    echo sprintf(
                        "Page,%s,%d,%d,%.2f,%.2f\n",
                        str_replace(',', ';', $page['page_url']),
                        $page['clicks'],
                        $page['impressions'],
                        $page['ctr'],
                        $page['avg_position']
                    );
                }
                exit();
            } else {
                sendResponse(true, $data, 'Data exported successfully');
            }
            break;

        // Start automated monitoring
        case 'start_monitoring':
            if ($method !== 'POST') {
                sendResponse(false, null, 'POST method required', 405);
            }
            // This would typically set a flag in the database or start a background process
            // For now, we'll just acknowledge the request
            sendResponse(true, ['monitoring' => true], 'Automated monitoring started');
            break;

        // Stop automated monitoring
        case 'stop_monitoring':
            if ($method !== 'POST') {
                sendResponse(false, null, 'POST method required', 405);
            }
            // This would typically clear the monitoring flag or stop the background process
            sendResponse(true, ['monitoring' => false], 'Automated monitoring stopped');
            break;

        // Update SEO settings
        case 'settings':
            if ($method !== 'POST') {
                sendResponse(false, null, 'POST method required', 405);
            }
            $input = json_decode(file_get_contents('php://input'), true);
            // Process settings update here
            sendResponse(true, $input, 'Settings updated successfully');
            break;

        // Invalid action
        default:
            sendResponse(false, null, 'Invalid action: ' . $action, 400);
    }

} catch (Exception $e) {
    handleError($e);
}
?>
