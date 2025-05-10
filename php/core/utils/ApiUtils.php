<?php
/**
 * ApiUtils.php
 * Helper functions for API responses and error handling
 */

namespace FoodPriceApp\Core\Utils;

use FoodPriceApp\Core\Utils\Logger;

class ApiUtils {
    private static ?Logger $logger = null;
    
    /**
     * Get logger instance
     * 
     * @return Logger
     */
    private static function getLogger(): Logger {
        if (self::$logger === null) {
            self::$logger = new Logger('API');
        }
        return self::$logger;
    }
    
    /**
     * Send JSON success response
     * 
     * @param mixed $data Response data
     * @param int $statusCode HTTP status code
     * @param bool $exit Whether to exit after sending response
     */
    public static function sendSuccessResponse($data, int $statusCode = 200, bool $exit = true): void {
        http_response_code($statusCode);
        
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        echo json_encode([
            'success' => true,
            'data' => $data
        ]);
        
        if ($exit) {
            exit;
        }
    }
    
    /**
     * Send JSON error response
     * 
     * @param string $message Error message
     * @param int $statusCode HTTP status code
     * @param array $details Optional error details
     * @param bool $exit Whether to exit after sending response
     */
    public static function sendErrorResponse(string $message, int $statusCode = 400, array $details = [], bool $exit = true): void {
        http_response_code($statusCode);
        
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        self::getLogger()->error("API Error: {$message}", $details);
        
        $response = [
            'success' => false,
            'error' => $message
        ];
        
        if (!empty($details)) {
            $response['details'] = $details;
        }
        
        echo json_encode($response);
        
        if ($exit) {
            exit;
        }
    }
    
    /**
     * Get request parameters from either GET or POST
     * 
     * @param array $paramNames Parameter names to get
     * @param bool $required Whether parameters are required
     * @return array|false Parameters or false if required parameters are missing
     */
    public static function getRequestParams(array $paramNames, bool $required = true) {
        $params = [];
        $missing = [];
        
        foreach ($paramNames as $paramName) {
            if (isset($_POST[$paramName])) {
                $params[$paramName] = $_POST[$paramName];
            } elseif (isset($_GET[$paramName])) {
                $params[$paramName] = $_GET[$paramName];
            } elseif ($required) {
                $missing[] = $paramName;
            } else {
                $params[$paramName] = null;
            }
        }
        
        if (!empty($missing) && $required) {
            self::sendErrorResponse("Missing required parameters: " . implode(', ', $missing));
            return false;
        }
        
        return $params;
    }
    
    /**
     * Get JSON data from request body
     * 
     * @param array $requiredFields Required fields in JSON
     * @return array|false JSON data or false on error
     */
    public static function getJsonData(array $requiredFields = []) {
        // Get content from request body
        $jsonData = file_get_contents('php://input');
        
        // Decode JSON
        $data = json_decode($jsonData, true);
        
        // Check for JSON decode errors
        if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
            self::sendErrorResponse("Invalid JSON: " . json_last_error_msg());
            return false;
        }
        
        // Check for required fields
        if (!empty($requiredFields)) {
            $missing = [];
            
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    $missing[] = $field;
                }
            }
            
            if (!empty($missing)) {
                self::sendErrorResponse("Missing required fields: " . implode(', ', $missing));
                return false;
            }
        }
        
        return $data;
    }
    
    /**
     * Validate parameters against rules
     * 
     * @param array $params Parameters to validate
     * @param array $rules Validation rules
     * @return array|false Validated parameters or false on validation error
     */
    public static function validateParams(array $params, array $rules) {
        $errors = [];
        $validatedParams = [];
        
        foreach ($rules as $field => $rule) {
            if (!isset($params[$field]) && isset($rule['default'])) {
                $validatedParams[$field] = $rule['default'];
                continue;
            }
            
            if (!isset($params[$field]) && ($rule['required'] ?? false)) {
                $errors[] = "Field '{$field}' is required";
                continue;
            }
            
            if (!isset($params[$field])) {
                continue;
            }
            
            $value = $params[$field];
            
            // Type validation
            if (isset($rule['type'])) {
                switch ($rule['type']) {
                    case 'int':
                    case 'integer':
                        if (!is_numeric($value) || (int)$value != $value) {
                            $errors[] = "Field '{$field}' must be an integer";
                            continue 2;
                        }
                        $value = (int)$value;
                        break;
                        
                    case 'float':
                    case 'double':
                        if (!is_numeric($value)) {
                            $errors[] = "Field '{$field}' must be a number";
                            continue 2;
                        }
                        $value = (float)$value;
                        break;
                        
                    case 'bool':
                    case 'boolean':
                        if (!is_bool($value) && $value !== '0' && $value !== '1' && 
                            $value !== 0 && $value !== 1 && 
                            strtolower($value) !== 'false' && strtolower($value) !== 'true') {
                            $errors[] = "Field '{$field}' must be a boolean";
                            continue 2;
                        }
                        $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                        break;
                        
                    case 'string':
                        // Already a string from request
                        break;
                        
                    case 'array':
                        if (!is_array($value)) {
                            $errors[] = "Field '{$field}' must be an array";
                            continue 2;
                        }
                        break;
                        
                    case 'date':
                        $date = date_parse($value);
                        if ($date['error_count'] > 0) {
                            $errors[] = "Field '{$field}' must be a valid date";
                            continue 2;
                        }
                        break;
                }
            }
            
            // Min/max validation
            if (isset($rule['min']) && $value < $rule['min']) {
                $errors[] = "Field '{$field}' must be at least {$rule['min']}";
                continue;
            }
            
            if (isset($rule['max']) && $value > $rule['max']) {
                $errors[] = "Field '{$field}' must not exceed {$rule['max']}";
                continue;
            }
            
            // Regex validation
            if (isset($rule['pattern']) && !preg_match($rule['pattern'], $value)) {
                $errors[] = "Field '{$field}' has an invalid format";
                continue;
            }
            
            // Enumeration validation
            if (isset($rule['enum']) && !in_array($value, $rule['enum'])) {
                $errors[] = "Field '{$field}' must be one of: " . implode(', ', $rule['enum']);
                continue;
            }
            
            $validatedParams[$field] = $value;
        }
        
        if (!empty($errors)) {
            self::sendErrorResponse("Validation failed", 400, ['errors' => $errors]);
            return false;
        }
        
        return $validatedParams;
    }
}
?>
