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
            $reportsDir = __DIR__ . '/../../reports/';
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
        
        // Update or insert keyword data
        $stmt = $this->db->prepare("
            INSERT INTO seo_keywords (keyword, clicks, impressions, ctr, avg_position, last_updated)
            VALUES (?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
            clicks = VALUES(clicks),
            impressions = VALUES(impressions),
            ctr = VALUES(ctr),
            avg_position = VALUES(avg_position),
            last_updated = NOW()
        ");
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
        
        // Update or insert page data
        $stmt = $this->db->prepare("
            INSERT INTO seo_pages (page_url, clicks, impressions, ctr, avg_position, last_updated)
            VALUES (?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
            clicks = VALUES(clicks),
            impressions = VALUES(impressions),
            ctr = VALUES(ctr),
            avg_position = VALUES(avg_position),
            last_updated = NOW()
        ");
        $stmt->execute([$pageUrl, $clicks, $impressions, $ctr, $position]);
    }

    /**
     * Process country data
     */
    private function processCountryData($row) {
        $countryCode = trim($row['Country'] ?? '');
        $clicks = intval($row['Clicks'] ?? 0);
        $impressions = intval($row['Impressions'] ?? 0);
        $ctr = floatval(str_replace('%', '', $row['CTR'] ?? 0));
        $position = floatval($row['Position'] ?? 0);
        
        if (empty($countryCode)) return;
        
        // Update or insert international data
        $stmt = $this->db->prepare("
            INSERT INTO seo_international_opportunities (country_code, country_name, clicks, impressions, ctr, avg_position, opportunity_score, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
            clicks = VALUES(clicks),
            impressions = VALUES(impressions),
            ctr = VALUES(ctr),
            avg_position = VALUES(avg_position),
            opportunity_score = VALUES(opportunity_score),
            last_updated = NOW()
        ");
        
        $countryName = $this->getCountryName($countryCode);
        $opportunityScore = $clicks * 0.6 + $impressions * 0.4; // Simple scoring
        $stmt->execute([$countryCode, $countryName, $clicks, $impressions, $ctr, $position, $opportunityScore]);
    }

    /**
     * Process device data
     */
    private function processDeviceData($row) {
        $device = trim($row['Device'] ?? '');
        $clicks = intval($row['Clicks'] ?? 0);
        $impressions = intval($row['Impressions'] ?? 0);
        $ctr = floatval(str_replace('%', '', $row['CTR'] ?? 0));
        $position = floatval($row['Position'] ?? 0);
        
        if (empty($device)) return;
        
        // Update or insert device data
        $stmt = $this->db->prepare("
            INSERT INTO seo_device_performance (device_type, clicks, impressions, ctr, avg_position, last_updated)
            VALUES (?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
            clicks = VALUES(clicks),
            impressions = VALUES(impressions),
            ctr = VALUES(ctr),
            avg_position = VALUES(avg_position),
            last_updated = NOW()
        ");
        $stmt->execute([$device, $clicks, $impressions, $ctr, $position]);
    }

    /**
     * Generate SEO optimizations
     */
    private function generateOptimizations() {
        $optimizationCount = 0;
        
        // Generate page optimizations
        $optimizationCount += $this->generatePageOptimizations();
        
        // Generate keyword optimizations
        $optimizationCount += $this->generateKeywordOptimizations();
        
        // Generate international optimizations
        $optimizationCount += $this->generateInternationalOptimizations();
        
        return $optimizationCount;
    }

    /**
     * Generate page optimizations
     */
    private function generatePageOptimizations() {
        $stmt = $this->db->prepare("
            SELECT * FROM seo_pages 
            WHERE (ctr < 5 OR avg_position > 10) AND clicks > 10
            ORDER BY impressions DESC
            LIMIT 20
        ");
        $stmt->execute();
        $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $count = 0;
        foreach ($pages as $page) {
            $optimization = [
                'meta_title' => $this->generateOptimizedTitle($page),
                'meta_description' => $this->generateOptimizedDescription($page),
                'suggested_keywords' => $this->getRelevantKeywords($page['page_url'])
            ];
            
            $stmt = $this->db->prepare("
                INSERT INTO seo_optimizations (optimization_type, target_url, meta_title, meta_description, keywords, status, priority_score)
                VALUES ('page_optimization', ?, ?, ?, ?, 'pending', ?)
            ");
            
            $priorityScore = $page['impressions'] * 0.3 + (20 - $page['avg_position']) * 0.7;
            $stmt->execute([
                $page['page_url'], 
                $optimization['meta_title'], 
                $optimization['meta_description'],
                json_encode($optimization['suggested_keywords']),
                $priorityScore
            ]);
            $count++;
        }
        
        return $count;
    }

    /**
     * Generate keyword optimizations
     */
    private function generateKeywordOptimizations() {
        $stmt = $this->db->prepare("
            SELECT keyword, search_volume, avg_position, clicks, impressions
            FROM seo_keywords 
            WHERE avg_position BETWEEN 11 AND 30 AND impressions > 50
            ORDER BY impressions DESC
            LIMIT 15
        ");
        $stmt->execute();
        $keywords = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $count = 0;
        foreach ($keywords as $keyword) {
            $stmt = $this->db->prepare("
                INSERT INTO seo_content_gaps (keyword, search_volume, competition_level, opportunity_score, suggested_content_type, suggested_url)
                VALUES (?, ?, 'medium', ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                opportunity_score = VALUES(opportunity_score),
                last_updated = NOW()
            ");
            
            $opportunityScore = $keyword['impressions'] * 0.4 + (31 - $keyword['avg_position']) * 0.6;
            $contentType = $this->determineContentType($keyword['keyword']);
            $suggestedURL = $this->generateSuggestedURL($keyword['keyword']);
            
            $stmt->execute([
                $keyword['keyword'],
                $keyword['search_volume'] ?? 0,
                $opportunityScore,
                $contentType,
                $suggestedURL
            ]);
            $count++;
        }
        
        return $count;
    }

    /**
     * Generate international optimizations
     */
    private function generateInternationalOptimizations() {
        $stmt = $this->db->prepare("
            SELECT * FROM seo_international_opportunities 
            WHERE clicks > 5 AND avg_position < 20
            ORDER BY opportunity_score DESC
            LIMIT 10
        ");
        $stmt->execute();
        $opportunities = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $count = 0;
        foreach ($opportunities as $opportunity) {
            $optimization = [
                'target_country' => $opportunity['country_name'],
                'localization_suggestions' => [
                    'currency_display' => true,
                    'local_time_zones' => true,
                    'regional_content' => true
                ]
            ];
            
            $stmt = $this->db->prepare("
                INSERT INTO seo_optimizations (optimization_type, target_url, meta_title, meta_description, keywords, status, priority_score, reason)
                VALUES ('international_optimization', ?, '', '', ?, 'pending', ?, ?)
            ");
            
            $priorityScore = $opportunity['clicks'] * 0.7 + $opportunity['impressions'] * 0.3;
            $reason = "International opportunity: {$opportunity['clicks']} clicks from {$opportunity['country_name']}";
            $stmt->execute([$opportunity['country_code'], json_encode($optimization), $priorityScore, $reason]);
            $count++;
        }
        
        return $count;
    }

    /**
     * Update daily insights
     */
    private function updateDailyInsights() {
        $today = date('Y-m-d');
        
        // Generate insight about top performing keywords
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as keyword_count, AVG(ctr) as avg_ctr, SUM(clicks) as total_clicks
            FROM seo_keywords 
            WHERE last_updated >= CURDATE()
        ");
        $stmt->execute();
        $keywordStats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($keywordStats['keyword_count'] > 0) {
            $insight = [
                'keywords_tracked' => $keywordStats['keyword_count'],
                'average_ctr' => round($keywordStats['avg_ctr'], 2),
                'total_clicks' => $keywordStats['total_clicks']
            ];
            
            $stmt = $this->db->prepare("
                INSERT INTO seo_insights (insight_type, insight_data, confidence_score, insight_date)
                VALUES ('daily_keyword_performance', ?, 85, ?)
            ");
            $stmt->execute([json_encode($insight), $today]);
        }
        
        $this->log("Daily insights updated for {$today}");
    }

    /**
     * Log report processing
     */
    private function logReportProcessing($filename, $recordsProcessed, $status, $errorMessage = null) {
        $stmt = $this->db->prepare("
            INSERT INTO seo_automated_reports 
            (report_type, file_name, records_processed, status, error_message, processing_start_time, processing_end_time, created_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())
        ");
        
        $reportType = $this->getReportType($filename);
        $stmt->execute([$reportType, $filename, $recordsProcessed, $status, $errorMessage]);
    }

    /**
     * Get processing status
     */
    public function getProcessingStatus() {
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
                'isProcessing' => false,
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
                    $dateFilter = "WHERE insight_date >= DATE_SUB(NOW(), INTERVAL 1 DAY)";
                    break;
                case '7d':
                    $dateFilter = "WHERE insight_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                    break;
                case '30d':
                    $dateFilter = "WHERE insight_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                    break;
            }
            
            $stmt = $this->db->prepare("
                SELECT insight_type, insight_data, confidence_score, insight_date
                FROM seo_insights 
                {$dateFilter}
                ORDER BY confidence_score DESC, insight_date DESC
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
            $uploadsDir = __DIR__ . '/../../reports/';
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
            'SGP' => 'Singapore',
            'IND' => 'India',
            'DEU' => 'Germany',
            'FRA' => 'France'
        ];
        return $countries[$countryCode] ?? $countryCode;
    }

    private function generateOptimizedTitle($page) {
        return "Egg Rates Today | Live Prices & NECC Updates - " . ucfirst($this->determinePageType($page['page_url']));
    }

    private function generateOptimizedDescription($page) {
        return "Get latest egg rates and prices today. Real-time NECC egg rate updates, market trends, and daily price tracking across India.";
    }

    private function getRelevantKeywords($pageUrl) {
        $stmt = $this->db->prepare("
            SELECT keyword FROM seo_keywords 
            WHERE keyword LIKE ? 
            ORDER BY clicks DESC
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
?>
