<?php
/**
 * Automated SEO Backend Service
 * Handles CSV processing, database operations, and SEO automation
 */

require_once __DIR__ . '/config/db.php';

class AutomatedSEOService {
    private $db;
    private $logFile;
    
    public function __construct() {
        $this->db = Database::getConnection();
        $this->logFile = __DIR__ . '/logs/seo_automation.log';
        
        // Ensure log directory exists
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }

    /**
     * Process CSV files from reports directory
     */
    public function processCSVReports() {
        $this->log("Starting CSV report processing...");
        
        try {
            $reportsDir = __DIR__ . '/../reports/';
            $csvFiles = glob($reportsDir . '*.csv');
            
            $results = [
                'processed_files' => 0,
                'total_records' => 0,
                'optimizations_created' => 0,
                'errors' => []
            ];
            
            foreach ($csvFiles as $csvFile) {
                $filename = basename($csvFile);
                $this->log("Processing file: {$filename}");
                
                try {
                    $records = $this->processCSVFile($csvFile);
                    $results['processed_files']++;
                    $results['total_records'] += $records;
                    
                    // Log processing in database
                    $this->logReportProcessing($filename, $records, 'completed');
                    
                } catch (Exception $e) {
                    $error = "Error processing {$filename}: " . $e->getMessage();
                    $results['errors'][] = $error;
                    $this->log($error, 'ERROR');
                    
                    // Log error in database
                    $this->logReportProcessing($filename, 0, 'failed', $e->getMessage());
                }
            }
            
            // Generate optimizations based on processed data
            $optimizations = $this->generateOptimizations();
            $results['optimizations_created'] = $optimizations;
            
            // Update daily insights
            $this->updateDailyInsights();
            
            $this->log("CSV processing completed. Processed {$results['processed_files']} files, {$results['total_records']} records, {$optimizations} optimizations created.");
            
            return $results;
            
        } catch (Exception $e) {
            $this->log("Critical error in CSV processing: " . $e->getMessage(), 'ERROR');
            throw $e;
        }
    }

    /**
     * Process individual CSV file
     */
    private function processCSVFile($csvFile) {
        $filename = basename($csvFile);
        $recordCount = 0;
        
        if (($handle = fopen($csvFile, "r")) !== FALSE) {
            $headers = fgetcsv($handle); // Read headers
            
            while (($data = fgetcsv($handle)) !== FALSE) {
                if (count($data) !== count($headers)) {
                    continue; // Skip malformed rows
                }
                
                $row = array_combine($headers, $data);
                
                // Process based on file type
                switch (true) {
                    case strpos($filename, 'Queries') !== false:
                        $this->processQueryData($row);
                        break;
                    case strpos($filename, 'Pages') !== false:
                        $this->processPageData($row);
                        break;
                    case strpos($filename, 'Countries') !== false:
                        $this->processCountryData($row);
                        break;
                    case strpos($filename, 'Devices') !== false:
                        $this->processDeviceData($row);
                        break;
                }
                
                $recordCount++;
            }
            
            fclose($handle);
        }
        
        return $recordCount;
    }

    /**
     * Process query/keyword data
     */
    private function processQueryData($row) {
        $keyword = trim($row['Top queries'] ?? '');
        $clicks = intval($row['Clicks'] ?? 0);
        $impressions = intval($row['Impressions'] ?? 0);
        $ctr = floatval(str_replace('%', '', $row['CTR'] ?? 0));
        $position = floatval($row['Position'] ?? 0);
        
        if (empty($keyword)) return;
        
        // Call stored procedure to update keyword performance
        $stmt = $this->db->prepare("CALL UpdateKeywordPerformance(?, ?, ?, ?, ?)");
        $stmt->execute([$keyword, $clicks, $impressions, $ctr, $position]);
    }

    /**
     * Process page performance data
     */
    private function processPageData($row) {
        $pageUrl = trim($row['Top pages'] ?? '');
        $clicks = intval($row['Clicks'] ?? 0);
        $impressions = intval($row['Impressions'] ?? 0);
        $ctr = floatval(str_replace('%', '', $row['CTR'] ?? 0));
        $position = floatval($row['Position'] ?? 0);
        
        if (empty($pageUrl)) return;
        
        $pageType = $this->determinePageType($pageUrl);
        $optimizationPotential = $impressions * (2 - $ctr) * (21 - $position);
        
        $stmt = $this->db->prepare("
            INSERT INTO seo_pages (page_url, page_type, clicks, impressions, ctr, position, optimization_potential)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                clicks = VALUES(clicks),
                impressions = VALUES(impressions),
                ctr = VALUES(ctr),
                position = VALUES(position),
                optimization_potential = VALUES(optimization_potential),
                updated_at = CURRENT_TIMESTAMP
        ");
        
        $stmt->execute([$pageUrl, $pageType, $clicks, $impressions, $ctr, $position, $optimizationPotential]);
    }

    /**
     * Process country performance data
     */
    private function processCountryData($row) {
        $countryCode = trim($row['Country'] ?? '');
        $clicks = intval($row['Clicks'] ?? 0);
        $impressions = intval($row['Impressions'] ?? 0);
        $ctr = floatval(str_replace('%', '', $row['CTR'] ?? 0));
        $position = floatval($row['Position'] ?? 0);
        
        if (empty($countryCode) || $countryCode === 'ind') return; // Skip India
        
        $countryName = $this->getCountryName($countryCode);
        $marketPotential = $clicks + ($impressions * $ctr * 0.1);
        
        $stmt = $this->db->prepare("
            INSERT INTO seo_international_opportunities 
            (country_code, country_name, clicks, impressions, ctr, position, market_potential)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                clicks = VALUES(clicks),
                impressions = VALUES(impressions),
                ctr = VALUES(ctr),
                position = VALUES(position),
                market_potential = VALUES(market_potential),
                updated_at = CURRENT_TIMESTAMP
        ");
        
        $stmt->execute([$countryCode, $countryName, $clicks, $impressions, $ctr, $position, $marketPotential]);
    }

    /**
     * Process device performance data
     */
    private function processDeviceData($row) {
        $deviceType = strtoupper(trim($row['Device'] ?? ''));
        $clicks = intval($row['Clicks'] ?? 0);
        $impressions = intval($row['Impressions'] ?? 0);
        $ctr = floatval(str_replace('%', '', $row['CTR'] ?? 0));
        $position = floatval($row['Position'] ?? 0);
        
        if (empty($deviceType)) return;
        
        $performanceDate = date('Y-m-d');
        
        $stmt = $this->db->prepare("
            INSERT INTO seo_device_performance 
            (device_type, performance_date, clicks, impressions, ctr, position)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                clicks = VALUES(clicks),
                impressions = VALUES(impressions),
                ctr = VALUES(ctr),
                position = VALUES(position),
                updated_at = CURRENT_TIMESTAMP
        ");
        
        $stmt->execute([$deviceType, $performanceDate, $clicks, $impressions, $ctr, $position]);
    }

    /**
     * Generate automated optimizations
     */
    private function generateOptimizations() {
        $optimizationsCreated = 0;
        
        // 1. Optimize low CTR pages with high impressions
        $stmt = $this->db->prepare("
            SELECT * FROM seo_pages 
            WHERE impressions > 100 AND ctr < 1.0 AND optimization_status = 'needs_optimization'
            ORDER BY optimization_potential DESC 
            LIMIT 10
        ");
        $stmt->execute();
        $lowCTRPages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($lowCTRPages as $page) {
            $this->createMetaTagsOptimization($page);
            $optimizationsCreated++;
        }
        
        // 2. Create content for high-opportunity keywords
        $stmt = $this->db->prepare("
            SELECT k.* FROM seo_keywords k
            LEFT JOIN seo_content_gaps g ON k.keyword = g.keyword
            WHERE k.impressions > 100 AND k.position > 10 AND g.id IS NULL
            ORDER BY k.priority_score DESC
            LIMIT 5
        ");
        $stmt->execute();
        $contentGaps = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($contentGaps as $keyword) {
            $this->createContentGapOptimization($keyword);
            $optimizationsCreated++;
        }
        
        // 3. Optimize for emerging keywords
        $stmt = $this->db->prepare("
            SELECT * FROM seo_keywords 
            WHERE status = 'emerging' AND position BETWEEN 5 AND 15
            ORDER BY priority_score DESC
            LIMIT 8
        ");
        $stmt->execute();
        $emergingKeywords = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($emergingKeywords as $keyword) {
            $this->createKeywordOptimization($keyword);
            $optimizationsCreated++;
        }
        
        // 4. International market optimizations
        $stmt = $this->db->prepare("
            SELECT * FROM seo_international_opportunities 
            WHERE market_potential > 20 AND optimization_applied = FALSE
            ORDER BY market_potential DESC
            LIMIT 3
        ");
        $stmt->execute();
        $internationalOpps = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($internationalOpps as $opportunity) {
            $this->createInternationalOptimization($opportunity);
            $optimizationsCreated++;
        }
        
        return $optimizationsCreated;
    }

    /**
     * Create meta tags optimization
     */
    private function createMetaTagsOptimization($page) {
        $optimization = [
            'page_url' => $page['page_url'],
            'current_ctr' => $page['ctr'],
            'current_impressions' => $page['impressions'],
            'suggested_improvements' => [
                'title' => $this->generateOptimizedTitle($page),
                'meta_description' => $this->generateOptimizedDescription($page),
                'keywords' => $this->getRelevantKeywords($page['page_url'])
            ]
        ];
        
        $stmt = $this->db->prepare("
            INSERT INTO seo_optimizations 
            (optimization_type, target_type, target_value, optimization_data, reason, priority)
            VALUES ('meta_tags', 'page', ?, ?, ?, 'high')
        ");
        
        $reason = "Low CTR: {$page['ctr']}% with {$page['impressions']} impressions";
        $stmt->execute([$page['page_url'], json_encode($optimization), $reason]);
    }

    /**
     * Create content gap optimization
     */
    private function createContentGapOptimization($keyword) {
        $suggestedUrl = $this->generateSuggestedURL($keyword['keyword']);
        $contentType = $this->determineContentType($keyword['keyword']);
        
        $stmt = $this->db->prepare("
            INSERT INTO seo_content_gaps 
            (keyword, impressions, current_position, suggested_url, content_type, priority_score)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $keyword['keyword'],
            $keyword['impressions'],
            $keyword['position'],
            $suggestedUrl,
            $contentType,
            $keyword['priority_score']
        ]);
    }

    /**
     * Create keyword optimization
     */
    private function createKeywordOptimization($keyword) {
        $optimization = [
            'keyword' => $keyword['keyword'],
            'current_position' => $keyword['position'],
            'target_position' => max(1, $keyword['position'] - 3),
            'actions' => [
                'Add to title tags',
                'Include in H1/H2 headings',
                'Increase content mentions',
                'Build internal links'
            ]
        ];
        
        $stmt = $this->db->prepare("
            INSERT INTO seo_optimizations 
            (optimization_type, target_type, target_value, optimization_data, reason, priority)
            VALUES ('keyword_optimization', 'keyword', ?, ?, ?, 'medium')
        ");
        
        $reason = "Emerging keyword at position {$keyword['position']} with {$keyword['impressions']} impressions";
        $stmt->execute([$keyword['keyword'], json_encode($optimization), $reason]);
    }

    /**
     * Create international optimization
     */
    private function createInternationalOptimization($opportunity) {
        $optimization = [
            'country' => $opportunity['country_name'],
            'country_code' => $opportunity['country_code'],
            'current_metrics' => [
                'clicks' => $opportunity['clicks'],
                'impressions' => $opportunity['impressions'],
                'ctr' => $opportunity['ctr'],
                'position' => $opportunity['position']
            ],
            'recommended_actions' => [
                'Add hreflang tags',
                'Include currency conversion',
                'Add local content sections',
                'Optimize for regional terms'
            ]
        ];
        
        $stmt = $this->db->prepare("
            INSERT INTO seo_optimizations 
            (optimization_type, target_type, target_value, optimization_data, reason, priority)
            VALUES ('international_optimization', 'country', ?, ?, ?, 'medium')
        ");
        
        $reason = "International opportunity: {$opportunity['clicks']} clicks from {$opportunity['country_name']}";
        $stmt->execute([$opportunity['country_code'], json_encode($optimization), $reason]);
    }

    /**
     * Update daily insights
     */
    private function updateDailyInsights() {
        $today = date('Y-m-d');
        
        $stmt = $this->db->prepare("CALL GenerateDailyInsights(?)");
        $stmt->execute([$today]);
        
        $this->log("Daily insights updated for {$today}");
    }

    /**
     * Log report processing
     */
    private function logReportProcessing($filename, $recordsProcessed, $status, $errorMessage = null) {
        $stmt = $this->db->prepare("
            INSERT INTO seo_automated_reports 
            (report_type, file_name, records_processed, status, error_message, processing_start_time, processing_end_time)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ");
        
        $reportType = $this->getReportType($filename);
        $stmt->execute([$reportType, $filename, $recordsProcessed, $status, $errorMessage]);
    }

    /**
     * Get SEO dashboard data
     */
    public function getDashboardData() {
        $data = [];
        
        // Top keywords
        $stmt = $this->db->query("SELECT * FROM v_top_keywords LIMIT 10");
        $data['top_keywords'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Optimization opportunities
        $stmt = $this->db->query("SELECT * FROM v_optimization_opportunities LIMIT 10");
        $data['optimization_opportunities'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // International summary
        $stmt = $this->db->query("SELECT * FROM v_international_summary");
        $data['international_opportunities'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Device comparison
        $stmt = $this->db->query("SELECT * FROM v_device_comparison");
        $data['device_performance'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Content gaps
        $stmt = $this->db->query("SELECT * FROM v_content_gaps_priority LIMIT 10");
        $data['content_gaps'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Recent insights
        $stmt = $this->db->query("
            SELECT * FROM seo_insights 
            ORDER BY insight_date DESC 
            LIMIT 7
        ");
        $data['recent_insights'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return $data;
    }

    /**
     * Get processing status
     */
    public function getProcessingStatus() {
        $stmt = $this->db->query("
            SELECT 
                COUNT(*) as total_reports,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                MAX(processing_start_time) as last_processing
            FROM seo_automated_reports 
            WHERE DATE(processing_start_time) = CURDATE()
        ");
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Helper methods
    private function determinePageType($url) {
        if (strpos($url, '/rates') !== false) return 'rates';
        if (strpos($url, '/city') !== false || strpos($url, '/state') !== false) return 'city';
        if (strpos($url, '/latest') !== false) return 'latest';
        if (strpos($url, '/analysis') !== false) return 'analysis';
        return $url === '/' ? 'home' : 'other';
    }

    private function getCountryName($countryCode) {
        $countries = [
            'ARE' => 'United Arab Emirates',
            'AUS' => 'Australia',
            'QAT' => 'Qatar',
            'USA' => 'United States',
            'GBR' => 'United Kingdom',
            'CAN' => 'Canada',
            'SGP' => 'Singapore'
        ];
        return $countries[$countryCode] ?? $countryCode;
    }

    private function generateOptimizedTitle($page) {
        return "Egg Rates Today | Live Prices & NECC Updates - {$page['page_type']}";
    }

    private function generateOptimizedDescription($page) {
        return "Get latest egg rates and prices today. Real-time NECC egg rate updates, market trends, and daily price tracking across India.";
    }

    private function getRelevantKeywords($pageUrl) {
        $stmt = $this->db->prepare("
            SELECT keyword FROM seo_keywords 
            WHERE keyword LIKE ? AND status = 'active'
            ORDER BY priority_score DESC
            LIMIT 5
        ");
        $stmt->execute(['%egg%']);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    private function generateSuggestedURL($keyword) {
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9\s]/', '', $keyword));
        $slug = preg_replace('/\s+/', '-', trim($slug));
        
        if (strpos($keyword, 'rate') !== false) {
            return "/rates/{$slug}";
        } elseif (strpos($keyword, 'today') !== false) {
            return "/latest/{$slug}";
        }
        return "/{$slug}";
    }

    private function determineContentType($keyword) {
        if (strpos($keyword, 'rate') !== false || strpos($keyword, 'price') !== false) {
            return 'rates_page';
        } elseif (strpos($keyword, 'today') !== false || strpos($keyword, 'latest') !== false) {
            return 'news_page';
        } elseif (strpos($keyword, 'trend') !== false || strpos($keyword, 'analysis') !== false) {
            return 'analysis_page';
        }
        return 'informational_page';
    }

    private function getReportType($filename) {
        if (strpos($filename, 'Queries') !== false) return 'queries';
        if (strpos($filename, 'Pages') !== false) return 'pages';
        if (strpos($filename, 'Countries') !== false) return 'countries';
        if (strpos($filename, 'Devices') !== false) return 'devices';
        if (strpos($filename, 'Dates') !== false) return 'dates';
        return 'other';
    }

    private function log($message, $level = 'INFO') {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] [{$level}] {$message}" . PHP_EOL;
        file_put_contents($this->logFile, $logMessage, FILE_APPEND | LOCK_EX);
    }
}

// API Endpoints
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    $seoService = new AutomatedSEOService();
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    
    try {
        switch ($action) {
            case 'process_reports':
                $result = $seoService->processCSVReports();
                echo json_encode(['success' => true, 'data' => $result]);
                break;
                
            case 'get_dashboard':
                $data = $seoService->getDashboardData();
                echo json_encode(['success' => true, 'data' => $data]);
                break;
                
            case 'get_status':
                $status = $seoService->getProcessingStatus();
                echo json_encode(['success' => true, 'data' => $status]);
                break;
                
            default:
                echo json_encode(['success' => false, 'error' => 'Invalid action']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>
