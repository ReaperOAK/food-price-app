<?php
/**
 * db.php
 * Database connection and utility functions
 * 
 * This file provides backward compatibility with the original db.php
 * while making use of the new architecture
 */

// Load our autoloader
require_once dirname(__DIR__) . '/core/Autoloader.php';

use FoodPriceApp\Core\Database\DatabaseConnection;
use FoodPriceApp\Core\Models\State;
use FoodPriceApp\Core\Models\City;
use FoodPriceApp\Core\Models\Rate;

// Define connection parameters for backward compatibility
$servername = "localhost";
$username = "u901337298_test";
$password = "A12345678b*";
$dbname = "u901337298_test";

// Get connection from the singleton
$conn = DatabaseConnection::getInstance()->getConnection();

// The original database helper functions are now implemented as wrappers
// using the new models, provided through the Autoloader.php
?>
