<?php
// Include necessary files
require_once 'db.php';
require_once 'schema_markup.php';

// Get city name from URL
$city_slug = isset($_GET['city']) ? $_GET['city'] : '';
$city_name = str_replace('-egg-rate', '', $city_slug);
$city_name = str_replace('-', ' ', $city_name);
$city_name = ucwords($city_name); // Convert to title case

// Get latest rate for this city
$query = "SELECT * FROM egg_rates WHERE city_name = :city_name ORDER BY date DESC LIMIT 1";
$stmt = $pdo->prepare($query);
$stmt->execute(['city_name' => $city_name]);
$city_data = $stmt->fetch(PDO::FETCH_ASSOC);

// Get historical rates
$history_query = "SELECT * FROM egg_rates WHERE city_name = :city_name ORDER BY date DESC LIMIT 10";
$history_stmt = $pdo->prepare($history_query);
$history_stmt->execute(['city_name' => $city_name]);
$history_data = $history_stmt->fetchAll(PDO::FETCH_ASSOC);

// Get state name for this city
$state_query = "SELECT s.state_name FROM states s 
                JOIN city_state_map csm ON s.id = csm.state_id 
                JOIN cities c ON c.id = csm.city_id 
                WHERE c.city_name = :city_name";
$state_stmt = $pdo->prepare($state_query);
$state_stmt->execute(['city_name' => $city_name]);
$state_data = $state_stmt->fetch(PDO::FETCH_ASSOC);
$state_name = $state_data ? $state_data['state_name'] : '';

// Generate title and meta description
$title = "Today's Egg Rate in $city_name - Latest Price Update " . date('d M Y');
$meta_description = "Check today's egg rate in $city_name. Get latest egg prices, daily updates, and wholesale rates for $city_name. NECC egg price in $city_name updated daily.";

// Generate schema markup
$schema_data = [
    'city_name' => $city_name,
    'rate' => $city_data ? $city_data['rate'] : '',
    'date' => $city_data ? $city_data['date'] : date('Y-m-d')
];
$schema_markup = generate_schema_markup('city', $schema_data);

// Generate breadcrumb HTML
$breadcrumb_html = '
<div class="breadcrumb">
    <a href="/">Home</a> &raquo; ';

if (!empty($state_name)) {
    $state_slug = strtolower(str_replace(' ', '-', $state_name)) . '-egg-rate';
    $breadcrumb_html .= '<a href="/state/' . $state_slug . '">' . $state_name . '</a> &raquo; ';
}

$breadcrumb_html .= $city_name . ' Egg Rate
</div>';

// Output JSON data if requested
if (isset($_GET['format']) && $_GET['format'] === 'json') {
    header('Content-Type: application/json');
    echo json_encode([
        'city' => $city_name,
        'state' => $state_name,
        'current_rate' => $city_data ? $city_data['rate'] : null,
        'date' => $city_data ? $city_data['date'] : null,
        'history' => $history_data
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
    <meta name="keywords" content="<?php echo $city_name; ?> egg rate, egg price in <?php echo $city_name; ?>, <?php echo $city_name; ?> egg price today, <?php echo $city_name; ?> wholesale egg rate, NECC egg rate <?php echo $city_name; ?>">
    <link rel="canonical" href="https://todayeggrates.com/<?php echo $city_slug; ?>">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="<?php echo $title; ?>">
    <meta property="og:description" content="<?php echo $meta_description; ?>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://todayeggrates.com/<?php echo $city_slug; ?>">
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
            <h1>Today's Egg Rate in <?php echo $city_name; ?></h1>
            <?php echo $breadcrumb_html; ?>
        </div>
    </header>
    
    <main class="container">
        <?php if ($city_data): ?>
            <div class="egg-rate-card">
                <h2>Current Egg Rate in <?php echo $city_name; ?></h2>
                <div class="egg-price">₹<?php echo $city_data['rate']; ?></div>
                <div class="egg-date">per 100 eggs as of <?php echo date('d F Y', strtotime($city_data['date'])); ?></div>
                
                <?php if (!empty($state_name)): ?>
                <div class="state-info">
                    <p>City: <?php echo $city_name; ?>, State: <?php echo $state_name; ?></p>
                </div>
                <?php endif; ?>
            </div>
            
            <section class="rate-history">
                <h2><?php echo $city_name; ?> Egg Rate History</h2>
                <table class="rate-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Rate (per 100)</th>
                            <th>Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $prev_rate = null;
                        foreach ($history_data as $index => $rate): 
                            $change = '';
                            if ($index < count($history_data) - 1) {
                                $diff = $rate['rate'] - $history_data[$index + 1]['rate'];
                                if ($diff > 0) {
                                    $change = '<span class="up">+' . $diff . '</span>';
                                } elseif ($diff < 0) {
                                    $change = '<span class="down">' . $diff . '</span>';
                                } else {
                                    $change = '<span class="same">0</span>';
                                }
                            }
                        ?>
                        <tr>
                            <td><?php echo date('d M Y', strtotime($rate['date'])); ?></td>
                            <td>₹<?php echo $rate['rate']; ?></td>
                            <td><?php echo $change; ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </section>
            
            <section class="egg-info">
                <h2>About Egg Rates in <?php echo $city_name; ?></h2>
                <p>The egg rates in <?php echo $city_name; ?> are updated daily based on wholesale market prices and National Egg Coordination Committee (NECC) rates. Factors affecting egg prices in <?php echo $city_name; ?> include:</p>
                <ul>
                    <li>Poultry feed costs</li>
                    <li>Seasonal demand</li>
                    <li>Supply chain factors</li>
                    <li>Regional market conditions</li>
                </ul>
                
                <p>The egg prices displayed are for white eggs (per 100) in wholesale markets. Retail prices may vary slightly.</p>
                
                <h3>Frequently Asked Questions about <?php echo $city_name; ?> Egg Rates</h3>
                <div class="faq">
                    <div class="faq-item">
                        <h4>What is the current egg rate in <?php echo $city_name; ?>?</h4>
                        <p>The current egg rate in <?php echo $city_name; ?> is ₹<?php echo $city_data['rate']; ?> per 100 eggs as of <?php echo date('F j, Y', strtotime($city_data['date'])); ?>.</p>
                    </div>
                    
                    <div class="faq-item">
                        <h4>How often are egg rates updated in <?php echo $city_name; ?>?</h4>
                        <p>Egg rates in <?php echo $city_name; ?> are updated daily based on the wholesale market prices and NECC rates.</p>
                    </div>
                    
                    <div class="faq-item">
                        <h4>Why do egg prices fluctuate in <?php echo $city_name; ?>?</h4>
                        <p>Egg prices in <?php echo $city_name; ?> fluctuate due to factors like feed costs, seasonal demand, supply chain issues, and local market conditions.</p>
                    </div>
                </div>
            </section>
            
            <section class="nearby-cities">
                <h2>Egg Rates in Cities Near <?php echo $city_name; ?></h2>
                <?php
                // Get nearby cities based on state
                if (!empty($state_name)) {
                    $nearby_query = "SELECT c.city_name FROM cities c 
                                    JOIN city_state_map csm ON c.id = csm.city_id 
                                    JOIN states s ON s.id = csm.state_id 
                                    WHERE s.state_name = :state_name 
                                    AND c.city_name != :city_name
                                    LIMIT 5";
                    $nearby_stmt = $pdo->prepare($nearby_query);
                    $nearby_stmt->execute(['state_name' => $state_name, 'city_name' => $city_name]);
                    $nearby_cities = $nearby_stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    if (count($nearby_cities) > 0) {
                        echo '<ul class="city-list">';
                        foreach ($nearby_cities as $nearby) {
                            $nearby_slug = strtolower(str_replace(' ', '-', $nearby['city_name'])) . '-egg-rate';
                            echo '<li><a href="/' . $nearby_slug . '">' . $nearby['city_name'] . ' Egg Rate</a></li>';
                        }
                        echo '</ul>';
                    } else {
                        echo '<p>No nearby cities found.</p>';
                    }
                }
                ?>
            </section>
        <?php else: ?>
            <div class="error-message">
                <h2>City Data Not Found</h2>
                <p>We don't have egg rate information for <?php echo $city_name; ?> at the moment. Please check back later or try searching for another city.</p>
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