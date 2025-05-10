<?php
/**
 * ApiHeaders.php
 * Helper class for handling API response headers
 */

namespace FoodPriceApp\Core\Utils;

use FoodPriceApp\Core\Config;

class ApiHeaders {
    /**
     * Set standard API headers for CORS and JSON content
     */
    public static function setStandardHeaders(): void {
        header('Access-Control-Allow-Origin: ' . Config::API_ALLOW_ORIGIN);
        header('Content-Type: ' . Config::API_CONTENT_TYPE);
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }
    
    /**
     * Set headers for file download
     * 
     * @param string $filename The filename to be downloaded
     * @param string $contentType The content type of the file
     */
    public static function setDownloadHeaders(string $filename, string $contentType = 'application/octet-stream'): void {
        header('Content-Type: ' . $contentType);
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
    }
    
    /**
     * Set cache control headers
     * 
     * @param int $maxAge Max age in seconds
     */
    public static function setCacheHeaders(int $maxAge = 3600): void {
        header('Cache-Control: max-age=' . $maxAge . ', public');
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $maxAge) . ' GMT');
    }
    
    /**
     * Send JSON response with appropriate headers
     * 
     * @param mixed $data The data to be sent as JSON
     * @param int $statusCode HTTP status code
     */
    public static function sendJsonResponse($data, int $statusCode = 200): void {
        http_response_code($statusCode);
        self::setStandardHeaders();
        echo json_encode($data);
        exit;
    }
    
    /**
     * Send error response with appropriate headers
     * 
     * @param string $message Error message
     * @param int $statusCode HTTP status code
     */
    public static function sendErrorResponse(string $message, int $statusCode = 400): void {
        http_response_code($statusCode);
        self::setStandardHeaders();
        echo json_encode(['error' => $message]);
        exit;
    }
}
?>
