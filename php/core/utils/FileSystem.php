<?php
/**
 * FileSystem.php
 * Helper class for file system operations
 */

namespace FoodPriceApp\Core\Utils;

use FoodPriceApp\Core\Utils\Logger;
use Exception;

class FileSystem {
    private Logger $logger;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->logger = new Logger('FILESYSTEM');
    }
    
    /**
     * Check if directory exists, create if it doesn't
     * 
     * @param string $dirPath Path to directory
     * @param int $permissions Permissions for new directory
     * @return bool Success status
     */
    public function ensureDirectoryExists(string $dirPath, int $permissions = 0755): bool {
        try {
            if (!file_exists($dirPath)) {
                $this->logger->info("Creating directory: " . $dirPath);
                if (!mkdir($dirPath, $permissions, true)) {
                    $this->logger->error("Failed to create directory: " . $dirPath);
                    return false;
                }
                $this->logger->debug("Directory created successfully: " . $dirPath);
            }
            return true;
        } catch (Exception $e) {
            $this->logger->error("Error ensuring directory exists: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Delete a directory and its contents recursively
     * 
     * @param string $dirPath Path to directory
     * @return bool Success status
     */
    public function deleteDirectory(string $dirPath): bool {
        try {
            if (!is_dir($dirPath)) {
                return false;
            }
            
            $files = array_diff(scandir($dirPath), ['.', '..']);
            
            foreach ($files as $file) {
                $path = $dirPath . DIRECTORY_SEPARATOR . $file;
                
                if (is_dir($path)) {
                    $this->deleteDirectory($path);
                } else {
                    unlink($path);
                }
            }
            
            return rmdir($dirPath);
        } catch (Exception $e) {
            $this->logger->error("Error deleting directory: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Write content to a file
     * 
     * @param string $filePath Path to file
     * @param string $content Content to write
     * @return bool Success status
     */
    public function writeFile(string $filePath, string $content): bool {
        try {
            // Make sure the directory exists
            $dir = dirname($filePath);
            $this->ensureDirectoryExists($dir);
            
            $this->logger->debug("Writing to file: " . $filePath);
            $result = file_put_contents($filePath, $content);
            
            if ($result === false) {
                $this->logger->error("Failed to write to file: " . $filePath);
                return false;
            }
            
            return true;
        } catch (Exception $e) {
            $this->logger->error("Error writing file: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Read content from a file
     * 
     * @param string $filePath Path to file
     * @return string|false File content or false on failure
     */
    public function readFile(string $filePath) {
        try {
            if (!file_exists($filePath)) {
                $this->logger->error("File does not exist: " . $filePath);
                return false;
            }
            
            return file_get_contents($filePath);
        } catch (Exception $e) {
            $this->logger->error("Error reading file: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * List all files in a directory with optional pattern filtering
     * 
     * @param string $dirPath Path to directory
     * @param string $pattern Optional glob pattern
     * @return array List of file paths
     */
    public function listFiles(string $dirPath, string $pattern = '*'): array {
        try {
            if (!is_dir($dirPath)) {
                $this->logger->warning("Not a directory: " . $dirPath);
                return [];
            }
            
            $files = glob($dirPath . DIRECTORY_SEPARATOR . $pattern);
            return is_array($files) ? $files : [];
        } catch (Exception $e) {
            $this->logger->error("Error listing files: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Delete files matching a pattern
     * 
     * @param string $dirPath Path to directory
     * @param string $pattern Glob pattern to match files
     * @return int Number of files deleted
     */
    public function deleteFiles(string $dirPath, string $pattern = '*'): int {
        try {
            $files = $this->listFiles($dirPath, $pattern);
            $count = 0;
            
            foreach ($files as $file) {
                if (is_file($file) && unlink($file)) {
                    $count++;
                }
            }
            
            return $count;
        } catch (Exception $e) {
            $this->logger->error("Error deleting files: " . $e->getMessage());
            return 0;
        }
    }
}
?>
