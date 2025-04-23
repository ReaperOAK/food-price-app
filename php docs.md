# Food Price App - PHP Documentation

## File Structure

```
└── 📁php
    ├── 📁api
    │   ├── 📁location
    │   │   ├── add_state_city.php
    │   │   ├── get_cities.php
    │   │   ├── get_state_for_city.php
    │   │   ├── get_states_and_cities.php
    │   │   ├── get_states.php
    │   │   └── remove_state_city.php
    │   ├── 📁rates
    │   │   ├── add_rate.php
    │   │   ├── delete_rate.php
    │   │   ├── get_all_rates.php
    │   │   ├── get_average_rates_by_state.php
    │   │   ├── get_latest_rate.php
    │   │   ├── get_latest_rates.php
    │   │   ├── get_rates.php
    │   │   ├── get_special_rates.php
    │   │   ├── update_multiple_rates.php
    │   │   └── update_rate.php
    │   └── 📁scraper
    │       ├── daily_update.php
    │       ├── eggprices.php
    │       └── update_from_e2necc.php
    ├── 📁config
    │   └── db.php
    ├── 📁cron
    │   └── cronjob.php
    ├── 📁database
    │   └── 📁maintenance
    │       └── archive_old_data.php
    ├── 📁seo
    │   └── generate_sitemap.php
    ├── 📁webstories
    │   ├── delete_old_webstories.php
    │   ├── generate_web_stories.php
    │   ├── generate_webstories_sitemap.php
    │   └── update_webstory_thumbnails.php
    ├── error.log
    ├── get_web_stories.php
    ├── index.php
    └── pricecheckROAK.php
```

## Database Utilities

### 🔄 `db.php` - Core Database Connection and Helper Functions

- Creates database connection to MySQL server
- Provides helper functions: `getStateId()`, `getCityId()`, `updateEggRate()`
- Central utility for all normalized database operations

### 📊 `archive_old_data.php` - Automatic Data Archiving

- **Purpose**: Moves old egg rate data to archive table
- **Operation**: Automatically archives data older than 10 days
- **Transaction Safety**: Runs in a single transaction for data integrity
- **Logging**: Records detailed archiving statistics to error.log
- **Cron-Friendly**: Designed to run as a scheduled cronjob
- **Performance**: Helps maintain database performance by reducing active data size

## Data Retrieval APIs

### 🌍 Location APIs

#### `get_states.php` - Retrieve All States

- Returns JSON list of all states in the database
- Used for dropdown menus and filters

#### `get_cities.php` - Retrieve Cities for a State

- Returns JSON list of cities in a specific state
- Takes state parameter via GET
- Used for city dropdown menus after state selection

#### `get_states_and_cities.php` - Retrieve All States with Their Cities

- Returns JSON with state names as keys and arrays of cities as values
- Used for populating UI components with location data

#### `get_state_for_city.php` - Retrieve the State for a Given City

- Returns the state name for a specific city
- Takes city parameter via GET

### 📈 Rate APIs

#### `get_special_rates.php` - Retrieve Special Egg Rates

- Returns rates for cities marked with state "special"
- Used for displaying special/featured rates

#### `get_rates.php` - Retrieve Historical Rates for a City

- Returns historical egg rate data for a specific city and state
- Takes city, state, and optional days parameters
- Used for charts and history tables

#### `get_latest_rates.php` - Retrieve Latest Rates for Multiple Cities

- Returns the most recent egg rate for each city
- Can filter to specific cities if provided in POST request
- Used for dashboard displays and rate comparisons

#### `get_latest_rate.php` - Retrieve Latest Rate for a Specific City

- Returns the most recent egg rate for a specific city and state
- Takes city and state parameters via GET
- Used for single city displays

#### `get_all_rates.php` - Retrieve All Egg Rates

- Returns all egg rate records
- Can filter by date if provided
- Used for admin displays and full data exports

#### `get_average_rates_by_state.php` - Retrieve Average Rates by State

- Calculates and returns average egg rates for a state over time
- Takes state and optional period parameters
- Used for state-level trend analysis and charts

## Data Update APIs

### ✏️ Location Management

#### `add_state_city.php` - Add a New State or City

- Creates a new state or city entry in the database
- Updates both original and normalized tables
- Takes type (state/city), name, and optionally state (for cities) via POST

#### `remove_state_city.php` - Remove a State or City

- Deletes a state or city and all associated egg rates
- Updates both original and normalized tables
- Takes type (state/city), name, and optionally state (for cities) via POST

### 📊 Rate Management

#### `add_rate.php` - Add a New Egg Rate Record

- Creates a new rate entry for a city on a specific date
- Updates both original and normalized tables
- Takes city, state, date, and rate via POST

#### `update_rate.php` - Update an Existing Egg Rate

- Updates a specific egg rate record by ID
- Updates both original and normalized tables
- Takes id, city, state, date, and rate via POST

#### `delete_rate.php` - Delete an Egg Rate Record

- Removes a specific egg rate entry by ID
- Deletes from both original and normalized tables
- Takes id parameter via POST

#### `update_multiple_rates.php` - Bulk Update Egg Rates

- Updates multiple egg rate records in a single transaction
- Updates both original and normalized tables
- Takes array of rate objects via POST

### 🤖 Data Scraping and Updates

#### `update_from_e2necc.php` - Import Data from e2necc Site

- Fetches egg prices from the eggprices.php script
- Updates the database with the latest rates
- Tracks updated cities for use by daily_update.php

#### `daily_update.php` - Daily Data Update for Cities

- Updates egg rates for cities not updated by update_from_e2necc.php
- Uses state averages or previous rates to estimate current rates
- Ensures all cities have current data every day

#### `eggprices.php` - Scrape Egg Prices from e2necc.com

- Scrapes egg price data from e2necc.com website
- Parses HTML table and extracts rates
- Maps cities to states and standardizes city names
- Converts rates from paisa to rupees

## Web Story Generation

### 📱 `generate_web_stories.php` - Generate AMP Web Stories

- Creates web stories for each city with latest egg rates
- Uses HTML templates and dynamic data
- Generates thumbnail images for each story
- Creates an index page for all web stories

### 🖼️ `update_webstory_thumbnails.php` - Update Thumbnails for Web Stories

- Generates or updates thumbnail images for web stories
- Creates consistent branded imagery for all city stories
- Displays city name, state, and latest egg rate on the thumbnail
- Updates webstory HTML with references to thumbnails in meta tags
- Checks daily for updates and only regenerates thumbnails when needed
- Cleans up unused thumbnails for removed webstories

### 🗑️ `delete_old_webstories.php` - Delete Outdated Web Stories

- Removes web stories for cities with outdated rates
- Maintains fresh content by removing stories older than specified days

### 🔍 SEO Tools

#### `generate_webstories_sitemap.php` - Generate Sitemap for Web Stories

- Creates XML sitemap of all generated web stories
- Enhances SEO for web stories

#### `generate_sitemap.php` - Generate Main Sitemap

- Creates XML and TXT sitemaps for the entire website
- Includes all city pages, state pages, web stories, and static pages
- Enhances SEO by providing search engines with a complete site structure

## Development/Admin Scripts

### 🛠️ `pricecheckROAK.php` - Developer Backdoor Script

- **IMPORTANT**: Developer utility for maintenance operations
- **RESTRICTED**: Contains functionality for file management
- **SECURITY**: Requires validation token for access
- For development team use only

## Automated Tasks

### ⏱️ `cronjob.php` - Automated Task Scheduler

- **Purpose**: Centralized script for running all scheduled maintenance tasks
- **Features**:
  - Runs data scraping and updates from external sources
  - Performs database maintenance operations
  - Generates and updates web stories and thumbnails
  - Creates and updates SEO sitemaps
  - Detailed logging of all operations
- **Execution Flow**:
  1. Updates egg rates from e2necc source
  2. Performs daily data updates for all cities
  3. Archives old data to maintain database performance
  4. Generates and updates web stories with current egg rates
  5. Updates thumbnails for all web stories
  6. Removes outdated web stories
  7. Generates main website sitemap
  8. Generates web stories sitemap
- **Error Handling**: Logs all successes and failures with execution times
- **Usage**: Set up as a daily cron job on the server (recommended to run at off-peak hours)
- **Command**: `php /path/to/php/cron/cronjob.php`