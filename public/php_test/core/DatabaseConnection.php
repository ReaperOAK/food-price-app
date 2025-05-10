<?php
/**
 * Database Connection Class
 * 
 * This class implements the Singleton pattern for database connection management
 */

require_once __DIR__ . '/../config/config.php';

class DatabaseConnection {
    private static $instance = null;
    private $connection;
    private $inTransaction = false;
    
    /**
     * Private constructor to prevent direct instantiation
     */
    private function __construct() {
        $this->connect();
    }
    
    /**
     * Connect to the database
     * 
     * @return void
     * @throws Exception If connection fails
     */
    private function connect() {
        try {
            $this->connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
            if ($this->connection->connect_error) {
                throw new Exception("Database connection failed: " . $this->connection->connect_error);
            }
            
            // Set character set to utf8mb4 for better character support
            $this->connection->set_charset("utf8mb4");
        } catch (Exception $e) {
            $this->logError("Database connection error: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Get database connection instance (Singleton pattern)
     * 
     * @return DatabaseConnection The singleton instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new DatabaseConnection();
        }
        return self::$instance;
    }
      /**
     * Get the mysqli connection object
     * 
     * @return mysqli The mysqli connection
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Execute a direct query (non-prepared)
     * 
     * @param string $sql SQL query
     * @return mysqli_result|bool Query result or false on failure
     */
    public function query($sql) {
        try {
            $result = $this->connection->query($sql);
            if ($result === false) {
                $this->logError("Direct query failed: " . $this->connection->error . " for SQL: $sql");
            }
            return $result;
        } catch (Exception $e) {
            $this->logError("Database query error: " . $e->getMessage() . " for SQL: $sql");
            return false;
        }
    }
    
    /**
     * Begin a database transaction
     * 
     * @return bool Success status
     */
    public function beginTransaction() {
        if (!$this->inTransaction) {
            $this->connection->begin_transaction();
            $this->inTransaction = true;
            return true;
        }
        return false;
    }
    
    /**
     * Commit a database transaction
     * 
     * @return bool Success status
     */
    public function commitTransaction() {
        if ($this->inTransaction) {
            $this->connection->commit();
            $this->inTransaction = false;
            return true;
        }
        return false;
    }
    
    /**
     * Rollback a database transaction
     * 
     * @return bool Success status
     */
    public function rollbackTransaction() {
        if ($this->inTransaction) {
            $this->connection->rollback();
            $this->inTransaction = false;
            return true;
        }
        return false;
    }
    
    /**
     * Execute a prepared statement with parameters
     * 
     * @param string $sql SQL query with placeholders
     * @param string $types Parameter types (i: integer, s: string, d: double, b: blob)
     * @param array $params Parameters to bind
     * @return mysqli_stmt|false The statement object or false on failure
     */
    public function executeQuery($sql, $types = "", array $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            
            if ($stmt === false) {
                $this->logError("Query preparation failed: " . $this->connection->error . " for SQL: $sql");
                return false;
            }
            
            if (!empty($types) && !empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            
            $stmt->execute();
            
            if ($stmt->error) {
                $this->logError("Query execution failed: " . $stmt->error . " for SQL: $sql");
                return false;
            }
            
            return $stmt;
        } catch (Exception $e) {
            $this->logError("Database query error: " . $e->getMessage() . " for SQL: $sql");
            return false;
        }
    }
    
    /**
     * Execute a query and fetch all results as an associative array
     * 
     * @param string $sql SQL query with placeholders
     * @param string $types Parameter types (i: integer, s: string, d: double, b: blob)
     * @param array $params Parameters to bind
     * @return array|false Associative array of results or false on failure
     */
    public function fetchAll($sql, $types = "", array $params = []) {
        $stmt = $this->executeQuery($sql, $types, $params);
        
        if ($stmt === false) {
            return false;
        }
        
        $result = $stmt->get_result();
        $data = [];
        
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        $stmt->close();
        return $data;
    }
    
    /**
     * Execute a query and fetch a single row as an associative array
     * 
     * @param string $sql SQL query with placeholders
     * @param string $types Parameter types (i: integer, s: string, d: double, b: blob)
     * @param array $params Parameters to bind
     * @return array|false Associative array of a single row or false on failure
     */
    public function fetchOne($sql, $types = "", array $params = []) {
        $stmt = $this->executeQuery($sql, $types, $params);
        
        if ($stmt === false) {
            return false;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        $stmt->close();
        return $row;
    }
    
    /**
     * Execute a query and fetch a single column from all rows
     * 
     * @param string $sql SQL query with placeholders
     * @param string $types Parameter types (i: integer, s: string, d: double, b: blob)
     * @param array $params Parameters to bind
     * @param int $column The zero-based column index to fetch
     * @return array|false Array of values or false on failure
     */
    public function fetchColumn($sql, $types = "", array $params = [], $column = 0) {
        $stmt = $this->executeQuery($sql, $types, $params);
        
        if ($stmt === false) {
            return false;
        }
        
        $result = $stmt->get_result();
        $data = [];
        
        while ($row = $result->fetch_array(MYSQLI_NUM)) {
            $data[] = $row[$column];
        }
        
        $stmt->close();
        return $data;
    }
    
    /**
     * Execute a query and fetch a single value
     * 
     * @param string $sql SQL query with placeholders
     * @param string $types Parameter types (i: integer, s: string, d: double, b: blob)
     * @param array $params Parameters to bind
     * @return mixed|false The value or false on failure
     */
    public function fetchValue($sql, $types = "", array $params = []) {
        $stmt = $this->executeQuery($sql, $types, $params);
        
        if ($stmt === false) {
            return false;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_array(MYSQLI_NUM);
        
        $stmt->close();
        return $row ? $row[0] : false;
    }
    
    /**
     * Insert data into a table and return the inserted ID
     * 
     * @param string $table Table name
     * @param array $data Associative array of column => value pairs
     * @return int|false The inserted ID or false on failure
     */
    public function insert($table, array $data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        
        $types = '';
        $values = [];
        
        foreach ($data as $value) {
            if (is_int($value)) {
                $types .= 'i';
            } elseif (is_float($value)) {
                $types .= 'd';
            } elseif (is_string($value)) {
                $types .= 's';
            } else {
                $types .= 's';
            }
            $values[] = $value;
        }
        
        $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
        $stmt = $this->executeQuery($sql, $types, $values);
        
        if ($stmt === false) {
            return false;
        }
        
        $id = $this->connection->insert_id;
        $stmt->close();
        
        return $id;
    }
    
    /**
     * Update data in a table
     * 
     * @param string $table Table name
     * @param array $data Associative array of column => value pairs to update
     * @param string $whereClause WHERE clause for the update
     * @param string $whereTypes Parameter types for WHERE clause
     * @param array $whereParams Parameters for WHERE clause
     * @return int|false Number of affected rows or false on failure
     */
    public function update($table, array $data, $whereClause, $whereTypes = "", array $whereParams = []) {
        $setClauses = [];
        $types = '';
        $values = [];
        
        foreach ($data as $column => $value) {
            $setClauses[] = "$column = ?";
            
            if (is_int($value)) {
                $types .= 'i';
            } elseif (is_float($value)) {
                $types .= 'd';
            } elseif (is_string($value)) {
                $types .= 's';
            } else {
                $types .= 's';
            }
            
            $values[] = $value;
        }
        
        // Add WHERE parameters to values array and types string
        $types .= $whereTypes;
        $values = array_merge($values, $whereParams);
        
        $sql = "UPDATE $table SET " . implode(', ', $setClauses) . " WHERE $whereClause";
        $stmt = $this->executeQuery($sql, $types, $values);
        
        if ($stmt === false) {
            return false;
        }
        
        $affectedRows = $stmt->affected_rows;
        $stmt->close();
        
        return $affectedRows;
    }
    
    /**
     * Delete data from a table
     * 
     * @param string $table Table name
     * @param string $whereClause WHERE clause for the delete
     * @param string $types Parameter types
     * @param array $params Parameters to bind
     * @return int|false Number of affected rows or false on failure
     */
    public function delete($table, $whereClause, $types = "", array $params = []) {
        $sql = "DELETE FROM $table WHERE $whereClause";
        $stmt = $this->executeQuery($sql, $types, $params);
        
        if ($stmt === false) {
            return false;
        }
        
        $affectedRows = $stmt->affected_rows;
        $stmt->close();
        
        return $affectedRows;
    }
    
    /**
     * Log error to file
     * 
     * @param string $message Error message
     * @return void
     */
    private function logError($message) {
        if (defined('LOG_PATH')) {
            error_log(date('[Y-m-d H:i:s]') . " - $message\n", 3, LOG_PATH);
        }
    }
    
    /**
     * Close the database connection
     */
    public function close() {
        if ($this->connection) {
            $this->connection->close();
        }
    }
    
    /**
     * Destructor
     */
    public function __destruct() {
        $this->close();
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
