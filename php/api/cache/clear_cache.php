<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once dirname(dirname(dirname(__FILE__))) . '/config/CacheManager.php';

$cacheConfig = require dirname(dirname(dirname(__FILE__))) . '/config/cache_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $cacheManager = new CacheManager($cacheConfig['cache_path']);
    $cacheManager->invalidateAll();
    echo json_encode([
        'success' => true,
        'message' => 'Cache cleared successfully'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to clear cache',
        'message' => $e->getMessage()
    ]);
}
?>
