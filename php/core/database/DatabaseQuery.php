<?php
/**
 * DatabaseQuery.php
 * Helper class for database queries with normalized table fallback
 */

namespace FoodPriceApp\Core\Database;

use FoodPriceApp\Core\Utils\Logger;
use mysqli;
use Exception;

class DatabaseQuery {
    private mysqli $conn;
    private Logger $logger;
    
    /**
     * Constructor
     * 
     * @param mysqli $connection Database connection
     */
    public function __construct(mysqli $connection) {
        $this->conn = $connection;
        $this->logger = new Logger('DATABASE');
    }
    
    /**
     * Execute a query with fallback
     * 
     * @param string $normalizedQuery Primary query using normalized tables
     * @param string $fallbackQuery Fallback query using original tables
     * @param array $params Array of parameters for prepared statement
     * @param string $types Types of parameters (e.g., "ssi" for string, string, integer)
     * @return array|null Result as associative array or null on failure
     */
    public function queryWithFallback(
        string $normalizedQuery, 
        string $fallbackQuery, 
        array $params = [], 
        string $types = ""
    ): ?array {
        $this->logger->debug("Executing query with fallback");
        
        try {
            // Try normalized tables first
            $result = $this->executeQuery($normalizedQuery, $params, $types);
            
            // If no results from normalized tables, fall back to original
            if (empty($result)) {
                $this->logger->debug("No results from normalized tables, falling back to original");
                $result = $this->executeQuery($fallbackQuery, $params, $types);
            }
            
            return $result;
        } catch (Exception $e) {
            $this->logger->error("Query with fallback failed: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Execute a prepared statement
     * 
     * @param string $query SQL query
     * @param array $params Parameters for prepared statement
     * @param string $types Types of parameters
     * @return array Result as associative array
     * @throws Exception on error
     */
    public function executeQuery(string $query, array $params = [], string $types = ""): array {
        try {
            $stmt = $this->conn->prepare($query);
            
            if ($stmt === false) {
                throw new Exception("Failed to prepare statement: " . $this->conn->error);
            }
            
            // Bind parameters if there are any
            if (!empty($params)) {
                // If types is not provided or not matching params count, generate it
                if (empty($types) || strlen($types) !== count($params)) {
                    $types = str_repeat("s", count($params));
                }
                
                $bindParams = array_merge([$types], $params);
                $bindParamsRefs = [];
                
                // Create references for bind_param
                foreach ($bindParams as $key => $value) {
                    $bindParamsRefs[$key] = &$bindParams[$key];
                }
                
                call_user_func_array([$stmt, 'bind_param'], $bindParamsRefs);
            }
            
            // Execute the statement
            if (!$stmt->execute()) {
                throw new Exception("Failed to execute statement: " . $stmt->error);
            }
            
            // Get the result
            $result = $stmt->get_result();
            
            if ($result === false) {
                // For queries not returning results (INSERT, UPDATE, DELETE)
                $stmt->close();
                return [];
            }
            
            // Fetch all results as associative array
            $data = $result->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
            
            return $data;
        } catch (Exception $e) {
            $this->logger->error("Query execution failed: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Execute a query and return a single row
     * 
     * @param string $query SQL query
     * @param array $params Parameters for prepared statement
     * @param string $types Types of parameters
     * @return array|null Result as associative array or null if no rows
     */
    public function fetchOne(string $query, array $params = [], string $types = ""): ?array {
        $result = $this->executeQuery($query, $params, $types);
        return !empty($result) ? $result[0] : null;
    }
    
    /**
     * Execute a query and return a single value
     * 
     * @param string $query SQL query
     * @param array $params Parameters for prepared statement
     * @param string $types Types of parameters
     * @return mixed|null Result value or null if no rows
     */
    public function fetchValue(string $query, array $params = [], string $types = "") {
        $row = $this->fetchOne($query, $params, $types);
        if ($row === null) {
            return null;
        }
        
        // Return the first column of the first row
        return reset($row);
    }
    
    /**
     * Execute an INSERT query and return the last insert ID
     * 
     * @param string $query SQL query
     * @param array $params Parameters for prepared statement
     * @param string $types Types of parameters
     * @return int|null Last insert ID or null on failure
     */
    public function insert(string $query, array $params = [], string $types = ""): ?int {
        try {
            $this->executeQuery($query, $params, $types);
            $insertId = $this->conn->insert_id;
            
            return $insertId > 0 ? $insertId : null;
        } catch (Exception $e) {
            $this->logger->error("Insert failed: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Execute an UPDATE or DELETE query and return affected rows
     * 
     * @param string $query SQL query
     * @param array $params Parameters for prepared statement
     * @param string $types Types of parameters
     * @return int Number of affected rows
     */
    public function execute(string $query, array $params = [], string $types = ""): int {
        try {
            $this->executeQuery($query, $params, $types);
            return $this->conn->affected_rows;
        } catch (Exception $e) {
            $this->logger->error("Execute failed: " . $e->getMessage());
            return 0;
        }
    }
}
?>
