<?php
/**
 * State.php
 * Model for state data
 */

namespace FoodPriceApp\Core\Models;

use FoodPriceApp\Core\Models\BaseModel;
use mysqli;

class State extends BaseModel {
    /**
     * Constructor
     * 
     * @param mysqli $connection Database connection
     */
    public function __construct(mysqli $connection) {
        parent::__construct($connection);
        $this->table = 'states';
    }
    
    /**
     * Find state by name
     * 
     * @param string $name State name
     * @return array|null State data or null if not found
     */
    public function findByName(string $name): ?array {
        return $this->db->fetchOne("SELECT * FROM {$this->table} WHERE name = ?", [$name]);
    }
    
    /**
     * Get state ID by name, create if not exists
     * 
     * @param string $name State name
     * @return int State ID
     */
    public function getStateId(string $name): int {
        $state = $this->findByName($name);
        
        if ($state !== null) {
            return (int)$state['id'];
        }
        
        // State doesn't exist, insert and return new ID
        $insertId = $this->insert(['name' => $name]);
        return $insertId ?? 0;
    }
    
    /**
     * Get all states with their cities
     * 
     * @return array Associative array of states and their cities
     */
    public function getAllWithCities(): array {
        $query = "SELECT s.name AS state_name, c.name AS city_name 
                 FROM {$this->table} s
                 LEFT JOIN cities c ON c.state_id = s.id
                 ORDER BY s.name, c.name";
                 
        $result = $this->db->executeQuery($query);
        $statesWithCities = [];
        
        foreach ($result as $row) {
            $stateName = $row['state_name'];
            if (!isset($statesWithCities[$stateName])) {
                $statesWithCities[$stateName] = [];
            }
            
            if (!empty($row['city_name'])) {
                $statesWithCities[$stateName][] = $row['city_name'];
            }
        }
        
        return $statesWithCities;
    }
    
    /**
     * Find state for a city
     * 
     * @param string $cityName City name
     * @return string|null State name or null if not found
     */
    public function findStateForCity(string $cityName): ?string {
        $query = "SELECT s.name FROM {$this->table} s
                 JOIN cities c ON c.state_id = s.id
                 WHERE c.name = ?";
                 
        return $this->db->fetchValue($query, [$cityName]);
    }
    
    /**
     * Get states with fallback to original table
     * 
     * @return array List of state names
     */
    public function getAllStatesWithFallback(): array {
        $normalizedQuery = "SELECT name FROM {$this->table} ORDER BY name";
        $fallbackQuery = "SELECT DISTINCT state FROM egg_rates ORDER BY state";
        
        $result = $this->db->queryWithFallback($normalizedQuery, $fallbackQuery);
        $states = [];
        
        foreach ($result as $row) {
            $states[] = $row['name'] ?? $row['state'];
        }
        
        return $states;
    }
    
    /**
     * Add a new state
     * 
     * @param string $name State name
     * @return int|null State ID or null on failure
     */
    public function addState(string $name): ?int {
        // Check if state already exists
        $existingState = $this->findByName($name);
        
        if ($existingState !== null) {
            return (int)$existingState['id'];
        }
        
        // Insert new state
        return $this->insert(['name' => $name]);
    }
    
    /**
     * Delete state and its cities
     * 
     * @param string $name State name
     * @return bool Success status
     */
    public function deleteState(string $name): bool {
        $state = $this->findByName($name);
        
        if ($state === null) {
            return false;
        }
        
        $stateId = (int)$state['id'];
        
        // Delete all cities in this state first
        $this->conn->query("DELETE FROM cities WHERE state_id = {$stateId}");
        
        // Delete all egg rates for this state from original table
        $this->conn->query("DELETE FROM egg_rates WHERE state = '{$name}'");
        
        // Delete the state
        return $this->delete($stateId);
    }
}
?>
