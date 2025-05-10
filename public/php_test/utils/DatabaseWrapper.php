<?php
/**
 * Database Wrapper Class
 * 
 * This class provides a consistent interface for database operations
 * regardless of the actual database connection type (mysqli or PDO)
 */

class DatabaseWrapper {
    private $connection;
    private $type;
    
    /**
     * Constructor
     * 
     * @param mixed $connection PDO or mysqli connection object
     */
    public function __construct($connection) {
        $this->connection = $connection;
        
        if ($connection instanceof PDO) {
            $this->type = 'pdo';
        } elseif ($connection instanceof mysqli) {
            $this->type = 'mysqli';
        } else {
            throw new Exception('Invalid database connection type');
        }
    }
    
    /**
     * Execute a query
     * 
     * @param string $query SQL query
     * @param array $params Optional parameters for prepared statement
     * @return mixed Query result
     */
    public function query($query, $params = []) {
        if ($this->type === 'pdo') {
            if (empty($params)) {
                return $this->connection->query($query);
            } else {
                $stmt = $this->connection->prepare($query);
                $stmt->execute($params);
                return $stmt;
            }
        } else { // mysqli
            if (empty($params)) {
                return $this->connection->query($query);
            } else {
                $stmt = $this->connection->prepare($query);
                
                // Create parameter types string (all strings for simplicity)
                $types = str_repeat('s', count($params));
                
                // Bind parameters
                $stmt->bind_param($types, ...$params);
                $stmt->execute();
                return $stmt;
            }
        }
    }
      /**
     * Get number of rows in result
     * 
     * @param mixed $result Query result
     * @return int Number of rows
     */
    public function numRows($result) {
        if ($result === false) {
            return 0;
        }
        
        if ($this->type === 'pdo') {
            // For SELECT queries, rowCount might not work reliably in all drivers
            // So we might need to fetch all rows and count them
            if ($result instanceof PDOStatement) {
                try {
                    return $result->rowCount();
                } catch (Exception $e) {
                    // If rowCount() fails, fall back to counting fetched rows
                    $data = $result->fetchAll(PDO::FETCH_ASSOC);
                    $count = count($data);
                    
                    // Rewind the statement for future use
                    $result->execute();
                    return $count;
                }
            }
            return 0;
        } else { // mysqli
            if ($result instanceof mysqli_result) {
                return $result->num_rows;
            }
            return 0;
        }
    }
    
    /**
     * Fetch a row from result as associative array
     * 
     * @param mixed $result Query result
     * @return array|null Row data or null if no more rows
     */
    public function fetch($result) {
        if ($this->type === 'pdo') {
            return $result->fetch(PDO::FETCH_ASSOC);
        } else { // mysqli
            return $result->fetch_assoc();
        }
    }
    
    /**
     * Fetch all rows from result
     * 
     * @param mixed $result Query result
     * @return array All rows
     */
    public function fetchAll($result) {
        $rows = [];
        
        if ($this->type === 'pdo') {
            return $result->fetchAll(PDO::FETCH_ASSOC);
        } else { // mysqli
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            return $rows;
        }
    }
    
    /**
     * Get last insert ID
     * 
     * @return int|string Last insert ID
     */
    public function lastInsertId() {
        if ($this->type === 'pdo') {
            return $this->connection->lastInsertId();
        } else { // mysqli
            return $this->connection->insert_id;
        }
    }
    
    /**
     * Begin a transaction
     * 
     * @return bool Success status
     */
    public function beginTransaction() {
        if ($this->type === 'pdo') {
            return $this->connection->beginTransaction();
        } else { // mysqli
            return $this->connection->begin_transaction();
        }
    }
    
    /**
     * Commit a transaction
     * 
     * @return bool Success status
     */
    public function commit() {
        if ($this->type === 'pdo') {
            return $this->connection->commit();
        } else { // mysqli
            return $this->connection->commit();
        }
    }
    
    /**
     * Rollback a transaction
     * 
     * @return bool Success status
     */
    public function rollback() {
        if ($this->type === 'pdo') {
            return $this->connection->rollBack();
        } else { // mysqli
            return $this->connection->rollback();
        }
    }
    
    /**
     * Quote a string for use in a query
     * 
     * @param string $value Value to quote
     * @return string Quoted string
     */
    public function quote($value) {
        if ($this->type === 'pdo') {
            return $this->connection->quote($value);
        } else { // mysqli
            return "'" . $this->connection->real_escape_string($value) . "'";
        }
    }
      /**
     * Get error info
     * 
     * @return string Error message
     */
    public function errorInfo() {
        if ($this->type === 'pdo') {
            if ($this->connection) {
                $info = $this->connection->errorInfo();
                $errorMessage = $info[2] ?? 'Unknown error';
                $errorCode = $info[1] ?? 0;
                return "$errorMessage (Code: $errorCode)";
            }
            return 'No active connection';
        } else { // mysqli
            if ($this->connection) {
                return $this->connection->error . ' (Code: ' . $this->connection->errno . ')';
            }
            return 'No active connection';
        }
    }
    
    /**
     * Get the underlying connection object
     * 
     * @return mixed PDO or mysqli connection
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Get connection type
     * 
     * @return string 'pdo' or 'mysqli'
     */
    public function getType() {
        return $this->type;
    }
}
