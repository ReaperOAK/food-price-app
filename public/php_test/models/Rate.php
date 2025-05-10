<?php
/**
 * Rate Model
 * 
 * This class handles egg rate data operations
 */

require_once __DIR__ . '/../core/DatabaseConnection.php';
require_once __DIR__ . '/../utils/Logger.php';

class Rate {
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
     * Get the latest egg rate for a specific city
     * 
     * @param string $city City name
     * @param string $state State name
     * @return array|false Rate data or false if not found
     */
    public function getLatestRate($city, $state) {
        // Try normalized tables first
        $sql = "SELECT r.id, c.name AS city_name, s.name AS state_name, r.rate, r.date
                FROM normalized_rates r
                JOIN normalized_cities c ON r.city_id = c.id
                JOIN normalized_states s ON c.state_id = s.id
                WHERE c.name = ? AND s.name = ?
                ORDER BY r.date DESC
                LIMIT 1";
        
        $result = $this->db->fetchOne($sql, 'ss', [$city, $state]);
        
        // If found, return it
        if ($result) {
            return $result;
        }
        
        // Fallback to original table
        $sql = "SELECT id, city, state, rate, date
                FROM egg_rates
                WHERE city = ? AND state = ?
                ORDER BY date DESC
                LIMIT 1";
        
        return $this->db->fetchOne($sql, 'ss', [$city, $state]);
    }
    
    /**
     * Get the latest egg rates for multiple cities
     * 
     * @param array $cities Optional list of city names to filter by
     * @param array $states Optional list of state names to filter by
     * @return array Array of rate data
     */
    public function getLatestRates($cities = [], $states = []) {
        // Base query
        $baseSql = "SELECT r.id, c.name AS city_name, s.name AS state_name, r.rate, r.date
                    FROM normalized_rates r
                    JOIN normalized_cities c ON r.city_id = c.id
                    JOIN normalized_states s ON c.state_id = s.id
                    JOIN (
                        SELECT city_id, MAX(date) as max_date
                        FROM normalized_rates
                        GROUP BY city_id
                    ) latest ON r.city_id = latest.city_id AND r.date = latest.max_date";
        
        // Initialize parameters and types
        $params = [];
        $types = '';
        $conditions = [];
        
        // Add city filter if provided
        if (!empty($cities)) {
            $placeholders = implode(',', array_fill(0, count($cities), '?'));
            $conditions[] = "c.name IN ($placeholders)";
            $params = array_merge($params, $cities);
            $types .= str_repeat('s', count($cities));
        }
        
        // Add state filter if provided
        if (!empty($states)) {
            $placeholders = implode(',', array_fill(0, count($states), '?'));
            $conditions[] = "s.name IN ($placeholders)";
            $params = array_merge($params, $states);
            $types .= str_repeat('s', count($states));
        }
        
        // Combine conditions
        $sql = $baseSql;
        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(' AND ', $conditions);
        }
        
        $sql .= " ORDER BY s.name, c.name";
        
        // Try using normalized tables
        $result = $this->db->fetchAll($sql, $types, $params);
        
        // If we got results, return them
        if (!empty($result)) {
            return $result;
        }
        
        // Fallback to original tables
        $baseSql = "SELECT er.id, er.city, er.state, er.rate, er.date
                    FROM egg_rates er
                    JOIN (
                        SELECT city, state, MAX(date) as max_date
                        FROM egg_rates
                        GROUP BY city, state
                    ) latest ON er.city = latest.city AND er.state = latest.state 
                                 AND er.date = latest.max_date";
        
        // Reset conditions
        $conditions = [];
        
        // Add city filter if provided
        if (!empty($cities)) {
            $placeholders = implode(',', array_fill(0, count($cities), '?'));
            $conditions[] = "er.city IN ($placeholders)";
        }
        
        // Add state filter if provided
        if (!empty($states)) {
            $placeholders = implode(',', array_fill(0, count($states), '?'));
            $conditions[] = "er.state IN ($placeholders)";
        }
        
        // Combine conditions
        $sql = $baseSql;
        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(' AND ', $conditions);
        }
        
        $sql .= " ORDER BY er.state, er.city";
        
        return $this->db->fetchAll($sql, $types, $params);
    }
    
    /**
     * Get special egg rates (for cities marked with state "special")
     * 
     * @return array Array of special rate data
     */
    public function getSpecialRates() {
        // Try normalized tables first
        $sql = "SELECT r.id, c.name AS city_name, s.name AS state_name, r.rate, r.date
                FROM normalized_rates r
                JOIN normalized_cities c ON r.city_id = c.id
                JOIN normalized_states s ON c.state_id = s.id
                WHERE s.name = 'special'
                ORDER BY r.date DESC";
        
        $result = $this->db->fetchAll($sql);
        
        // If found, return them
        if (!empty($result)) {
            return $result;
        }
        
        // Fallback to original table
        $sql = "SELECT id, city, state, rate, date
                FROM egg_rates
                WHERE state = 'special'
                ORDER BY date DESC";
        
        return $this->db->fetchAll($sql);
    }
    
    /**
     * Get historical rates for a specific city
     * 
     * @param string $city City name
     * @param string $state State name
     * @param int $days Number of days to look back (0 for all)
     * @return array Array of historical rate data
     */
    public function getRateHistory($city, $state, $days = 0) {
        // Base query for normalized tables
        $sql = "SELECT r.id, c.name AS city_name, s.name AS state_name, r.rate, r.date
                FROM normalized_rates r
                JOIN normalized_cities c ON r.city_id = c.id
                JOIN normalized_states s ON c.state_id = s.id
                WHERE c.name = ? AND s.name = ?";
        
        // Parameters
        $params = [$city, $state];
        $types = 'ss';
        
        // Add date filter if days is provided
        if ($days > 0) {
            $sql .= " AND r.date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
            $params[] = $days;
            $types .= 'i';
        }
        
        $sql .= " ORDER BY r.date DESC";
        
        $result = $this->db->fetchAll($sql, $types, $params);
        
        // If found, return them
        if (!empty($result)) {
            return $result;
        }
        
        // Fallback to original table
        $sql = "SELECT id, city, state, rate, date
                FROM egg_rates
                WHERE city = ? AND state = ?";
        
        // Reset parameters
        $params = [$city, $state];
        $types = 'ss';
        
        // Add date filter if days is provided
        if ($days > 0) {
            $sql .= " AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
            $params[] = $days;
            $types .= 'i';
        }
        
        $sql .= " ORDER BY date DESC";
        
        return $this->db->fetchAll($sql, $types, $params);
    }
    
    /**
     * Get all egg rates
     * 
     * @param string $date Optional specific date to filter by (YYYY-MM-DD)
     * @return array Array of all rate data
     */
    public function getAllRates($date = null) {
        // Try normalized tables first
        $sql = "SELECT r.id, c.name AS city_name, s.name AS state_name, r.rate, r.date
                FROM normalized_rates r
                JOIN normalized_cities c ON r.city_id = c.id
                JOIN normalized_states s ON c.state_id = s.id";
        
        $params = [];
        $types = '';
        
        // Add date filter if provided
        if ($date !== null) {
            $sql .= " WHERE r.date = ?";
            $params[] = $date;
            $types = 's';
        }
        
        $sql .= " ORDER BY r.date DESC, s.name, c.name";
        
        $result = $this->db->fetchAll($sql, $types, $params);
        
        // If found, return them
        if (!empty($result)) {
            return $result;
        }
        
        // Fallback to original table
        $sql = "SELECT id, city, state, rate, date
                FROM egg_rates";
        
        // Reset parameters
        $params = [];
        $types = '';
        
        // Add date filter if provided
        if ($date !== null) {
            $sql .= " WHERE date = ?";
            $params[] = $date;
            $types = 's';
        }
        
        $sql .= " ORDER BY date DESC, state, city";
        
        return $this->db->fetchAll($sql, $types, $params);
    }
    
    /**
     * Get average rates by state
     * 
     * @param string $state State name
     * @param int $days Number of days to look back (0 for all)
     * @return array Array of average rate data by date
     */
    public function getAverageRatesByState($state, $days = 0) {
        // Base query for normalized tables
        $sql = "SELECT s.name AS state_name, AVG(r.rate) AS avg_rate, r.date
                FROM normalized_rates r
                JOIN normalized_cities c ON r.city_id = c.id
                JOIN normalized_states s ON c.state_id = s.id
                WHERE s.name = ?";
        
        // Parameters
        $params = [$state];
        $types = 's';
        
        // Add date filter if days is provided
        if ($days > 0) {
            $sql .= " AND r.date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
            $params[] = $days;
            $types .= 'i';
        }
        
        $sql .= " GROUP BY s.name, r.date ORDER BY r.date DESC";
        
        $result = $this->db->fetchAll($sql, $types, $params);
        
        // If found, return them
        if (!empty($result)) {
            return $result;
        }
        
        // Fallback to original table
        $sql = "SELECT state, AVG(rate) AS avg_rate, date
                FROM egg_rates
                WHERE state = ?";
        
        // Reset parameters
        $params = [$state];
        $types = 's';
        
        // Add date filter if days is provided
        if ($days > 0) {
            $sql .= " AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
            $params[] = $days;
            $types .= 'i';
        }
        
        $sql .= " GROUP BY state, date ORDER BY date DESC";
        
        return $this->db->fetchAll($sql, $types, $params);
    }
    
    /**
     * Add a new egg rate record
     * 
     * @param string $city City name
     * @param string $state State name
     * @param float $rate Egg rate
     * @param string $date Rate date (YYYY-MM-DD)
     * @return int|false The inserted ID or false on failure
     */
    public function addRate($city, $state, $rate, $date) {
        // Begin transaction
        $this->db->beginTransaction();
        
        try {
            // Insert into original egg_rates table
            $originalData = [
                'city' => $city,
                'state' => $state,
                'rate' => $rate,
                'date' => $date
            ];
            
            $originalId = $this->db->insert('egg_rates', $originalData);
            
            if ($originalId === false) {
                throw new Exception("Failed to insert into egg_rates");
            }
            
            // Get city and state IDs or create them if they don't exist
            $stateId = $this->getStateId($state);
            $cityId = $this->getCityId($city, $stateId);
            
            // Insert into normalized_rates table
            $normalizedData = [
                'city_id' => $cityId,
                'rate' => $rate,
                'date' => $date,
                'original_id' => $originalId
            ];
            
            $normalizedId = $this->db->insert('normalized_rates', $normalizedData);
            
            if ($normalizedId === false) {
                throw new Exception("Failed to insert into normalized_rates");
            }
            
            // Commit transaction
            $this->db->commitTransaction();
            
            return $originalId;
        } catch (Exception $e) {
            // Rollback on error
            $this->db->rollbackTransaction();
            $this->logger->error("Error adding rate: " . $e->getMessage(), 'Rate');
            return false;
        }
    }
    
    /**
     * Update an egg rate record
     * 
     * @param int $id Original record ID
     * @param string $city City name
     * @param string $state State name
     * @param float $rate Egg rate
     * @param string $date Rate date (YYYY-MM-DD)
     * @return bool Success status
     */
    public function updateRate($id, $city, $state, $rate, $date) {
        // Begin transaction
        $this->db->beginTransaction();
        
        try {
            // Update original egg_rates table
            $originalData = [
                'city' => $city,
                'state' => $state,
                'rate' => $rate,
                'date' => $date
            ];
            
            $result = $this->db->update('egg_rates', $originalData, 'id = ?', 'i', [$id]);
            
            if ($result === false) {
                throw new Exception("Failed to update egg_rates");
            }
            
            // Get city and state IDs or create them if they don't exist
            $stateId = $this->getStateId($state);
            $cityId = $this->getCityId($city, $stateId);
            
            // Update normalized_rates table
            $normalizedData = [
                'city_id' => $cityId,
                'rate' => $rate,
                'date' => $date
            ];
            
            $result = $this->db->update('normalized_rates', $normalizedData, 'original_id = ?', 'i', [$id]);
            
            if ($result === false) {
                throw new Exception("Failed to update normalized_rates");
            }
            
            // Commit transaction
            $this->db->commitTransaction();
            
            return true;
        } catch (Exception $e) {
            // Rollback on error
            $this->db->rollbackTransaction();
            $this->logger->error("Error updating rate: " . $e->getMessage(), 'Rate');
            return false;
        }
    }
    
    /**
     * Delete an egg rate record
     * 
     * @param int $id Original record ID
     * @return bool Success status
     */
    public function deleteRate($id) {
        // Begin transaction
        $this->db->beginTransaction();
        
        try {
            // Delete from normalized_rates table
            $result = $this->db->delete('normalized_rates', 'original_id = ?', 'i', [$id]);
            
            if ($result === false) {
                throw new Exception("Failed to delete from normalized_rates");
            }
            
            // Delete from original egg_rates table
            $result = $this->db->delete('egg_rates', 'id = ?', 'i', [$id]);
            
            if ($result === false) {
                throw new Exception("Failed to delete from egg_rates");
            }
            
            // Commit transaction
            $this->db->commitTransaction();
            
            return true;
        } catch (Exception $e) {
            // Rollback on error
            $this->db->rollbackTransaction();
            $this->logger->error("Error deleting rate: " . $e->getMessage(), 'Rate');
            return false;
        }
    }
    
    /**
     * Update multiple egg rates at once
     * 
     * @param array $rates Array of rate objects with id, city, state, rate, date
     * @return array Result with success count and errors
     */
    public function updateMultipleRates($rates) {
        $results = [
            'success' => 0,
            'errors' => []
        ];
        
        foreach ($rates as $rate) {
            // Ensure all required fields are present
            if (!isset($rate['id']) || !isset($rate['city']) || !isset($rate['state']) || 
                !isset($rate['rate']) || !isset($rate['date'])) {
                $results['errors'][] = "Missing required fields for rate";
                continue;
            }
            
            // Update the rate
            $success = $this->updateRate(
                $rate['id'],
                $rate['city'],
                $rate['state'],
                $rate['rate'],
                $rate['date']
            );
            
            if ($success) {
                $results['success']++;
            } else {
                $results['errors'][] = "Failed to update rate with ID {$rate['id']}";
            }
        }
        
        return $results;
    }
    
    /**
     * Get a state ID by name, creating it if it doesn't exist
     * 
     * @param string $stateName State name
     * @return int State ID
     */
    private function getStateId($stateName) {
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
     * Get a city ID by name and state ID, creating it if it doesn't exist
     * 
     * @param string $cityName City name
     * @param int $stateId State ID
     * @return int City ID
     */
    private function getCityId($cityName, $stateId) {
        // Check if city exists
        $sql = "SELECT id FROM normalized_cities WHERE name = ? AND state_id = ?";
        $cityId = $this->db->fetchValue($sql, 'si', [$cityName, $stateId]);
        
        if ($cityId !== false) {
            return $cityId;
        }
        
        // If not, insert it
        $data = [
            'name' => $cityName,
            'state_id' => $stateId
        ];
        
        $cityId = $this->db->insert('normalized_cities', $data);
        
        if ($cityId === false) {
            throw new Exception("Failed to insert city: $cityName");
        }
        
        return $cityId;
    }
    
    /**
     * Get all latest rates (alias for getLatestRates for compatibility)
     * 
     * @return array Array of rate data
     */
    public function getAllLatestRates() {
        return $this->getLatestRates();
    }
}
