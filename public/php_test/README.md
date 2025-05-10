# Food Price App API Documentation

This document provides a comprehensive guide to the API endpoints available in the Food Price App. All API responses follow a consistent format for success and error cases.

## API Response Format

### Success Response

```json
{
    "status": "success",
    "message": "Operation completed successfully",
    "data": {
        // Response data specific to the endpoint
    }
}
```

### Error Response

```json
{
    "status": "error",
    "message": "Error message explaining what went wrong",
    "code": 400 // HTTP status code
}
```

## Authentication

Currently, the API does not require authentication. However, for production use, consider implementing API keys or other authentication mechanisms.

## Rate Limits

There are no specific rate limits, but excessive usage may be throttled to prevent server overload.

---

## Endpoints

### Location Endpoints

#### Get All States

Retrieves a list of all states in the database.

- **URL**: `/api/location/get_states.php`
- **Method**: GET
- **Parameters**: None
- **Response**:
  ```json
  {
      "status": "success",
      "message": "States retrieved successfully",
      "data": ["Andhra Pradesh", "Delhi", "Gujarat", ...]
  }
  ```

#### Get Cities by State

Retrieves all cities for a specific state.

- **URL**: `/api/location/get_cities.php`
- **Method**: GET
- **Parameters**: 
  - `state` (string, required): The name of the state
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Cities retrieved successfully",
      "data": ["Chennai", "Coimbatore", "Madurai", ...]
  }
  ```

#### Get All States and Cities

Retrieves all states with their corresponding cities.

- **URL**: `/api/location/get_states_and_cities.php`
- **Method**: GET
- **Parameters**: None
- **Response**:
  ```json
  {
      "status": "success",
      "message": "States and cities retrieved successfully",
      "data": {
          "Andhra Pradesh": ["Hyderabad", "Vijayawada", ...],
          "Delhi": ["Delhi", "New Delhi"],
          ...
      }
  }
  ```

#### Add State/City

Adds a new state and city combination to the database.

- **URL**: `/api/location/add_state_city.php`
- **Method**: POST
- **Parameters**: 
  - `state` (string, required): The name of the state
  - `city` (string, required): The name of the city
- **Response**:
  ```json
  {
      "status": "success",
      "message": "State and city added successfully",
      "data": {
          "state": "Karnataka",
          "city": "Mysore"
      }
  }
  ```

#### Remove State/City

Removes a state and city combination from the database.

- **URL**: `/api/location/remove_state_city.php`
- **Method**: POST
- **Parameters**: 
  - `state` (string, required): The name of the state
  - `city` (string, required): The name of the city
- **Response**:
  ```json
  {
      "status": "success",
      "message": "State and city removed successfully",
      "data": {
          "state": "Karnataka",
          "city": "Mysore"
      }
  }
  ```

### Rates Endpoints

#### Get Latest Rate for a City

Retrieves the latest egg rate for a specific city.

- **URL**: `/api/rates/get_latest_rate.php`
- **Method**: GET
- **Parameters**: 
  - `city` (string, required): The name of the city
  - `state` (string, optional): The name of the state
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Rate retrieved successfully",
      "data": {
          "city": "Mumbai",
          "state": "Maharashtra",
          "rate": 560,
          "date": "2023-05-20"
      }
  }
  ```

#### Get Latest Rates for All Cities

Retrieves the latest egg rates for all cities.

- **URL**: `/api/rates/get_latest_rates.php`
- **Method**: GET
- **Parameters**: None
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Rates retrieved successfully",
      "data": [
          {
              "city": "Mumbai",
              "state": "Maharashtra",
              "rate": 560,
              "date": "2023-05-20"
          },
          ...
      ]
  }
  ```

#### Get Special Rates

Retrieves special egg rates (e.g., wholesale prices, farm prices).

- **URL**: `/api/rates/get_special_rates.php`
- **Method**: GET
- **Parameters**: None
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Special rates retrieved successfully",
      "data": [
          {
              "city": "Wholesale",
              "state": "Special",
              "rate": 510,
              "date": "2023-05-20"
          },
          ...
      ]
  }
  ```

#### Get Rates History for a City

Retrieves the egg rate history for a specific city.

- **URL**: `/api/rates/get_rates.php`
- **Method**: GET
- **Parameters**: 
  - `city` (string, required): The name of the city
  - `state` (string, optional): The name of the state
  - `days` (integer, optional): Number of days of history to retrieve (default: 30)
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Rates retrieved successfully",
      "data": [
          {
              "city": "Mumbai",
              "state": "Maharashtra",
              "rate": 560,
              "date": "2023-05-20"
          },
          {
              "city": "Mumbai",
              "state": "Maharashtra",
              "rate": 555,
              "date": "2023-05-19"
          },
          ...
      ]
  }
  ```

#### Get All Rates

Retrieves all egg rates in the database with optional filtering.

- **URL**: `/api/rates/get_all_rates.php`
- **Method**: GET
- **Parameters**: 
  - `state` (string, optional): Filter by state
  - `start_date` (string, optional): Start date in YYYY-MM-DD format
  - `end_date` (string, optional): End date in YYYY-MM-DD format
  - `limit` (integer, optional): Maximum number of records to retrieve
  - `offset` (integer, optional): Number of records to skip
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Rates retrieved successfully",
      "data": [
          {
              "id": 1,
              "city": "Mumbai",
              "state": "Maharashtra",
              "rate": 560,
              "date": "2023-05-20"
          },
          ...
      ],
      "pagination": {
          "total": 500,
          "limit": 50,
          "offset": 0,
          "next_offset": 50
      }
  }
  ```

#### Add New Rate

Adds a new egg rate entry to the database.

- **URL**: `/api/rates/add_rate.php`
- **Method**: POST
- **Parameters**: 
  - `city` (string, required): The name of the city
  - `state` (string, required): The name of the state
  - `rate` (number, required): The egg rate
  - `date` (string, optional): Date in YYYY-MM-DD format (defaults to current date)
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Rate added successfully",
      "data": {
          "id": 501,
          "city": "Mumbai",
          "state": "Maharashtra",
          "rate": 565,
          "date": "2023-05-21"
      }
  }
  ```

#### Update Existing Rate

Updates an existing egg rate entry.

- **URL**: `/api/rates/update_rate.php`
- **Method**: POST
- **Parameters**: 
  - `id` (integer, required): The ID of the rate to update
  - `rate` (number, required): The new egg rate
  - `date` (string, optional): New date in YYYY-MM-DD format
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Rate updated successfully",
      "data": {
          "id": 501,
          "city": "Mumbai",
          "state": "Maharashtra",
          "rate": 570,
          "date": "2023-05-21"
      }
  }
  ```

### Web Stories Endpoints

#### Get Web Stories

Retrieves a list of available web stories.

- **URL**: `/api/webstories/get_web_stories.php`
- **Method**: GET
- **Parameters**: 
  - `limit` (integer, optional): Maximum number of web stories to retrieve (default: 10)
  - `offset` (integer, optional): Number of web stories to skip
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Web stories retrieved successfully",
      "data": [
          {
              "city": "Mumbai",
              "state": "Maharashtra",
              "url": "https://todayeggrates.com/webstory/mumbai-egg-rate",
              "thumbnail": "https://todayeggrates.com/images/webstories/mumbai-egg-rate.jpg",
              "created": "2023-05-20"
          },
          ...
      ]
  }
  ```

#### Generate Web Stories

Generates web stories for cities with recent egg rates.

- **URL**: `/api/webstories/generate_stories.php`
- **Method**: GET
- **Parameters**: 
  - `force` (boolean, optional): Force regeneration of all stories (default: false)
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Web stories generated successfully",
      "data": {
          "generated": 10,
          "skipped": 5,
          "failed": 0
      }
  }
  ```

#### Update Web Story Thumbnails

Updates thumbnails for existing web stories.

- **URL**: `/api/webstories/update_thumbnails.php`
- **Method**: GET
- **Parameters**: 
  - `force` (boolean, optional): Force regeneration of all thumbnails (default: false)
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Web story thumbnails updated successfully",
      "data": {
          "generated": 10,
          "skipped": 5,
          "failed": 0
      }
  }
  ```

#### Delete Old Web Stories

Removes web stories that have outdated egg rates.

- **URL**: `/api/webstories/delete_old_stories.php`
- **Method**: GET
- **Parameters**: 
  - `days` (integer, optional): Age threshold in days (default: 7)
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Old web stories deleted successfully",
      "data": {
          "deleted": 3,
          "kept": 12
      }
  }
  ```

#### Generate Web Stories Sitemap

Generates a sitemap specifically for web stories.

- **URL**: `/api/webstories/generate_sitemap.php`
- **Method**: GET
- **Parameters**: None
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Web stories sitemap generated successfully",
      "data": {
          "count": 15
      }
  }
  ```

### SEO Endpoints

#### Generate All Sitemaps

Generates all sitemaps for the website.

- **URL**: `/api/seo/generate_all_sitemaps.php`
- **Method**: GET
- **Parameters**: None
- **Response**:
  ```json
  {
      "status": "success",
      "message": "All sitemaps generated successfully",
      "data": {
          "main_sitemap": {
              "status": "success",
              "urls": 120,
              "states": 15,
              "cities": 50,
              "webstories": 50,
              "static": 5
          },
          "webstories_sitemap": {
              "status": "success",
              "urls": 50
          }
      }
  }
  ```

### Scraper Endpoints

#### Update Rates from E2NECC

Updates egg rates by scraping data from e2necc.com.

- **URL**: `/api/scraper/update_from_e2necc.php`
- **Method**: GET
- **Parameters**: 
  - `force` (boolean, optional): Force update even if already updated today (default: false)
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Egg rates updated successfully from e2necc",
      "data": {
          "source": "e2necc.com",
          "date": "2023-05-21",
          "updated_cities": 15,
          "new_rates": 15,
          "unchanged": 0
      }
  }
  ```

#### Daily Update

Performs daily updates for cities not covered by e2necc.com.

- **URL**: `/api/scraper/daily_update.php`
- **Method**: GET
- **Parameters**: 
  - `already_updated` (array, optional): List of cities already updated
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Daily update completed successfully",
      "data": {
          "date": "2023-05-21",
          "updated_cities": 35,
          "skipped_cities": 15
      }
  }
  ```

### Database Maintenance Endpoints

#### Archive Old Data

Archives old egg rate data to maintain database performance.

- **URL**: `/database/maintenance/archive_old_data.php`
- **Method**: GET
- **Parameters**: 
  - `days` (integer, optional): Number of days before archiving (default: 60)
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Old data archived successfully",
      "data": {
          "archived": 500,
          "threshold_days": 60,
          "cutoff_date": "2023-03-22"
      }
  }
  ```

## Cron Jobs

The application includes several scheduled tasks that can be executed via the cron job controller.

- **Script**: `/cron/cronjob.php`
- **Usage**: `php cronjob.php task=<task_name>`
- **Available Tasks**:
  - `daily_update`: Runs all daily update tasks
  - `update_e2necc`: Updates rates from e2necc.com only
  - `update_rates`: Updates remaining cities with state averages
  - `generate_stories`: Generates web stories
  - `update_thumbnails`: Updates web story thumbnails
  - `delete_old_stories`: Deletes outdated web stories
  - `generate_sitemaps`: Updates all sitemaps
  - `archive_data`: Archives old data

## Error Codes

- `400`: Bad Request - The request is malformed or missing required parameters
- `404`: Not Found - The requested resource was not found
- `500`: Internal Server Error - An unexpected error occurred on the server
