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

        $query = "SELECT name as state FROM states ORDER BY name";
        $stmt = $this->db->query($query);
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

        $query = "SELECT c.name as city 
                 FROM cities c
                 JOIN states s ON c.state_id = s.id
                 WHERE s.name = ?
                 ORDER BY c.name";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$state]);
        $cities = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $this->cache->set($cacheKey, $cities, 3600);
        $this->sendResponse($cities);
    }

    private function getStatesAndCities() {
        $cacheKey = $this->getCacheKey('states_and_cities');
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }

        $query = "SELECT s.name as state, c.name as city 
                 FROM states s
                 LEFT JOIN cities c ON c.state_id = s.id
                 ORDER BY s.name, c.name";
        $stmt = $this->db->query($query);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response = [];
        foreach ($result as $row) {
            if (!isset($response[$row['state']])) {
                $response[$row['state']] = [];
            }
            if ($row['city']) {
                $response[$row['state']][] = $row['city'];
            }
        }

        $this->cache->set($cacheKey, $response, 3600);
        $this->sendResponse($response);
    }

    private function getStateForCity($city) {
        if (empty($city)) {
            $this->sendError('City parameter is required');
        }

        $cacheKey = $this->getCacheKey('state_for_city', ['city' => $city]);
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }

        // Try normalized table first
        try {
            $query = "SELECT s.name as state 
                     FROM cities c
                     JOIN states s ON c.state_id = s.id
                     WHERE c.name = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$city]);
            $state = $stmt->fetchColumn();
        } catch (Exception $e) {
            // Fallback to original table
            $query = "SELECT state FROM locations WHERE city = ? LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$city]);
            $state = $stmt->fetchColumn();
        }

        if (!$state) {
            $this->sendError('City not found');
        }

        $this->cache->set($cacheKey, $state, 3600);
        $this->sendResponse($state);
    }

    private function addStateOrCity($data) {
        if (!isset($data['type']) || !in_array($data['type'], ['state', 'city'])) {
            $this->sendError('Type must be either "state" or "city"');
        }

        if (!isset($data['name']) || empty($data['name'])) {
            $this->sendError('Name is required');
        }

        if ($data['type'] === 'city' && (!isset($data['state']) || empty($data['state']))) {
            $this->sendError('State is required for city');
        }

        $this->db->beginTransaction();

        try {
            if ($data['type'] === 'state') {
                // Try normalized table first
                try {
                    $stmt = $this->db->prepare("INSERT INTO states (name) VALUES (?)");
                    $stmt->execute([$data['name']]);
                } catch (Exception $e) {
                    // Add a dummy city entry in locations table to represent the state
                    $stmt = $this->db->prepare("INSERT INTO locations (state, city) VALUES (?, '_state')");
                    $stmt->execute([$data['name']]);
                }
            } else {
                // Try normalized table first
                try {
                    // Get state ID
                    $stmt = $this->db->prepare("SELECT id FROM states WHERE name = ?");
                    $stmt->execute([$data['state']]);
                    $stateId = $stmt->fetchColumn();

                    if (!$stateId) {
                        $stmt = $this->db->prepare("INSERT INTO states (name) VALUES (?)");
                        $stmt->execute([$data['state']]);
                        $stateId = $this->db->lastInsertId();
                    }

                    $stmt = $this->db->prepare("INSERT INTO cities (name, state_id) VALUES (?, ?)");
                    $stmt->execute([$data['name'], $stateId]);
                } catch (Exception $e) {
                    // Fallback to original table
                    $stmt = $this->db->prepare("INSERT INTO locations (state, city) VALUES (?, ?)");
                    $stmt->execute([$data['state'], $data['name']]);
                }
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
        if (!isset($data['type']) || !in_array($data['type'], ['state', 'city'])) {
            $this->sendError('Type must be either "state" or "city"');
        }

        if (!isset($data['name']) || empty($data['name'])) {
            $this->sendError('Name is required');
        }

        if ($data['type'] === 'city' && (!isset($data['state']) || empty($data['state']))) {
            $this->sendError('State is required for city');
        }

        $this->db->beginTransaction();

        try {
            if ($data['type'] === 'state') {
                // Try normalized table first
                try {
                    $stmt = $this->db->prepare("DELETE FROM states WHERE name = ?");
                    $stmt->execute([$data['name']]);
                    $stmt = $this->db->prepare("DELETE FROM cities WHERE state_id IN (SELECT id FROM states WHERE name = ?)");
                    $stmt->execute([$data['name']]);
                } catch (Exception $e) {
                    // Fallback to original table
                    $stmt = $this->db->prepare("DELETE FROM locations WHERE state = ?");
                    $stmt->execute([$data['name']]);
                }
            } else {
                // Try normalized table first
                try {
                    $stmt = $this->db->prepare("DELETE FROM cities WHERE name = ? AND state_id = (SELECT id FROM states WHERE name = ?)");
                    $stmt->execute([$data['name'], $data['state']]);
                } catch (Exception $e) {
                    // Fallback to original table
                    $stmt = $this->db->prepare("DELETE FROM locations WHERE city = ? AND state = ?");
                    $stmt->execute([$data['name'], $data['state']]);
                }
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
