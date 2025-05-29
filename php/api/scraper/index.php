<?php
require_once __DIR__ . '/../core/BaseAPI.php';

class DataScraper extends BaseAPI {
    private $cityToState = [
        "Ahmedabad" => "Gujarat",
        "Ajmer" => "Rajasthan",
        "Barwala" => "Haryana",
        "Bengaluru (CC)" => "Karnataka",
        "Bengaluru" => "Karnataka",
        "Bangalore" => "Karnataka",
        "Brahmapur (OD)" => "Odisha",
        "Chennai (CC)" => "Tamil Nadu",
        "Chittoor" => "Andhra Pradesh",
        "Delhi (CC)" => "Delhi",
        "E.Godavari" => "Andhra Pradesh",
        "Hospet" => "Karnataka",
        "Hyderabad" => "Telangana",
        "Jabalpur" => "Madhya Pradesh",
        "Kolkata (WB)" => "West Bengal",
        "Ludhiana" => "Punjab",
        "Mumbai (CC)" => "Maharashtra",
        "Mysuru" => "Karnataka",
        "Namakkal" => "Tamil Nadu",
        "Pune" => "Maharashtra",
        "Raipur" => "Chhattisgarh",
        "Surat" => "Gujarat",
        "Vijayawada" => "Andhra Pradesh",
        "Vizag" => "Andhra Pradesh",
        "W.Godavari" => "Andhra Pradesh",
        "Warangal" => "Telangana"
    ];

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
    }    private function scrapeFromE2NECC() {
        $url = 'https://www.e2necc.com/home/eggprice';
        $context = stream_context_create([
            'http' => [
                'timeout' => 60,
                'ignore_errors' => true,
                'follow_location' => true,
                'protocol_version' => '1.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ]);

        // Try multiple times with increasing delays
        $maxRetries = 3;
        $retryDelay = 5;
        $html = false;
        
        for ($try = 1; $try <= $maxRetries; $try++) {
            $html = @file_get_contents($url, false, $context);
            if ($html !== false) {
                break;
            }
            if ($try < $maxRetries) {
                error_log("Retry $try failed for e2necc, waiting {$retryDelay}s before next attempt");
                sleep($retryDelay);
                $retryDelay *= 2; // Exponential backoff
            }
        }

        if (!$html) {
            $error = error_get_last();
            throw new Exception('Failed to fetch data from e2necc: ' . ($error['message'] ?? 'Unknown error'));
        }

        $doc = new DOMDocument();
        @$doc->loadHTML($html);
        $xpath = new DOMXPath($doc);
        
        // Look for the specific table with egg prices
        $tables = $xpath->query('//table[@border="1px"]');
        if ($tables->length === 0) {
            throw new Exception('Price table not found on e2necc website');
        }

        $updatedCities = [];
        $errors = [];
        $dayOfMonth = date('j'); // Get current day of month (1-31)
        
        $this->db->beginTransaction();
        
        try {
            foreach ($tables as $table) {
                $rows = $xpath->query('.//tr', $table);
                foreach ($rows as $rowIndex => $row) {
                    if ($rowIndex < 2) continue; // Skip header rows
                    
                    $cells = $xpath->query('.//td', $row);
                    if ($cells->length >= $dayOfMonth + 1) {
                        $city = trim($cells->item(0)->textContent);
                        
                        // Skip if city is empty or contains "Prevailing Prices"
                        if (empty($city) || strtolower($city) === 'prevailing prices') {
                            continue;
                        }
                        
                        // Clean and standardize city name
                        $city = preg_replace('/\s*\(.*?\)\s*/', '', $city);
                        $city = trim($city);
                        
                        // Standardize Bengaluru/Bangalore
                        if (strtolower($city) === 'bangalore') {
                            $city = 'Bengaluru';
                        }

                        // Get today's rate from the appropriate column
                        $rateCell = $cells->item($dayOfMonth);
                        if (!$rateCell) continue;
                        
                        $rate = trim($rateCell->textContent);
                        
                        // If today's rate is not available, find the last available rate
                        if ($rate === '-' || $rate === '') {
                            for ($i = $dayOfMonth - 1; $i > 0; $i--) {
                                $previousRate = trim($cells->item($i)->textContent);
                                if ($previousRate !== '-' && $previousRate !== '') {
                                    $rate = $previousRate;
                                    break;
                                }
                            }
                        }
                        
                        // Skip if no valid rate found
                        if ($rate === '-' || $rate === '') continue;
                        
                        // Convert paisa to rupees
                        $rateInRupees = $this->convertPaisaToRupees($rate);
                        if ($rateInRupees <= 0) continue;
                        
                        // Get state for city
                        $state = $this->cityToState[$city] ?? 'Unknown';
                        
                        try {
                            if ($this->updateRate($city, $state, $rateInRupees)) {
                                $updatedCities[] = [
                                    'city' => $city,
                                    'state' => $state,
                                    'rate' => $rateInRupees
                                ];
                            }
                        } catch (Exception $e) {
                            $errors[] = "Failed to update {$city}: " . $e->getMessage();
                            error_log("Error updating rate for {$city}: " . $e->getMessage());
                        }
                    }
                }
            }
            
            $this->db->commit();
            $this->cache->invalidateAll();
            
            if (empty($updatedCities)) {
                throw new Exception('No valid prices found in the table');
            }
            
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
            }            $this->db->commit();
            $this->cache->invalidateAll();
            
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

    private function updateRate($city, $state, $rate) {
        try {
            // Get or create state
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

            // Insert or update rate
            $stmt = $this->db->prepare("
                INSERT INTO egg_rates_normalized (city_id, rate, date)
                VALUES (?, ?, CURRENT_DATE)
                ON DUPLICATE KEY UPDATE rate = ?
            ");
            $stmt->execute([$cityId, $rate, $rate]);

            // Also update the updated_cities tracking table
            $stmt = $this->db->prepare("
                INSERT INTO updated_cities (city, state, date, rate) 
                VALUES (?, ?, CURRENT_DATE, ?)
                ON DUPLICATE KEY UPDATE rate = ?
            ");
            $stmt->execute([$city, $state, $rate, $rate]);

            return true;
        } catch (Exception $e) {
            error_log("Error in updateRate: " . $e->getMessage());
            throw $e; // Re-throw to be handled by caller
        }
    }

    private function convertPaisaToRupees($paisa) {
        return floatval(preg_replace('/[^0-9.]/', '', $paisa)) / 100;
    }
}

// Initialize and handle request
$scraper = new DataScraper();
$scraper->handleRequest();
