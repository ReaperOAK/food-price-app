# Food Price App Setup Instructions

This document provides detailed instructions for setting up the Food Price App on a web server.

## System Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache 2.4 or higher (or Nginx equivalent)
- PHP Extensions:
  - PDO and PDO_MySQL
  - cURL
  - GD or Imagick (for image processing)
  - mbstring
  - xml

## Installation Steps

### 1. Database Setup

1. Create a new MySQL database for the application:

```sql
CREATE DATABASE eggpriceapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Create a database user and grant permissions:

```sql
CREATE USER 'eggpriceuser'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON eggpriceapp.* TO 'eggpriceuser'@'localhost';
FLUSH PRIVILEGES;
```

3. Import the database schema:

```bash
mysql -u eggpriceuser -p eggpriceapp < database/schema.sql
```

### 2. Application Files

1. Clone or download the application files to your web server:

```bash
git clone https://github.com/yourusername/food-price-app.git /var/www/html/eggpriceapp
```

2. Set the proper permissions:

```bash
chown -R www-data:www-data /var/www/html/eggpriceapp
chmod -R 755 /var/www/html/eggpriceapp
chmod -R 777 /var/www/html/eggpriceapp/webstories
chmod -R 777 /var/www/html/eggpriceapp/images
```

### 3. Configuration

1. Copy the example configuration file and edit it with your settings:

```bash
cp /var/www/html/eggpriceapp/php_test/config/config.example.php /var/www/html/eggpriceapp/php_test/config/config.php
```

2. Edit the configuration file with your database and site settings:

```php
// Database configuration
define('DB_HOST', 'localhost');     // Database host
define('DB_USER', 'eggpriceuser');  // Database user
define('DB_PASS', 'your_secure_password'); // Database password
define('DB_NAME', 'eggpriceapp');   // Database name

// Path configuration
define('BASE_PATH', dirname(__DIR__));
define('WEBSTORIES_PATH', BASE_PATH . '/../webstories');
define('WEBSTORIES_IMAGES_PATH', BASE_PATH . '/../images/webstories');
define('TEMPLATES_PATH', BASE_PATH . '/../templates');

// URL configuration
define('BASE_URL', 'https://yourdomain.com');
define('WEBSTORIES_URL', BASE_URL . '/webstories');
```

### 4. Web Server Configuration

#### For Apache:

1. Create a virtual host configuration file:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/html/eggpriceapp
    
    <Directory /var/www/html/eggpriceapp>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/eggpriceapp-error.log
    CustomLog ${APACHE_LOG_DIR}/eggpriceapp-access.log combined
</VirtualHost>
```

2. Enable the virtual host and restart Apache:

```bash
sudo a2ensite eggpriceapp.conf
sudo systemctl restart apache2
```

#### For Nginx:

1. Create a server block configuration file:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/html/eggpriceapp;
    
    index index.php index.html;
    
    location / {
        try_files $uri $uri/ /index.php?$args;
    }
    
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    }
    
    location ~ /\.ht {
        deny all;
    }
}
```

2. Enable the configuration and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/eggpriceapp.conf /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### 5. Directory Structure

Ensure the following directories exist and are writable by the web server:

```bash
mkdir -p /var/www/html/eggpriceapp/webstories
mkdir -p /var/www/html/eggpriceapp/images/webstories
mkdir -p /var/www/html/eggpriceapp/templates
```

### 6. Cron Job Setup

Set up the following cron jobs to automate the application's daily tasks:

1. Edit the crontab:

```bash
crontab -e
```

2. Add the following entries:

```cron
# Update egg prices daily at 6 AM
0 6 * * * php /var/www/html/eggpriceapp/php_test/daily_update.php >> /var/www/html/eggpriceapp/php_test/logs/daily_update.log 2>&1

# Archive old data weekly on Sunday at 2 AM
0 2 * * 0 php /var/www/html/eggpriceapp/php_test/cron/cronjob.php task=archive_data >> /var/www/html/eggpriceapp/php_test/logs/archive.log 2>&1

# Generate sitemaps daily at 7 AM
0 7 * * * php /var/www/html/eggpriceapp/php_test/cron/cronjob.php task=generate_sitemaps >> /var/www/html/eggpriceapp/php_test/logs/sitemaps.log 2>&1
```

### 7. Testing the Installation

1. To test the installation, access the API to get the list of states:

```
https://yourdomain.com/php_test/api/location/get_states.php
```

2. You should receive a JSON response similar to this:

```json
{
    "status": "success",
    "message": "States retrieved successfully",
    "data": ["Andhra Pradesh", "Delhi", "Gujarat", ...]
}
```

## Initial Data Setup

### 1. Adding Initial States and Cities

To add initial states and cities, you can use the provided API endpoint:

```bash
curl -X POST "https://yourdomain.com/php_test/api/location/add_state_city.php" \
  -d "state=Maharashtra&city=Mumbai"
```

Repeat this for all the states and cities you want to track.

### 2. Running the First Update

To populate the database with initial egg rate data, run:

```bash
php /var/www/html/eggpriceapp/php_test/cron/cronjob.php task=daily_update
```

This will:
- Scrape rates from e2necc.com
- Calculate rates for other cities
- Generate initial web stories
- Create thumbnails
- Generate sitemaps

## Troubleshooting

### Issue: API Returns 500 Internal Server Error

1. Check the PHP error logs:
   ```bash
   tail -100 /var/log/php/error.log
   ```

2. Ensure database connection is working:
   ```php
   <?php
   $conn = new PDO('mysql:host=localhost;dbname=eggpriceapp', 'eggpriceuser', 'your_secure_password');
   echo "Connection successful";
   ```

### Issue: Cron Jobs Not Running

1. Check if cron is running:
   ```bash
   systemctl status cron
   ```

2. Check cron logs:
   ```bash
   grep CRON /var/log/syslog
   ```

3. Ensure the PHP script is executable:
   ```bash
   chmod +x /var/www/html/eggpriceapp/php_test/daily_update.php
   ```

### Issue: Web Stories Not Generating

1. Check if the template directory exists and contains valid templates.
2. Check file permissions on the webstories and images directories.
3. Ensure the GD or Imagick PHP extension is installed and enabled.

## Security Notes

1. **API Protection**: Consider adding authentication to protect your API endpoints. This can be done using API keys or JWT tokens.

2. **Rate Limiting**: Implement rate limiting to prevent abuse of your API endpoints.

3. **File Uploads**: The application doesn't currently handle file uploads, but if you extend it to do so, ensure proper validation and sanitization.

4. **Regular Updates**: Keep PHP, MySQL, and your web server software updated with security patches.

## Backup Strategy

1. **Database Backup**:
   ```bash
   # Add to crontab for daily backups
   0 1 * * * mysqldump -u eggpriceuser -p'your_secure_password' eggpriceapp > /path/to/backups/eggpriceapp_$(date +\%Y\%m\%d).sql
   ```

2. **File Backup**:
   ```bash
   # Add to crontab for weekly backups
   0 2 * * 0 tar -czf /path/to/backups/eggpriceapp_files_$(date +\%Y\%m\%d).tar.gz /var/www/html/eggpriceapp
   ```

## Production Optimization

For production environments, consider the following optimizations:

1. **Enable PHP OPcache**:
   ```ini
   opcache.enable=1
   opcache.memory_consumption=128
   opcache.max_accelerated_files=10000
   opcache.revalidate_freq=60
   ```

2. **Configure Database Caching**:
   ```ini
   query_cache_size = 64M
   query_cache_limit = 2M
   ```

3. **Set Up a CDN** for static assets like images.

4. **Implement Page Caching** for static content.

5. **Enable HTTP/2** on your web server for better performance.

## Support and Maintenance

For ongoing support and maintenance:

1. **Monitor Error Logs** regularly to catch issues early.
2. **Set Up Alerts** for critical errors or downtime.
3. **Regularly Test** the API endpoints to ensure they're functioning correctly.
4. **Update Dependencies** to keep the system secure and performant.
