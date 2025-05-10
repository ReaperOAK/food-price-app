<?php
/**
 * TransactionHandler.php
 * Helper class for managing database transactions
 */

namespace FoodPriceApp\Core\Database;

use FoodPriceApp\Core\Utils\Logger;
use mysqli;
use Exception;
use Closure;

class TransactionHandler {
    private mysqli $conn;
    private Logger $logger;
    
    /**
     * Constructor
     * 
     * @param mysqli $connection Database connection
     */
    public function __construct(mysqli $connection) {
        $this->conn = $connection;
        $this->logger = new Logger('TRANSACTION');
    }
    
    /**
     * Execute operations within a transaction
     * 
     * @param Closure $operations Closure containing operations to execute
     * @return mixed Return value from operations or false on failure
     */
    public function executeTransaction(Closure $operations) {
        try {
            // Begin transaction
            $this->logger->debug("Beginning transaction");
            $this->conn->begin_transaction();
            
            // Execute operations
            $result = $operations($this->conn);
            
            // Commit transaction
            $this->logger->debug("Committing transaction");
            $this->conn->commit();
            
            return $result;
        } catch (Exception $e) {
            // Rollback transaction on error
            $this->logger->error("Transaction failed, rolling back: " . $e->getMessage());
            $this->conn->rollback();
            return false;
        }
    }
    
    /**
     * Execute batch operations within a transaction
     * 
     * @param array $operations Array of operations to execute
     * @return array Array of operation results
     */
    public function executeBatch(array $operations): array {
        return $this->executeTransaction(function($conn) use ($operations) {
            $results = [];
            
            foreach ($operations as $index => $operation) {
                try {
                    if (!is_callable($operation)) {
                        throw new Exception("Operation {$index} is not callable");
                    }
                    
                    $results[$index] = $operation($conn);
                } catch (Exception $e) {
                    $this->logger->error("Batch operation {$index} failed: " . $e->getMessage());
                    throw $e;
                }
            }
            
            return $results;
        });
    }
}
?>
