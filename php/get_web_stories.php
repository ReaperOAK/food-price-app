<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once __DIR__ . '/config/db.php';

// Directory where web stories are stored with absolute path
$basePath = dirname(dirname(__FILE__)); // Go up one level from php dir
$storiesDir = $basePath . '/webstories';

// Get limit parameter if provided
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;

// Helper function to generate city slug with state code for proper file naming
if (!function_exists('generateCitySlug')) {
    function generateCitySlug($city, $state = null) {
        // First, check if the city name contains a state code in parentheses like "Allahabad (CC)"
        $stateCode = '';
        $cleanCity = $city;
        
        if (preg_match('/^(.+?)\s*\(([A-Z]{2})\)$/', $city, $matches)) {
            $cleanCity = trim($matches[1]);
            $stateCode = strtolower($matches[2]);
        } elseif ($state) {
            // If no state code in city name, try to derive from state name
            $stateCode = extractStateCodeFromStateName($state);
        }
        
        // Generate the base city slug
        $citySlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $cleanCity));
        $citySlug = trim($citySlug, '-'); // Remove leading/trailing dashes
        
        // Add state code if available, using double dash pattern
        if ($stateCode) {
            $slug = $citySlug . '-' . $stateCode . '--egg-rate';
        } else {
            $slug = $citySlug . '-egg-rate';
        }
        
        return $slug;
    }
}

// Helper function to extract state code from state name
if (!function_exists('extractStateCodeFromStateName')) {
    function extractStateCodeFromStateName($stateName) {
        // Common state name to code mappings based on the data patterns observed
        $stateMapping = [
            'chhattisgarh' => 'cc',
            'odisha' => 'od', 
            'orissa' => 'od',
            'west bengal' => 'wb',
            'andhra pradesh' => 'ap',
            'telangana' => 'tg',
            'tamil nadu' => 'tn',
            'karnataka' => 'ka',
            'kerala' => 'kl',
            'maharashtra' => 'mh',
            'gujarat' => 'gj',
            'rajasthan' => 'rj',
            'madhya pradesh' => 'mp',
            'uttar pradesh' => 'up',
            'bihar' => 'br',
            'jharkhand' => 'jh',
            'punjab' => 'pb',
            'haryana' => 'hr',
        ];
        
        $stateLower = strtolower(trim($stateName));
        return isset($stateMapping[$stateLower]) ? $stateMapping[$stateLower] : '';
    }
}

// Helper function to extract city and state info from filename
function extractCityInfoFromFilename($filename) {
    // Remove .html extension
    $slug = str_replace('.html', '', $filename);
    
    // Remove -egg-rate suffix
    $slug = str_replace('-egg-rate', '', $slug);
    
    // Check for state code pattern (double dash)
    if (strpos($slug, '--') !== false) {
        $slug = str_replace('--', '', $slug);
    }
    
    // Check for single state code pattern
    if (preg_match('/^(.+)-([a-z]{2})$/', $slug, $matches)) {
        $citySlug = $matches[1];
        $stateCode = $matches[2];
    } else {
        $citySlug = $slug;
        $stateCode = '';
    }
    
    // Convert slug back to city name
    $cityName = ucwords(str_replace('-', ' ', $citySlug));
    
    // Map state code back to state name
    $stateCodeMapping = [
        'cc' => 'Chhattisgarh',
        'od' => 'Odisha',
        'wb' => 'West Bengal',
        'ap' => 'Andhra Pradesh',
        'tg' => 'Telangana',
        'tn' => 'Tamil Nadu',
        'ka' => 'Karnataka',
        'kl' => 'Kerala',
        'mh' => 'Maharashtra',
        'gj' => 'Gujarat',
        'rj' => 'Rajasthan',
        'mp' => 'Madhya Pradesh',
        'up' => 'Uttar Pradesh',
        'br' => 'Bihar',
        'jh' => 'Jharkhand',
        'pb' => 'Punjab',
        'hr' => 'Haryana',
    ];
    
    $stateName = isset($stateCodeMapping[$stateCode]) ? $stateCodeMapping[$stateCode] : '';
    
    return [
        'city' => $cityName,
        'state' => $stateName,
        'slug' => str_replace('.html', '', $filename)
    ];
}

// Read webstories from filesystem instead of database
$stories = [];

try {
    // Check if webstories directory exists
    if (!is_dir($storiesDir)) {
        echo json_encode([]);
        exit;
    }
    
    // Get all HTML files from webstories directory
    $files = glob($storiesDir . '/*.html');
    
    if (empty($files)) {
        echo json_encode([]);
        exit;
    }
    
    // Sort files by modification time (newest first)
    usort($files, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    
    // Apply limit if specified
    if ($limit && $limit > 0) {
        $files = array_slice($files, 0, $limit);
    }
    
    foreach ($files as $filePath) {
        $filename = basename($filePath);
        
        // Skip if file is older than 3 days
        if (filemtime($filePath) < strtotime('-3 days')) {
            continue;
        }
        
        // Extract city and state info from filename
        $cityInfo = extractCityInfoFromFilename($filename);
        $city = $cityInfo['city'];
        $state = $cityInfo['state'];
        $slug = $cityInfo['slug'];
        
        // Get file modification time for display
        $displayDate = date('F j, Y', filemtime($filePath));
        
        // Try to extract rate from the HTML content if possible
        $rate = 'N/A';
        $htmlContent = file_get_contents($filePath);
        if ($htmlContent) {
            // Look for rate pattern in the HTML content
            if (preg_match('/₹\s*(\d+(?:\.\d+)?)\s*per\s*egg/i', $htmlContent, $matches)) {
                $rate = $matches[1];
            } elseif (preg_match('/Rate[:\s]*₹\s*(\d+(?:\.\d+)?)/i', $htmlContent, $matches)) {
                $rate = $matches[1];
            } elseif (preg_match('/(\d+(?:\.\d+)?)\s*₹/i', $htmlContent, $matches)) {
                $rate = $matches[1];
            }
        }
        
        // Check if thumbnail exists
        $thumbnailPath = "/images/webstories/thumbnail-$slug.webp";
        $thumbnailFile = $basePath . $thumbnailPath;
        
        // Add to stories array
        $stories[] = [
            'title' => "Egg Rate in $city" . ($state ? ", $state" : ""),
            'slug' => $slug,
            'thumbnail' => file_exists($thumbnailFile) ? $thumbnailPath : "/images/webstories/default-thumbnail.webp",
            'date' => $displayDate,
            'rate' => $rate,
            'city' => $city,
            'state' => $state,
            'file_path' => $filePath,
            'file_size' => filesize($filePath)
        ];
    }
    
} catch (Exception $e) {
    error_log("Error reading webstories: " . $e->getMessage());
    echo json_encode([]);
    exit;
}

echo json_encode($stories);
$conn->close();
?>
