<?php
/**
 * Logger Class
 * 
 * This class provides unified logging functionality across the application
 */

require_once __DIR__ . '/../config/config.php';

class Logger {
    const ERROR = 'ERROR';
    const WARNING = 'WARNING';
    const INFO = 'INFO';
    const DEBUG = 'DEBUG';
    
    private static $instance = null;
    private $logPath;
    private $debugMode;
    
    /**
     * Private constructor to prevent direct instantiation
     */
    private function __construct() {
        $this->logPath = defined('LOG_PATH') ? LOG_PATH : __DIR__ . '/../error.log';
        $this->debugMode = defined('DEBUG_MODE') ? DEBUG_MODE : false;
    }
    
    /**
     * Get logger instance (Singleton pattern)
     * 
     * @return Logger The singleton instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Logger();
        }
        return self::$instance;
    }
    
    /**
     * Log an error message
     * 
     * @param string $message The message to log
     * @param string $context Optional context information
     * @return bool Success status
     */
    public function error($message, $context = '') {
        return $this->log(self::ERROR, $message, $context);
    }
    
    /**
     * Log a warning message
     * 
     * @param string $message The message to log
     * @param string $context Optional context information
     * @return bool Success status
     */
    public function warning($message, $context = '') {
        return $this->log(self::WARNING, $message, $context);
    }
    
    /**
     * Log an info message
     * 
     * @param string $message The message to log
     * @param string $context Optional context information
     * @return bool Success status
     */
    public function info($message, $context = '') {
        return $this->log(self::INFO, $message, $context);
    }
    
    /**
     * Log a debug message (only in debug mode)
     * 
     * @param string $message The message to log
     * @param string $context Optional context information
     * @return bool Success status
     */
    public function debug($message, $context = '') {
        if ($this->debugMode) {
            return $this->log(self::DEBUG, $message, $context);
        }
        return true;
    }
    
    /**
     * Log a message with the specified level
     * 
     * @param string $level Log level
     * @param string $message The message to log
     * @param string $context Optional context information
     * @return bool Success status
     */
    private function log($level, $message, $context = '') {
        $timestamp = date('[Y-m-d H:i:s]');
        $contextInfo = !empty($context) ? "[$context] " : '';
        $logEntry = "$timestamp [$level] {$contextInfo}$message\n";
        
        return error_log($logEntry, 3, $this->logPath);
    }
    
    /**
     * Prevent cloning
     */
    private function __clone() {}
    
    /**
     * Prevent unserialization
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
