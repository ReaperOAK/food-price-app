<?php
/**
 * Database Migration: Add SEO Columns
 * Adds missing SEO columns to states, cities, and egg_rates_normalized tables
 * Run this script once to upgrade database to enhanced SEO structure
 */

require_once dirname(dirname(dirname(__FILE__))) . '/config/db.php';

// Check if connection exists
if (!isset($conn) || $conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

echo "Starting SEO columns migration...\n";

try {
    // Begin transaction
    $conn->begin_transaction();
    
    // 1. Add SEO columns to STATES table
    echo "Adding SEO columns to states table...\n";
    
    $statesAlterations = [
        "ADD COLUMN seo_slug VARCHAR(150) NULL AFTER name",
        "ADD COLUMN meta_title VARCHAR(255) NULL AFTER seo_slug",
        "ADD COLUMN meta_description TEXT NULL AFTER meta_title", 
        "ADD COLUMN seo_keywords TEXT NULL AFTER meta_description",
        "ADD COLUMN search_volume INT(11) NULL DEFAULT 0 AFTER seo_keywords",
        "ADD COLUMN ranking_keywords JSON NULL AFTER search_volume",
        "ADD COLUMN last_seo_update TIMESTAMP NULL AFTER ranking_keywords"
    ];
    
    foreach ($statesAlterations as $alteration) {
        $sql = "ALTER TABLE states $alteration";
        try {
            $conn->query($sql);
            echo "✓ States: $alteration\n";
        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                echo "⚠ States: Column already exists - $alteration\n";
            } else {
                throw $e;
            }
        }
    }
    
    // Add index for seo_slug in states
    try {
        $conn->query("ALTER TABLE states ADD INDEX idx_states_seo_slug (seo_slug)");
        echo "✓ States: Added seo_slug index\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "⚠ States: Index already exists - seo_slug\n";
        } else {
            throw $e;
        }
    }
    
    // Add index for search_volume in states
    try {
        $conn->query("ALTER TABLE states ADD INDEX idx_states_search_volume (search_volume)");
        echo "✓ States: Added search_volume index\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "⚠ States: Index already exists - search_volume\n";
        } else {
            throw $e;
        }
    }
    
    // 2. Add SEO columns to CITIES table
    echo "Adding SEO columns to cities table...\n";
    
    $citiesAlterations = [
        "ADD COLUMN seo_slug VARCHAR(150) NULL AFTER name",
        "ADD COLUMN meta_title VARCHAR(255) NULL AFTER state_id",
        "ADD COLUMN meta_description TEXT NULL AFTER meta_title",
        "ADD COLUMN seo_keywords TEXT NULL AFTER meta_description", 
        "ADD COLUMN search_volume INT(11) NULL DEFAULT 0 AFTER seo_keywords",
        "ADD COLUMN ranking_keywords JSON NULL AFTER search_volume",
        "ADD COLUMN last_seo_update TIMESTAMP NULL AFTER ranking_keywords"
    ];
    
    foreach ($citiesAlterations as $alteration) {
        $sql = "ALTER TABLE cities $alteration";
        try {
            $conn->query($sql);
            echo "✓ Cities: $alteration\n";
        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                echo "⚠ Cities: Column already exists - $alteration\n";
            } else {
                throw $e;
            }
        }
    }
    
    // Add index for seo_slug in cities
    try {
        $conn->query("ALTER TABLE cities ADD INDEX idx_cities_seo_slug (seo_slug)");
        echo "✓ Cities: Added seo_slug index\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "⚠ Cities: Index already exists - seo_slug\n";
        } else {
            throw $e;
        }
    }
    
    // Add index for search_volume in cities
    try {
        $conn->query("ALTER TABLE cities ADD INDEX idx_cities_search_volume (search_volume)");
        echo "✓ Cities: Added search_volume index\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "⚠ Cities: Index already exists - search_volume\n";
        } else {
            throw $e;
        }
    }
    
    // 3. Add SEO tracking columns to EGG_RATES_NORMALIZED table
    echo "Adding SEO tracking columns to egg_rates_normalized table...\n";
    
    $ratesAlterations = [
        "ADD COLUMN page_views INT(11) NULL DEFAULT 0 AFTER rate",
        "ADD COLUMN organic_clicks INT(11) NULL DEFAULT 0 AFTER page_views",
        "ADD COLUMN search_impressions INT(11) NULL DEFAULT 0 AFTER organic_clicks",
        "ADD COLUMN avg_search_position DECIMAL(5,2) NULL DEFAULT 0.00 AFTER search_impressions",
        "ADD COLUMN last_seo_analysis TIMESTAMP NULL AFTER avg_search_position"
    ];
    
    foreach ($ratesAlterations as $alteration) {
        $sql = "ALTER TABLE egg_rates_normalized $alteration";
        try {
            $conn->query($sql);
            echo "✓ Rates: $alteration\n";
        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                echo "⚠ Rates: Column already exists - $alteration\n";
            } else {
                throw $e;
            }
        }
    }
    
    // Add indexes for SEO tracking
    $seoIndexes = [
        "ALTER TABLE egg_rates_normalized ADD INDEX idx_rates_page_views (page_views)",
        "ALTER TABLE egg_rates_normalized ADD INDEX idx_rates_organic_clicks (organic_clicks)",
        "ALTER TABLE egg_rates_normalized ADD INDEX idx_rates_search_impressions (search_impressions)"
    ];
    
    foreach ($seoIndexes as $indexSql) {
        try {
            $conn->query($indexSql);
            echo "✓ Rates: Added SEO tracking index\n";
        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
                echo "⚠ Rates: Index already exists\n";
            } else {
                throw $e;
            }
        }
    }
    
    // 4. Create SEO_KEYWORDS table
    echo "Creating seo_keywords table...\n";
    
    $seoKeywordsTable = "
        CREATE TABLE IF NOT EXISTS seo_keywords (
            id INT(11) NOT NULL AUTO_INCREMENT,
            keyword VARCHAR(255) NOT NULL,
            search_volume INT(11) DEFAULT 0,
            difficulty_score DECIMAL(5,2) DEFAULT 0.00,
            current_ranking INT(11) DEFAULT 0,
            target_ranking INT(11) DEFAULT 0,
            related_city_id INT(11) NULL,
            related_state_id INT(11) NULL,
            competition_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
            monthly_searches INT(11) DEFAULT 0,
            cost_per_click DECIMAL(10,2) DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_keyword (keyword),
            KEY idx_search_volume (search_volume),
            KEY idx_difficulty_score (difficulty_score),
            KEY idx_current_ranking (current_ranking),
            KEY idx_city_id (related_city_id),
            KEY idx_state_id (related_state_id),
            FOREIGN KEY (related_city_id) REFERENCES cities(id) ON DELETE SET NULL,
            FOREIGN KEY (related_state_id) REFERENCES states(id) ON DELETE SET NULL
        )
    ";
    
    $conn->query($seoKeywordsTable);
    echo "✓ Created seo_keywords table\n";
    
    // 5. Create SEO_PERFORMANCE table
    echo "Creating seo_performance table...\n";
    
    $seoPerformanceTable = "
        CREATE TABLE IF NOT EXISTS seo_performance (
            id INT(11) NOT NULL AUTO_INCREMENT,
            page_url VARCHAR(500) NOT NULL,
            page_type ENUM('city', 'state', 'home', 'other') DEFAULT 'other',
            related_city_id INT(11) NULL,
            related_state_id INT(11) NULL,
            date DATE NOT NULL,
            organic_impressions INT(11) DEFAULT 0,
            organic_clicks INT(11) DEFAULT 0,
            average_position DECIMAL(5,2) DEFAULT 0.00,
            click_through_rate DECIMAL(5,4) DEFAULT 0.0000,
            page_views INT(11) DEFAULT 0,
            bounce_rate DECIMAL(5,4) DEFAULT 0.0000,
            avg_session_duration INT(11) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_page_date (page_url(255), date),
            KEY idx_page_type (page_type),
            KEY idx_date (date),
            KEY idx_organic_clicks (organic_clicks),
            KEY idx_average_position (average_position),
            KEY idx_city_id (related_city_id),
            KEY idx_state_id (related_state_id),
            FOREIGN KEY (related_city_id) REFERENCES cities(id) ON DELETE SET NULL,
            FOREIGN KEY (related_state_id) REFERENCES states(id) ON DELETE SET NULL
        )
    ";
    
    $conn->query($seoPerformanceTable);
    echo "✓ Created seo_performance table\n";
    
    // 6. Create SEO_ANALYTICS table
    echo "Creating seo_analytics table...\n";
    
    $seoAnalyticsTable = "
        CREATE TABLE IF NOT EXISTS seo_analytics (
            id INT(11) NOT NULL AUTO_INCREMENT,
            analysis_date DATE NOT NULL,
            analysis_type ENUM('keyword', 'content', 'technical', 'competitor') DEFAULT 'keyword',
            entity_type ENUM('city', 'state', 'global') DEFAULT 'global',
            entity_id INT(11) NULL,
            metric_name VARCHAR(100) NOT NULL,
            metric_value DECIMAL(15,4) DEFAULT 0.0000,
            metric_unit VARCHAR(50) DEFAULT '',
            recommendation TEXT NULL,
            priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
            status ENUM('pending', 'in_progress', 'completed', 'ignored') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_analysis_date (analysis_date),
            KEY idx_analysis_type (analysis_type),
            KEY idx_entity_type (entity_type),
            KEY idx_entity_id (entity_id),
            KEY idx_priority (priority),
            KEY idx_status (status)
        )
    ";
    
    $conn->query($seoAnalyticsTable);
    echo "✓ Created seo_analytics table\n";
    
    // Commit all changes
    $conn->commit();
    
    echo "\n🎉 SEO columns migration completed successfully!\n";
    echo "Added columns to: states, cities, egg_rates_normalized tables\n";
    echo "Created tables: seo_keywords, seo_performance, seo_analytics\n";
    echo "Migration is complete.\n";
    
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
    echo "All changes have been rolled back.\n";
    exit(1);
}

$conn->close();
?>
