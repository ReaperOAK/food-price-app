<?php
require_once __DIR__ . '/../core/BaseAPI.php';

class RatesAPI extends BaseAPI {
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';

        try {
            switch ($method) {
                case 'GET':
                    switch ($action) {
                        case 'latest':
                            $this->getLatestRates();
                            break;
                        case 'special':
                            $this->getSpecialRates();
                            break;
                        case 'all':
                            $this->getAllRates();
                            break;
                        case 'city-state':
                            $this->getRatesForCityState();
                            break;
                        case 'average-by-state':
                            $this->getAverageRatesByState();
                            break;
                        default:
                            $this->sendError('Invalid action');
                    }
                    break;
                    
                case 'POST':
                    switch ($action) {
                        case 'add':
                            $this->addRate();
                            break;
                        case 'update':
                            $this->updateRate();
                            break;
                        case 'update-multiple':
                            $this->updateMultipleRates();
                            break;
                        case 'delete':
                            $this->deleteRate();
                            break;
                        default:
                            $this->sendError('Invalid action');
                    }
                    break;

                default:
                    $this->sendError('Method not allowed', 405);
            }
        } catch (Exception $e) {
            $this->sendError($e->getMessage());
        }
    }

    private function getLatestRates() {
        $cacheKey = $this->getCacheKey('latest_rates');
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }

        try {
            $query = "WITH LatestRates AS (
                     SELECT city_id, rate, date,
                            ROW_NUMBER() OVER (PARTITION BY city_id ORDER BY date DESC) as rn
                     FROM egg_rates_normalized
                     )
                     SELECT c.name as city, s.name as state, lr.date, lr.rate
                     FROM LatestRates lr
                     JOIN cities c ON lr.city_id = c.id
                     JOIN states s ON c.state_id = s.id
                     WHERE lr.rn = 1
                     ORDER BY s.name, c.name";
            $stmt = $this->db->query($query);
            $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->cache->set($cacheKey, $rates, 3600);
            $this->sendResponse($rates);
        } catch (Exception $e) {
            error_log("Error in getLatestRates: " . $e->getMessage());
            $this->sendError('Failed to retrieve rates');
        }
    }

    private function getSpecialRates() {
        $cacheKey = $this->getCacheKey('special_rates');
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }

        try {
            $query = "WITH LatestRates AS (
                     SELECT city_id, rate, date,
                            ROW_NUMBER() OVER (PARTITION BY city_id ORDER BY date DESC) as rn
                     FROM egg_rates_normalized
                     )
                     SELECT c.name as city, s.name as state, lr.date, lr.rate
                     FROM LatestRates lr
                     JOIN cities c ON lr.city_id = c.id
                     JOIN states s ON c.state_id = s.id
                     WHERE lr.rn = 1 AND s.name = 'Special'
                     ORDER BY c.name";
            $stmt = $this->db->query($query);
            $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->cache->set($cacheKey, $rates, 3600);
            $this->sendResponse($rates);
        } catch (Exception $e) {
            error_log("Error in getSpecialRates: " . $e->getMessage());
            $this->sendError('Failed to retrieve special rates');
        }
    }

    private function getAllRates() {
        $date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
        
        $cacheKey = $this->getCacheKey('all_rates', ['date' => $date]);
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }

        try {
            $query = "SELECT c.name as city, s.name as state, er.date, er.rate
                     FROM egg_rates_normalized er
                     JOIN cities c ON er.city_id = c.id
                     JOIN states s ON c.state_id = s.id
                     WHERE DATE(er.date) = :date
                     ORDER BY s.name, c.name";
            $stmt = $this->db->prepare($query);
            $stmt->execute(['date' => $date]);
            $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->cache->set($cacheKey, $rates, 3600);
            $this->sendResponse($rates);
        } catch (Exception $e) {
            error_log("Error in getAllRates: " . $e->getMessage());
            $this->sendError('Failed to retrieve rates');
        }
    }

    private function getRatesForCityState() {
        $city = $_GET['city'] ?? '';
        $state = $_GET['state'] ?? '';
        $days = $_GET['days'] ?? null;

        if (empty($city) || empty($state)) {
            $this->sendError('City and state parameters are required');
        }

        $cacheKey = $this->getCacheKey('city_state_rates', [
            'city' => $city,
            'state' => $state,
            'days' => $days
        ]);

        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
            return;
        }

        try {
            // Try normalized tables first
            $params = ['city' => $city, 'state' => $state];
            $query = "
                SELECT ern.date, ern.rate
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE c.name = :city AND s.name = :state
            ";

            if ($days) {
                $query .= " ORDER BY ern.date DESC LIMIT :days";
                $params['days'] = (int)$days;
            } else {
                $query .= " ORDER BY ern.date DESC";
            }

            $stmt = $this->db->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }
            $stmt->execute();
            $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($rates)) {
                // Fall back to original table
                unset($params['days']); // Reset params for new query
                $query = "SELECT date, rate FROM egg_rates WHERE city = :city AND state = :state";
                
                if ($days) {
                    $query .= " ORDER BY date DESC LIMIT :days";
                    $params['days'] = (int)$days;
                } else {
                    $query .= " ORDER BY date DESC";
                }

                $stmt = $this->db->prepare($query);
                foreach ($params as $key => $value) {
                    $stmt->bindValue($key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
                }
                $stmt->execute();
                $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }

            $this->cache->set($cacheKey, $rates, 1800);
            $this->sendResponse($rates);
        } catch (Exception $e) {
            error_log("Error in getRatesForCityState: " . $e->getMessage());
            $this->sendError('Failed to retrieve rates');
        }
    }

    private function getAverageRatesByState() {
        $state = $_GET['state'] ?? '';
        $period = $_GET['period'] ?? '30'; // Default to 30 days
        
        if (empty($state)) {
            $this->sendError('State parameter is required');
        }

        $cacheKey = $this->getCacheKey('avg_rates_state', [
            'state' => $state,
            'period' => $period
        ]);

        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
            return;
        }

        try {
            $startDate = date('Y-m-d', strtotime("-$period days"));
            
            // Try normalized tables first
            $query = "
                SELECT ern.date, AVG(ern.rate) as averageRate
                FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE s.name = :state AND ern.date >= :startDate
                GROUP BY ern.date
                ORDER BY ern.date ASC
            ";

            $stmt = $this->db->prepare($query);
            $stmt->execute([
                'state' => $state,
                'startDate' => $startDate
            ]);
            $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($rates)) {
                // Fall back to original table
                $query = "
                    SELECT date, AVG(rate) as averageRate 
                    FROM egg_rates 
                    WHERE state = :state AND date >= :startDate
                    GROUP BY date
                    ORDER BY date ASC
                ";
                
                $stmt = $this->db->prepare($query);
                $stmt->execute([
                    'state' => $state,
                    'startDate' => $startDate
                ]);
                $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }

            // Calculate statistics
            $statistics = [];
            if (!empty($rates)) {
                $allRates = array_column($rates, 'averageRate');
                $statistics = [
                    'min' => min($allRates),
                    'max' => max($allRates),
                    'average' => number_format(array_sum($allRates) / count($allRates), 2, '.', ''),
                    'count' => count($allRates),
                    'period' => $period . ' days'
                ];
            }

            $response = [
                'state' => $state,
                'averageRates' => $rates,
                'statistics' => $statistics
            ];

            $this->cache->set($cacheKey, $response, 1800);
            $this->sendResponse($response);
        } catch (Exception $e) {
            error_log("Error in getAverageRatesByState: " . $e->getMessage());
            $this->sendError('Failed to retrieve average rates');
        }
    }

    private function addRate() {
        $data = $this->getJsonInput();
        $this->validateRequiredParams($data, ['city', 'state', 'date', 'rate']);

        try {
            $this->db->beginTransaction();

            // Use the shared updateEggRate function from db.php
            if (updateEggRate($this->db, $data['city'], $data['state'], $data['date'], $data['rate'])) {
                $this->db->commit();
                $this->cache->invalidateAll();
                $this->sendResponse(['success' => true, 'message' => 'Rate added successfully']);
            } else {
                throw new Exception('Failed to add rate');
            }
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error in addRate: " . $e->getMessage());
            $this->sendError('Failed to add rate');
        }
    }

    private function updateRate() {
        $data = $this->getJsonInput();
        $this->validateRequiredParams($data, ['id', 'city', 'state', 'date', 'rate']);

        try {
            $this->db->beginTransaction();

            // First update the original table
            $stmt = $this->db->prepare("UPDATE egg_rates SET city = ?, state = ?, date = ?, rate = ? WHERE id = ?");
            $stmt->execute([$data['city'], $data['state'], $data['date'], $data['rate'], $data['id']]);

            // Then update the normalized table
            if (updateEggRate($this->db, $data['city'], $data['state'], $data['date'], $data['rate'])) {
                $this->db->commit();
                $this->cache->invalidateAll();
                $this->sendResponse(['success' => true, 'message' => 'Rate updated successfully']);
            } else {
                throw new Exception('Failed to update rate in normalized tables');
            }
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error in updateRate: " . $e->getMessage());
            $this->sendError('Failed to update rate');
        }
    }

    private function updateMultipleRates() {
        $data = $this->getJsonInput();
        if (!is_array($data)) {
            $this->sendError('Invalid input format');
        }

        try {
            $this->db->beginTransaction();
            $successCount = 0;
            $errors = [];

            foreach ($data as $rate) {
                if (!isset($rate['city'], $rate['state'], $rate['date'], $rate['rate'])) {
                    throw new Exception('Invalid rate data format');
                }

                if (updateEggRate($this->db, $rate['city'], $rate['state'], $rate['date'], $rate['rate'])) {
                    $successCount++;
                } else {
                    $errors[] = "Failed to update rate for {$rate['city']}, {$rate['state']} on {$rate['date']}";
                }
            }

            if (empty($errors)) {
                $this->db->commit();
                $this->cache->invalidateAll();
                $this->sendResponse([
                    'success' => true,
                    'message' => 'All rates updated successfully',
                    'count' => $successCount
                ]);
            } else {
                throw new Exception(implode('; ', $errors));
            }
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error in updateMultipleRates: " . $e->getMessage());
            $this->sendError('Failed to update rates: ' . $e->getMessage());
        }
    }

    private function deleteRate() {
        $data = $this->getJsonInput();
        $this->validateRequiredParams($data, ['id']);

        try {
            $this->db->beginTransaction();

            // First get the rate details from original table
            $stmt = $this->db->prepare("SELECT city, state, date FROM egg_rates WHERE id = ?");
            $stmt->execute([$data['id']]);
            $rate = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$rate) {
                throw new Exception('Rate not found');
            }

            // Delete from original table
            $stmt = $this->db->prepare("DELETE FROM egg_rates WHERE id = ?");
            $stmt->execute([$data['id']]);

            // Delete from normalized table
            $stmt = $this->db->prepare("
                DELETE ern FROM egg_rates_normalized ern
                JOIN cities c ON ern.city_id = c.id
                JOIN states s ON c.state_id = s.id
                WHERE c.name = ? AND s.name = ? AND ern.date = ?
            ");
            $stmt->execute([$rate['city'], $rate['state'], $rate['date']]);

            $this->db->commit();
            $this->cache->invalidateAll();
            $this->sendResponse(['success' => true, 'message' => 'Rate deleted successfully']);
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error in deleteRate: " . $e->getMessage());
            $this->sendError('Failed to delete rate');
        }
    }
}

// Initialize and handle request
$api = new RatesAPI();
$api->handleRequest();
