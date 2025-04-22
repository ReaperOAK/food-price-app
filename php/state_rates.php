<?php
// Include necessary files
require_once 'db.php';
require_once 'schema_markup.php';

// Get state name from URL
$state_slug = isset($_GET['state']) ? $_GET['state'] : '';
$state_name = str_replace('-egg-rate', '', $state_slug);
$state_name = str_replace('-', ' ', $state_name);
$state_name = ucwords($state_name); // Convert to title case

// Get latest rates for cities in this state
$query = "SELECT e.city_name, e.rate, e.date FROM egg_rates e
          JOIN cities c ON e.city_name = c.city_name
          JOIN city_state_map csm ON c.id = csm.city_id
          JOIN states s ON csm.state_id = s.id
          WHERE s.state_name = :state_name
          AND (e.city_name, e.date) IN (
            SELECT city_name, MAX(date) FROM egg_rates GROUP BY city_name
          )
          ORDER BY e.rate DESC";
$stmt = $pdo->prepare($query);
$stmt->execute(['state_name' => $state_name]);
$cities_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Calculate average rate for the state
$avg_rate = 0;
if (count($cities_data) > 0) {
    $total = 0;
    foreach ($cities_data as $city) {
        $total += (float)$city['rate'];
    }
    $avg_rate = number_format($total / count($cities_data), 2);
}

// Generate title and meta description
$title = "Egg Rates in $state_name - Latest Egg Prices for All Cities (Updated " . date('d M Y') . ")";
$meta_description = "Check current egg rates for all cities in $state_name. Get latest egg prices, daily updates, and wholesale rates for $state_name. NECC egg price in $state_name updated daily.";

// Generate schema markup
$schema_data = [
    'state_name' => $state_name,
    'avg_rate' => $avg_rate
];
$schema_markup = generate_schema_markup('state', $schema_data);

// Output JSON data if requested
if (isset($_GET['format']) && $_GET['format'] === 'json') {
    header('Content-Type: application/json');
    echo json_encode([
        'state' => $state_name,
        'average_rate' => $avg_rate,
        'cities' => $cities_data
    ]);
    exit;
}

// Begin HTML output
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $title; ?></title>
    <meta name="description" content="<?php echo $meta_description; ?>">
    <meta name="keywords" content="<?php echo $state_name; ?> egg rate, egg price in <?php echo $state_name; ?>, <?php echo $state_name; ?> egg price today, <?php echo $state_name; ?> wholesale egg rate, NECC egg rate <?php echo $state_name; ?>">
    <link rel="canonical" href="https://todayeggrates.com/state/<?php echo $state_slug; ?>">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="<?php echo $title; ?>">
    <meta property="og:description" content="<?php echo $meta_description; ?>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://todayeggrates.com/state/<?php echo $state_slug; ?>">
    <meta property="og:image" content="https://todayeggrates.com/eggpic.png">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo $title; ?>">
    <meta name="twitter:description" content="<?php echo $meta_description; ?>">
    <meta name="twitter:image" content="https://todayeggrates.com/eggpic.png">
    
    <!-- Schema.org markup -->
    <?php echo $schema_markup; ?>
    
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header>
        <div class="container">
            <h1>Egg Rates in <?php echo $state_name; ?></h1>
            <div class="breadcrumb">
                <a href="/">Home</a> &raquo; <?php echo $state_name; ?> Egg Rates
            </div>
        </div>
    </header>
    
    <main class="container">
        <?php if (count($cities_data) > 0): ?>
            <div class="egg-rate-card">
                <h2>Average Egg Rate in <?php echo $state_name; ?></h2>
                <div class="egg-price">₹<?php echo $avg_rate; ?></div>
                <div class="egg-date">per 100 eggs as of <?php echo date('d F Y'); ?></div>
            </div>
            
            <section class="cities-list">
                <h2>Egg Rates in All Cities of <?php echo $state_name; ?></h2>
                <p>Below are the current egg rates for all major cities in <?php echo $state_name; ?>. Rates are updated daily.</p>
                
                <table class="rate-table">
                    <thead>
                        <tr>
                            <th>City</th>
                            <th>Rate (per 100)</th>
                            <th>Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($cities_data as $city): ?>
                        <tr>
                            <td>
                                <a href="/<?php echo strtolower(str_replace(' ', '-', $city['city_name'])); ?>-egg-rate">
                                    <?php echo $city['city_name']; ?>
                                </a>
                            </td>
                            <td>₹<?php echo $city['rate']; ?></td>
                            <td><?php echo date('d M Y', strtotime($city['date'])); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </section>
            
            <section class="state-info">
                <h2>About Egg Rates in <?php echo $state_name; ?></h2>
                <p>The egg rates in <?php echo $state_name; ?> are updated daily based on wholesale market prices and National Egg Coordination Committee (NECC) rates. The average egg rate in <?php echo $state_name; ?> is ₹<?php echo $avg_rate; ?> per 100 eggs.</p>
                
                <p>Factors affecting egg prices in <?php echo $state_name; ?> include:</p>
                <ul>
                    <li>Local poultry farm production</li>
                    <li>Transportation costs within the state</li>
                    <li>Regional demand patterns</li>
                    <li>State-specific regulations and taxes</li>
                    <li>Seasonal factors</li>
                </ul>
                
                <p>The egg prices displayed are for white eggs (per 100) in wholesale markets. Retail prices may vary by city and individual vendors.</p>
            </section>
            
            <section class="faq-section">
                <h2>Frequently Asked Questions about <?php echo $state_name; ?> Egg Rates</h2>
                <div class="faq">
                    <div class="faq-item">
                        <h4>What is the average egg rate in <?php echo $state_name; ?>?</h4>
                        <p>The average egg rate in <?php echo $state_name; ?> is ₹<?php echo $avg_rate; ?> per 100 eggs. Rates may vary by city and district.</p>
                    </div>
                    
                    <div class="faq-item">
                        <h4>Which city in <?php echo $state_name; ?> has the highest egg prices?</h4>
                        <p><?php echo $cities_data[0]['city_name']; ?> currently has the highest egg rate in <?php echo $state_name; ?> at ₹<?php echo $cities_data[0]['rate']; ?> per 100 eggs.</p>
                    </div>
                    
                    <div class="faq-item">
                        <h4>How often are egg rates updated in <?php echo $state_name; ?>?</h4>
                        <p>Egg rates in <?php echo $state_name; ?> are updated daily based on the wholesale market prices and NECC rates.</p>
                    </div>
                </div>
            </section>
            
            <section class="nearby-states">
                <h2>Egg Rates in States Near <?php echo $state_name; ?></h2>
                <?php
                // Get nearby states
                $nearby_query = "SELECT DISTINCT s.state_name 
                                FROM states s 
                                WHERE s.state_name != :state_name
                                ORDER BY RAND()
                                LIMIT 5";
                $nearby_stmt = $pdo->prepare($nearby_query);
                $nearby_stmt->execute(['state_name' => $state_name]);
                $nearby_states = $nearby_stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (count($nearby_states) > 0) {
                    echo '<ul class="state-list">';
                    foreach ($nearby_states as $nearby) {
                        $nearby_slug = strtolower(str_replace(' ', '-', $nearby['state_name'])) . '-egg-rate';
                        echo '<li><a href="/state/' . $nearby_slug . '">' . $nearby['state_name'] . ' Egg Rates</a></li>';
                    }
                    echo '</ul>';
                } else {
                    echo '<p>No nearby states found.</p>';
                }
                ?>
            </section>
        <?php else: ?>
            <div class="error-message">
                <h2>State Data Not Found</h2>
                <p>We don't have egg rate information for <?php echo $state_name; ?> at the moment. Please check back later or try searching for another state.</p>
                <a href="/" class="btn">Back to Home</a>
            </div>
        <?php endif; ?>
    </main>
    
    <footer>
        <div class="container">
            <p>&copy; <?php echo date('Y'); ?> Today Egg Rates. All rights reserved.</p>
            <div class="footer-links">
                <a href="/privacy">Privacy Policy</a>
                <a href="/terms">Terms of Service</a>
                <a href="/disclaimer">Disclaimer</a>
            </div>
        </div>
    </footer>
    
    <script src="/js/main.js"></script>
</body>
</html>