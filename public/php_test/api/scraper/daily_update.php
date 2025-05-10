<?php
/**
 * API: Daily Update
 * 
 * Updates egg rates for cities not updated by e2necc scraper
 * using state averages or previous rates
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/Logger.php';
require_once __DIR__ . '/../../models/Rate.php';
require_once __DIR__ . '/../../models/Location.php';
require_once __DIR__ . '/../../utils/Cache.php';

class DailyUpdater {
    private $logger;
    private $rateModel;
    private $locationModel;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->logger = Logger::getInstance();
        $this->rateModel = new Rate();
        $this->locationModel = new Location();
    }
    
    /**
     * Update rates for cities not updated by e2necc
     * 
     * @param array $updatedCities Cities already updated by e2necc
     * @return array Result statistics
     */
    public function update($updatedCities = []) {
        $result = [
            'updated' => 0,
            'skipped' => 0,
            'failed' => 0,
            'updated_cities' => []
        ];
        
        $this->logger->info("Starting daily update", "DailyUpdater");
        
        // Get all states and cities
        $statesAndCities = $this->locationModel->getAllStatesAndCities();
        
        if (empty($statesAndCities)) {
            $this->logger->error("No states and cities found", "DailyUpdater");
            return [
                'status' => 'error',
                'message' => 'No states and cities found'
            ];
        }
        
        // Current date
        $today = date('Y-m-d');
        
        // Process each state and its cities
        foreach ($statesAndCities as $state => $cities) {
            // Skip special state
            if (strtolower($state) === 'special') {
                continue;
            }
            
            // Calculate state average from updated cities first
            $stateUpdatedRates = [];
            
            foreach ($cities as $city) {
                // If city was updated by e2necc, get its rate
                if (in_array($city, $updatedCities)) {
                    $latestRate = $this->rateModel->getLatestRate($city, $state);
                    
                    if ($latestRate && $latestRate['date'] === $today) {
                        $stateUpdatedRates[] = (float)$latestRate['rate'];
                    }
                }
            }
            
            // Calculate state average
            $stateAverage = !empty($stateUpdatedRates) ? 
                array_sum($stateUpdatedRates) / count($stateUpdatedRates) : 
                null;
            
            // Update each city not already updated
            foreach ($cities as $city) {
                // Skip if already updated by e2necc
                if (in_array($city, $updatedCities)) {
                    $result['skipped']++;
                    continue;
                }
                
                try {
                    // Get latest rate for this city
                    $latestRate = $this->rateModel->getLatestRate($city, $state);
                    
                    // Skip if already updated today
                    if ($latestRate && $latestRate['date'] === $today) {
                        $result['skipped']++;
                        continue;
                    }
                    
                    // Determine new rate
                    $newRate = null;
                    
                    if ($stateAverage !== null) {
                        // Use state average if available
                        $newRate = $stateAverage;
                    } elseif ($latestRate) {
                        // Use previous rate if no state average
                        $newRate = (float)$latestRate['rate'];
                    } else {
                        // Skip if no rate can be determined
                        $result['skipped']++;
                        $this->logger->info("Skipping $city, $state: No rate data available", "DailyUpdater");
                        continue;
                    }
                    
                    // Add new rate
                    $success = $this->rateModel->addRate($city, $state, $newRate, $today);
                    
                    if ($success) {
                        $result['updated']++;
                        $result['updated_cities'][] = $city;
                        
                        // Clear cache for this city
                        Cache::delete('latest_rate_' . strtolower(str_replace(' ', '_', $city)) . '_' . strtolower(str_replace(' ', '_', $state)));
                    } else {
                        $result['failed']++;
                        $this->logger->error("Failed to update rate for $city, $state", "DailyUpdater");
                    }
                } catch (Exception $e) {
                    $result['failed']++;
                    $this->logger->error("Error updating rate for $city, $state: " . $e->getMessage(), "DailyUpdater");
                }
            }
        }
        
        // Clear general caches
        Cache::delete('latest_rates');
        Cache::delete('all_rates');
        Cache::delete('all_rates_date_' . $today);
        
        $this->logger->info("Completed daily update. Updated: {$result['updated']}, Skipped: {$result['skipped']}, Failed: {$result['failed']}", "DailyUpdater");
        
        $result['status'] = 'success';
        return $result;
    }
}

// Execute updater if this script is called directly
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    header('Content-Type: application/json');
    
    try {
        // Get updated cities from e2necc if specified
        $updatedCities = [];
        
        if (isset($_GET['e2necc']) && $_GET['e2necc'] === '1') {
            // Run e2necc update first
            require_once __DIR__ . '/update_from_e2necc.php';
            
            $e2neccUpdater = new E2NeccUpdater();
            $e2neccResult = $e2neccUpdater->update();
            
            if (isset($e2neccResult['updated_cities'])) {
                $updatedCities = $e2neccResult['updated_cities'];
            }
        }
        
        // Run daily update
        $updater = new DailyUpdater();
        $result = $updater->update($updatedCities);
        
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
}
