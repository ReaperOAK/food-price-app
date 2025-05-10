<?php
/**
 * City.php
 * Model for city data
 */

namespace FoodPriceApp\Core\Models;

use FoodPriceApp\Core\Models\BaseModel;
use mysqli;

class City extends BaseModel {
    /**
     * Constructor
     * 
     * @param mysqli $connection Database connection
     */
    public function __construct(mysqli $connection) {
        parent::__construct($connection);
        $this->table = 'cities';
    }
    
    /**
     * Find city by name and state ID
     * 
     * @param string $name City name
     * @param int $stateId State ID
     * @return array|null City data or null if not found
     */
    public function findByNameAndStateId(string $name, int $stateId): ?array {
        $query = "SELECT * FROM {$this->table} WHERE name = ? AND state_id = ?";
        return $this->db->fetchOne($query, [$name, $stateId]);
    }
    
    /**
     * Find city by name and state name
     * 
     * @param string $cityName City name
     * @param string $stateName State name
     * @return array|null City data or null if not found
     */
    public function findByNameAndState(string $cityName, string $stateName): ?array {
        $query = "SELECT c.* FROM {$this->table} c
                 JOIN states s ON c.state_id = s.id
                 WHERE c.name = ? AND s.name = ?";
        return $this->db->fetchOne($query, [$cityName, $stateName]);
    }
    
    /**
     * Get city ID by name and state ID, create if not exists
     * 
     * @param string $name City name
     * @param int $stateId State ID
     * @return int City ID
     */
    public function getCityId(string $name, int $stateId): int {
        $city = $this->findByNameAndStateId($name, $stateId);
        
        if ($city !== null) {
            return (int)$city['id'];
        }
        
        // City doesn't exist, insert and return new ID
        $insertId = $this->insert([
            'name' => $name,
            'state_id' => $stateId
        ]);
        
        return $insertId ?? 0;
    }
    
    /**
     * Get cities for a state with fallback to original table
     * 
     * @param string $stateName State name
     * @return array List of city names
     */
    public function getCitiesForStateWithFallback(string $stateName): array {
        $normalizedQuery = "SELECT c.name 
                           FROM {$this->table} c
                           JOIN states s ON c.state_id = s.id
                           WHERE s.name = ?
                           ORDER BY c.name";
                           
        $fallbackQuery = "SELECT DISTINCT city FROM egg_rates WHERE state = ? ORDER BY city";
        
        $result = $this->db->queryWithFallback($normalizedQuery, $fallbackQuery, [$stateName]);
        $cities = [];
        
        foreach ($result as $row) {
            $cities[] = $row['name'] ?? $row['city'];
        }
        
        return $cities;
    }
    
    /**
     * Add a new city
     * 
     * @param string $name City name
     * @param int $stateId State ID
     * @return int|null City ID or null on failure
     */
    public function addCity(string $name, int $stateId): ?int {
        // Check if city already exists
        $existingCity = $this->findByNameAndStateId($name, $stateId);
        
        if ($existingCity !== null) {
            return (int)$existingCity['id'];
        }
        
        // Insert new city
        return $this->insert([
            'name' => $name,
            'state_id' => $stateId
        ]);
    }
    
    /**
     * Delete city
     * 
     * @param string $cityName City name
     * @param string $stateName State name
     * @return bool Success status
     */
    public function deleteCity(string $cityName, string $stateName): bool {
        $city = $this->findByNameAndState($cityName, $stateName);
        
        if ($city === null) {
            return false;
        }
        
        $cityId = (int)$city['id'];
        
        // Delete all egg rates for this city from original table
        $this->conn->query("DELETE FROM egg_rates WHERE city = '{$cityName}' AND state = '{$stateName}'");
        
        // Delete normalized egg rates
        $this->conn->query("DELETE FROM egg_rates_normalized WHERE city_id = {$cityId}");
        
        // Delete the city
        return $this->delete($cityId);
    }
    
    /**
     * Get cities with special rates
     * 
     * @return array List of city names
     */
    public function getSpecialCities(): array {
        $query = "SELECT c.name FROM {$this->table} c
                 JOIN states s ON c.state_id = s.id
                 WHERE s.name = 'special'
                 ORDER BY c.name";
                 
        $fallbackQuery = "SELECT DISTINCT city FROM egg_rates WHERE state = 'special' ORDER BY city";
        
        $result = $this->db->queryWithFallback($query, $fallbackQuery);
        $cities = [];
        
        foreach ($result as $row) {
            $cities[] = $row['name'] ?? $row['city'];
        }
        
        return $cities;
    }
}
?>
