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
                        case 'cityState':
                            $this->getRatesForCityState();
                            break;
                        case 'averageByState':
                            $this->getAverageRatesByState();
                            break;
                        default:
                            $this->sendError('Invalid action');
                    }
                    break;
                    
                case 'POST':
                    switch ($action) {
                        case 'update':
                            $this->updateRate();
                            break;
                        case 'updateMultiple':
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

        $query = "SELECT r.*, l.city, l.state 
                 FROM rates r 
                 JOIN locations l ON r.location_id = l.id 
                 WHERE r.date = (SELECT MAX(date) FROM rates)";
        
        $stmt = $this->db->query($query);
        $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $this->cache->set($cacheKey, $rates, 1800); // 30 minutes cache
        $this->sendResponse($rates);
    }

    private function getSpecialRates() {
        $cacheKey = $this->getCacheKey('special_rates');
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }

        $query = "SELECT r.*, l.city, l.state 
                 FROM rates r 
                 JOIN locations l ON r.location_id = l.id 
                 WHERE l.state = 'special' 
                 AND r.date = (SELECT MAX(date) FROM rates WHERE location_id = r.location_id)";
        
        $stmt = $this->db->query($query);
        $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $this->cache->set($cacheKey, $rates, 1800);
        $this->sendResponse($rates);
    }

    private function getAllRates() {
        $date = $_GET['date'] ?? date('Y-m-d');
        
        $query = "SELECT r.*, l.city, l.state 
                 FROM rates r 
                 JOIN locations l ON r.location_id = l.id 
                 WHERE DATE(r.date) = ?";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$date]);
        $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $this->sendResponse($rates);
    }

    private function getRatesForCityState() {
        $city = $_GET['city'] ?? '';
        $state = $_GET['state'] ?? '';

        if (empty($city) || empty($state)) {
            $this->sendError('City and state parameters are required');
        }

        $cacheKey = $this->getCacheKey('city_state_rates', ['city' => $city, 'state' => $state]);
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }

        $query = "SELECT r.* 
                 FROM rates r 
                 JOIN locations l ON r.location_id = l.id 
                 WHERE l.city = ? AND l.state = ? 
                 ORDER BY r.date DESC";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$city, $state]);
        $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $this->cache->set($cacheKey, $rates, 1800);
        $this->sendResponse($rates);
    }

    private function getAverageRatesByState() {
        $state = $_GET['state'] ?? '';
        if (empty($state)) {
            $this->sendError('State parameter is required');
        }

        $cacheKey = $this->getCacheKey('avg_rates_state', ['state' => $state]);
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }

        $query = "SELECT DATE(r.date) as date, AVG(r.rate) as average_rate 
                 FROM rates r 
                 JOIN locations l ON r.location_id = l.id 
                 WHERE l.state = ? 
                 GROUP BY DATE(r.date) 
                 ORDER BY date DESC";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$state]);
        $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $result = ['averageRates' => $rates];
        $this->cache->set($cacheKey, $result, 1800);
        $this->sendResponse($result);
    }

    private function updateRate() {
        $data = $this->getJsonInput();
        $this->validateRequiredParams($data, ['id', 'rate']);

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("UPDATE rates SET rate = ? WHERE id = ?");
            $stmt->execute([$data['rate'], $data['id']]);

            $this->db->commit();
            $this->cache->clear();
            $this->sendResponse(['success' => true]);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->sendError($e->getMessage());
        }
    }

    private function updateMultipleRates() {
        $data = $this->getJsonInput();
        if (!is_array($data)) {
            $this->sendError('Invalid input format');
        }

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("UPDATE rates SET rate = ? WHERE id = ?");
            foreach ($data as $rate) {
                if (!isset($rate['id']) || !isset($rate['rate'])) {
                    throw new Exception('Invalid rate data format');
                }
                $stmt->execute([$rate['rate'], $rate['id']]);
            }

            $this->db->commit();
            $this->cache->clear();
            $this->sendResponse(['success' => true]);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->sendError($e->getMessage());
        }
    }

    private function deleteRate() {
        $data = $this->getJsonInput();
        $this->validateRequiredParams($data, ['id']);

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("DELETE FROM rates WHERE id = ?");
            $stmt->execute([$data['id']]);

            $this->db->commit();
            $this->cache->clear();
            $this->sendResponse(['success' => true]);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->sendError($e->getMessage());
        }
    }
}

// Initialize and handle request
$api = new RatesAPI();
$api->handleRequest();
