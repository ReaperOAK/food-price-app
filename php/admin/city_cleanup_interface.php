<?php
/**
 * Web Interface for City Duplicates Cleanup
 * 
 * This provides a safe web interface to analyze and clean up duplicate cities
 * Access via: yourdomain.com/php/admin/city_cleanup_interface.php
 */

session_start();

// Simple authentication (you should change this password)
$admin_password = 'cleanup2024'; // Change this to a secure password

if (!isset($_SESSION['cleanup_authenticated'])) {
    if (isset($_POST['password']) && $_POST['password'] === $admin_password) {
        $_SESSION['cleanup_authenticated'] = true;
    } else {
        // Show login form
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <title>City Cleanup Admin</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                .form-group { margin: 15px 0; }
                input[type="password"] { padding: 8px; width: 200px; }
                button { padding: 10px 20px; background: #007cba; color: white; border: none; cursor: pointer; }
                button:hover { background: #005a87; }
            </style>
        </head>
        <body>
            <h2>City Cleanup Admin Access</h2>
            <form method="POST">
                <div class="form-group">
                    <label>Admin Password:</label><br>
                    <input type="password" name="password" required>
                </div>
                <button type="submit">Login</button>
            </form>
        </body>
        </html>
        <?php
        exit;
    }
}

require_once dirname(dirname(__DIR__)) . '/config/db.php';

// Verify database connection
if (!isset($conn) || $conn->connect_error) {
    die("Database connection failed");
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>City Duplicates Cleanup Interface</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 1200px; 
            margin: 20px auto; 
            padding: 20px; 
            background: #f5f5f5;
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .btn { 
            padding: 12px 24px; 
            margin: 10px 5px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 14px;
            text-decoration: none;
            display: inline-block;
        }
        .btn-primary { background: #007cba; color: white; }
        .btn-success { background: #28a745; color: white; }
        .btn-warning { background: #ffc107; color: black; }
        .btn-danger { background: #dc3545; color: white; }
        .btn:hover { opacity: 0.9; }
        .results { 
            background: #f8f9fa; 
            border: 1px solid #dee2e6; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 4px;
            max-height: 400px;
            overflow-y: auto;
        }
        .duplicate-item {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .success-item {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .error-item {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
        }
        th { 
            background: #f2f2f2; 
            font-weight: bold; 
        }
        .code { 
            background: #f8f9fa; 
            padding: 2px 4px; 
            border-radius: 3px; 
            font-family: monospace; 
            font-size: 90%;
        }
        .status-bar {
            background: #e9ecef;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        #loading {
            display: none;
            text-align: center;
            padding: 20px;
        }
    </style>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <div class="container">
        <h1>🏙️ City Duplicates Cleanup Interface</h1>
        <p>This tool helps identify and clean up duplicate city entries that have state codes like "Allahabad (CC)" vs "Allahabad".</p>
        
        <div class="status-bar">
            <strong>Current Status:</strong> Ready to analyze database
        </div>

        <div style="margin: 20px 0;">
            <button class="btn btn-primary" onclick="analyzeDatabase()">📊 Analyze Current Duplicates</button>
            <button class="btn btn-warning" onclick="previewCleanup()">👀 Preview Cleanup Changes</button>
            <button class="btn btn-success" onclick="runCleanup()" id="runCleanupBtn" disabled>🧹 Run Cleanup (Disabled until analysis)</button>
            <button class="btn btn-danger" onclick="logout()">🚪 Logout</button>
        </div>

        <div id="loading">
            <p>⏳ Processing... Please wait</p>
        </div>

        <div id="results"></div>
    </div>

    <script>
    function showLoading() {
        $('#loading').show();
        $('.btn').prop('disabled', true);
    }

    function hideLoading() {
        $('#loading').hide();
        $('.btn').prop('disabled', false);
    }

    function analyzeDatabase() {
        showLoading();
        
        $.get('../api/cleanup/analyze_duplicates.php')
        .done(function(data) {
            hideLoading();
            displayAnalysisResults(data);
            $('#runCleanupBtn').prop('disabled', false);
        })
        .fail(function() {
            hideLoading();
            $('#results').html('<div class="error-item">❌ Failed to analyze database. Please check server logs.</div>');
        });
    }

    function previewCleanup() {
        showLoading();
        
        $.get('../api/cleanup/city_duplicates_cleanup.php')
        .done(function(data) {
            hideLoading();
            displayPreviewResults(data);
        })
        .fail(function() {
            hideLoading();
            $('#results').html('<div class="error-item">❌ Failed to preview cleanup. Please check server logs.</div>');
        });
    }

    function runCleanup() {
        if (!confirm('⚠️ Are you sure you want to run the cleanup? This will modify your database.\n\nMake sure you have a backup!')) {
            return;
        }

        if (!confirm('🔄 Final confirmation: This action cannot be undone. Continue?')) {
            return;
        }

        showLoading();
        
        $.get('../api/cleanup/city_duplicates_cleanup.php?run=1')
        .done(function(data) {
            hideLoading();
            displayCleanupResults(data);
        })
        .fail(function() {
            hideLoading();
            $('#results').html('<div class="error-item">❌ Cleanup failed. Please check server logs.</div>');
        });
    }

    function displayAnalysisResults(data) {
        let html = '<h3>📊 Database Analysis Results</h3>';
        
        if (data.summary) {
            html += '<div class="success-item">';
            html += '<h4>📈 Summary Statistics</h4>';
            html += '<ul>';
            for (let key in data.summary) {
                html += `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${data.summary[key]}</li>`;
            }
            html += '</ul></div>';
        }

        if (data.duplicates_found && Object.keys(data.duplicates_found).length > 0) {
            html += '<div class="duplicate-item">';
            html += '<h4>🔍 Specific Duplicates Found</h4>';
            for (let city in data.duplicates_found) {
                html += `<h5>${city}:</h5><ul>`;
                data.duplicates_found[city].forEach(variant => {
                    html += `<li><span class="code">${variant.city}</span> in ${variant.state} (${variant.rate_count} rates)</li>`;
                });
                html += '</ul>';
            }
            html += '</div>';
        }

        if (data.cities_with_state_codes && data.cities_with_state_codes.length > 0) {
            html += '<div class="duplicate-item">';
            html += '<h4>🏷️ Cities with State Codes</h4>';
            html += '<table><tr><th>City</th><th>State</th><th>Rate Count</th><th>Date Range</th></tr>';
            data.cities_with_state_codes.forEach(city => {
                html += `<tr>
                    <td><span class="code">${city.city}</span></td>
                    <td>${city.state}</td>
                    <td>${city.rate_count}</td>
                    <td>${city.earliest_rate} to ${city.latest_rate}</td>
                </tr>`;
            });
            html += '</table></div>';
        }

        if (data.recommendations) {
            html += '<div class="success-item">';
            html += '<h4>💡 Recommendations</h4>';
            html += '<h5>Immediate Actions:</h5><ul>';
            data.recommendations.immediate_actions.forEach(action => {
                html += `<li>${action}</li>`;
            });
            html += '</ul></div>';
        }

        $('#results').html(html);
    }

    function displayPreviewResults(data) {
        let html = '<h3>👀 Cleanup Preview</h3>';
        
        if (data.preview && data.preview.length > 0) {
            html += '<div class="duplicate-item">';
            html += '<h4>📋 Cities that will be affected:</h4>';
            html += '<table><tr><th>City</th><th>State</th><th>Type</th><th>Rate Count</th><th>Clean Name</th></tr>';
            data.preview.forEach(item => {
                html += `<tr>
                    <td><span class="code">${item.city}</span></td>
                    <td>${item.state}</td>
                    <td>${item.city_type}</td>
                    <td>${item.rate_count}</td>
                    <td><strong>${item.clean_name}</strong></td>
                </tr>`;
            });
            html += '</table></div>';
        }

        html += `<div class="success-item">
            <h4>📊 Total cities with issues: ${data.total_cities_with_issues || 0}</h4>
            <p>The cleanup will process these cities and merge/rename them as needed.</p>
        </div>`;

        $('#results').html(html);
    }

    function displayCleanupResults(data) {
        let html = '<h3>🧹 Cleanup Results</h3>';
        
        if (data.success) {
            html += '<div class="success-item">';
            html += '<h4>✅ Cleanup completed successfully!</h4>';
            html += '<h5>📊 Statistics:</h5><ul>';
            for (let key in data.statistics) {
                html += `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${data.statistics[key]}</li>`;
            }
            html += '</ul></div>';

            if (data.processed_duplicates && data.processed_duplicates.length > 0) {
                html += '<div class="success-item">';
                html += '<h4>🔄 Processed Duplicates:</h4>';
                data.processed_duplicates.forEach(item => {
                    html += `<div style="margin: 10px 0; padding: 10px; background: #fff; border-radius: 4px;">
                        <strong>${item.action === 'merge_and_remove' ? '🔗 Merged' : '✏️ Renamed'}:</strong> 
                        <span class="code">${item.city_with_code}</span> → <span class="code">${item.clean_city}</span>
                        <br><small>${item.details.join('. ')}</small>
                    </div>`;
                });
                html += '</div>';
            }

            html += '<div class="success-item">';
            html += '<h4>🎯 Next Steps:</h4>';
            html += '<ul>';
            html += '<li>✅ Database cleanup completed</li>';
            html += '<li>🔄 Consider regenerating sitemap</li>';
            html += '<li>🗂️ Update web stories if needed</li>';
            html += '<li>🧹 Clear any caches</li>';
            html += '</ul></div>';

        } else {
            html += '<div class="error-item">';
            html += '<h4>❌ Cleanup failed</h4>';
            if (data.errors && data.errors.length > 0) {
                html += '<ul>';
                data.errors.forEach(error => {
                    html += `<li>${error}</li>`;
                });
                html += '</ul>';
            }
            html += '</div>';
        }

        $('#results').html(html);
    }

    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = '?logout=1';
        }
    }

    // Auto-run analysis on page load
    $(document).ready(function() {
        analyzeDatabase();
    });
    </script>
</body>
</html>

<?php
// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

$conn->close();
?>
