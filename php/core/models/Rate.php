<?php
/**
 * Rate.php
 * Model for egg rate data
 */

namespace FoodPriceApp\Core\Models;

use FoodPriceApp\Core\Models\BaseModel;
use FoodPriceApp\Core\Models\City;
use FoodPriceApp\Core\Models\State;
use FoodPriceApp\Core\Database\TransactionHandler;
use mysqli;
use Exception;
use DateTime;

class Rate extends BaseModel {
    private TransactionHandler $transactionHandler;
    
    /**
     * Constructor
     * 
     * @param mysqli $connection Database connection
     */
    public function __construct(mysqli $connection) {
        parent::__construct($connection);
        $this->table = 'egg_rates_normalized';
        $this->transactionHandler = new TransactionHandler($connection);
    }
    
    /**
     * Get latest rate for a city
     * 
     * @param string $cityName City name
     * @param string $stateName State name
     * @return array|null Rate data or null if not found
     */
    public function getLatestRateForCity(string $cityName, string $stateName): ?array {
        // Try normalized tables first
        try {
            $normalizedQuery = "SELECT ern.id, ern.rate, ern.date, c.name as city, s.name as state 
                              FROM {$this->table} ern
                              JOIN cities c ON ern.city_id = c.id
                              JOIN states s ON c.state_id = s.id
                              WHERE c.name = ? AND s.name = ?
                              ORDER BY ern.date DESC
                              LIMIT 1";
            
            $result = $this->db->executeQuery($normalizedQuery, [$cityName, $stateName]);
            
            if (!empty($result)) {
                return $result[0];
            }
            
            // Fall back to original table
            $fallbackQuery = "SELECT id, rate, date, city, state 
                            FROM egg_rates
                            WHERE city = ? AND state = ?
                            ORDER BY date DESC
                            LIMIT 1";
            
            $result = $this->db->executeQuery($fallbackQuery, [$cityName, $stateName]);
            
            return !empty($result) ? $result[0] : null;
        } catch (Exception $e) {
            return null;
        }
    }
    
    /**
     * Get latest rates for all cities
     * 
     * @param array $cities Optional array of cities to filter
     * @return array Latest rates
     */
    public function getLatestRates(array $cities = []): array {
        // Try normalized tables first
        try {
            $normalizedQuery = "SELECT ern.id, ern.rate, ern.date, c.name as city, s.name as state,
                              (SELECT MAX(date) FROM {$this->table} WHERE city_id = ern.city_id) as latest_date
                              FROM {$this->table} ern
                              JOIN cities c ON ern.city_id = c.id
                              JOIN states s ON c.state_id = s.id
                              WHERE ern.date = (SELECT MAX(date) FROM {$this->table} WHERE city_id = ern.city_id)";
            
            if (!empty($cities)) {
                $placeholders = implode(',', array_fill(0, count($cities), '?'));
                $normalizedQuery .= " AND c.name IN ({$placeholders})";
            }
            
            $normalizedQuery .= " ORDER BY s.name, c.name";
            
            $result = $this->db->executeQuery($normalizedQuery, $cities);
            
            if (!empty($result)) {
                return $result;
            }
            
            // Fall back to original table
            $fallbackQuery = "SELECT er.id, er.rate, er.date, er.city, er.state
                            FROM egg_rates er
                            INNER JOIN (
                                SELECT city, state, MAX(date) as max_date
                                FROM egg_rates
                                GROUP BY city, state
                            ) latest ON er.city = latest.city AND er.state = latest.state AND er.date = latest.max_date";
            
            if (!empty($cities)) {
                $placeholders = implode(',', array_fill(0, count($cities), '?'));
                $fallbackQuery .= " WHERE er.city IN ({$placeholders})";
            }
            
            $fallbackQuery .= " ORDER BY er.state, er.city";
            
            return $this->db->executeQuery($fallbackQuery, $cities);
        } catch (Exception $e) {
            return [];
        }
    }
    
    /**
     * Get all rates for a specific city
     * 
     * @param string $cityName City name
     * @param string $stateName State name
     * @param int $days Optional number of days to limit results
     * @return array Rates
     */
    public function getRatesForCity(string $cityName, string $stateName, int $days = 0): array {
        // Try normalized tables first
        try {
            $normalizedQuery = "SELECT ern.id, ern.rate, ern.date, c.name as city, s.name as state 
                              FROM {$this->table} ern
                              JOIN cities c ON ern.city_id = c.id
                              JOIN states s ON c.state_id = s.id
                              WHERE c.name = ? AND s.name = ?";
            
            $fallbackQuery = "SELECT id, rate, date, city, state 
                            FROM egg_rates
                            WHERE city = ? AND state = ?";
            
            $params = [$cityName, $stateName];
            
            if ($days > 0) {
                $date = new DateTime();
                $date->modify("-{$days} days");
                $fromDate = $date->format('Y-m-d');
                
                $normalizedQuery .= " AND ern.date >= ?";
                $fallbackQuery .= " AND date >= ?";
                $params[] = $fromDate;
            }
            
            $normalizedQuery .= " ORDER BY ern.date DESC";
            $fallbackQuery .= " ORDER BY date DESC";
            
            $result = $this->db->queryWithFallback($normalizedQuery, $fallbackQuery, $params);
            
            return $result;
        } catch (Exception $e) {
            return [];
        }
    }
    
    /**
     * Get all rates
     * 
     * @param string|null $date Optional date to filter
     * @return array Rates
     */
    public function getAllRates(?string $date = null): array {
        // Try normalized tables first
        try {
            $normalizedQuery = "SELECT ern.id, ern.rate, ern.date, c.name as city, s.name as state 
                              FROM {$this->table} ern
                              JOIN cities c ON ern.city_id = c.id
                              JOIN states s ON c.state_id = s.id";
            
            $fallbackQuery = "SELECT id, rate, date, city, state FROM egg_rates";
            
            $params = [];
            
            if ($date !== null) {
                $normalizedQuery .= " WHERE ern.date = ?";
                $fallbackQuery .= " WHERE date = ?";
                $params[] = $date;
            }
            
            $normalizedQuery .= " ORDER BY ern.date DESC, s.name, c.name";
            $fallbackQuery .= " ORDER BY date DESC, state, city";
            
            return $this->db->queryWithFallback($normalizedQuery, $fallbackQuery, $params);
        } catch (Exception $e) {
            return [];
        }
    }
    
    /**
     * Get average rates by state
     * 
     * @param string $stateName State name
     * @param int $days Number of days to include
     * @return array Average rates
     */
    public function getAverageRatesByState(string $stateName, int $days = 7): array {
        try {
            $date = new DateTime();
            $date->modify("-{$days} days");
            $fromDate = $date->format('Y-m-d');
            
            // Try normalized tables first
            $normalizedQuery = "SELECT ern.date, AVG(ern.rate) as avg_rate
                              FROM {$this->table} ern
                              JOIN cities c ON ern.city_id = c.id
                              JOIN states s ON c.state_id = s.id
                              WHERE s.name = ? AND ern.date >= ?
                              GROUP BY ern.date
                              ORDER BY ern.date";
            
            $fallbackQuery = "SELECT date, AVG(rate) as avg_rate
                            FROM egg_rates
                            WHERE state = ? AND date >= ?
                            GROUP BY date
                            ORDER BY date";
            
            return $this->db->queryWithFallback($normalizedQuery, $fallbackQuery, [$stateName, $fromDate]);
        } catch (Exception $e) {
            return [];
        }
    }
    
    /**
     * Update egg rate in both original and normalized tables
     * 
     * @param string $cityName City name
     * @param string $stateName State name
     * @param string $date Date of rate
     * @param float $rate Rate value
     * @return bool Success status
     */
    public function updateEggRate(string $cityName, string $stateName, string $date, float $rate): bool {
        return $this->transactionHandler->executeTransaction(function($conn) use ($cityName, $stateName, $date, $rate) {
            // 1. Update the original egg_rates table
            $stmt = $conn->prepare("SELECT id FROM egg_rates WHERE city = ? AND state = ? AND date = ?");
            $stmt->bind_param("sss", $cityName, $stateName, $date);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                // Update existing rate
                $stmt = $conn->prepare("UPDATE egg_rates SET rate = ? WHERE city = ? AND state = ? AND date = ?");
                $stmt->bind_param("dsss", $rate, $cityName, $stateName, $date);
                $stmt->execute();
            } else {
                // Insert new rate
                $stmt = $conn->prepare("INSERT INTO egg_rates (city, state, date, rate) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("sssd", $cityName, $stateName, $date, $rate);
                $stmt->execute();
            }
            
            // 2. Update the normalized tables
            $stateModel = new State($conn);
            $cityModel = new City($conn);
            
            $stateId = $stateModel->getStateId($stateName);
            $cityId = $cityModel->getCityId($cityName, $stateId);
            
            // Check if the rate already exists in normalized table
            $stmt = $conn->prepare("SELECT id FROM egg_rates_normalized WHERE city_id = ? AND date = ?");
            $stmt->bind_param("is", $cityId, $date);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                // Update existing normalized rate
                $rateId = $result->fetch_assoc()['id'];
                $stmt = $conn->prepare("UPDATE egg_rates_normalized SET rate = ? WHERE id = ?");
                $stmt->bind_param("di", $rate, $rateId);
                $stmt->execute();
            } else {
                // Insert new normalized rate
                $stmt = $conn->prepare("INSERT INTO egg_rates_normalized (city_id, date, rate) VALUES (?, ?, ?)");
                $stmt->bind_param("isd", $cityId, $date, $rate);
                $stmt->execute();
            }
            
            return true;
        });
    }
    
    /**
     * Delete egg rate from both original and normalized tables
     * 
     * @param int $id Rate ID
     * @return bool Success status
     */
    public function deleteEggRate(int $id): bool {
        return $this->transactionHandler->executeTransaction(function($conn) use ($id) {
            // Get the rate details from the original table
            $stmt = $conn->prepare("SELECT city, state, date FROM egg_rates WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return false;
            }
            
            $rate = $result->fetch_assoc();
            $cityName = $rate['city'];
            $stateName = $rate['state'];
            $date = $rate['date'];
            
            // Delete from original table
            $stmt = $conn->prepare("DELETE FROM egg_rates WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            
            // Find and delete from normalized table
            $stmt = $conn->prepare("SELECT ern.id 
                                  FROM egg_rates_normalized ern
                                  JOIN cities c ON ern.city_id = c.id
                                  JOIN states s ON c.state_id = s.id
                                  WHERE c.name = ? AND s.name = ? AND ern.date = ?");
            $stmt->bind_param("sss", $cityName, $stateName, $date);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $normalizedId = $result->fetch_assoc()['id'];
                $stmt = $conn->prepare("DELETE FROM egg_rates_normalized WHERE id = ?");
                $stmt->bind_param("i", $normalizedId);
                $stmt->execute();
            }
            
            return true;
        });
    }
    
    /**
     * Update multiple egg rates
     * 
     * @param array $rates Array of rate data
     * @return bool Success status
     */
    public function updateMultipleRates(array $rates): bool {
        if (empty($rates)) {
            return false;
        }
        
        return $this->transactionHandler->executeTransaction(function($conn) use ($rates) {
            foreach ($rates as $rate) {
                if (!isset($rate['city'], $rate['state'], $rate['date'], $rate['rate'])) {
                    throw new Exception("Missing required rate fields");
                }
                
                $cityName = $rate['city'];
                $stateName = $rate['state'];
                $date = $rate['date'];
                $rateValue = (float)$rate['rate'];
                
                // Update using the same logic as updateEggRate
                $stmt = $conn->prepare("SELECT id FROM egg_rates WHERE city = ? AND state = ? AND date = ?");
                $stmt->bind_param("sss", $cityName, $stateName, $date);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    // Update existing rate
                    $stmt = $conn->prepare("UPDATE egg_rates SET rate = ? WHERE city = ? AND state = ? AND date = ?");
                    $stmt->bind_param("dsss", $rateValue, $cityName, $stateName, $date);
                    $stmt->execute();
                } else {
                    // Insert new rate
                    $stmt = $conn->prepare("INSERT INTO egg_rates (city, state, date, rate) VALUES (?, ?, ?, ?)");
                    $stmt->bind_param("sssd", $cityName, $stateName, $date, $rateValue);
                    $stmt->execute();
                }
                
                // Update normalized tables
                $stateModel = new State($conn);
                $cityModel = new City($conn);
                
                $stateId = $stateModel->getStateId($stateName);
                $cityId = $cityModel->getCityId($cityName, $stateId);
                
                $stmt = $conn->prepare("SELECT id FROM egg_rates_normalized WHERE city_id = ? AND date = ?");
                $stmt->bind_param("is", $cityId, $date);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $rateId = $result->fetch_assoc()['id'];
                    $stmt = $conn->prepare("UPDATE egg_rates_normalized SET rate = ? WHERE id = ?");
                    $stmt->bind_param("di", $rateValue, $rateId);
                    $stmt->execute();
                } else {
                    $stmt = $conn->prepare("INSERT INTO egg_rates_normalized (city_id, date, rate) VALUES (?, ?, ?)");
                    $stmt->bind_param("isd", $cityId, $date, $rateValue);
                    $stmt->execute();
                }
            }
            
            return true;
        });
    }
}
?>
