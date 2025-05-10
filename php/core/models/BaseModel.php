<?php
/**
 * BaseModel.php
 * Base class for all models
 */

namespace FoodPriceApp\Core\Models;

use FoodPriceApp\Core\Database\DatabaseQuery;
use mysqli;

abstract class BaseModel {
    protected mysqli $conn;
    protected DatabaseQuery $db;
    protected string $table;
    protected string $primaryKey = 'id';
    
    /**
     * Constructor
     * 
     * @param mysqli $connection Database connection
     */
    public function __construct(mysqli $connection) {
        $this->conn = $connection;
        $this->db = new DatabaseQuery($connection);
    }
    
    /**
     * Find record by ID
     * 
     * @param int $id Record ID
     * @return array|null Record data or null if not found
     */
    public function findById(int $id): ?array {
        $query = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?";
        return $this->db->fetchOne($query, [$id]);
    }
    
    /**
     * Find all records
     * 
     * @param string $orderBy Order by clause
     * @param int $limit Limit results
     * @param int $offset Offset for pagination
     * @return array Records
     */
    public function findAll(string $orderBy = '', int $limit = 0, int $offset = 0): array {
        $query = "SELECT * FROM {$this->table}";
        
        if (!empty($orderBy)) {
            $query .= " ORDER BY {$orderBy}";
        }
        
        if ($limit > 0) {
            $query .= " LIMIT {$limit}";
            
            if ($offset > 0) {
                $query .= " OFFSET {$offset}";
            }
        }
        
        return $this->db->executeQuery($query);
    }
    
    /**
     * Find records by field value
     * 
     * @param string $field Field name
     * @param mixed $value Field value
     * @param string $orderBy Order by clause
     * @return array Records
     */
    public function findByField(string $field, $value, string $orderBy = ''): array {
        $query = "SELECT * FROM {$this->table} WHERE {$field} = ?";
        
        if (!empty($orderBy)) {
            $query .= " ORDER BY {$orderBy}";
        }
        
        return $this->db->executeQuery($query, [$value]);
    }
    
    /**
     * Count records
     * 
     * @param string $whereClause Optional WHERE clause
     * @param array $params Optional parameters for WHERE clause
     * @return int Record count
     */
    public function count(string $whereClause = '', array $params = []): int {
        $query = "SELECT COUNT(*) FROM {$this->table}";
        
        if (!empty($whereClause)) {
            $query .= " WHERE {$whereClause}";
        }
        
        $count = $this->db->fetchValue($query, $params);
        return intval($count);
    }
    
    /**
     * Insert a new record
     * 
     * @param array $data Record data
     * @return int|null Inserted ID or null on failure
     */
    public function insert(array $data): ?int {
        $fields = array_keys($data);
        $placeholders = array_fill(0, count($fields), '?');
        
        $query = "INSERT INTO {$this->table} (" . implode(', ', $fields) . ") 
                 VALUES (" . implode(', ', $placeholders) . ")";
        
        return $this->db->insert($query, array_values($data));
    }
    
    /**
     * Update a record
     * 
     * @param int $id Record ID
     * @param array $data Record data
     * @return bool Success status
     */
    public function update(int $id, array $data): bool {
        $fields = array_keys($data);
        $setClause = implode(' = ?, ', $fields) . ' = ?';
        
        $query = "UPDATE {$this->table} SET {$setClause} WHERE {$this->primaryKey} = ?";
        
        $params = array_values($data);
        $params[] = $id;
        
        $affectedRows = $this->db->execute($query, $params);
        return $affectedRows > 0;
    }
    
    /**
     * Delete a record
     * 
     * @param int $id Record ID
     * @return bool Success status
     */
    public function delete(int $id): bool {
        $query = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?";
        $affectedRows = $this->db->execute($query, [$id]);
        return $affectedRows > 0;
    }
}
?>
