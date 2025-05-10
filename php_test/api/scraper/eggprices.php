<?php
/**
 * API: Scrape Egg Prices from e2necc
 * 
 * Scrapes egg prices from e2necc.com and returns the data
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/Logger.php';

class E2NeccScraper {
    private $logger;
    private $sourceUrl = 'https://e2necc.com/eggprices.php';
    
    // City name mappings to standardize names from e2necc
    private $cityMapping = [
        'Ahmedabad' => 'Ahmedabad',
        'Ajmer' => 'Ajmer',
        'Banglore' => 'Bangalore', // Corrected spelling
        'Bangalore' => 'Bangalore',
        'Barwala' => 'Barwala',
        'Chennai' => 'Chennai',
        'Delhi' => 'Delhi',
        'East Godavari' => 'East Godavari',
        'Hyderabad' => 'Hyderabad',
        'Jabalpur' => 'Jabalpur',
        'Kanpur' => 'Kanpur',
        'Kolkata' => 'Kolkata',
        'Ludhiana' => 'Ludhiana',
        'Mumbai' => 'Mumbai',
        'Muzaffarnagar' => 'Muzaffarnagar',
        'Namakkal' => 'Namakkal',
        'Patna' => 'Patna',
        'Pune' => 'Pune',
        'Surat' => 'Surat',
        'Varanasi' => 'Varanasi',
        'Vijayawada' => 'Vijayawada',
        'Vizag' => 'Visakhapatnam', // Standardized to full name
        'Visakhapatnam' => 'Visakhapatnam',
        'West Godavari' => 'West Godavari'
        // Add more mappings as needed
    ];
    
    // State mappings for each city
    private $stateMapping = [
        'Ahmedabad' => 'Gujarat',
        'Ajmer' => 'Rajasthan',
        'Bangalore' => 'Karnataka',
        'Barwala' => 'Haryana',
        'Chennai' => 'Tamil Nadu',
        'Delhi' => 'Delhi',
        'East Godavari' => 'Andhra Pradesh',
        'Hyderabad' => 'Telangana',
        'Jabalpur' => 'Madhya Pradesh',
        'Kanpur' => 'Uttar Pradesh',
        'Kolkata' => 'West Bengal',
        'Ludhiana' => 'Punjab',
        'Mumbai' => 'Maharashtra',
        'Muzaffarnagar' => 'Uttar Pradesh',
        'Namakkal' => 'Tamil Nadu',
        'Patna' => 'Bihar',
        'Pune' => 'Maharashtra',
        'Surat' => 'Gujarat',
        'Varanasi' => 'Uttar Pradesh',
        'Visakhapatnam' => 'Andhra Pradesh',
        'West Godavari' => 'Andhra Pradesh'
        // Add more mappings as needed
    ];
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->logger = Logger::getInstance();
    }
    
    /**
     * Scrape egg prices
     * 
     * @return array|false Array of egg prices or false on failure
     */
    public function scrape() {
        $this->logger->info("Starting e2necc price scraping", "E2NeccScraper");
        
        // Fetch HTML content
        $html = $this->fetchHtml();
        
        if ($html === false) {
            return false;
        }
        
        // Extract table data
        $tableData = $this->extractTableData($html);
        
        if ($tableData === false) {
            return false;
        }
        
        // Process and format the data
        $formattedData = $this->formatData($tableData);
        
        $this->logger->info("Completed e2necc price scraping. Found " . count($formattedData) . " prices", "E2NeccScraper");
        
        return $formattedData;
    }
    
    /**
     * Fetch HTML from source URL
     * 
     * @return string|false HTML content or false on failure
     */
    private function fetchHtml() {
        try {
            $options = [
                'http' => [
                    'method' => 'GET',
                    'header' => 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
                    'timeout' => 30
                ],
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false
                ]
            ];
            
            $context = stream_context_create($options);
            $html = @file_get_contents($this->sourceUrl, false, $context);
            
            if ($html === false) {
                $this->logger->error("Failed to fetch HTML from {$this->sourceUrl}", "E2NeccScraper");
                return false;
            }
            
            return $html;
        } catch (Exception $e) {
            $this->logger->error("Exception while fetching HTML: " . $e->getMessage(), "E2NeccScraper");
            return false;
        }
    }
    
    /**
     * Extract table data from HTML
     * 
     * @param string $html HTML content
     * @return array|false Array of table rows or false on failure
     */
    private function extractTableData($html) {
        try {
            $dom = new DOMDocument();
            @$dom->loadHTML($html);
            
            $xpath = new DOMXPath($dom);
            
            // Find the main table with egg prices
            $tables = $xpath->query('//table');
            
            if ($tables->length === 0) {
                $this->logger->error("No tables found in HTML", "E2NeccScraper");
                return false;
            }
            
            // Usually the second table contains the egg prices
            $targetTable = null;
            
            foreach ($tables as $table) {
                $headers = $xpath->query('.//th', $table);
                
                // Check if this table has the expected headers
                foreach ($headers as $header) {
                    if (stripos($header->textContent, 'City') !== false || 
                        stripos($header->textContent, 'Rate') !== false) {
                        $targetTable = $table;
                        break 2;
                    }
                }
            }
            
            if ($targetTable === null) {
                $this->logger->error("Could not find egg price table", "E2NeccScraper");
                return false;
            }
            
            // Extract rows
            $rows = $xpath->query('.//tr', $targetTable);
            $data = [];
            $hasFoundHeader = false;
            
            foreach ($rows as $row) {
                $cells = $xpath->query('.//td|.//th', $row);
                $rowData = [];
                
                // Skip empty rows
                if ($cells->length === 0) {
                    continue;
                }
                
                // Extract cell content
                foreach ($cells as $cell) {
                    $rowData[] = trim($cell->textContent);
                }
                
                // Skip empty rows
                if (implode('', $rowData) === '') {
                    continue;
                }
                
                // Check if this is the header row
                if (!$hasFoundHeader) {
                    // Look for header indicators
                    foreach ($rowData as $cell) {
                        if (stripos($cell, 'City') !== false || 
                            stripos($cell, 'Rate') !== false) {
                            $hasFoundHeader = true;
                            break;
                        }
                    }
                    
                    if ($hasFoundHeader) {
                        // This is the header row, store column indices
                        $cityIndex = -1;
                        $rateIndex = -1;
                        
                        foreach ($rowData as $i => $cell) {
                            if (stripos($cell, 'City') !== false) {
                                $cityIndex = $i;
                            }
                            if (stripos($cell, 'Rate') !== false) {
                                $rateIndex = $i;
                            }
                        }
                        
                        if ($cityIndex === -1 || $rateIndex === -1) {
                            $this->logger->error("Could not find city or rate columns", "E2NeccScraper");
                            return false;
                        }
                        
                        // Store header indices
                        $data['headers'] = [
                            'cityIndex' => $cityIndex,
                            'rateIndex' => $rateIndex
                        ];
                        
                        continue;
                    }
                }
                
                // Skip if we haven't found the header row yet
                if (!$hasFoundHeader) {
                    continue;
                }
                
                // This is a data row, add it to our data array
                $data[] = $rowData;
            }
            
            if (!isset($data['headers'])) {
                $this->logger->error("Could not find header row", "E2NeccScraper");
                return false;
            }
            
            return $data;
        } catch (Exception $e) {
            $this->logger->error("Exception while extracting table data: " . $e->getMessage(), "E2NeccScraper");
            return false;
        }
    }
    
    /**
     * Format the extracted data
     * 
     * @param array $tableData Extracted table data
     * @return array Formatted egg price data
     */
    private function formatData($tableData) {
        $formattedData = [];
        $headers = $tableData['headers'];
        unset($tableData['headers']);
        
        foreach ($tableData as $row) {
            // Skip if row doesn't have enough cells
            if (!isset($row[$headers['cityIndex']]) || !isset($row[$headers['rateIndex']])) {
                continue;
            }
            
            $cityRaw = trim($row[$headers['cityIndex']]);
            $rateRaw = trim($row[$headers['rateIndex']]);
            
            // Skip rows with empty city or rate
            if (empty($cityRaw) || empty($rateRaw)) {
                continue;
            }
            
            // Standardize city name
            $city = isset($this->cityMapping[$cityRaw]) ? $this->cityMapping[$cityRaw] : $cityRaw;
            
            // Get state for city
            $state = isset($this->stateMapping[$city]) ? $this->stateMapping[$city] : 'Unknown';
            
            // Convert rate from paisa to rupees if needed
            $rate = $this->convertToRupees($rateRaw);
            
            // Add to formatted data
            $formattedData[] = [
                'city' => $city,
                'state' => $state,
                'rate' => $rate,
                'date' => date('Y-m-d') // Current date
            ];
        }
        
        return $formattedData;
    }
    
    /**
     * Convert rate from paisa to rupees if needed
     * 
     * @param string $rateString Rate string
     * @return float Converted rate
     */
    private function convertToRupees($rateString) {
        // Remove any non-numeric characters except decimal point
        $rate = preg_replace('/[^0-9.]/', '', $rateString);
        
        // Convert to float
        $rate = (float)$rate;
        
        // If rate is very high (likely in paisa), convert to rupees
        if ($rate > 1000) {
            $rate = $rate / 100;
        }
        
        return $rate;
    }
}

// Execute scraper if this script is called directly
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    header('Content-Type: application/json');
    
    try {
        $scraper = new E2NeccScraper();
        $data = $scraper->scrape();
        
        if ($data === false) {
            echo json_encode(['status' => 'error', 'message' => 'Failed to scrape egg prices']);
        } else {
            echo json_encode(['status' => 'success', 'data' => $data]);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
    }
}
