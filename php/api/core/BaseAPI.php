<?php

class BaseAPI {
    protected $db;
    protected $cache;

    public function __construct() {
        require_once __DIR__ . '/Database.php';
        require_once __DIR__ . '/../../config/CacheManager.php';
        
        $this->db = Database::getInstance()->getConnection();
        $this->cache = new CacheManager();
    }

    protected function sendResponse($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        header('Cache-Control: no-cache, must-revalidate');
        echo json_encode($data);
        exit;
    }

    protected function sendError($message, $status = 400) {
        $this->sendResponse(['error' => $message], $status);
    }

    protected function getJsonInput() {
        return json_decode(file_get_contents('php://input'), true);
    }

    protected function validateRequiredParams($params, $required) {
        foreach ($required as $param) {
            if (!isset($params[$param]) || empty($params[$param])) {
                $this->sendError("Missing required parameter: {$param}");
            }
        }
    }

    protected function getCacheKey($prefix, $params = []) {
        return $prefix . '_' . md5(serialize($params));
    }
}
