<?php
/**
 * FileSystem Utility Class
 * 
 * This class provides file and directory operation utilities
 */

require_once __DIR__ . '/Logger.php';

class FileSystem {
    /**
     * Ensure a directory exists, create it if it doesn't
     * 
     * @param string $path Directory path
     * @param int $permissions Directory permissions (default: 0755)
     * @return bool Success status
     */
    public static function ensureDirectoryExists($path, $permissions = 0755) {
        if (empty($path)) {
            return false;
        }
        
        if (is_dir($path)) {
            return true;
        }
        
        $logger = Logger::getInstance();
        
        $result = mkdir($path, $permissions, true);
        
        if (!$result) {
            $logger->error("Failed to create directory: $path", 'FileSystem');
            return false;
        }
        
        $logger->debug("Created directory: $path", 'FileSystem');
        return true;
    }
    
    /**
     * Write content to a file
     * 
     * @param string $path File path
     * @param string $content File content
     * @param bool $createDir Whether to create parent directories if they don't exist
     * @return bool Success status
     */
    public static function writeFile($path, $content, $createDir = true) {
        $logger = Logger::getInstance();
        
        // Ensure parent directory exists if requested
        if ($createDir) {
            $directory = dirname($path);
            if (!self::ensureDirectoryExists($directory)) {
                return false;
            }
        }
        
        $result = file_put_contents($path, $content);
        
        if ($result === false) {
            $logger->error("Failed to write file: $path", 'FileSystem');
            return false;
        }
        
        $logger->debug("Wrote file: $path", 'FileSystem');
        return true;
    }
    
    /**
     * Read content from a file
     * 
     * @param string $path File path
     * @param mixed $default Default value if file doesn't exist or can't be read
     * @return string|mixed File content or default value
     */
    public static function readFile($path, $default = '') {
        if (!is_readable($path)) {
            Logger::getInstance()->error("File not readable: $path", 'FileSystem');
            return $default;
        }
        
        $content = file_get_contents($path);
        
        if ($content === false) {
            Logger::getInstance()->error("Failed to read file: $path", 'FileSystem');
            return $default;
        }
        
        return $content;
    }
    
    /**
     * Delete a file
     * 
     * @param string $path File path
     * @return bool Success status
     */
    public static function deleteFile($path) {
        $logger = Logger::getInstance();
        
        if (!file_exists($path)) {
            $logger->debug("File does not exist for deletion: $path", 'FileSystem');
            return true; // Already deleted
        }
        
        $result = unlink($path);
        
        if (!$result) {
            $logger->error("Failed to delete file: $path", 'FileSystem');
            return false;
        }
        
        $logger->debug("Deleted file: $path", 'FileSystem');
        return true;
    }
    
    /**
     * Copy a file
     * 
     * @param string $source Source path
     * @param string $destination Destination path
     * @param bool $createDir Whether to create parent directories if they don't exist
     * @return bool Success status
     */
    public static function copyFile($source, $destination, $createDir = true) {
        $logger = Logger::getInstance();
        
        if (!file_exists($source)) {
            $logger->error("Source file does not exist: $source", 'FileSystem');
            return false;
        }
        
        // Ensure parent directory exists if requested
        if ($createDir) {
            $directory = dirname($destination);
            if (!self::ensureDirectoryExists($directory)) {
                return false;
            }
        }
        
        $result = copy($source, $destination);
        
        if (!$result) {
            $logger->error("Failed to copy file from $source to $destination", 'FileSystem');
            return false;
        }
        
        $logger->debug("Copied file from $source to $destination", 'FileSystem');
        return true;
    }
    
    /**
     * Move a file
     * 
     * @param string $source Source path
     * @param string $destination Destination path
     * @param bool $createDir Whether to create parent directories if they don't exist
     * @return bool Success status
     */
    public static function moveFile($source, $destination, $createDir = true) {
        $logger = Logger::getInstance();
        
        if (!file_exists($source)) {
            $logger->error("Source file does not exist: $source", 'FileSystem');
            return false;
        }
        
        // Ensure parent directory exists if requested
        if ($createDir) {
            $directory = dirname($destination);
            if (!self::ensureDirectoryExists($directory)) {
                return false;
            }
        }
        
        $result = rename($source, $destination);
        
        if (!$result) {
            $logger->error("Failed to move file from $source to $destination", 'FileSystem');
            return false;
        }
        
        $logger->debug("Moved file from $source to $destination", 'FileSystem');
        return true;
    }
    
    /**
     * List files in a directory
     * 
     * @param string $directory Directory path
     * @param string $pattern Optional glob pattern
     * @return array|false Array of file paths or false on failure
     */
    public static function listFiles($directory, $pattern = '*') {
        $logger = Logger::getInstance();
        
        if (!is_dir($directory)) {
            $logger->error("Directory does not exist: $directory", 'FileSystem');
            return false;
        }
        
        $files = glob(rtrim($directory, '/') . '/' . $pattern);
        
        if ($files === false) {
            $logger->error("Failed to list files in directory: $directory", 'FileSystem');
            return false;
        }
        
        return $files;
    }
    
    /**
     * Delete a directory and its contents recursively
     * 
     * @param string $directory Directory path
     * @return bool Success status
     */
    public static function deleteDirectory($directory) {
        $logger = Logger::getInstance();
        
        if (!is_dir($directory)) {
            $logger->debug("Directory does not exist for deletion: $directory", 'FileSystem');
            return true; // Already deleted
        }
        
        $items = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        
        foreach ($items as $item) {
            if ($item->isDir()) {
                if (!rmdir($item->getRealPath())) {
                    $logger->error("Failed to remove directory: {$item->getRealPath()}", 'FileSystem');
                    return false;
                }
            } else {
                if (!unlink($item->getRealPath())) {
                    $logger->error("Failed to delete file: {$item->getRealPath()}", 'FileSystem');
                    return false;
                }
            }
        }
        
        $result = rmdir($directory);
        
        if (!$result) {
            $logger->error("Failed to remove directory: $directory", 'FileSystem');
            return false;
        }
        
        $logger->debug("Deleted directory: $directory", 'FileSystem');
        return true;
    }
}
