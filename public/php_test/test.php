<?php
/**
 * Test Script for Food Price App
 * 
 * This script tests each component of the PHP implementation
 * to ensure everything is working properly.
 * 
 * Usage: php test.php [component]
 * 
 * Available components to test:
 * - all: Test all components (default)
 * - config: Test configuration
 * - database: Test database connection
 * - logger: Test logging functionality
 * - filesystem: Test file system operations
 * - cache: Test caching system
 * - location: Test location API endpoints
 * - rates: Test rates API endpoints
 * - webstories: Test web stories generation
 * - sitemap: Test sitemap generation
 * - scraper: Test e2necc scraping
 */

// Set script execution time to unlimited for comprehensive testing
set_time_limit(0);

// Define test component from command line argument
$testComponent = isset($argv[1]) ? $argv[1] : 'all';
$isWebRequest = php_sapi_name() !== 'cli';

// Required files
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/core/DatabaseConnection.php';
require_once __DIR__ . '/utils/Logger.php';
require_once __DIR__ . '/utils/ApiResponse.php';
require_once __DIR__ . '/utils/FileSystem.php';
require_once __DIR__ . '/utils/Cache.php';
require_once __DIR__ . '/models/Location.php';
require_once __DIR__ . '/models/Rate.php';
require_once __DIR__ . '/models/WebStory.php';

/**
 * Output function for both CLI and web interface
 */
function output($message, $isSuccess = true, $isHeading = false) {
    global $isWebRequest;
    
    $statusChar = $isSuccess ? '✓' : '✗';
    $color = $isSuccess ? 'green' : 'red';
    
    if ($isWebRequest) {
        $style = $isHeading ? 'font-size: 1.2em; font-weight: bold; margin-top: 20px;' : '';
        echo "<div style='margin: 5px 0; color: $color; $style'>";
        if (!$isHeading) echo "$statusChar ";
        echo htmlspecialchars($message);
        echo "</div>";
    } else {
        if ($isHeading) {
            echo "\n\033[1m" . str_repeat('-', 50) . "\n";
            echo "$message\n";
            echo str_repeat('-', 50) . "\033[0m\n";
        } else {
            echo ($isSuccess ? "\033[32m$statusChar " : "\033[31m$statusChar ");
            echo "$message\033[0m\n";
        }
    }
}

/**
 * Test configuration file
 */
function testConfig() {
    output("Testing Configuration", true, true);
    
    $requiredConstants = [
        'DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME',
        'BASE_PATH', 'WEBSTORIES_PATH', 'WEBSTORIES_IMAGES_PATH', 'TEMPLATES_PATH',
        'BASE_URL', 'WEBSTORIES_URL'
    ];
    
    foreach ($requiredConstants as $constant) {
        $defined = defined($constant);
        output("Checking for $constant: " . ($defined ? 'Defined' : 'Not defined'), $defined);
    }
    
    output("Configuration path check: " . BASE_PATH, file_exists(BASE_PATH));
    output("Webstories path check: " . WEBSTORIES_PATH, file_exists(WEBSTORIES_PATH) || is_dir(WEBSTORIES_PATH) || mkdir(WEBSTORIES_PATH, 0755, true));
    output("Webstories images path check: " . WEBSTORIES_IMAGES_PATH, file_exists(WEBSTORIES_IMAGES_PATH) || is_dir(WEBSTORIES_IMAGES_PATH) || mkdir(WEBSTORIES_IMAGES_PATH, 0755, true));
    output("Templates path check: " . TEMPLATES_PATH, file_exists(TEMPLATES_PATH) || is_dir(TEMPLATES_PATH) || mkdir(TEMPLATES_PATH, 0755, true));
}

/**
 * Test database connection
 */
function testDatabase() {
    output("Testing Database Connection", true, true);
    
    try {
        $db = DatabaseConnection::getInstance();
        $connected = $db->query("SELECT 1");
        output("Database connection: " . ($connected ? 'Successful' : 'Failed'), $connected !== false);
        
        // Test database schema
        $tables = ['egg_rates', 'egg_rates_archive', 'states', 'cities'];
        foreach ($tables as $table) {
            $result = $db->query("SHOW TABLES LIKE '$table'");
            $exists = $result && $result->rowCount() > 0;
            output("Table '$table' exists: " . ($exists ? 'Yes' : 'No'), $exists);
        }
    } catch (Exception $e) {
        output("Database error: " . $e->getMessage(), false);
    }
}

/**
 * Test logging functionality
 */
function testLogger() {
    output("Testing Logger", true, true);
    
    try {
        $logger = Logger::getInstance();
        $logger->info("Test info message", "TestModule");
        output("Logger info: Message logged", true);
        
        $logger->error("Test error message", "TestModule");
        output("Logger error: Message logged", true);
        
        $logger->debug("Test debug message", "TestModule");
        output("Logger debug: Message logged", true);
        
        $logPath = defined('LOG_PATH') ? LOG_PATH : BASE_PATH . '/error.log';
        output("Log file exists: " . $logPath, file_exists($logPath));
    } catch (Exception $e) {
        output("Logger error: " . $e->getMessage(), false);
    }
}

/**
 * Test file system operations
 */
function testFileSystem() {
    output("Testing File System", true, true);
    
    try {
        $fs = new FileSystem();
        
        // Test directory creation
        $testDir = BASE_PATH . '/test_dir';
        $dirCreated = $fs->ensureDirectoryExists($testDir);
        output("Directory creation: " . ($dirCreated ? 'Successful' : 'Failed'), $dirCreated);
        
        // Test file write
        $testFile = $testDir . '/test.txt';
        $content = 'Test content: ' . date('Y-m-d H:i:s');
        $fileWritten = $fs->writeFile($testFile, $content);
        output("File write: " . ($fileWritten ? 'Successful' : 'Failed'), $fileWritten);
        
        // Test file read
        $readContent = file_get_contents($testFile);
        $readSuccess = $readContent === $content;
        output("File read: " . ($readSuccess ? 'Successful' : 'Failed'), $readSuccess);
        
        // Clean up
        unlink($testFile);
        rmdir($testDir);
        output("Cleanup: Successful", true);
    } catch (Exception $e) {
        output("File system error: " . $e->getMessage(), false);
    }
}

/**
 * Test caching system
 */
function testCache() {
    output("Testing Cache System", true, true);
    
    try {
        // Test set and get
        $key = 'test_key_' . time();
        $data = ['test' => 'data', 'timestamp' => time()];
        
        $result = Cache::set($key, $data, 60);
        output("Cache set: " . ($result ? 'Successful' : 'Failed'), $result);
        
        $cached = Cache::get($key);
        $getSuccess = $cached !== null && $cached['test'] === 'data';
        output("Cache get: " . ($getSuccess ? 'Successful' : 'Failed'), $getSuccess);
        
        // Test invalidation
        $result = Cache::invalidate($key);
        output("Cache invalidate: " . ($result ? 'Successful' : 'Failed'), $result);
        
        $cached = Cache::get($key);
        $invalidateSuccess = $cached === null;
        output("Cache invalidation verification: " . ($invalidateSuccess ? 'Successful' : 'Failed'), $invalidateSuccess);
    } catch (Exception $e) {
        output("Cache error: " . $e->getMessage(), false);
    }
}

/**
 * Test location API endpoints
 */
function testLocation() {
    output("Testing Location Model & API", true, true);
    
    try {
        $location = new Location();
        
        // Get all states
        $states = $location->getAllStates();
        output("Get all states: " . count($states) . " states found", count($states) > 0);
        
        if (count($states) > 0) {
            $firstState = $states[0];
            
            // Get cities for first state
            $cities = $location->getCitiesByState($firstState);
            output("Get cities by state ($firstState): " . count($cities) . " cities found", true);
            
            // Get states and cities
            $statesAndCities = $location->getAllStatesAndCities();
            output("Get all states and cities: " . count($statesAndCities) . " states with cities", count($statesAndCities) > 0);
            
            // Test add and remove state/city if cities array is empty
            if (count($cities) == 0) {
                $testCity = "TestCity" . time();
                $added = $location->addStateCity($firstState, $testCity);
                output("Add state/city ($firstState/$testCity): " . ($added ? 'Successful' : 'Failed'), $added);
                
                if ($added) {
                    $cities = $location->getCitiesByState($firstState);
                    output("Verify city added: " . (in_array($testCity, $cities) ? 'Successful' : 'Failed'), in_array($testCity, $cities));
                    
                    $removed = $location->removeStateCity($firstState, $testCity);
                    output("Remove state/city ($firstState/$testCity): " . ($removed ? 'Successful' : 'Failed'), $removed);
                    
                    $cities = $location->getCitiesByState($firstState);
                    output("Verify city removed: " . (!in_array($testCity, $cities) ? 'Successful' : 'Failed'), !in_array($testCity, $cities));
                }
            }
        }
    } catch (Exception $e) {
        output("Location error: " . $e->getMessage(), false);
    }
}

/**
 * Test rates API endpoints
 */
function testRates() {
    output("Testing Rate Model & API", true, true);
    
    try {
        $rate = new Rate();
        $location = new Location();
        
        // Get latest rates
        $latestRates = $rate->getAllLatestRates();
        output("Get all latest rates: " . count($latestRates) . " rates found", true);
        
        // Get latest rate for a specific city if we have rates
        if (count($latestRates) > 0) {
            $firstRate = $latestRates[0];
            $city = $firstRate['city'];
            $state = $firstRate['state'];
            
            $cityRate = $rate->getLatestRate($city, $state);
            output("Get latest rate for $city, $state: " . 
                  (isset($cityRate['rate']) ? 'Rate: ' . $cityRate['rate'] : 'Not found'), 
                  isset($cityRate['rate']));
            
            // Get rates history
            $history = $rate->getRatesHistory($city, $state, 30);
            output("Get rates history for $city, $state: " . count($history) . " records found", true);
            
            // Get special rates
            $specialRates = $rate->getSpecialRates();
            output("Get special rates: " . count($specialRates) . " special rates found", true);
            
            // Test add rate and update rate with a dummy entry
            $testRate = 999.99;
            $today = date('Y-m-d');
            
            $addResult = $rate->addRate($city, $state, $testRate, $today);
            if ($addResult && isset($addResult['id'])) {
                output("Add rate ($city, $state, $testRate): Successful (ID: " . $addResult['id'] . ")", true);
                
                $newRate = 888.88;
                $updateResult = $rate->updateRate($addResult['id'], $newRate);
                output("Update rate (ID: " . $addResult['id'] . ", $newRate): " . 
                      ($updateResult ? 'Successful' : 'Failed'), $updateResult);
                
                // Clean up test rate
                $db = DatabaseConnection::getInstance();
                $db->exec("DELETE FROM egg_rates WHERE id = " . $addResult['id']);
                output("Clean up test rate: Successful", true);
            } else {
                output("Add rate ($city, $state, $testRate): Failed", false);
            }
        } else {
            // If no rates exist, get states and add a test rate
            $states = $location->getAllStates();
            if (count($states) > 0) {
                $firstState = $states[0];
                $cities = $location->getCitiesByState($firstState);
                
                if (count($cities) > 0) {
                    $firstCity = $cities[0];
                    $testRate = 999.99;
                    $today = date('Y-m-d');
                    
                    $addResult = $rate->addRate($firstCity, $firstState, $testRate, $today);
                    if ($addResult && isset($addResult['id'])) {
                        output("Add test rate ($firstCity, $firstState, $testRate): Successful (ID: " . $addResult['id'] . ")", true);
                        
                        $db = DatabaseConnection::getInstance();
                        $db->exec("DELETE FROM egg_rates WHERE id = " . $addResult['id']);
                        output("Clean up test rate: Successful", true);
                    } else {
                        output("Add test rate: Failed", false);
                    }
                }
            }
        }
    } catch (Exception $e) {
        output("Rates error: " . $e->getMessage(), false);
    }
}

/**
 * Test web stories generation
 */
function testWebStories() {
    output("Testing Web Stories", true, true);
    
    try {
        $webStory = new WebStory();
        
        // Get existing web stories
        $stories = $webStory->getWebStories();
        output("Get web stories: " . (is_array($stories) ? count($stories) . ' stories found' : 'Failed'), is_array($stories));
        
        // Test generate thumbnail
        $testImage = WEBSTORIES_IMAGES_PATH . '/test_thumbnail.jpg';
        
        // Create a simple test image if GD is available
        if (function_exists('imagecreate')) {
            $im = imagecreate(300, 200);
            $backgroundColor = imagecolorallocate($im, 255, 255, 255);
            $textColor = imagecolorallocate($im, 0, 0, 0);
            imagestring($im, 5, 60, 90, 'Test Image', $textColor);
            imagejpeg($im, $testImage);
            imagedestroy($im);
            
            $thumbnailGenerated = $webStory->generateThumbnail($testImage, $testImage . '.thumb.jpg');
            output("Generate thumbnail: " . ($thumbnailGenerated ? 'Successful' : 'Failed'), $thumbnailGenerated);
            
            // Clean up
            if (file_exists($testImage)) unlink($testImage);
            if (file_exists($testImage . '.thumb.jpg')) unlink($testImage . '.thumb.jpg');
        } else {
            output("Generate thumbnail: Skipped (GD library not available)", false);
        }
        
        // Check if template exists
        $templateExists = file_exists(TEMPLATES_PATH . '/webstory_template.html');
        output("Web story template exists: " . ($templateExists ? 'Yes' : 'No'), $templateExists);
        
        // Don't actually generate stories as this would create files
        output("Web story generation: Skipped for test", true);
        
    } catch (Exception $e) {
        output("Web Stories error: " . $e->getMessage(), false);
    }
}

/**
 * Test sitemap generation
 */
function testSitemap() {
    output("Testing Sitemap Generation", true, true);
    
    try {
        // Test sitemaps using offline mode
        require_once __DIR__ . '/seo/generate_sitemap.php';
        
        // Use reflection to create an instance without running generate()
        $sitemapGenerator = new SitemapGenerator();
        
        // Check if createSlug method works
        $class = new ReflectionClass('SitemapGenerator');
        if ($class->hasMethod('createSlug')) {
            $method = $class->getMethod('createSlug');
            $method->setAccessible(true);
            
            $slug = $method->invoke($sitemapGenerator, 'Test City Name');
            $expected = 'test-city-name';
            output("Create slug test: " . ($slug === $expected ? 'Successful' : "Failed ($slug vs $expected)"), $slug === $expected);
        } else {
            output("Create slug test: Method not found", false);
        }
        
        // Check if addUrl method works
        if ($class->hasMethod('addUrl')) {
            $method = $class->getMethod('addUrl');
            $method->setAccessible(true);
            
            $url = 'https://example.com/test';
            $priority = '0.8';
            $lastmod = '2023-01-01';
            
            $result = $method->invoke($sitemapGenerator, $url, $priority, $lastmod);
            $containsUrl = strpos($result, $url) !== false;
            $containsPriority = strpos($result, $priority) !== false;
            $containsLastmod = strpos($result, $lastmod) !== false;
            
            output("Add URL test: " . 
                  ($containsUrl && $containsPriority && $containsLastmod ? 'Successful' : 'Failed'), 
                  $containsUrl && $containsPriority && $containsLastmod);
        } else {
            output("Add URL test: Method not found", false);
        }
        
        output("Full sitemap generation: Skipped for test", true);
        
    } catch (Exception $e) {
        output("Sitemap error: " . $e->getMessage(), false);
    }
}

/**
 * Test e2necc scraping
 */
function testScraper() {
    output("Testing E2NECC Scraper", true, true);
    
    try {
        require_once __DIR__ . '/api/scraper/eggprices.php';
        
        $scraper = new E2NeccScraper();
        
        // Check if the URL is accessible without actually scraping
        $class = new ReflectionClass('E2NeccScraper');
        $property = $class->getProperty('sourceUrl');
        $property->setAccessible(true);
        $url = $property->getValue($scraper);
        
        $headers = get_headers($url, 1);
        $accessible = $headers && strpos($headers[0], '200') !== false;
        output("Source URL accessible: " . ($accessible ? 'Yes' : 'No'), $accessible);
        
        // Don't actually run the scraper as it can be intensive and might update real data
        output("E2NECC scraping: Skipped for test", true);
        
    } catch (Exception $e) {
        output("Scraper error: " . $e->getMessage(), false);
    }
}

// Web interface header
if ($isWebRequest) {
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Food Price App - PHP Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            hr { border: 0; border-top: 1px solid #ddd; margin: 20px 0; }
            .success { color: green; }
            .error { color: red; }
            form { margin: 20px 0; }
            select, button { padding: 8px; }
        </style>
    </head>
    <body>
        <h1>Food Price App - PHP Test</h1>
        <p>This script tests the functionality of the Food Price App PHP implementation.</p>
        <form method="get">
            <select name="component">
                <option value="all"' . ($testComponent == 'all' ? ' selected' : '') . '>All Components</option>
                <option value="config"' . ($testComponent == 'config' ? ' selected' : '') . '>Configuration</option>
                <option value="database"' . ($testComponent == 'database' ? ' selected' : '') . '>Database</option>
                <option value="logger"' . ($testComponent == 'logger' ? ' selected' : '') . '>Logger</option>
                <option value="filesystem"' . ($testComponent == 'filesystem' ? ' selected' : '') . '>FileSystem</option>
                <option value="cache"' . ($testComponent == 'cache' ? ' selected' : '') . '>Cache</option>
                <option value="location"' . ($testComponent == 'location' ? ' selected' : '') . '>Location</option>
                <option value="rates"' . ($testComponent == 'rates' ? ' selected' : '') . '>Rates</option>
                <option value="webstories"' . ($testComponent == 'webstories' ? ' selected' : '') . '>Web Stories</option>
                <option value="sitemap"' . ($testComponent == 'sitemap' ? ' selected' : '') . '>Sitemap</option>
                <option value="scraper"' . ($testComponent == 'scraper' ? ' selected' : '') . '>Scraper</option>
            </select>
            <button type="submit">Run Test</button>
        </form>
        <hr>
        <div id="results">
';

    // Get component from query string
    $testComponent = isset($_GET['component']) ? $_GET['component'] : 'all';
}

// Run selected tests
switch ($testComponent) {
    case 'config':
        testConfig();
        break;
    case 'database':
        testDatabase();
        break;
    case 'logger':
        testLogger();
        break;
    case 'filesystem':
        testFileSystem();
        break;
    case 'cache':
        testCache();
        break;
    case 'location':
        testLocation();
        break;
    case 'rates':
        testRates();
        break;
    case 'webstories':
        testWebStories();
        break;
    case 'sitemap':
        testSitemap();
        break;
    case 'scraper':
        testScraper();
        break;
    case 'all':
    default:
        testConfig();
        testDatabase();
        testLogger();
        testFileSystem();
        testCache();
        testLocation();
        testRates();
        testWebStories();
        testSitemap();
        testScraper();
        break;
}

// Web interface footer
if ($isWebRequest) {
    echo '
        </div>
    </body>
    </html>';
}
