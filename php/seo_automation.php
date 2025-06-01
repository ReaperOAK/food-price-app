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
        global $conn;
        $this->db = $conn;
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

    /**
     * Get keywords with filtering and sorting
     */
    public function getKeywords($limit = 50, $sort = 'clicks', $order = 'DESC') {
        $allowedSorts = ['clicks', 'impressions', 'ctr', 'avg_position', 'search_volume'];
        if (!in_array($sort, $allowedSorts)) $sort = 'clicks';
        if (!in_array($order, ['ASC', 'DESC'])) $order = 'DESC';
        
        $stmt = $this->db->prepare("
            SELECT * FROM seo_keywords 
            ORDER BY {$sort} {$order} 
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get pages with filtering and sorting
     */
    public function getPages($limit = 50, $sort = 'clicks', $order = 'DESC') {
        $allowedSorts = ['clicks', 'impressions', 'ctr', 'avg_position'];
        if (!in_array($sort, $allowedSorts)) $sort = 'clicks';
        if (!in_array($order, ['ASC', 'DESC'])) $order = 'DESC';
        
        $stmt = $this->db->prepare("
            SELECT * FROM seo_pages 
            ORDER BY {$sort} {$order} 
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get optimizations with pagination
     */
    public function getOptimizations($limit = 20, $offset = 0) {
        $stmt = $this->db->prepare("
            SELECT * FROM seo_optimizations 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get content gaps
     */
    public function getContentGaps() {
        $stmt = $this->db->prepare("
            SELECT * FROM seo_content_gaps 
            ORDER BY opportunity_score DESC 
            LIMIT 20
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get international opportunities
     */
    public function getInternationalOpportunities() {
        $stmt = $this->db->prepare("
            SELECT * FROM seo_international_opportunities 
            ORDER BY opportunity_score DESC 
            LIMIT 20
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get device performance data
     */
    public function getDevicePerformance() {
        $stmt = $this->db->prepare("
            SELECT * FROM seo_device_performance 
            ORDER BY clicks DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get processing logs
     */
    public function getProcessingLogs($limit = 100) {
        $stmt = $this->db->prepare("
            SELECT * FROM seo_automated_reports 
            ORDER BY created_at DESC 
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
    }    private function log($message, $level = 'INFO') {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] [{$level}] {$message}" . PHP_EOL;
        file_put_contents($this->logFile, $logMessage, FILE_APPEND | LOCK_EX);
    }
}

// API Endpoints Handler
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as total_reports,
                    MAX(created_at) as last_processed,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_reports,
                    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_reports
                FROM seo_automated_reports 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ");
            $stmt->execute();
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get latest optimizations
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as optimization_count
                FROM seo_optimizations 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ");
            $stmt->execute();
            $optimizations = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return [
                'isProcessing' => false, // You might want to track this in a separate table
                'lastProcessed' => $stats['last_processed'],
                'totalReports' => intval($stats['total_reports']),
                'completedReports' => intval($stats['completed_reports']),
                'failedReports' => intval($stats['failed_reports']),
                'optimizationsCreated' => intval($optimizations['optimization_count']),
                'timestamp' => date('Y-m-d H:i:s')
            ];
        } catch (Exception $e) {
            $this->log("Error getting processing status: " . $e->getMessage(), 'ERROR');
            throw $e;
        }
    

    /**
     * Get dashboard data
     */
    public function getDashboardData() {
        try {
            // Get top keywords
            $stmt = $this->db->prepare("
                SELECT keyword, clicks, impressions, ctr, avg_position, search_volume
                FROM seo_keywords 
                ORDER BY clicks DESC 
                LIMIT 10
            ");
            $stmt->execute();
            $topKeywords = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get top pages
            $stmt = $this->db->prepare("
                SELECT page_url, clicks, impressions, ctr, avg_position
                FROM seo_pages 
                ORDER BY clicks DESC 
                LIMIT 10
            ");
            $stmt->execute();
            $topPages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get recent optimizations
            $stmt = $this->db->prepare("
                SELECT optimization_type, target_url, meta_title, meta_description, 
                       keywords, status, created_at
                FROM seo_optimizations 
                ORDER BY created_at DESC 
                LIMIT 10
            ");
            $stmt->execute();
            $recentOptimizations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get content gaps
            $stmt = $this->db->prepare("
                SELECT keyword, search_volume, competition_level, opportunity_score
                FROM seo_content_gaps 
                ORDER BY opportunity_score DESC 
                LIMIT 5
            ");
            $stmt->execute();
            $contentGaps = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'topKeywords' => $topKeywords,
                'topPages' => $topPages,
                'recentOptimizations' => $recentOptimizations,
                'contentGaps' => $contentGaps,
                'timestamp' => date('Y-m-d H:i:s')
            ];
        } catch (Exception $e) {
            $this->log("Error getting dashboard data: " . $e->getMessage(), 'ERROR');
            throw $e;
        }
    }

    /**
     * Get SEO insights
     */
    public function getInsights($timeframe = '7d') {
        try {
            $dateFilter = '';
            switch ($timeframe) {
                case '1d':
                    $dateFilter = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)";
                    break;
                case '7d':
                    $dateFilter = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                    break;
                case '30d':
                    $dateFilter = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                    break;
            }
            
            $stmt = $this->db->prepare("
                SELECT insight_type, insight_data, confidence_score, created_at
                FROM seo_insights 
                {$dateFilter}
                ORDER BY confidence_score DESC, created_at DESC
                LIMIT 20
            ");
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $this->log("Error getting insights: " . $e->getMessage(), 'ERROR');
            throw $e;
        }
    }

    /**
     * Handle file upload
     */
    public function handleFileUpload() {
        try {
            if (!isset($_FILES['csvFile']) || $_FILES['csvFile']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('No file uploaded or upload error occurred');
            }
            
            $uploadedFile = $_FILES['csvFile'];
            $fileType = $_POST['fileType'] ?? 'unknown';
            
            // Validate file type
            $allowedTypes = ['text/csv', 'application/csv', 'text/plain'];
            if (!in_array($uploadedFile['type'], $allowedTypes)) {
                throw new Exception('Invalid file type. Only CSV files are allowed.');
            }
            
            // Create uploads directory if it doesn't exist
            $uploadsDir = __DIR__ . '/../reports/';
            if (!is_dir($uploadsDir)) {
                mkdir($uploadsDir, 0755, true);
            }
            
            // Generate unique filename
            $filename = $fileType . '_' . date('Y-m-d_H-i-s') . '.csv';
            $targetPath = $uploadsDir . $filename;
            
            // Move uploaded file
            if (!move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
                throw new Exception('Failed to save uploaded file');
            }
            
            // Process the uploaded file immediately
            $records = $this->processCSVFile($targetPath);
            
            $this->log("File uploaded and processed: {$filename}, {$records} records");
            
            return [
                'filename' => $filename,
                'records_processed' => $records,
                'file_path' => $targetPath
            ];
        } catch (Exception $e) {
            $this->log("Error handling file upload: " . $e->getMessage(), 'ERROR');
            throw $e;
        }
    }
}

// API Endpoints Handler
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$seoService = new AutomatedSEOService();
$action = $_REQUEST['action'] ?? '';

try {
    switch ($action) {
        case 'process':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('POST method required');
            }
            $result = $seoService->processCSVReports();
            echo json_encode(['success' => true, 'data' => $result]);
            break;
            
        case 'status':
            $status = $seoService->getProcessingStatus();
            echo json_encode(['success' => true, 'data' => $status]);
            break;
            
        case 'dashboard':
            $data = $seoService->getDashboardData();
            echo json_encode(['success' => true, 'data' => $data]);
            break;
            
        case 'insights':
            $timeframe = $_GET['timeframe'] ?? '7d';
            $insights = $seoService->getInsights($timeframe);
            echo json_encode(['success' => true, 'data' => $insights]);
            break;
            
        case 'upload':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('POST method required');
            }
            $result = $seoService->handleFileUpload();
            echo json_encode(['success' => true, 'data' => $result]);
            break;
            
        case 'keywords':
            $limit = intval($_GET['limit'] ?? 50);
            $sort = $_GET['sort'] ?? 'clicks';
            $order = $_GET['order'] ?? 'DESC';
            
            $allowedSorts = ['clicks', 'impressions', 'ctr', 'avg_position', 'search_volume'];
            if (!in_array($sort, $allowedSorts)) $sort = 'clicks';
            if (!in_array($order, ['ASC', 'DESC'])) $order = 'DESC';
            
            $stmt = $seoService->db->prepare("
                SELECT * FROM seo_keywords 
                ORDER BY {$sort} {$order} 
                LIMIT ?
            ");
            $stmt->execute([$limit]);
            $keywords = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $keywords]);
            break;
            
        case 'pages':
            $limit = intval($_GET['limit'] ?? 50);
            $sort = $_GET['sort'] ?? 'clicks';
            $order = $_GET['order'] ?? 'DESC';
            
            $allowedSorts = ['clicks', 'impressions', 'ctr', 'avg_position'];
            if (!in_array($sort, $allowedSorts)) $sort = 'clicks';
            if (!in_array($order, ['ASC', 'DESC'])) $order = 'DESC';
            
            $stmt = $seoService->db->prepare("
                SELECT * FROM seo_pages 
                ORDER BY {$sort} {$order} 
                LIMIT ?
            ");
            $stmt->execute([$limit]);
            $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $pages]);
            break;
            
        case 'optimizations':
            $limit = intval($_GET['limit'] ?? 20);
            $offset = intval($_GET['offset'] ?? 0);
            
            $stmt = $seoService->db->prepare("
                SELECT * FROM seo_optimizations 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$limit, $offset]);
            $optimizations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $optimizations]);
            break;
            
        case 'content_gaps':
            $stmt = $seoService->db->prepare("
                SELECT * FROM seo_content_gaps 
                ORDER BY opportunity_score DESC 
                LIMIT 20
            ");
            $stmt->execute();
            $gaps = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $gaps]);
            break;
            
        case 'international':
            $stmt = $seoService->db->prepare("
                SELECT * FROM seo_international_opportunities 
                ORDER BY opportunity_score DESC 
                LIMIT 20
            ");
            $stmt->execute();
            $opportunities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $opportunities]);
            break;
            
        case 'devices':
            $stmt = $seoService->db->prepare("
                SELECT * FROM seo_device_performance 
                ORDER BY clicks DESC
            ");
            $stmt->execute();
            $devices = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $devices]);
            break;
            
        case 'logs':
            $limit = intval($_GET['limit'] ?? 100);
            
            $stmt = $seoService->db->prepare("
                SELECT * FROM seo_automated_reports 
                ORDER BY created_at DESC 
                LIMIT ?
            ");
            $stmt->execute([$limit]);
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $logs]);
            break;
            
        case 'force_process':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('POST method required');
            }
            $result = $seoService->processCSVReports();
            echo json_encode(['success' => true, 'data' => $result, 'message' => 'Force processing completed']);
            break;
            
        case 'export':
            $format = $_GET['format'] ?? 'json';
            $data = $seoService->getDashboardData();
            
            if ($format === 'csv') {
                header('Content-Type: text/csv');
                header('Content-Disposition: attachment; filename="seo_data_' . date('Y-m-d') . '.csv"');
                
                // Simple CSV export (you can enhance this)
                echo "Type,Name,Clicks,Impressions,CTR,Position\n";
                foreach ($data['topKeywords'] as $keyword) {
                    echo "Keyword,{$keyword['keyword']},{$keyword['clicks']},{$keyword['impressions']},{$keyword['ctr']},{$keyword['avg_position']}\n";
                }
                foreach ($data['topPages'] as $page) {
                    echo "Page,{$page['page_url']},{$page['clicks']},{$page['impressions']},{$page['ctr']},{$page['avg_position']}\n";
                }
            } else {
                echo json_encode(['success' => true, 'data' => $data]);
            }
            break;
            
        default:
            if (empty($action)) {
                // Return available endpoints
                echo json_encode([
                    'success' => true, 
                    'message' => 'SEO Automation API',
                    'endpoints' => [
                        'GET /seo_automation.php?action=status' => 'Get processing status',
                        'GET /seo_automation.php?action=dashboard' => 'Get dashboard data',
                        'POST /seo_automation.php?action=process' => 'Process CSV reports',
                        'POST /seo_automation.php?action=upload' => 'Upload CSV file',
                        'GET /seo_automation.php?action=insights&timeframe=7d' => 'Get insights',
                        'GET /seo_automation.php?action=keywords' => 'Get keyword data',
                        'GET /seo_automation.php?action=pages' => 'Get page data',
                        'GET /seo_automation.php?action=optimizations' => 'Get optimizations',
                        'POST /seo_automation.php?action=force_process' => 'Force process CSV'
                    ]
                ]);            } else {
                echo json_encode(['success' => false, 'error' => 'Invalid action: ' . $action]);
            }
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
