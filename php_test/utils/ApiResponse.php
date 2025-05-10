<?php
/**
 * API Response Utility Class
 * 
 * This class handles consistent API response formatting
 */

class ApiResponse {
    /**
     * Send a successful JSON response
     * 
     * @param mixed $data The data to include in the response
     * @param string $message Optional message
     * @param int $statusCode HTTP status code
     * @return never Exits script after sending response
     */
    public static function success($data, $message = 'Success', $statusCode = 200) {
        self::setHeaders($statusCode);
        
        $response = [
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ];
        
        echo json_encode($response);
        exit;
    }
    
    /**
     * Send an error JSON response
     * 
     * @param string $message Error message
     * @param int $statusCode HTTP status code
     * @param mixed $errors Optional additional error details
     * @return never Exits script after sending response
     */
    public static function error($message, $statusCode = 400, $errors = null) {
        self::setHeaders($statusCode);
        
        $response = [
            'status' => 'error',
            'message' => $message
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        echo json_encode($response);
        exit;
    }
    
    /**
     * Set HTTP headers including CORS if enabled
     * 
     * @param int $statusCode HTTP status code
     * @return void
     */
    private static function setHeaders($statusCode) {
        // Set content type
        header('Content-Type: application/json');
        
        // Set status code
        http_response_code($statusCode);
        
        // Handle CORS if enabled
        if (defined('ENABLE_CORS') && ENABLE_CORS) {
            $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
            
            // Check if origin is allowed
            $allowedOrigins = defined('ALLOWED_ORIGINS') ? ALLOWED_ORIGINS : ['*'];
            
            if ($allowedOrigins[0] === '*') {
                header('Access-Control-Allow-Origin: *');
            } elseif (in_array($origin, $allowedOrigins)) {
                header('Access-Control-Allow-Origin: ' . $origin);
            }
            
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            header('Access-Control-Max-Age: 86400'); // 24 hours cache
            
            // Handle preflight OPTIONS request
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                exit(0);
            }
        }
    }
}
