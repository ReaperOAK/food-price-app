Food Price App - Code Redundancy Analysis
1. Common Database Connection Pattern
Issue: Nearly every PHP file contains the same database connection verification code:

This pattern appears in:

All webstories PHP files
API scripts
Maintenance scripts
SEO scripts
Recommendation:

Create a DatabaseConnection singleton class in a separate file (e.g., db_connection.php)
Remove connection code from individual files and use the singleton
2. Common HTTP Headers
Issue: Almost all API files repeat the same CORS and content type headers:

Recommendation:

Create a helper file api_headers.php that sets these headers
Include this file at the beginning of all API files
3. Normalized Tables Fallback Pattern
Issue: Multiple files implement the exact same fallback pattern when using normalized tables:

This appears in:

get_cities.php
get_states.php
get_latest_rate.php
get_latest_rates.php
get_special_rates.php
get_all_rates.php
get_rates.php
generate_web_stories.php
update_webstory_thumbnails.php
Recommendation:

Create a helper class DatabaseQuery with methods to handle this pattern
Example method: queryWithFallback(normalizedQuery, fallbackQuery, parameters)
4. Debug Logging Functions
Issue: Multiple files define similar debug logging functions:

This function is defined redundantly in:

generate_web_stories.php
update_webstory_thumbnails.php
delete_old_webstories.php
Recommendation:

Create a Logger class with consistent logging methods
Allow setting context/tag for different script types
5. Directory Creation and Checking
Issue: Similar directory checking and creation code appears in multiple webstory scripts:

Recommendation:

Create a FileSystem utility class with helper methods
Example method: ensureDirectoryExists($path)
6. Image Processing Operations
Issue: Duplicate image processing code in generate_web_stories.php and update_webstory_thumbnails.php:

Similar code for image resizing
Duplicate code for determining image type
Similar overlay creation patterns
Recommendation:

Create an ImageProcessor class with reusable methods
Example methods: resizeImage(), addOverlay(), determineImageType()
7. Database Helper Functions
Issue: The updateEggRate() function in db.php handles both original and normalized table operations, but similar patterns are repeated in:

update_rate.php
delete_rate.php
update_multiple_rates.php
add_state_city.php
remove_state_city.php
Recommendation:

Extend the database helper functions in db.php
Add functions like deleteEggRate() and updateMultipleRates()
8. Common State/City Query Patterns
Issue: Many files repeat similar SQL queries for getting cities, states, or rates:

Recommendation:

Create model classes for City, State, and Rate entities
Implement standard CRUD operations for each entity
9. Error Handling
Issue: Error handling patterns are inconsistent across files:

Some use try/catch with JSON error responses
Some use direct die() calls
Some log to error.log and continue
Recommendation:

Create a standardized error handling system
Implement a consistent API response format for errors
10. File Structure and Path Management
Issue: Multiple files calculate similar file paths and base paths:

Recommendation:

Define constants for common paths in a configuration file
Use these constants throughout the application
11. SQL Query Structure
Issue: Similar query patterns are repeated across files, particularly for:

Getting latest rates
Joining normalized tables
Updating records
Recommendation:

Create a query builder class or repository pattern
Define standard queries as reusable methods
12. Database Transaction Handling
Issue: Similar transaction patterns (begin/commit/rollback) appear in multiple files:

Recommendation:

Create a transaction handler class
Implement methods to execute operations within transactions
13. File Reading/Writing
Issue: Similar patterns for file reading and writing appear in multiple files:

Recommendation:

Create a FileHandler utility class
Implement methods for safe file reading/writing with proper error handling
Implementation Recommendations
Based on the above analysis, here are concrete recommendations for refactoring:

Create a MVC-like structure:

Models: Rate, City, State
Controllers: API endpoint logic
Services: Business logic
Utils: Helper functions
Implement Service Classes:

RateService for all rate operations
LocationService for city/state operations
WebStoryService for web story generation
Create Utility Classes:

DatabaseConnection (singleton)
Logger with configurable contexts
FileSystem for file/directory operations
ImageProcessor for image manipulation
Standardize API Responses:

Create a response formatter class
Implement consistent error handling
Refactor Configuration:

Move all configuration to a separate config file
Implement environment-specific configuration
By implementing these recommendations, the codebase would be significantly more maintainable, with clear separation of concerns and reduced duplication. This would make future enhancements easier and reduce the risk of bugs when making changes.