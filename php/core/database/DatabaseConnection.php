<?php
/**
 * DatabaseConnection.php
 * Singleton class for database connection management
 */

namespace FoodPriceApp\Core\Database;

use mysqli;
use Exception;

class DatabaseConnection {
    private static ?DatabaseConnection $instance = null;
    private mysqli $connection;
    
    // Database configuration
    private string $servername = "localhost";
    private string $username = "u901337298_test";
    private string $password = "A12345678b*";
    private string $dbname = "u901337298_test";
    
    /**
     * Private constructor to prevent direct instantiation
     */
    private function __construct() {
        $this->connect();
    }
    
    /**
     * Connect to database
     * 
     * @throws Exception if connection fails
     */
    private function connect(): void {
        $this->connection = new mysqli(
            $this->servername, 
            $this->username, 
            $this->password, 
            $this->dbname
        );
        
        if ($this->connection->connect_error) {
            throw new Exception("Connection failed: " . $this->connection->connect_error);
        }
    }
    
    /**
     * Get singleton instance
     * 
     * @return DatabaseConnection
     */
    public static function getInstance(): DatabaseConnection {
        if (self::$instance === null) {
            self::$instance = new DatabaseConnection();
        }
        return self::$instance;
    }
    
    /**
     * Get the database connection
     * 
     * @return mysqli
     */
    public function getConnection(): mysqli {
        return $this->connection;
    }
    
    /**
     * Begin a transaction
     * 
     * @return bool
     */
    public function beginTransaction(): bool {
        return $this->connection->begin_transaction();
    }
    
    /**
     * Commit a transaction
     * 
     * @return bool
     */
    public function commit(): bool {
        return $this->connection->commit();
    }
    
    /**
     * Rollback a transaction
     * 
     * @return bool
     */
    public function rollback(): bool {
        return $this->connection->rollback();
    }
    
    /**
     * Close the database connection
     */
    public function closeConnection(): void {
        $this->connection->close();
    }
    
    /**
     * Prevent cloning of the instance
     */
    private function __clone() {}
    
    /**
     * Prevent unserialization of the instance
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize a singleton.");
    }
}
?>
