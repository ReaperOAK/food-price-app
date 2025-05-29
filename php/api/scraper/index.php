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
        $html = file_get_contents($url);
        if (!$html) {
            throw new Exception('Failed to fetch data from e2necc');
        }

        // Parse the HTML table
        $updatedCities = [];
        $doc = new DOMDocument();
        @$doc->loadHTML($html);
        $tables = $doc->getElementsByTagName('table');
        
        foreach ($tables as $table) {
            $rows = $table->getElementsByTagName('tr');
            foreach ($rows as $row) {
                $cols = $row->getElementsByTagName('td');
                if ($cols->length >= 2) {
                    $city = trim($cols->item(0)->textContent);
                    $rate = $this->convertPaisaToRupees(trim($cols->item(1)->textContent));
                    
                    if ($city && $rate) {
                        $this->updateRate($city, $rate);
                        $updatedCities[] = $city;
                    }
                }
            }
        }

        $this->cache->clear();
        $this->sendResponse([
            'success' => true,
            'updated_cities' => $updatedCities
        ]);
    }

    private function performDailyUpdate() {
        // Get cities not updated by e2necc
        $query = "SELECT l.id, l.city, l.state 
                 FROM locations l 
                 LEFT JOIN rates r ON l.id = r.location_id 
                 AND r.date = CURRENT_DATE 
                 WHERE r.id IS NULL";
        
        $stmt = $this->db->query($query);
        $pendingCities = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $updated = [];
        foreach ($pendingCities as $city) {
            // Get latest rate or state average
            $rate = $this->estimateRate($city);
            if ($rate) {
                $this->insertRate($city['id'], $rate);
                $updated[] = $city['city'];
            }
        }

        $this->cache->clear();
        $this->sendResponse([
            'success' => true,
            'updated_cities' => $updated
        ]);
    }

    private function convertPaisaToRupees($paisa) {
        return floatval(preg_replace('/[^0-9.]/', '', $paisa)) / 100;
    }

    private function updateRate($city, $rate) {
        $stmt = $this->db->prepare("
            INSERT INTO rates (location_id, rate, date)
            SELECT id, ?, CURRENT_DATE
            FROM locations
            WHERE city = ?
        ");
        return $stmt->execute([$rate, $city]);
    }

    private function estimateRate($city) {
        // Try to get state average
        $stmt = $this->db->prepare("
            SELECT AVG(r.rate) as avg_rate
            FROM rates r
            JOIN locations l ON r.location_id = l.id
            WHERE l.state = ? AND r.date = CURRENT_DATE
        ");
        $stmt->execute([$city['state']]);
        $avgRate = $stmt->fetchColumn();

        if ($avgRate) {
            return $avgRate;
        }

        // Fall back to previous day's rate
        $stmt = $this->db->prepare("
            SELECT rate
            FROM rates
            WHERE location_id = ?
            ORDER BY date DESC
            LIMIT 1
        ");
        $stmt->execute([$city['id']]);
        return $stmt->fetchColumn();
    }

    private function insertRate($locationId, $rate) {
        $stmt = $this->db->prepare("
            INSERT INTO rates (location_id, rate, date)
            VALUES (?, ?, CURRENT_DATE)
        ");
        return $stmt->execute([$locationId, $rate]);
    }
}

// Initialize and handle request
$scraper = new DataScraper();
$scraper->handleRequest();
