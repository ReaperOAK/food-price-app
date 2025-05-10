<?php
/**
 * FileHandler.php
 * Utility class for file reading and writing operations
 */

namespace FoodPriceApp\Core\Utils;

use FoodPriceApp\Core\Utils\Logger;
use FoodPriceApp\Core\Utils\FileSystem;
use Exception;

class FileHandler {
    private Logger $logger;
    private FileSystem $fileSystem;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->logger = new Logger('FILE_HANDLER');
        $this->fileSystem = new FileSystem();
    }
    
    /**
     * Read file safely with error handling
     * 
     * @param string $filePath Path to file
     * @param bool $asJson Whether to parse as JSON
     * @return mixed File content, JSON decoded if $asJson is true, or false on error
     */
    public function readFile(string $filePath, bool $asJson = false) {
        try {
            if (!file_exists($filePath)) {
                $this->logger->error("File does not exist: " . $filePath);
                return false;
            }
            
            $content = file_get_contents($filePath);
            
            if ($content === false) {
                $this->logger->error("Failed to read file: " . $filePath);
                return false;
            }
            
            return $asJson ? json_decode($content, true) : $content;
        } catch (Exception $e) {
            $this->logger->error("Error reading file: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Write to file safely with error handling
     * 
     * @param string $filePath Path to file
     * @param mixed $content Content to write
     * @param bool $asJson Whether to encode as JSON
     * @return bool Success status
     */
    public function writeFile(string $filePath, $content, bool $asJson = false): bool {
        try {
            // Create directory if it doesn't exist
            $directory = dirname($filePath);
            if (!is_dir($directory)) {
                if (!mkdir($directory, 0755, true)) {
                    $this->logger->error("Failed to create directory: " . $directory);
                    return false;
                }
            }
            
            $dataToWrite = $asJson ? json_encode($content, JSON_PRETTY_PRINT) : $content;
            
            if (file_put_contents($filePath, $dataToWrite) === false) {
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
     * Append to file safely with error handling
     * 
     * @param string $filePath Path to file
     * @param string $content Content to append
     * @return bool Success status
     */
    public function appendToFile(string $filePath, string $content): bool {
        try {
            // Create directory if it doesn't exist
            $directory = dirname($filePath);
            if (!is_dir($directory)) {
                if (!mkdir($directory, 0755, true)) {
                    $this->logger->error("Failed to create directory: " . $directory);
                    return false;
                }
            }
            
            if (file_put_contents($filePath, $content, FILE_APPEND) === false) {
                $this->logger->error("Failed to append to file: " . $filePath);
                return false;
            }
            
            return true;
        } catch (Exception $e) {
            $this->logger->error("Error appending to file: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Copy file with error handling
     * 
     * @param string $source Source file path
     * @param string $destination Destination file path
     * @return bool Success status
     */
    public function copyFile(string $source, string $destination): bool {
        try {
            if (!file_exists($source)) {
                $this->logger->error("Source file does not exist: " . $source);
                return false;
            }
            
            // Create directory if it doesn't exist
            $directory = dirname($destination);
            if (!is_dir($directory)) {
                if (!mkdir($directory, 0755, true)) {
                    $this->logger->error("Failed to create directory: " . $directory);
                    return false;
                }
            }
            
            if (!copy($source, $destination)) {
                $this->logger->error("Failed to copy file from {$source} to {$destination}");
                return false;
            }
            
            return true;
        } catch (Exception $e) {
            $this->logger->error("Error copying file: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Delete file with error handling
     * 
     * @param string $filePath Path to file
     * @return bool Success status
     */
    public function deleteFile(string $filePath): bool {
        try {
            if (!file_exists($filePath)) {
                $this->logger->debug("File does not exist, cannot delete: " . $filePath);
                return true; // File doesn't exist, so it's technically already deleted
            }
            
            if (!unlink($filePath)) {
                $this->logger->error("Failed to delete file: " . $filePath);
                return false;
            }
            
            $this->logger->debug("File deleted: " . $filePath);
            return true;
        } catch (Exception $e) {
            $this->logger->error("Error deleting file: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Read CSV file and return as array
     * 
     * @param string $filePath Path to CSV file
     * @param bool $hasHeader Whether the CSV has a header row
     * @return array|false CSV data or false on error
     */
    public function readCsv(string $filePath, bool $hasHeader = true) {
        try {
            if (!file_exists($filePath)) {
                $this->logger->error("CSV file does not exist: " . $filePath);
                return false;
            }
            
            $file = fopen($filePath, 'r');
            if ($file === false) {
                $this->logger->error("Failed to open CSV file: " . $filePath);
                return false;
            }
            
            $data = [];
            $headers = $hasHeader ? fgetcsv($file) : null;
            
            while (($row = fgetcsv($file)) !== false) {
                if ($hasHeader) {
                    $rowData = [];
                    foreach ($headers as $i => $header) {
                        $rowData[$header] = $row[$i] ?? '';
                    }
                    $data[] = $rowData;
                } else {
                    $data[] = $row;
                }
            }
            
            fclose($file);
            return $data;
        } catch (Exception $e) {
            $this->logger->error("Error reading CSV file: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Write array to CSV file
     * 
     * @param string $filePath Path to CSV file
     * @param array $data Data to write
     * @param array $headers Optional column headers
     * @return bool Success status
     */
    public function writeCsv(string $filePath, array $data, array $headers = []): bool {
        try {
            // Create directory if it doesn't exist
            $directory = dirname($filePath);
            if (!is_dir($directory)) {
                if (!mkdir($directory, 0755, true)) {
                    $this->logger->error("Failed to create directory: " . $directory);
                    return false;
                }
            }
            
            $file = fopen($filePath, 'w');
            if ($file === false) {
                $this->logger->error("Failed to open CSV file for writing: " . $filePath);
                return false;
            }
            
            // Write headers if provided
            if (!empty($headers)) {
                fputcsv($file, $headers);
            }
            
            // Write data rows
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
            return true;
        } catch (Exception $e) {
            $this->logger->error("Error writing CSV file: " . $e->getMessage());
            return false;
        }
    }
}
?>
