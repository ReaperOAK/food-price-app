# Food Price App - PHP Refactoring Guide

This document provides guidance on how to refactor the existing PHP codebase to eliminate redundancy and improve code organization.

## New Directory Structure

```
public/php/
├── api/             # API endpoints (existing)
├── config/          # Configuration files
│   ├── db.php       # Legacy database connection (gradually transition to use core)
│   └── db_new.php   # New implementation with backward compatibility
├── core/            # New core classes
│   ├── Autoloader.php              # PSR-4 autoloader and compatibility functions
│   ├── Config.php                  # Global configuration settings
│   ├── database/                   # Database related classes
│   │   ├── DatabaseConnection.php  # Singleton for database connections
│   │   ├── DatabaseQuery.php       # Helper for database queries with fallback
│   │   └── TransactionHandler.php  # Transaction management
│   ├── models/                     # Data models
│   │   ├── BaseModel.php           # Base model with CRUD operations
│   │   ├── City.php                # City entity model
│   │   ├── Rate.php                # Egg rate model
│   │   └── State.php               # State entity model
│   ├── controllers/               # Controller classes for API endpoints
│   ├── services/                  # Business logic services
│   └── utils/                     # Utility classes
│       ├── ApiHeaders.php          # API response header management
│       ├── ApiUtils.php            # API helper functions
│       ├── FileHandler.php         # Safe file operations
│       ├── FileSystem.php          # Directory and file system operations
│       ├── ImageProcessor.php      # Image manipulation utilities
│       └── Logger.php              # Consistent logging system
├── cron/            # Cron jobs (existing)
├── database/        # Database maintenance (existing)
├── seo/             # SEO scripts (existing)
└── webstories/      # Web story generation (existing)
```

## Refactoring Steps

### 1. Implement Autoloader

First, include the `Autoloader.php` in your PHP files:

```php
require_once dirname(__DIR__) . '/core/Autoloader.php';
```

### 2. Replace Database Connections

Replace direct connection code with the singleton:

```php
use FoodPriceApp\Core\Database\DatabaseConnection;

// Get database connection from singleton
$conn = DatabaseConnection::getInstance()->getConnection();
```

### 3. Replace Common Headers

Instead of directly setting headers in each API file:

```php
use FoodPriceApp\Core\Utils\ApiHeaders;

// Set standard API headers
ApiHeaders::setStandardHeaders();
```

### 4. Replace Normalized Tables Fallback

Instead of repeating the fallback pattern:

```php
use FoodPriceApp\Core\Database\DatabaseQuery;

$db = new DatabaseQuery($conn);
$results = $db->queryWithFallback(
    "SELECT * FROM normalized_table WHERE condition = ?",
    "SELECT * FROM original_table WHERE condition = ?",
    [$param]
);
```

### 5. Use Logger for Debugging

Replace custom debug functions:

```php
use FoodPriceApp\Core\Utils\Logger;

$logger = new Logger('WEBSTORIES');
$logger->debug("Starting web story generation");
$logger->info("Generated story for city: " . $city);
$logger->error("Failed to create thumbnail: " . $e->getMessage());
```

### 6. Directory Operations

Replace direct directory checks and creation:

```php
use FoodPriceApp\Core\Utils\FileSystem;

$fileSystem = new FileSystem();
$fileSystem->ensureDirectoryExists('/path/to/directory');
```

### 7. Image Processing

Replace duplicate image code:

```php
use FoodPriceApp\Core\Utils\ImageProcessor;

$imageProcessor = new ImageProcessor();
$imageProcessor->resizeImage($inputPath, $outputPath, 800, 600);
$imageProcessor->addTextOverlay($imagePath, $outputPath, "Sample Text", 24);
```

### 8. Use Model Classes

Replace direct database queries:

```php
use FoodPriceApp\Core\Models\State;
use FoodPriceApp\Core\Models\City;
use FoodPriceApp\Core\Models\Rate;

// Get states
$stateModel = new State($conn);
$states = $stateModel->getAllStatesWithFallback();

// Get cities for a state
$cityModel = new City($conn);
$cities = $cityModel->getCitiesForStateWithFallback($stateName);

// Update a rate
$rateModel = new Rate($conn);
$rateModel->updateEggRate($cityName, $stateName, $date, $rateValue);
```

### 9. Standardize API Responses

Use ApiUtils for consistent responses:

```php
use FoodPriceApp\Core\Utils\ApiUtils;

// Success response
ApiUtils::sendSuccessResponse($data);

// Error response
ApiUtils::sendErrorResponse("An error occurred", 400);
```

### 10. Use Transaction Handler

For database operations requiring transactions:

```php
use FoodPriceApp\Core\Database\TransactionHandler;

$transactionHandler = new TransactionHandler($conn);
$success = $transactionHandler->executeTransaction(function($conn) {
    // Perform database operations
    // Return true on success, false on failure
    return true;
});
```

## Migration Strategy

1. First, implement the core classes and utilities.
2. Create a new `db_new.php` that provides backward compatibility.
3. Gradually refactor one API file or script at a time.
4. Test each refactored component before moving on.
5. Update any references to the old functions/patterns.

## Backward Compatibility

The `Autoloader.php` provides compatibility functions for existing code:

```php
// These will work with both old and new code
$stateId = getStateId($conn, $stateName);
$cityId = getCityId($conn, $cityName, $stateId);
$success = updateEggRate($conn, $cityName, $stateName, $date, $rate);
```

## Benefits of the New Structure

1. **Reduced redundancy**: Eliminates duplicate code across files.
2. **Improved maintainability**: Organized, modular code structure.
3. **Better error handling**: Consistent error handling and logging.
4. **Separation of concerns**: Clear distinction between database, business logic, and presentation.
5. **Testability**: Easier to write unit tests for individual components.
6. **Performance**: Optimized database connections and query handling.
7. **Scalability**: Better organized code that's easier to extend.

## Example Usage

See the `core/examples/get_cities_example.php` for a demonstration of how to refactor an API endpoint using the new architecture.
