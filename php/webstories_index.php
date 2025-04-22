<?php
// Include necessary files
require_once 'db.php';
require_once 'schema_markup.php';

// Get web stories
$query = "SELECT * FROM webstories WHERE status = 'published' ORDER BY created_at DESC";
$stmt = $pdo->prepare($query);
$stmt->execute();
$webstories = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Fallback if database query fails
if (empty($webstories)) {
    $webstories_dir = '../webstories/';
    $manual_webstories = [];
    
    if (file_exists($webstories_dir) && is_dir($webstories_dir)) {
        $files = scandir($webstories_dir);
        foreach ($files as $file) {
            if ($file != '.' && $file != '..' && pathinfo($file, PATHINFO_EXTENSION) == 'html') {
                $slug = pathinfo($file, PATHINFO_FILENAME);
                // Extract city name from slug (assuming format: city-egg-rate)
                $city_parts = explode('-egg-rate', $slug);
                $city_name = !empty($city_parts[0]) ? ucwords(str_replace('-', ' ', $city_parts[0])) : '';
                
                $manual_webstories[] = [
                    'slug' => $slug,
                    'title' => $city_name . ' Egg Rate Today',
                    'description' => 'Check the latest egg rate in ' . $city_name . '. Updated daily egg prices.',
                    'thumbnail' => '/images/webstories/thumbnails/' . $slug . '.jpg',
                    'created_at' => date('Y-m-d H:i:s', filemtime($webstories_dir . $file))
                ];
            }
        }
    }
    
    // Sort by creation date (newest first)
    usort($manual_webstories, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    $webstories = $manual_webstories;
}

// Page title and metadata
$title = 'Egg Rate Web Stories - Visual Updates on Today\'s Egg Prices Across India';
$description = 'Explore our visual web stories about egg rates across India. Get the latest egg prices for major cities in a visually engaging format. Updated daily with city-specific rates.';

// Begin HTML output
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $title; ?></title>
    <meta name="description" content="<?php echo $description; ?>">
    <meta name="keywords" content="egg rate web stories, egg price visual stories, city egg rates, visual egg price updates, egg rate today, egg price today">
    <link rel="canonical" href="https://todayeggrates.com/webstories/">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="<?php echo $title; ?>">
    <meta property="og:description" content="<?php echo $description; ?>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://todayeggrates.com/webstories/">
    <meta property="og:image" content="https://todayeggrates.com/eggpic.png">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo $title; ?>">
    <meta name="twitter:description" content="<?php echo $description; ?>">
    <meta name="twitter:image" content="https://todayeggrates.com/eggpic.png">
    
    <!-- Schema.org markup for Google -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "<?php echo $title; ?>",
      "description": "<?php echo $description; ?>",
      "url": "https://todayeggrates.com/webstories/",
      "hasPart": [
        <?php
        $parts = [];
        foreach ($webstories as $index => $story) {
            $parts[] = '{
              "@type": "WebPage",
              "headline": "' . htmlspecialchars($story['title'], ENT_QUOTES, 'UTF-8') . '",
              "url": "https://todayeggrates.com/webstories/' . $story['slug'] . '.html",
              "datePublished": "' . date('c', strtotime($story['created_at'])) . '"
            }';
        }
        echo implode(',', $parts);
        ?>
      ],
      "provider": {
        "@type": "Organization",
        "name": "Today Egg Rates",
        "url": "https://todayeggrates.com"
      }
    }
    </script>
    
    <link rel="stylesheet" href="/css/style.css">
    <style>
        .webstories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .story-card {
            background: #fff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .story-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }
        
        .story-thumbnail {
            position: relative;
            height: 200px;
            overflow: hidden;
            background: #f5f5f5;
        }
        
        .story-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .story-card:hover .story-thumbnail img {
            transform: scale(1.05);
        }
        
        .story-info {
            padding: 15px;
        }
        
        .story-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px;
            color: #333;
        }
        
        .story-description {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
            line-height: 1.4;
        }
        
        .story-date {
            font-size: 12px;
            color: #999;
            margin: 0;
        }
        
        .story-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 87, 34, 0.85);
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .intro-text {
            margin-bottom: 30px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Egg Rate Web Stories</h1>
            <h2>Visual Updates on Today's Egg Prices</h2>
            <div class="breadcrumb">
                <a href="/">Home</a> &raquo; Web Stories
            </div>
        </div>
    </header>
    
    <main class="container">
        <section class="intro">
            <div class="intro-text">
                <p>Explore our visual web stories to get the latest egg prices from major cities across India. These interactive visual stories provide a quick and engaging way to check today's egg rates. Tap on any story to view full-screen egg rate updates.</p>
                <p>All stories are updated daily with the most recent egg prices from wholesale markets and the National Egg Coordination Committee (NECC).</p>
            </div>
        </section>
        
        <section class="webstories-section">
            <h2>Latest Egg Rate Web Stories</h2>
            
            <?php if (count($webstories) > 0): ?>
            <div class="webstories-grid">
                <?php foreach ($webstories as $story): ?>
                <a href="/webstories/<?php echo $story['slug']; ?>.html" class="story-card">
                    <div class="story-thumbnail">
                        <img src="<?php echo !empty($story['thumbnail']) ? $story['thumbnail'] : '/eggpic.png'; ?>" alt="<?php echo htmlspecialchars($story['title'], ENT_QUOTES, 'UTF-8'); ?>">
                        <span class="story-badge">Web Story</span>
                    </div>
                    <div class="story-info">
                        <h3 class="story-title"><?php echo htmlspecialchars($story['title'], ENT_QUOTES, 'UTF-8'); ?></h3>
                        <p class="story-description"><?php echo htmlspecialchars($story['description'], ENT_QUOTES, 'UTF-8'); ?></p>
                        <p class="story-date">Published: <?php echo date('d M Y', strtotime($story['created_at'])); ?></p>
                    </div>
                </a>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <p>No web stories available at the moment. Please check back later.</p>
            <?php endif; ?>
        </section>
        
        <section class="webstories-info">
            <h2>What Are Web Stories?</h2>
            <p>Web Stories are a visual storytelling format built on open web technologies. They bring your content to life in a fast-loading, full-screen experience that's optimized for mobile viewing. Our egg rate web stories provide quick, engaging visual updates about egg prices across different cities in India.</p>
            
            <h3>Benefits of Web Stories</h3>
            <ul>
                <li>Quick visual access to today's egg rates</li>
                <li>Full-screen immersive experience</li>
                <li>Easy to share on social media</li>
                <li>Optimized for mobile devices</li>
                <li>Fast-loading content that works on any browser</li>
            </ul>
            
            <p>Our web stories are updated daily to provide the most current egg prices. You can also view detailed egg rate information on our <a href="/">main site</a>.</p>
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