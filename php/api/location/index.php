<?php
require_once __DIR__ . '/../core/BaseAPI.php';

class LocationAPI extends BaseAPI {
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';

        try {
            switch ($method) {
                case 'GET':
                    switch ($action) {
                        case 'states':
                            $this->getStates();
                            break;
                        case 'cities':
                            $this->getCities($_GET['state'] ?? '');
                            break;
                        case 'all':
                            $this->getStatesAndCities();
                            break;
                        case 'stateForCity':
                            $this->getStateForCity($_GET['city'] ?? '');
                            break;
                        default:
                            $this->sendError('Invalid action');
                    }
                    break;
                    
                case 'POST':
                    $data = $this->getJsonInput();
                    switch ($action) {
                        case 'add':
                            $this->addStateOrCity($data);
                            break;
                        case 'remove':
                            $this->removeStateOrCity($data);
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

    private function getStates() {
        $cacheKey = $this->getCacheKey('states');
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }

        $stmt = $this->db->query("SELECT DISTINCT name as state FROM states ORDER BY name");
        $states = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $this->cache->set($cacheKey, $states, 3600);
        $this->sendResponse($states);
    }

    private function getCities($state) {
        if (empty($state)) {
            $this->sendError('State parameter is required');
        }

        $cacheKey = $this->getCacheKey('cities', ['state' => $state]);
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }

        $stmt = $this->db->prepare("
            SELECT c.name as city 
            FROM cities c 
            JOIN states s ON c.state_id = s.id 
            WHERE s.name = ? 
            ORDER BY c.name");
        $stmt->execute([$state]);
        $cities = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $this->cache->set($cacheKey, $cities, 3600);
        $this->sendResponse($cities);
    }

    private function getStatesAndCities() {
        $cacheKey = $this->getCacheKey('states_and_cities');
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }        $stmt = $this->db->query("
            SELECT s.name as state, c.name as city 
            FROM cities c 
            JOIN states s ON c.state_id = s.id 
            ORDER BY s.name, c.name");
        $result = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $result[$row['state']][] = $row['city'];
        }

        $this->cache->set($cacheKey, $result, 3600);
        $this->sendResponse($result);
    }

    private function getStateForCity($city) {
        if (empty($city)) {
            $this->sendError('City parameter is required');
        }

        $cacheKey = $this->getCacheKey('state_for_city', ['city' => $city]);
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }

        $stmt = $this->db->prepare("
            SELECT s.name as state 
            FROM cities c 
            JOIN states s ON c.state_id = s.id 
            WHERE c.name = ? 
            LIMIT 1");
        $stmt->execute([$city]);
        $state = $stmt->fetchColumn();

        if (!$state) {
            $this->sendError('City not found', 404);
        }

        $result = ['state' => $state];
        $this->cache->set($cacheKey, $result, 3600);
        $this->sendResponse($result);
    }

    private function addStateOrCity($data) {
        $this->validateRequiredParams($data, ['type', 'name']);
        
        try {
            $this->db->beginTransaction();

            if ($data['type'] === 'state') {
                $stmt = $this->db->prepare("INSERT INTO states (name) VALUES (?)");
                $stmt->execute([$data['name']]);
            } else if ($data['type'] === 'city') {
                if (empty($data['state'])) {
                    $this->sendError('State is required for adding a city');
                }
                $stateStmt = $this->db->prepare("SELECT id FROM states WHERE name = ?");
                $stateStmt->execute([$data['state']]);
                $stateId = $stateStmt->fetchColumn();

                if (!$stateId) {
                    throw new Exception("State not found");
                }

                $stmt = $this->db->prepare("INSERT INTO cities (name, state_id) VALUES (?, ?)");
                $stmt->execute([$data['name'], $data['state']]);
            } else {
                $this->sendError('Invalid type. Must be "state" or "city"');
            }

            $this->db->commit();
            $this->cache->clear();
            $this->sendResponse(['success' => true]);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->sendError($e->getMessage());
        }
    }

    private function removeStateOrCity($data) {
        $this->validateRequiredParams($data, ['type', 'name']);

        try {
            $this->db->beginTransaction();

            if ($data['type'] === 'state') {
                $stmt = $this->db->prepare("DELETE FROM states WHERE name = ?");
                $stmt->execute([$data['name']]);
            } else if ($data['type'] === 'city') {
                if (empty($data['state'])) {
                    $this->sendError('State is required for removing a city');
                }
                $stateStmt = $this->db->prepare("SELECT id FROM states WHERE name = ?");
                $stateStmt->execute([$data['state']]);
                $stateId = $stateStmt->fetchColumn();

                if (!$stateId) {
                    throw new Exception("State not found");
                }

                $stmt = $this->db->prepare("DELETE FROM cities WHERE name = ? AND state_id = ?");
                $stmt->execute([$data['name'], $data['state']]);
            } else {
                $this->sendError('Invalid type. Must be "state" or "city"');
            }

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
$api = new LocationAPI();
$api->handleRequest();
