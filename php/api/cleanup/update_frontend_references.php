<?php
/**
 * Update Frontend References Script
 * 
 * This script updates various configuration files and generates
 * updated lists for frontend components that reference cities
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

require_once dirname(dirname(__DIR__)) . '/config/db.php';

function updateFrontendReferences($conn) {
    $results = [
        'success' => false,
        'updated_files' => [],
        'city_mappings' => [],
        'errors' => []
    ];
    
    try {
        // Get all clean cities from database after cleanup
        $citiesQuery = "
            SELECT DISTINCT city, state 
            FROM egg_rates 
            WHERE city NOT REGEXP '\\([A-Z]{2}\\)'
            ORDER BY city
        ";
        
        $result = $conn->query($citiesQuery);
        $cleanCities = [];
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $cleanCities[] = [
                    'city' => $row['city'],
                    'state' => $row['state']
                ];
            }
        }
        
        // Create mapping of old coded cities to clean cities
        $mappings = [
            'Allahabad (CC)' => 'Allahabad',
            'Chennai (CC)' => 'Chennai',
            'Delhi (CC)' => 'Delhi',
            'Mumbai (CC)' => 'Mumbai',
            'Kolkata (WB)' => 'Kolkata',
            'Kanpur (CC)' => 'Kanpur',
            'Luknow (CC)' => 'Lucknow',
            'Muzaffurpur (CC)' => 'Muzaffurpur',
            'Ranchi (CC)' => 'Ranchi',
            'Varanasi (CC)' => 'Varanasi',
            'Indore (CC)' => 'Indore',
            'Brahmapur (OD)' => 'Brahmapur',
            'Bengaluru (CC)' => 'Bengaluru'
        ];
        
        $results['city_mappings'] = $mappings;
        
        // Generate updated JavaScript data file
        $jsData = generateUpdatedJSData($cleanCities);
        $jsFilePath = dirname(dirname(dirname(__DIR__))) . '/src/data/eggprices_updated.js';
        
        if (file_put_contents($jsFilePath, $jsData)) {
            $results['updated_files'][] = $jsFilePath;
        }
        
        // Generate updated city links for components
        $cityLinksData = generateCityLinksData($cleanCities, $mappings);
        $linksFilePath = dirname(dirname(__DIR__)) . '/temp/updated_city_links.json';
        
        if (file_put_contents($linksFilePath, json_encode($cityLinksData, JSON_PRETTY_PRINT))) {
            $results['updated_files'][] = $linksFilePath;
        }
        
        // Generate URL redirections for old coded city URLs
        $redirections = generateUrlRedirections($mappings);
        $redirectFilePath = dirname(dirname(__DIR__)) . '/temp/city_redirections.json';
        
        if (file_put_contents($redirectFilePath, json_encode($redirections, JSON_PRETTY_PRINT))) {
            $results['updated_files'][] = $redirectFilePath;
        }
        
        $results['success'] = true;
        $results['message'] = 'Frontend references updated successfully';
        
    } catch (Exception $e) {
        $results['errors'][] = $e->getMessage();
    }
    
    return $results;
}

function generateUpdatedJSData($cities) {
    $jsContent = "// Updated egg prices data with cleaned city names\n";
    $jsContent .= "// Generated on " . date('Y-m-d H:i:s') . "\n\n";
    $jsContent .= "export const eggPricesData = [\n";
    
    foreach ($cities as $city) {
        $jsContent .= "  {\n";
        $jsContent .= "    \"city\": \"{$city['city']}\",\n";
        $jsContent .= "    \"state\": \"{$city['state']}\",\n";
        $jsContent .= "    \"date\": \"" . date('Y-m-d') . "\",\n";
        $jsContent .= "    \"rate\": \"0.00\" // To be updated by API\n";
        $jsContent .= "  },\n";
    }
    
    $jsContent = rtrim($jsContent, ",\n") . "\n";
    $jsContent .= "];\n\n";
    
    // Add utility functions
    $jsContent .= "export const getCitySlug = (cityName) => {\n";
    $jsContent .= "  return cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-egg-rate';\n";
    $jsContent .= "};\n\n";
    
    $jsContent .= "export const getCleanCityName = (cityName) => {\n";
    $jsContent .= "  // Remove any remaining state codes\n";
    $jsContent .= "  return cityName.replace(/\\s*\\([A-Z]{2}\\)\\s*/g, '').trim();\n";
    $jsContent .= "};\n";
    
    return $jsContent;
}

function generateCityLinksData($cities, $mappings) {
    $cityLinks = [
        'major_cities' => [],
        'all_cities' => [],
        'redirections' => []
    ];
    
    // Define major cities
    $majorCityNames = [
        'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata',
        'Lucknow', 'Kanpur', 'Varanasi', 'Allahabad', 'Muzaffurpur', 
        'Ranchi', 'Indore', 'Brahmapur'
    ];
    
    foreach ($cities as $city) {
        $slug = strtolower(str_replace(' ', '-', $city['city'])) . '-egg-rate';
        $cityData = [
            'name' => $city['city'],
            'state' => $city['state'],
            'slug' => $slug,
            'url' => '/' . $slug
        ];
        
        $cityLinks['all_cities'][] = $cityData;
        
        if (in_array($city['city'], $majorCityNames)) {
            $cityLinks['major_cities'][] = $cityData;
        }
    }
    
    // Add redirections for old coded cities
    foreach ($mappings as $oldName => $newName) {
        $oldSlug = strtolower(str_replace([' ', '(', ')'], ['-', '', ''], $oldName)) . '-egg-rate';
        $newSlug = strtolower(str_replace(' ', '-', $newName)) . '-egg-rate';
        
        $cityLinks['redirections'][] = [
            'old_name' => $oldName,
            'new_name' => $newName,
            'old_slug' => $oldSlug,
            'new_slug' => $newSlug,
            'old_url' => '/' . $oldSlug,
            'new_url' => '/' . $newSlug
        ];
    }
    
    return $cityLinks;
}

function generateUrlRedirections($mappings) {
    $redirections = [
        'apache_redirects' => [],
        'nginx_redirects' => [],
        'javascript_redirects' => []
    ];
    
    foreach ($mappings as $oldName => $newName) {
        $oldSlug = strtolower(str_replace([' ', '(', ')'], ['-', '', ''], $oldName)) . '-egg-rate';
        $newSlug = strtolower(str_replace(' ', '-', $newName)) . '-egg-rate';
        
        // Apache .htaccess redirects
        $redirections['apache_redirects'][] = "Redirect 301 /{$oldSlug} /{$newSlug}";
        
        // Nginx redirects
        $redirections['nginx_redirects'][] = "location /{$oldSlug} { return 301 /{$newSlug}; }";
        
        // JavaScript redirects for client-side routing
        $redirections['javascript_redirects'][] = [
            'from' => $oldSlug,
            'to' => $newSlug,
            'type' => 'permanent'
        ];
    }
    
    return $redirections;
}

// Execute the update if requested
if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['update'])) {
    $results = updateFrontendReferences($conn);
    echo json_encode($results, JSON_PRETTY_PRINT);
} else {
    echo json_encode([
        'message' => 'Frontend References Update Tool',
        'instructions' => 'Add ?update=1 to the URL or send a POST request to update frontend references',
        'actions' => [
            'Generate updated JavaScript data file with clean city names',
            'Create city links mapping for components',
            'Generate URL redirections for old coded city URLs',
            'Provide configuration for web server redirects'
        ]
    ], JSON_PRETTY_PRINT);
}

$conn->close();
?>
