<?php
// Include necessary files
require_once 'db.php';
require_once 'schema_markup.php';

// Get type from URL parameter
$type = isset($_GET['type']) ? $_GET['type'] : 'wholesale';

// Define page information based on type
$page_info = [
    'wholesale' => [
        'title' => 'Wholesale Egg Rates in India - Today\'s Bulk Egg Prices by City',
        'description' => 'Get today\'s wholesale egg rates across India. Compare bulk egg prices from major cities and markets. Updated daily with NECC and mandi prices.',
        'headline' => 'Today\'s Wholesale Egg Rates',
        'subheading' => 'Check Bulk Egg Prices Across India',
        'rate_unit' => 'per 100 eggs',
        'intro_text' => 'The wholesale egg rates below are updated daily based on data from the National Egg Coordination Committee (NECC) and major poultry markets across India. Rates are for white eggs sold in bulk (per 100) and may vary slightly from retail prices.',
        'query_type' => 'wholesale'
    ],
    'retail' => [
        'title' => 'Retail Egg Rates in India - Today\'s Consumer Egg Prices by City',
        'description' => 'Get today\'s retail egg rates across India. Compare consumer egg prices from major cities and markets. Updated daily with latest local market prices.',
        'headline' => 'Today\'s Retail Egg Rates',
        'subheading' => 'Consumer Egg Prices Across India',
        'rate_unit' => 'per dozen',
        'intro_text' => 'The retail egg rates below reflect the consumer prices in local markets across various cities in India. These prices are typically 10-15% higher than wholesale rates and are updated daily based on market surveys.',
        'query_type' => 'retail'
    ],
    'farm' => [
        'title' => 'Farm Egg Rates in India - Today\'s Poultry Farm Egg Prices',
        'description' => 'Get today\'s farm egg rates across India. Compare poultry farm egg prices from major production centers. Updated daily with farmer direct prices.',
        'headline' => 'Today\'s Farm Egg Rates',
        'subheading' => 'Direct from Poultry Farms',
        'rate_unit' => 'per 100 eggs',
        'intro_text' => 'The farm egg rates below show the prices that farmers receive when selling directly to distributors or at the farm gate. These rates are generally lower than wholesale prices and are updated daily based on reports from major poultry farming regions.',
        'query_type' => 'farm'
    ],
    'desi' => [
        'title' => 'Desi Egg Rates in India - Today\'s Country Egg Prices by City',
        'description' => 'Get today\'s desi egg rates across India. Compare country/native egg prices from major cities. Updated daily with premium for organic native eggs.',
        'headline' => 'Today\'s Desi Egg Rates',
        'subheading' => 'Country and Native Egg Prices',
        'rate_unit' => 'per dozen',
        'intro_text' => 'Desi eggs, also known as country or native eggs, typically command a premium over regular white eggs due to their perceived nutritional benefits. The rates below are updated daily and reflect prices for country eggs from free-range or indigenous chicken breeds.',
        'query_type' => 'desi'
    ]
];

// Set current page info
$current_page = isset($page_info[$type]) ? $page_info[$type] : $page_info['wholesale'];

// Get egg rates based on type
$query = "SELECT e.city_name, e.rate, e.date, s.state_name 
          FROM egg_rates e
          JOIN cities c ON e.city_name = c.city_name
          JOIN city_state_map csm ON c.id = csm.city_id
          JOIN states s ON csm.state_id = s.id
          WHERE e.type = :type OR e.type IS NULL
          AND (e.city_name, e.date) IN (
            SELECT city_name, MAX(date) FROM egg_rates GROUP BY city_name
          )
          ORDER BY s.state_name, e.city_name";

$stmt = $pdo->prepare($query);
$stmt->execute(['type' => $current_page['query_type']]);
$rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Organize rates by state
$rates_by_state = [];
foreach ($rates as $rate) {
    if (!isset($rates_by_state[$rate['state_name']])) {
        $rates_by_state[$rate['state_name']] = [];
    }
    $rates_by_state[$rate['state_name']][] = $rate;
}

// Calculate average rate
$avg_rate = 0;
if (count($rates) > 0) {
    $total = 0;
    foreach ($rates as $rate) {
        $total += (float)$rate['rate'];
    }
    $avg_rate = number_format($total / count($rates), 2);
}

// Generate schema data
$schema_data = [
    'title' => $current_page['title'],
    'description' => $current_page['description'],
    'egg_type' => $type,
    'avg_rate' => $avg_rate,
    'date' => date('Y-m-d')
];

$special_rate_schema = generate_special_rate_schema($schema_data);

// Begin HTML output
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $current_page['title']; ?></title>
    <meta name="description" content="<?php echo $current_page['description']; ?>">
    <meta name="keywords" content="<?php echo $type; ?> egg rates, <?php echo $type; ?> egg price, <?php echo $type; ?> egg rate today, egg prices India, NECC egg rates, egg market price, egg price today, egg rate today">
    <link rel="canonical" href="https://todayeggrates.com/<?php echo $type; ?>-egg-rates">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="<?php echo $current_page['title']; ?>">
    <meta property="og:description" content="<?php echo $current_page['description']; ?>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://todayeggrates.com/<?php echo $type; ?>-egg-rates">
    <meta property="og:image" content="https://todayeggrates.com/eggpic.png">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo $current_page['title']; ?>">
    <meta name="twitter:description" content="<?php echo $current_page['description']; ?>">
    <meta name="twitter:image" content="https://todayeggrates.com/eggpic.png">
    
    <!-- Schema.org markup -->
    <?php echo $special_rate_schema; ?>
    
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header>
        <div class="container">
            <h1><?php echo $current_page['headline']; ?></h1>
            <h2><?php echo $current_page['subheading']; ?></h2>
            <div class="breadcrumb">
                <a href="/">Home</a> &raquo; <?php echo $current_page['headline']; ?>
            </div>
        </div>
    </header>
    
    <main class="container">
        <section class="intro">
            <div class="egg-rate-card">
                <h2>Average <?php echo ucfirst($type); ?> Egg Rate in India</h2>
                <div class="egg-price">₹<?php echo $avg_rate; ?></div>
                <div class="egg-date"><?php echo $current_page['rate_unit']; ?> as of <?php echo date('d F Y'); ?></div>
            </div>
            
            <p class="intro-text"><?php echo $current_page['intro_text']; ?></p>
            
            <div class="rate-types">
                <a href="/wholesale-egg-rates" class="rate-type-btn <?php echo $type == 'wholesale' ? 'active' : ''; ?>">Wholesale Rates</a>
                <a href="/retail-egg-rates" class="rate-type-btn <?php echo $type == 'retail' ? 'active' : ''; ?>">Retail Rates</a>
                <a href="/farm-egg-rates" class="rate-type-btn <?php echo $type == 'farm' ? 'active' : ''; ?>">Farm Rates</a>
                <a href="/desi-egg-rates" class="rate-type-btn <?php echo $type == 'desi' ? 'active' : ''; ?>">Desi Egg Rates</a>
            </div>
        </section>
        
        <section class="rates-by-state">
            <h2><?php echo ucfirst($type); ?> Egg Rates by State</h2>
            
            <?php if (count($rates_by_state) > 0): ?>
                <?php foreach ($rates_by_state as $state_name => $state_rates): ?>
                    <div class="state-rates">
                        <h3><?php echo $state_name; ?> <?php echo ucfirst($type); ?> Egg Rates</h3>
                        <table class="rate-table">
                            <thead>
                                <tr>
                                    <th>City</th>
                                    <th>Rate (<?php echo $current_page['rate_unit']; ?>)</th>
                                    <th>Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($state_rates as $rate): ?>
                                <tr>
                                    <td>
                                        <a href="/<?php echo strtolower(str_replace(' ', '-', $rate['city_name'])); ?>-egg-rate">
                                            <?php echo $rate['city_name']; ?>
                                        </a>
                                    </td>
                                    <td>₹<?php echo $rate['rate']; ?></td>
                                    <td><?php echo date('d M Y', strtotime($rate['date'])); ?></td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p>No <?php echo $type; ?> egg rates available at the moment. Please check back later.</p>
            <?php endif; ?>
        </section>
        
        <section class="egg-info">
            <h2>About <?php echo ucfirst($type); ?> Egg Rates</h2>
            
            <?php if ($type == 'wholesale'): ?>
                <p>Wholesale egg rates reflect the prices at which eggs are sold in bulk to retailers, distributors, and commercial establishments. These rates are typically determined by several factors:</p>
                <ul>
                    <li>Supply and demand in the local market</li>
                    <li>Production costs, including feed prices</li>
                    <li>Seasonal variations</li>
                    <li>National Egg Coordination Committee (NECC) guidelines</li>
                    <li>Transportation and logistics costs</li>
                </ul>
                <p>Wholesale rates are generally 10-15% lower than retail rates as they don't include retailer margins. These rates are particularly important for businesses that purchase eggs in large quantities, such as bakeries, restaurants, and food manufacturers.</p>
            
            <?php elseif ($type == 'retail'): ?>
                <p>Retail egg rates are the prices that consumers pay when purchasing eggs from local markets, grocery stores, and supermarkets. These rates include:</p>
                <ul>
                    <li>Wholesale cost of eggs</li>
                    <li>Retailer's profit margin</li>
                    <li>Local taxes and overhead costs</li>
                    <li>Packaging and branding premium</li>
                    <li>Store location and market positioning</li>
                </ul>
                <p>Retail egg prices can vary significantly between different stores and areas within the same city. Premium retailers and branded eggs often command higher prices due to perceived quality and packaging differences.</p>
            
            <?php elseif ($type == 'farm'): ?>
                <p>Farm egg rates represent the prices that poultry farmers receive when selling their eggs directly to wholesalers or at the farm gate. These rates are influenced by:</p>
                <ul>
                    <li>Production costs, especially feed prices</li>
                    <li>Farm size and production volume</li>
                    <li>Local competition from other farms</li>
                    <li>Distance from major markets</li>
                    <li>Quality and grading of eggs</li>
                </ul>
                <p>Farm rates are typically the lowest in the supply chain, as they do not include the margins added by wholesalers and retailers. However, some farms that sell directly to consumers can command premium prices, especially if they are known for quality or organic practices.</p>
            
            <?php elseif ($type == 'desi'): ?>
                <p>Desi eggs, also known as country or native eggs, come from indigenous chicken breeds that are often free-range or raised in more natural conditions. Their pricing factors include:</p>
                <ul>
                    <li>Limited supply compared to commercial eggs</li>
                    <li>Higher production costs due to lower yield per bird</li>
                    <li>Perceived nutritional benefits and unique taste</li>
                    <li>Traditional and organic farming premium</li>
                    <li>Regional preferences and cultural significance</li>
                </ul>
                <p>Desi eggs typically cost 30-50% more than regular white eggs due to their perceived health benefits, including higher omega-3 content, deeper yolk color, and more robust flavor. They're particularly popular in rural areas and among health-conscious urban consumers.</p>
            <?php endif; ?>
        </section>
        
        <section class="faq-section">
            <h2>Frequently Asked Questions about <?php echo ucfirst($type); ?> Egg Rates</h2>
            <div class="faq">
                <div class="faq-item">
                    <h3>What is the current average <?php echo $type; ?> egg rate in India?</h3>
                    <div class="faq-answer">
                        <p>The current average <?php echo $type; ?> egg rate in India is ₹<?php echo $avg_rate; ?> <?php echo $current_page['rate_unit']; ?> as of <?php echo date('F j, Y'); ?>. Rates vary by city and state based on local market conditions.</p>
                    </div>
                </div>
                
                <div class="faq-item">
                    <h3>Why do <?php echo $type; ?> egg rates fluctuate?</h3>
                    <div class="faq-answer">
                        <p><?php echo ucfirst($type); ?> egg rates fluctuate due to changes in feed costs, seasonal demand variations, production volumes, and market conditions. Prices typically rise during winter months and festival seasons when demand increases.</p>
                    </div>
                </div>
                
                <div class="faq-item">
                    <h3>How often are the <?php echo $type; ?> egg rates updated?</h3>
                    <div class="faq-answer">
                        <p>The <?php echo $type; ?> egg rates on TodayEggRates.com are updated daily based on data from the National Egg Coordination Committee (NECC) and major poultry markets across India.</p>
                    </div>
                </div>
                
                <?php if ($type == 'wholesale'): ?>
                <div class="faq-item">
                    <h3>What is the minimum quantity for wholesale egg purchases?</h3>
                    <div class="faq-answer">
                        <p>Wholesale egg purchases typically start from 100 eggs (1 crate) and go up to thousands of eggs. Larger quantities often qualify for additional discounts. The rates listed are generally for purchases of 100 eggs or more.</p>
                    </div>
                </div>
                
                <?php elseif ($type == 'retail'): ?>
                <div class="faq-item">
                    <h3>Why are retail egg prices higher than wholesale prices?</h3>
                    <div class="faq-answer">
                        <p>Retail egg prices include the wholesaler's margin, the retailer's profit margin, transportation costs, storage costs, and sometimes packaging expenses. These additional costs typically add 10-15% to the wholesale price.</p>
                    </div>
                </div>
                
                <?php elseif ($type == 'farm'): ?>
                <div class="faq-item">
                    <h3>How can I buy eggs directly from farms?</h3>
                    <div class="faq-answer">
                        <p>To buy eggs directly from farms, you can visit local poultry farms, check farmers' markets, or contact farm cooperatives in your area. Some farms also offer delivery services for bulk orders. Direct purchases often result in fresher eggs at better prices.</p>
                    </div>
                </div>
                
                <?php elseif ($type == 'desi'): ?>
                <div class="faq-item">
                    <h3>What's the difference between desi eggs and regular eggs?</h3>
                    <div class="faq-answer">
                        <p>Desi eggs come from indigenous chicken breeds that are often free-range or raised in more natural conditions. They typically have a deeper yellow/orange yolk, stronger shell, and are believed to contain higher levels of omega-3 fatty acids and vitamins compared to regular white eggs from commercial layer hens.</p>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </section>
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