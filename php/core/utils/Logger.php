<?php
/**
 * Logger.php
 * Utility class for consistent logging across the application
 */

namespace FoodPriceApp\Core\Utils;

use FoodPriceApp\Core\Config;

class Logger {
    // Log levels
    const DEBUG = 'debug';
    const INFO = 'info';
    const WARNING = 'warning';
    const ERROR = 'error';
    
    // Context/tag for the current log entries
    private string $context;
    
    /**
     * Constructor
     * 
     * @param string $context A tag to identify the source of log messages
     */
    public function __construct(string $context = 'GENERAL') {
        $this->context = $context;
        
        // Ensure log file exists and is writable
        if (!file_exists(Config::LOG_FILE)) {
            touch(Config::LOG_FILE);
        }
        
        // Configure error logging
        ini_set('log_errors', 1);
        ini_set('error_log', Config::LOG_FILE);
    }
    
    /**
     * Log a message with specified level
     * 
     * @param string $level Log level (debug, info, warning, error)
     * @param string $message Log message
     * @param mixed|null $data Additional data to log
     * @return bool Success status
     */
    private function log(string $level, string $message, $data = null): bool {
        $logLevels = [
            self::DEBUG => 0,
            self::INFO => 1,
            self::WARNING => 2,
            self::ERROR => 3
        ];
        
        $configLevel = strtolower(Config::LOG_LEVEL);
        
        // Check if this log level should be recorded
        if (!isset($logLevels[$level]) || !isset($logLevels[$configLevel]) || 
            $logLevels[$level] < $logLevels[$configLevel]) {
            return false;
        }
        
        $log = date('Y-m-d H:i:s') . " [" . strtoupper($level) . "] [" . $this->context . "] " . $message;
        
        if ($data !== null) {
            $log .= " - " . (is_array($data) || is_object($data) ? json_encode($data, JSON_UNESCAPED_SLASHES) : $data);
        }
        
        return error_log($log);
    }
    
    /**
     * Log debug message
     * 
     * @param string $message Log message
     * @param mixed|null $data Additional data to log
     * @return bool Success status
     */
    public function debug(string $message, $data = null): bool {
        return $this->log(self::DEBUG, $message, $data);
    }
    
    /**
     * Log info message
     * 
     * @param string $message Log message
     * @param mixed|null $data Additional data to log
     * @return bool Success status
     */
    public function info(string $message, $data = null): bool {
        return $this->log(self::INFO, $message, $data);
    }
    
    /**
     * Log warning message
     * 
     * @param string $message Log message
     * @param mixed|null $data Additional data to log
     * @return bool Success status
     */
    public function warning(string $message, $data = null): bool {
        return $this->log(self::WARNING, $message, $data);
    }
    
    /**
     * Log error message
     * 
     * @param string $message Log message
     * @param mixed|null $data Additional data to log
     * @return bool Success status
     */
    public function error(string $message, $data = null): bool {
        return $this->log(self::ERROR, $message, $data);
    }
}
?>
