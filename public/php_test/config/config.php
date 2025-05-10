<?php
/**
 * Main configuration file
 * 
 * This file contains all configuration parameters for the application
 */

// Database configuration
define('DB_HOST', 'localhost');     // Database host
define('DB_USER', 'u901337298_test');          // Database user
define('DB_PASS', 'A12345678b*');              // Database password
define('DB_NAME', 'u901337298_test');   // Database name

// Path configuration
define('BASE_PATH', dirname(__DIR__));
define('WEBSTORIES_PATH', BASE_PATH . '/../webstories');
define('WEBSTORIES_IMAGES_PATH', BASE_PATH . '/../images/webstories');
define('TEMPLATES_PATH', BASE_PATH . '/../templates');

// URL configuration
define('BASE_URL', 'https://todayeggrates.com');
define('WEBSTORIES_URL', BASE_URL . '/webstories');

// Application configuration
define('DEBUG_MODE', false);
define('LOG_PATH', BASE_PATH . '/error.log');
define('DATA_ARCHIVE_DAYS', 10);  // Days before archiving old data
define('WEBSTORY_EXPIRY_DAYS', 7); // Days before web stories are considered outdated

// API Configuration
define('ENABLE_CORS', true);
define('ALLOWED_ORIGINS', ['https://todayeggrates.com', 'http://localhost:3000']);

// Cache settings
define('ENABLE_CACHE', true);
define('CACHE_EXPIRY', 3600); // Cache expiry in seconds (1 hour)

// Security settings
define('API_TOKEN', 'ReaperOAK'); // Change this to a secure random string
