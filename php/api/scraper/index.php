<?php
require_once __DIR__ . '/../core/BaseAPI.php';

class DataScraper extends BaseAPI {
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';

        try {
            switch ($action) {
                case 'scrape-e2necc':
                    $this->scrapeFromE2NECC();
                    break;
                case 'daily-update':
                    $this->performDailyUpdate();
                    break;
                default:
                    $this->sendError('Invalid action');
            }
        } catch (Exception $e) {
            $this->sendError($e->getMessage());
        }
    }

    private function scrapeFromE2NECC() {
        $url = 'https://www.e2necc.com/eggprices.asp';
        $context = stream_context_create([
            'http' => ['timeout' => 60],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false
            ]
        ]);

        $html = @file_get_contents($url, false, $context);
        if (!$html) {
            throw new Exception('Failed to fetch data from e2necc');
        }

        $doc = new DOMDocument();
        @$doc->loadHTML($html);
        
        $tables = $doc->getElementsByTagName('table');
        $updatedCities = [];
        $errors = [];
        
        $this->db->beginTransaction();
        
        try {
            foreach ($tables as $table) {
                $rows = $table->getElementsByTagName('tr');
                foreach ($rows as $row) {
                    $cols = $row->getElementsByTagName('td');
                    if ($cols->length >= 2) {
                        $city = trim($cols->item(0)->textContent);
                        $rate = $this->convertPaisaToRupees(trim($cols->item(1)->textContent));
                        
                        if ($city && $rate) {
                            try {
                                $this->updateRate($city, $rate);
                                $updatedCities[] = $city;
                            } catch (Exception $e) {
                                $errors[] = "Failed to update {$city}: " . $e->getMessage();
                            }
                        }
                    }
                }
            }

            $this->db->commit();
            $this->cache->clear();
            
            if (empty($errors)) {
                $this->sendResponse([
                    'success' => true,
                    'updated_cities' => $updatedCities
                ]);
            } else {
                $this->sendResponse([
                    'partial_success' => true,
                    'updated_cities' => $updatedCities,
                    'errors' => $errors
                ]);
            }
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function performDailyUpdate() {
        $errors = [];
        $updatedCities = [];
        
        $this->db->beginTransaction();
        
        try {
            // Try normalized tables first
            try {
                $query = "SELECT c.id, c.name as city, s.name as state
                         FROM cities c
                         JOIN states s ON c.state_id = s.id
                         LEFT JOIN egg_rates_normalized r ON c.id = r.city_id AND r.date = CURRENT_DATE
                         WHERE r.id IS NULL";
                $stmt = $this->db->query($query);
                $pendingCities = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($pendingCities as $city) {
                    $rate = $this->estimateRate($city);
                    if ($rate !== null) {
                        $stmt = $this->db->prepare("
                            INSERT INTO egg_rates_normalized (city_id, rate, date)
                            VALUES (?, ?, CURRENT_DATE)
                        ");
                        $stmt->execute([$city['id'], $rate]);
                        $updatedCities[] = $city['city'];
                    }
                }
            } catch (Exception $e) {
                // Fallback to original tables
                $query = "SELECT l.id, l.city, l.state 
                         FROM locations l
                         LEFT JOIN rates r ON l.id = r.location_id AND r.date = CURRENT_DATE
                         WHERE r.id IS NULL";
                $stmt = $this->db->query($query);
                $pendingCities = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($pendingCities as $city) {
                    $rate = $this->estimateRate($city);
                    if ($rate !== null) {
                        $stmt = $this->db->prepare("
                            INSERT INTO rates (location_id, rate, date)
                            VALUES (?, ?, CURRENT_DATE)
                        ");
                        $stmt->execute([$city['id'], $rate]);
                        $updatedCities[] = $city['city'];
                    }
                }
            }

            $this->db->commit();
            $this->cache->clear();
            
            $this->sendResponse([
                'success' => true,
                'updated_cities' => $updatedCities,
                'errors' => $errors
            ]);
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function estimateRate($city) {
        try {
            // First try to get today's rate
            $stmt = $this->db->prepare("
                SELECT er.rate 
                FROM egg_rates_normalized er
                JOIN cities c ON er.city_id = c.id
                WHERE c.name = ? AND er.date = CURRENT_DATE
            ");
            $stmt->execute([$city['name']]);
            $rate = $stmt->fetchColumn();

            if (!$rate) {
                // Try getting the latest rate for this city
                $stmt = $this->db->prepare("
                    SELECT er.rate 
                    FROM egg_rates_normalized er
                    JOIN cities c ON er.city_id = c.id
                    WHERE c.name = ?
                    ORDER BY er.date DESC
                    LIMIT 1
                ");
                $stmt->execute([$city['name']]);
                $rate = $stmt->fetchColumn();
            }

            if (!$rate) {
                // Try getting average rate for the state
                $stmt = $this->db->prepare("
                    SELECT AVG(er.rate) 
                    FROM egg_rates_normalized er
                    JOIN cities c ON er.city_id = c.id
                    JOIN states s ON c.state_id = s.id
                    WHERE s.name = ? AND er.date = CURRENT_DATE
                ");
                $stmt->execute([$city['state']]);
                $rate = $stmt->fetchColumn();
            }

            return $rate;
        } catch (Exception $e) {
            error_log("Error in estimateRate: " . $e->getMessage());
            return null;
        }
    }

    private function updateRate($city, $rate) {
        try {
            // Get or create state
            $state = 'Unknown';  // Default state
            $stmt = $this->db->prepare("INSERT INTO states (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)");
            $stmt->execute([$state]);
            $stateId = $this->db->lastInsertId();

            // Get or create city
            $stmt = $this->db->prepare("
                INSERT INTO cities (name, state_id) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
            ");
            $stmt->execute([$city, $stateId]);
            $cityId = $this->db->lastInsertId();

            // Insert rate
            $stmt = $this->db->prepare("
                INSERT INTO egg_rates_normalized (city_id, rate, date)
                VALUES (?, ?, CURRENT_DATE)
                ON DUPLICATE KEY UPDATE rate = ?
            ");
            $stmt->execute([$cityId, $rate, $rate]);

            return true;
        } catch (Exception $e) {
            error_log("Error in updateRate: " . $e->getMessage());
            return false;
        }
    }

    private function convertPaisaToRupees($paisa) {
        return floatval(preg_replace('/[^0-9.]/', '', $paisa)) / 100;
    }
}

// Initialize and handle request
$scraper = new DataScraper();
$scraper->handleRequest();
