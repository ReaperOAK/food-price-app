<?php
/**
 * Location Model
 * 
 * This class handles state and city data operations
 */

require_once __DIR__ . '/../core/DatabaseConnection.php';
require_once __DIR__ . '/../utils/Logger.php';

class Location {
    private $db;
    private $logger;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->db = DatabaseConnection::getInstance();
        $this->logger = Logger::getInstance();
    }
    
    /**
     * Get all states
     * 
     * @return array Array of state data
     */
    public function getAllStates() {
        // Try normalized table first
        $sql = "SELECT id, name FROM normalized_states ORDER BY name";
        $result = $this->db->fetchAll($sql);
        
        if (!empty($result)) {
            return $result;
        }
        
        // Fallback to distinct values from the original table
        $sql = "SELECT DISTINCT state as name FROM egg_rates WHERE state != '' ORDER BY state";
        return $this->db->fetchAll($sql);
    }
      /**
     * Get all cities for a state
     * 
     * @param string $state State name     * @return array Array of city data
     */
    public function getCitiesForState($state) {
        // Try normalized tables first
        $sql = "SELECT c.id, c.name
                FROM normalized_cities c
                JOIN normalized_states s ON c.state_id = s.id
                WHERE s.name = ?
                ORDER BY c.name";
        
        $result = $this->db->fetchAll($sql, 's', [$state]);
        
        if (!empty($result)) {
            return $result;
        }
        
        // Fallback to distinct values from the original table
        $sql = "SELECT DISTINCT city as name 
                FROM egg_rates 
                WHERE state = ? AND city != '' 
                ORDER BY city";
        
        return $this->db->fetchAll($sql, 's', [$state]);
    }
    
    /**
     * Get all states with their cities
     * 
     * @return array Associative array of states and their cities
     */
    public function getAllStatesAndCities() {
        $result = [];
        
        // Try normalized tables first
        $sql = "SELECT s.name as state_name, c.name as city_name
                FROM normalized_states s
                JOIN normalized_cities c ON s.id = c.state_id
                ORDER BY s.name, c.name";
        
        $data = $this->db->fetchAll($sql);
        
        if (!empty($data)) {
            foreach ($data as $row) {
                $stateName = $row['state_name'];
                $cityName = $row['city_name'];
                
                if (!isset($result[$stateName])) {
                    $result[$stateName] = [];
                }
                
                $result[$stateName][] = $cityName;
            }
            
            return $result;
        }
        
        // Fallback to the original table
        $sql = "SELECT DISTINCT state, city 
                FROM egg_rates 
                WHERE state != '' AND city != '' 
                ORDER BY state, city";
        
        $data = $this->db->fetchAll($sql);
        
        foreach ($data as $row) {
            $stateName = $row['state'];
            $cityName = $row['city'];
            
            if (!isset($result[$stateName])) {
                $result[$stateName] = [];
            }
            
            $result[$stateName][] = $cityName;
        }
        
        return $result;
    }
    
    /**
     * Get the state for a given city
     * 
     * @param string $city City name
     * @return string|false State name or false if not found
     */
    public function getStateForCity($city) {
        // Try normalized tables first
        $sql = "SELECT s.name
                FROM normalized_states s
                JOIN normalized_cities c ON s.id = c.state_id
                WHERE c.name = ?
                LIMIT 1";
        
        $result = $this->db->fetchValue($sql, 's', [$city]);
        
        if ($result !== false) {
            return $result;
        }
        
        // Fallback to the original table
        $sql = "SELECT state 
                FROM egg_rates 
                WHERE city = ? 
                LIMIT 1";
        
        return $this->db->fetchValue($sql, 's', [$city]);
    }
    
    /**
     * Add a new state or city
     * 
     * @param string $type Type of location ('state' or 'city')
     * @param string $name Name of the state or city
     * @param string $state Parent state name (required for cities)
     * @return int|false The inserted ID or false on failure
     */
    public function addLocation($type, $name, $state = null) {
        // Begin transaction
        $this->db->beginTransaction();
        
        try {
            if ($type === 'state') {
                // Add a new state
                $data = ['name' => $name];
                $id = $this->db->insert('normalized_states', $data);
                
                if ($id === false) {
                    throw new Exception("Failed to insert state: $name");
                }
                
                $this->db->commitTransaction();
                return $id;
            } elseif ($type === 'city') {
                if ($state === null) {
                    throw new Exception("State is required when adding a city");
                }
                
                // Get or create state
                $stateId = $this->getStateIdOrCreate($state);
                
                // Add city
                $data = [
                    'name' => $name,
                    'state_id' => $stateId
                ];
                
                $id = $this->db->insert('normalized_cities', $data);
                
                if ($id === false) {
                    throw new Exception("Failed to insert city: $name");
                }
                
                $this->db->commitTransaction();
                return $id;
            } else {
                throw new Exception("Invalid location type: $type");
            }
        } catch (Exception $e) {
            $this->db->rollbackTransaction();
            $this->logger->error("Error adding location: " . $e->getMessage(), 'Location');
            return false;
        }
    }
    
    /**
     * Remove a state or city
     * 
     * @param string $type Type of location ('state' or 'city')
     * @param string $name Name of the state or city
     * @param string $state Parent state name (required for cities)
     * @return bool Success status
     */
    public function removeLocation($type, $name, $state = null) {
        // Begin transaction
        $this->db->beginTransaction();
        
        try {
            if ($type === 'state') {
                // Get state ID
                $sql = "SELECT id FROM normalized_states WHERE name = ?";
                $stateId = $this->db->fetchValue($sql, 's', [$name]);
                
                if ($stateId === false) {
                    throw new Exception("State not found: $name");
                }
                
                // Delete associated cities
                $this->db->delete('normalized_cities', 'state_id = ?', 'i', [$stateId]);
                
                // Delete rates for cities in this state
                $sql = "DELETE r FROM normalized_rates r
                        JOIN normalized_cities c ON r.city_id = c.id
                        WHERE c.state_id = ?";
                
                $stmt = $this->db->executeQuery($sql, 'i', [$stateId]);
                if ($stmt === false) {
                    throw new Exception("Failed to delete rates for state: $name");
                }
                $stmt->close();
                
                // Delete from original table
                $this->db->delete('egg_rates', 'state = ?', 's', [$name]);
                
                // Delete state
                $this->db->delete('normalized_states', 'id = ?', 'i', [$stateId]);
                
            } elseif ($type === 'city') {
                if ($state === null) {
                    throw new Exception("State is required when removing a city");
                }
                
                // Get state ID
                $sql = "SELECT id FROM normalized_states WHERE name = ?";
                $stateId = $this->db->fetchValue($sql, 's', [$state]);
                
                if ($stateId === false) {
                    throw new Exception("State not found: $state");
                }
                
                // Get city ID
                $sql = "SELECT id FROM normalized_cities WHERE name = ? AND state_id = ?";
                $cityId = $this->db->fetchValue($sql, 'si', [$name, $stateId]);
                
                if ($cityId === false) {
                    throw new Exception("City not found: $name in $state");
                }
                
                // Delete rates for this city
                $this->db->delete('normalized_rates', 'city_id = ?', 'i', [$cityId]);
                
                // Delete from original table
                $this->db->delete('egg_rates', 'city = ? AND state = ?', 'ss', [$name, $state]);
                
                // Delete city
                $this->db->delete('normalized_cities', 'id = ?', 'i', [$cityId]);
                
            } else {
                throw new Exception("Invalid location type: $type");
            }
            
            $this->db->commitTransaction();
            return true;
        } catch (Exception $e) {
            $this->db->rollbackTransaction();
            $this->logger->error("Error removing location: " . $e->getMessage(), 'Location');
            return false;
        }
    }
    
    /**
     * Get a state ID by name, creating it if it doesn't exist
     * 
     * @param string $stateName State name
     * @return int State ID
     */
    private function getStateIdOrCreate($stateName) {
        // Check if state exists
        $sql = "SELECT id FROM normalized_states WHERE name = ?";
        $stateId = $this->db->fetchValue($sql, 's', [$stateName]);
        
        if ($stateId !== false) {
            return $stateId;
        }
        
        // If not, insert it
        $data = ['name' => $stateName];
        $stateId = $this->db->insert('normalized_states', $data);
        
        if ($stateId === false) {
            throw new Exception("Failed to insert state: $stateName");
        }
          return $stateId;
    }
    
    /**
     * Get cities by state (alias for getCitiesForState for compatibility)
     * 
     * @param string $state State name
     * @return array Array of city names
     */
    public function getCitiesByState($state) {
        $cities = $this->getCitiesForState($state);
        
        // Convert from detailed objects to simple array of names
        $result = [];
        foreach ($cities as $city) {
            $result[] = $city['name'];
        }
        
        return $result;
    }
}
