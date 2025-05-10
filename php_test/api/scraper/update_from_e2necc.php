<?php
/**
 * API: Update Rates from e2necc
 * 
 * Updates egg rates from e2necc scraper
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/Logger.php';
require_once __DIR__ . '/../../models/Rate.php';
require_once __DIR__ . '/../../utils/Cache.php';
require_once __DIR__ . '/eggprices.php';

class E2NeccUpdater {
    private $logger;
    private $rateModel;
    private $scraper;
    private $updatedCities = [];
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->logger = Logger::getInstance();
        $this->rateModel = new Rate();
        $this->scraper = new E2NeccScraper();
    }
    
    /**
     * Update egg rates from e2necc
     * 
     * @return array Result statistics
     */
    public function update() {
        $result = [
            'updated' => 0,
            'skipped' => 0,
            'failed' => 0,
            'updated_cities' => []
        ];
        
        $this->logger->info("Starting update from e2necc", "E2NeccUpdater");
        
        // Scrape data
        $data = $this->scraper->scrape();
        
        if ($data === false || empty($data)) {
            $this->logger->error("Failed to scrape data from e2necc", "E2NeccUpdater");
            return [
                'status' => 'error',
                'message' => 'Failed to scrape data from e2necc'
            ];
        }
        
        $this->logger->info("Scraped " . count($data) . " rates from e2necc", "E2NeccUpdater");
        
        // Update each rate
        foreach ($data as $item) {
            $city = $item['city'];
            $state = $item['state'];
            $rate = $item['rate'];
            $date = $item['date'];
            
            try {
                // Try to get the latest rate to see if we need to update
                $latestRate = $this->rateModel->getLatestRate($city, $state);
                
                // If the rate exists and is the same (for today), skip it
                if ($latestRate && 
                    $latestRate['date'] === $date && 
                    (float)$latestRate['rate'] === (float)$rate) {
                    $result['skipped']++;
                    continue;
                }
                
                // Otherwise, add the new rate
                $success = $this->rateModel->addRate($city, $state, $rate, $date);
                
                if ($success) {
                    $result['updated']++;
                    $result['updated_cities'][] = $city;
                    $this->updatedCities[] = $city; // Track updated cities
                    
                    // Clear cache for this city
                    Cache::delete('latest_rate_' . strtolower(str_replace(' ', '_', $city)) . '_' . strtolower(str_replace(' ', '_', $state)));
                } else {
                    $result['failed']++;
                    $this->logger->error("Failed to update rate for $city, $state", "E2NeccUpdater");
                }
            } catch (Exception $e) {
                $result['failed']++;
                $this->logger->error("Error updating rate for $city, $state: " . $e->getMessage(), "E2NeccUpdater");
            }
        }
        
        // Clear general caches
        Cache::delete('latest_rates');
        Cache::delete('all_rates');
        Cache::delete('all_rates_date_' . date('Y-m-d'));
        
        $this->logger->info("Completed update from e2necc. Updated: {$result['updated']}, Skipped: {$result['skipped']}, Failed: {$result['failed']}", "E2NeccUpdater");
        
        $result['status'] = 'success';
        return $result;
    }
    
    /**
     * Get list of cities that were updated
     * 
     * @return array List of updated cities
     */
    public function getUpdatedCities() {
        return $this->updatedCities;
    }
}

// Execute updater if this script is called directly
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    header('Content-Type: application/json');
    
    try {
        $updater = new E2NeccUpdater();
        $result = $updater->update();
        
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
}
