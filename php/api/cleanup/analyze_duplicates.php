<?php
/**
 * City Duplicates Analysis Script
 * 
 * This script analyzes the current state of city duplicates in the database
 * and provides detailed information about potential issues.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

require_once dirname(dirname(__DIR__)) . '/config/db.php';

// Verify database connection
if (!isset($conn) || $conn->connect_error) {
    die(json_encode(["error" => "Database connection failed"]));
}

function analyzeCityDuplicates($conn) {
    $analysis = [
        'summary' => [],
        'duplicates_found' => [],
        'cities_with_state_codes' => [],
        'potential_merges' => [],
        'orphaned_entries' => []
    ];
    
    // 1. Find all cities with state codes
    $stateCodeQuery = "
        SELECT city, state, COUNT(*) as rate_count,
               MIN(date) as earliest_rate, MAX(date) as latest_rate
        FROM egg_rates 
        WHERE city REGEXP '\\([A-Z]{2}\\)'
        GROUP BY city, state
        ORDER BY city
    ";
    
    $result = $conn->query($stateCodeQuery);
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $analysis['cities_with_state_codes'][] = $row;
        }
    }
    
    // 2. Find potential duplicate pairs
    $duplicatePairsQuery = "
        SELECT 
            r1.city as city_with_code,
            r1.state,
            COUNT(r1.id) as coded_rates,
            r2.city as clean_city,
            COUNT(r2.id) as clean_rates,
            TRIM(REGEXP_REPLACE(r1.city, '\\\\s*\\\\([A-Z]{2}\\\\)\\\\s*', '')) as extracted_clean_name
        FROM egg_rates r1
        LEFT JOIN egg_rates r2 ON (
            TRIM(REGEXP_REPLACE(r1.city, '\\\\s*\\\\([A-Z]{2}\\\\)\\\\s*', '')) = r2.city 
            AND r1.state = r2.state
        )
        WHERE r1.city REGEXP '\\([A-Z]{2}\\)'
        GROUP BY r1.city, r1.state, r2.city
        ORDER BY extracted_clean_name
    ";
    
    $result = $conn->query($duplicatePairsQuery);
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $analysis['potential_merges'][] = $row;
        }
    }
    
    // 3. Get summary statistics
    $summaryQueries = [
        'total_cities' => "SELECT COUNT(DISTINCT CONCAT(city, '-', state)) as count FROM egg_rates",
        'cities_with_codes' => "SELECT COUNT(DISTINCT CONCAT(city, '-', state)) as count FROM egg_rates WHERE city REGEXP '\\([A-Z]{2}\\)'",
        'total_rates' => "SELECT COUNT(*) as count FROM egg_rates",
        'rates_with_coded_cities' => "SELECT COUNT(*) as count FROM egg_rates WHERE city REGEXP '\\([A-Z]{2}\\)'"
    ];
    
    foreach ($summaryQueries as $key => $query) {
        $result = $conn->query($query);
        if ($result && $row = $result->fetch_assoc()) {
            $analysis['summary'][$key] = $row['count'];
        }
    }
    
    // 4. Find specific problem cities
    $problemCities = [
        'Allahabad', 'Chennai', 'Delhi', 'Mumbai', 'Kolkata', 
        'Kanpur', 'Luknow', 'Muzaffurpur', 'Ranchi', 'Varanasi', 
        'Indore', 'Brahmapur'
    ];
    
    foreach ($problemCities as $city) {
        $checkQuery = "
            SELECT city, state, COUNT(*) as rate_count
            FROM egg_rates 
            WHERE city LIKE ? OR city LIKE ?
            GROUP BY city, state
            ORDER BY city
        ";
        
        $stmt = $conn->prepare($checkQuery);
        $cityPattern = $city;
        $cityWithCodePattern = $city . ' (%';
        $stmt->bind_param("ss", $cityPattern, $cityWithCodePattern);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $cityVariants = [];
        while ($row = $result->fetch_assoc()) {
            $cityVariants[] = $row;
        }
        
        if (count($cityVariants) > 1) {
            $analysis['duplicates_found'][$city] = $cityVariants;
        }
    }
    
    // 5. Check normalized tables
    $normalizedQuery = "
        SELECT c.name, s.name as state_name, COUNT(ern.id) as rate_count
        FROM cities c
        JOIN states s ON c.state_id = s.id
        LEFT JOIN egg_rates_normalized ern ON c.id = ern.city_id
        WHERE c.name REGEXP '\\([A-Z]{2}\\)'
        GROUP BY c.id, c.name, s.name
        ORDER BY c.name
    ";
    
    $result = $conn->query($normalizedQuery);
    $normalizedIssues = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $normalizedIssues[] = $row;
        }
    }
    
    $analysis['normalized_table_issues'] = $normalizedIssues;
    
    return $analysis;
}

// Get the analysis
$analysis = analyzeCityDuplicates($conn);

// Add recommendations
$analysis['recommendations'] = [
    'immediate_actions' => [
        'Run the city_duplicates_cleanup.php script to merge duplicate cities',
        'Backup the database before running the cleanup',
        'Test the cleanup on a development environment first'
    ],
    'affected_features' => [
        'Sitemap generation may have duplicate URLs',
        'Web story generation may create conflicting stories',
        'City search functionality may show duplicates',
        'SEO performance may be affected by duplicate content'
    ],
    'post_cleanup_tasks' => [
        'Regenerate sitemap after cleanup',
        'Update web stories for affected cities',
        'Clear any caches that may contain old city names',
        'Verify that all frontend features work with cleaned city names'
    ]
];

echo json_encode($analysis, JSON_PRETTY_PRINT);

$conn->close();
?>
