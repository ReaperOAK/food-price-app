-- ========================================================
-- SQL STRUCTURE UPGRADES FOR AUTOMATED SEO SYSTEM
-- ========================================================

-- --------------------------------------------------------
-- NEW TABLE: SEO_KEYWORDS
-- Description: Stores keyword performance data from search console
-- --------------------------------------------------------

CREATE TABLE seo_keywords (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    keyword VARCHAR(255) NOT NULL,
    clicks INT(11) DEFAULT 0,
    impressions INT(11) DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0.0000,
    position DECIMAL(5,2) DEFAULT 0.00,
    priority_score DECIMAL(8,2) DEFAULT 0.00,
    status ENUM('active', 'emerging', 'declining', 'opportunity') DEFAULT 'active',
    first_seen DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_keyword (keyword),
    INDEX idx_clicks (clicks),
    INDEX idx_position (position),
    INDEX idx_status (status),
    INDEX idx_priority (priority_score),
    INDEX idx_last_updated (last_updated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- NEW TABLE: SEO_PAGES
-- Description: Stores page performance data from search console
-- --------------------------------------------------------

CREATE TABLE seo_pages (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    page_url VARCHAR(500) NOT NULL,
    page_type ENUM('home', 'city', 'rates', 'latest', 'analysis', 'other') DEFAULT 'other',
    clicks INT(11) DEFAULT 0,
    impressions INT(11) DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0.0000,
    position DECIMAL(5,2) DEFAULT 0.00,
    optimization_potential DECIMAL(10,2) DEFAULT 0.00,
    last_optimized DATE NULL,
    optimization_status ENUM('optimized', 'needs_optimization', 'in_progress', 'scheduled') DEFAULT 'needs_optimization',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_page (page_url),
    INDEX idx_page_type (page_type),
    INDEX idx_clicks (clicks),
    INDEX idx_ctr (ctr),
    INDEX idx_optimization_potential (optimization_potential),
    INDEX idx_optimization_status (optimization_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- NEW TABLE: SEO_OPTIMIZATIONS
-- Description: Stores applied SEO optimizations and their results
-- --------------------------------------------------------

CREATE TABLE seo_optimizations (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    optimization_type ENUM('meta_tags', 'content_creation', 'keyword_optimization', 'international_optimization', 'device_optimization') NOT NULL,
    target_type ENUM('page', 'keyword', 'country', 'device') NOT NULL,
    target_value VARCHAR(255) NOT NULL,
    optimization_data JSON,
    reason TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('pending', 'applied', 'testing', 'completed', 'failed') DEFAULT 'pending',
    applied_date DATE NULL,
    completion_date DATE NULL,
    results JSON NULL,
    created_by VARCHAR(50) DEFAULT 'automated_seo_engine',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_optimization_type (optimization_type),
    INDEX idx_target_type (target_type),
    INDEX idx_target_value (target_value),
    INDEX idx_priority (priority),
    INDEX idx_status (status),
    INDEX idx_applied_date (applied_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- NEW TABLE: SEO_INSIGHTS
-- Description: Stores daily SEO insights and analytics
-- --------------------------------------------------------

CREATE TABLE seo_insights (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    insight_date DATE NOT NULL,
    total_keywords INT(11) DEFAULT 0,
    total_pages INT(11) DEFAULT 0,
    total_clicks INT(11) DEFAULT 0,
    total_impressions INT(11) DEFAULT 0,
    average_ctr DECIMAL(5,4) DEFAULT 0.0000,
    average_position DECIMAL(5,2) DEFAULT 0.00,
    optimization_opportunities INT(11) DEFAULT 0,
    international_markets INT(11) DEFAULT 0,
    emerging_keywords INT(11) DEFAULT 0,
    top_performing_keywords JSON,
    actionable_insights JSON,
    device_performance JSON,
    country_performance JSON,
    processing_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (insight_date),
    INDEX idx_insight_date (insight_date),
    INDEX idx_total_clicks (total_clicks),
    INDEX idx_processing_status (processing_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- NEW TABLE: SEO_CONTENT_GAPS
-- Description: Identifies content opportunities based on search data
-- --------------------------------------------------------

CREATE TABLE seo_content_gaps (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    keyword VARCHAR(255) NOT NULL,
    impressions INT(11) DEFAULT 0,
    current_position DECIMAL(5,2) DEFAULT 0.00,
    suggested_url VARCHAR(500),
    content_type ENUM('rates_page', 'news_page', 'analysis_page', 'informational_page') DEFAULT 'informational_page',
    target_length VARCHAR(50),
    keyword_density VARCHAR(20),
    related_keywords JSON,
    priority_score DECIMAL(8,2) DEFAULT 0.00,
    status ENUM('identified', 'planned', 'in_progress', 'completed', 'rejected') DEFAULT 'identified',
    assigned_date DATE NULL,
    completion_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_keyword (keyword),
    INDEX idx_priority_score (priority_score),
    INDEX idx_status (status),
    INDEX idx_content_type (content_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- NEW TABLE: SEO_INTERNATIONAL_OPPORTUNITIES
-- Description: Tracks international market opportunities
-- --------------------------------------------------------

CREATE TABLE seo_international_opportunities (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    country_code VARCHAR(3) NOT NULL,
    country_name VARCHAR(100),
    clicks INT(11) DEFAULT 0,
    impressions INT(11) DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0.0000,
    position DECIMAL(5,2) DEFAULT 0.00,
    market_potential DECIMAL(8,2) DEFAULT 0.00,
    optimization_applied BOOLEAN DEFAULT FALSE,
    hreflang_added BOOLEAN DEFAULT FALSE,
    currency_conversion_added BOOLEAN DEFAULT FALSE,
    local_content_added BOOLEAN DEFAULT FALSE,
    last_optimization_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_country (country_code),
    INDEX idx_country_name (country_name),
    INDEX idx_market_potential (market_potential),
    INDEX idx_optimization_applied (optimization_applied)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- NEW TABLE: SEO_DEVICE_PERFORMANCE
-- Description: Tracks device-specific SEO performance
-- --------------------------------------------------------

CREATE TABLE seo_device_performance (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    device_type ENUM('DESKTOP', 'MOBILE', 'TABLET') NOT NULL,
    performance_date DATE NOT NULL,
    clicks INT(11) DEFAULT 0,
    impressions INT(11) DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0.0000,
    position DECIMAL(5,2) DEFAULT 0.00,
    optimization_recommendations JSON,
    optimization_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_device_date (device_type, performance_date),
    INDEX idx_device_type (device_type),
    INDEX idx_performance_date (performance_date),
    INDEX idx_ctr (ctr),
    INDEX idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- NEW TABLE: SEO_AUTOMATED_REPORTS
-- Description: Stores automated report processing logs
-- --------------------------------------------------------

CREATE TABLE seo_automated_reports (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    report_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT UNSIGNED,
    records_processed INT(11) DEFAULT 0,
    processing_start_time TIMESTAMP,
    processing_end_time TIMESTAMP NULL,
    processing_duration_seconds INT(11) NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'skipped') DEFAULT 'pending',
    error_message TEXT NULL,
    optimizations_applied INT(11) DEFAULT 0,
    insights_generated INT(11) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_type (report_type),
    INDEX idx_file_name (file_name),
    INDEX idx_status (status),
    INDEX idx_processing_start_time (processing_start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- ENHANCED TABLE: CITIES (Add SEO columns)
-- Description: Add SEO-related columns to existing cities table
-- --------------------------------------------------------

ALTER TABLE cities 
ADD COLUMN seo_slug VARCHAR(150) NULL AFTER name,
ADD COLUMN meta_title VARCHAR(255) NULL,
ADD COLUMN meta_description TEXT NULL,
ADD COLUMN seo_keywords TEXT NULL,
ADD COLUMN search_volume INT(11) DEFAULT 0,
ADD COLUMN ranking_keywords JSON NULL,
ADD COLUMN last_seo_update TIMESTAMP NULL,
ADD INDEX idx_seo_slug (seo_slug),
ADD INDEX idx_search_volume (search_volume);

-- --------------------------------------------------------
-- ENHANCED TABLE: STATES (Add SEO columns)
-- Description: Add SEO-related columns to existing states table
-- --------------------------------------------------------

ALTER TABLE states 
ADD COLUMN seo_slug VARCHAR(150) NULL AFTER name,
ADD COLUMN meta_title VARCHAR(255) NULL,
ADD COLUMN meta_description TEXT NULL,
ADD COLUMN seo_keywords TEXT NULL,
ADD COLUMN search_volume INT(11) DEFAULT 0,
ADD COLUMN ranking_keywords JSON NULL,
ADD COLUMN last_seo_update TIMESTAMP NULL,
ADD INDEX idx_seo_slug (seo_slug),
ADD INDEX idx_search_volume (search_volume);

-- --------------------------------------------------------
-- ENHANCED TABLE: EGG_RATES_NORMALIZED (Add SEO tracking)
-- Description: Add SEO tracking to egg rates for content optimization
-- --------------------------------------------------------

ALTER TABLE egg_rates_normalized 
ADD COLUMN page_views INT(11) DEFAULT 0,
ADD COLUMN organic_clicks INT(11) DEFAULT 0,
ADD COLUMN search_impressions INT(11) DEFAULT 0,
ADD COLUMN avg_search_position DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN last_seo_analysis TIMESTAMP NULL,
ADD INDEX idx_page_views (page_views),
ADD INDEX idx_organic_clicks (organic_clicks),
ADD INDEX idx_search_impressions (search_impressions);

-- --------------------------------------------------------
-- CREATE VIEWS FOR SEO DASHBOARD
-- --------------------------------------------------------

-- View: Top Performing Keywords
CREATE VIEW v_top_keywords AS
SELECT 
    keyword,
    clicks,
    impressions,
    ctr,
    position,
    priority_score,
    status,
    DATEDIFF(CURRENT_DATE, last_updated) as days_since_update
FROM seo_keywords 
WHERE status IN ('active', 'emerging')
ORDER BY priority_score DESC, clicks DESC
LIMIT 50;

-- View: Optimization Opportunities
CREATE VIEW v_optimization_opportunities AS
SELECT 
    p.page_url,
    p.page_type,
    p.clicks,
    p.impressions,
    p.ctr,
    p.position,
    p.optimization_potential,
    p.optimization_status,
    COUNT(o.id) as pending_optimizations
FROM seo_pages p
LEFT JOIN seo_optimizations o ON o.target_value = p.page_url AND o.status = 'pending'
WHERE p.optimization_potential > 100
GROUP BY p.id
ORDER BY p.optimization_potential DESC;

-- View: International Market Summary
CREATE VIEW v_international_summary AS
SELECT 
    country_name,
    clicks,
    impressions,
    ctr,
    position,
    market_potential,
    optimization_applied,
    CASE 
        WHEN optimization_applied = TRUE THEN 'Optimized'
        WHEN market_potential > 50 THEN 'High Potential'
        WHEN market_potential > 20 THEN 'Medium Potential'
        ELSE 'Low Potential'
    END as opportunity_level
FROM seo_international_opportunities
WHERE impressions > 10
ORDER BY market_potential DESC;

-- View: Device Performance Comparison
CREATE VIEW v_device_comparison AS
SELECT 
    device_type,
    AVG(clicks) as avg_clicks,
    AVG(impressions) as avg_impressions,
    AVG(ctr) as avg_ctr,
    AVG(position) as avg_position,
    COUNT(*) as data_points,
    MAX(performance_date) as latest_data
FROM seo_device_performance
WHERE performance_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY device_type
ORDER BY avg_clicks DESC;

-- View: Content Gap Priorities
CREATE VIEW v_content_gaps_priority AS
SELECT 
    keyword,
    impressions,
    current_position,
    suggested_url,
    content_type,
    priority_score,
    status,
    CASE 
        WHEN priority_score > 1000 THEN 'Critical'
        WHEN priority_score > 500 THEN 'High'
        WHEN priority_score > 100 THEN 'Medium'
        ELSE 'Low'
    END as priority_level
FROM seo_content_gaps
WHERE status IN ('identified', 'planned')
ORDER BY priority_score DESC;

-- --------------------------------------------------------
-- STORED PROCEDURES FOR AUTOMATED SEO OPERATIONS
-- --------------------------------------------------------

DELIMITER //

-- Procedure: Update Keyword Performance
CREATE PROCEDURE UpdateKeywordPerformance(
    IN p_keyword VARCHAR(255),
    IN p_clicks INT,
    IN p_impressions INT,
    IN p_ctr DECIMAL(5,4),
    IN p_position DECIMAL(5,2)
)
BEGIN
    DECLARE v_priority_score DECIMAL(8,2);
    DECLARE v_status ENUM('active', 'emerging', 'declining', 'opportunity');
    
    -- Calculate priority score
    SET v_priority_score = (p_clicks * 2) + (p_impressions * 0.1) + ((21 - p_position) * 0.5) + (p_ctr * 10);
    
    -- Determine status
    SET v_status = CASE 
        WHEN p_position <= 3 AND p_clicks > 50 THEN 'active'
        WHEN p_position <= 10 AND p_impressions > 100 AND p_ctr > 0.5 THEN 'emerging'
        WHEN p_position > 20 OR p_ctr < 0.2 THEN 'declining'
        ELSE 'opportunity'
    END;
    
    INSERT INTO seo_keywords (keyword, clicks, impressions, ctr, position, priority_score, status, first_seen)
    VALUES (p_keyword, p_clicks, p_impressions, p_ctr, p_position, v_priority_score, v_status, CURRENT_DATE)
    ON DUPLICATE KEY UPDATE
        clicks = p_clicks,
        impressions = p_impressions,
        ctr = p_ctr,
        position = p_position,
        priority_score = v_priority_score,
        status = v_status,
        last_updated = CURRENT_TIMESTAMP;
END //

-- Procedure: Generate Daily SEO Insights
CREATE PROCEDURE GenerateDailyInsights(IN p_date DATE)
BEGIN
    DECLARE v_total_keywords INT DEFAULT 0;
    DECLARE v_total_pages INT DEFAULT 0;
    DECLARE v_total_clicks INT DEFAULT 0;
    DECLARE v_total_impressions INT DEFAULT 0;
    DECLARE v_avg_ctr DECIMAL(5,4) DEFAULT 0.0000;
    DECLARE v_avg_position DECIMAL(5,2) DEFAULT 0.00;
    
    -- Calculate metrics
    SELECT COUNT(*), COALESCE(SUM(clicks), 0), COALESCE(SUM(impressions), 0), 
           COALESCE(AVG(ctr), 0), COALESCE(AVG(position), 0)
    INTO v_total_keywords, v_total_clicks, v_total_impressions, v_avg_ctr, v_avg_position
    FROM seo_keywords
    WHERE DATE(last_updated) = p_date;
    
    SELECT COUNT(*) INTO v_total_pages FROM seo_pages;
    
    -- Insert insights
    INSERT INTO seo_insights (
        insight_date, total_keywords, total_pages, total_clicks, 
        total_impressions, average_ctr, average_position,
        processing_status, processed_at
    )
    VALUES (
        p_date, v_total_keywords, v_total_pages, v_total_clicks,
        v_total_impressions, v_avg_ctr, v_avg_position,
        'completed', CURRENT_TIMESTAMP
    )
    ON DUPLICATE KEY UPDATE
        total_keywords = v_total_keywords,
        total_pages = v_total_pages,
        total_clicks = v_total_clicks,
        total_impressions = v_total_impressions,
        average_ctr = v_avg_ctr,
        average_position = v_avg_position,
        processing_status = 'completed',
        processed_at = CURRENT_TIMESTAMP;
END //

DELIMITER ;

-- --------------------------------------------------------
-- SAMPLE DATA INSERTION
-- --------------------------------------------------------

-- Insert sample SEO keywords based on your actual data
INSERT INTO seo_keywords (keyword, clicks, impressions, ctr, position, priority_score, status) VALUES
('necc egg rate', 243, 4000, 6.08, 6.07, 150.5, 'active'),
('egg rate', 188, 3200, 5.88, 7.2, 125.3, 'active'),
('necc egg', 127, 2800, 4.54, 8.1, 98.7, 'active'),
('egg rate today', 101, 2500, 4.04, 9.3, 85.2, 'emerging'),
('today egg rate', 93, 2200, 4.23, 8.8, 82.1, 'emerging'),
('barwala egg rate today', 16, 380, 4.21, 12.5, 25.8, 'opportunity');

-- Insert sample pages data
INSERT INTO seo_pages (page_url, page_type, clicks, impressions, ctr, position, optimization_potential) VALUES
('/', 'home', 450, 8000, 5.63, 7.2, 850.5),
('/rates/mumbai', 'city', 12, 46557, 0.22, 15.3, 2500.8),
('/rates/bangalore', 'city', 8, 43437, 0.19, 16.1, 2180.4),
('/rates/hyderabad', 'city', 6, 17754, 0.20, 14.8, 1250.2);

-- Insert sample international opportunities
INSERT INTO seo_international_opportunities (country_code, country_name, clicks, impressions, ctr, position, market_potential) VALUES
('ARE', 'United Arab Emirates', 15, 280, 5.36, 11.2, 45.3),
('AUS', 'Australia', 8, 150, 5.33, 12.1, 28.7),
('QAT', 'Qatar', 5, 95, 5.26, 13.5, 18.2);

-- --------------------------------------------------------
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- --------------------------------------------------------

-- Composite indexes for common queries
CREATE INDEX idx_keyword_performance ON seo_keywords (status, priority_score DESC, clicks DESC);
CREATE INDEX idx_page_optimization ON seo_pages (optimization_status, optimization_potential DESC);
CREATE INDEX idx_optimization_target ON seo_optimizations (target_type, target_value, status);
CREATE INDEX idx_insights_date_status ON seo_insights (insight_date DESC, processing_status);

-- --------------------------------------------------------
-- TRIGGERS FOR AUTOMATED UPDATES
-- --------------------------------------------------------

DELIMITER //

-- Trigger: Auto-update city SEO data when egg rates change
CREATE TRIGGER tr_egg_rates_seo_update 
AFTER INSERT ON egg_rates_normalized
FOR EACH ROW
BEGIN
    UPDATE cities 
    SET last_seo_update = CURRENT_TIMESTAMP 
    WHERE id = NEW.city_id;
END //

-- Trigger: Auto-calculate optimization potential
CREATE TRIGGER tr_calculate_optimization_potential
BEFORE INSERT ON seo_pages
FOR EACH ROW
BEGIN
    SET NEW.optimization_potential = NEW.impressions * (2 - NEW.ctr) * (21 - NEW.position);
END //

DELIMITER ;

-- --------------------------------------------------------
-- GRANT PERMISSIONS (Adjust as needed for your setup)
-- --------------------------------------------------------

-- Grant permissions to web application user
-- GRANT SELECT, INSERT, UPDATE ON food_price_db.seo_* TO 'web_app_user'@'localhost';
-- GRANT SELECT ON food_price_db.v_* TO 'web_app_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE food_price_db.UpdateKeywordPerformance TO 'web_app_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE food_price_db.GenerateDailyInsights TO 'web_app_user'@'localhost';

-- ========================================================
-- END OF SQL STRUCTURE UPGRADES
-- ========================================================
