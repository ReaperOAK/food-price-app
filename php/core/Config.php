<?php
/**
 * Config.php
 * Global configuration settings for the application
 */

namespace FoodPriceApp\Core;

class Config {
    /**
     * Database configuration
     */
    const DB_HOST = "localhost";
    const DB_USER = "u901337298_test";
    const DB_PASS = "A12345678b*";
    const DB_NAME = "u901337298_test";
    
    /**
     * Path constants
     */
    const BASE_PATH = __DIR__ . '/../../';
    const IMAGES_PATH = self::BASE_PATH . '../images/';
    const WEBSTORIES_PATH = self::BASE_PATH . '../webstories/';
    const WEBSTORIES_IMAGES_PATH = self::BASE_PATH . '../images/webstories/';
    const TEMPLATES_PATH = self::BASE_PATH . '../templates/';
    
    /**
     * Logger configuration
     */
    const LOG_FILE = self::BASE_PATH . '/error.log';
    const LOG_LEVEL = 'debug'; // options: debug, info, warning, error
    
    /**
     * API settings
     */
    const API_ALLOW_ORIGIN = '*';
    const API_CONTENT_TYPE = 'application/json';
    
    /**
     * Web stories configuration
     */
    const WEBSTORY_MAX_AGE_DAYS = 10;
    const WEBSTORY_TEMPLATE = self::TEMPLATES_PATH . 'webstory_template.html';
}
?>
