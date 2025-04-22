<?php
// Include necessary files
require_once 'db.php';
require_once 'schema_markup.php';

// Get blog post slug from URL
$blog_slug = isset($_GET['slug']) ? $_GET['slug'] : '';

// Get blog post data
$query = "SELECT * FROM blog_posts WHERE slug = :slug LIMIT 1";
$stmt = $pdo->prepare($query);
$stmt->execute(['slug' => $blog_slug]);
$post = $stmt->fetch(PDO::FETCH_ASSOC);

// If no post found, redirect to blog index
if (!$post) {
    header("Location: /blog");
    exit;
}

// Get related blog posts
$related_query = "SELECT id, title, slug, excerpt, featured_image, published_at 
                 FROM blog_posts 
                 WHERE id != :id AND status = 'published'
                 ORDER BY published_at DESC 
                 LIMIT 3";
$related_stmt = $pdo->prepare($related_query);
$related_stmt->execute(['id' => $post['id']]);
$related_posts = $related_stmt->fetchAll(PDO::FETCH_ASSOC);

// Format date
$date_formatted = date('F j, Y', strtotime($post['published_at']));

// Generate FAQs from post content if available
$faqs = [];
if ($post['faqs']) {
    $faqs = json_decode($post['faqs'], true);
}

// Generate schema markup
$schema_data = [
    'title' => $post['title'],
    'description' => $post['excerpt'],
    'image' => $post['featured_image'],
    'date_published' => $post['published_at'],
    'date_modified' => $post['updated_at'],
    'author' => $post['author_name'],
    'faqs' => $faqs
];
$blog_schema = generate_blog_schema($schema_data);

// Begin HTML output
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $post['title']; ?> | Today Egg Rates</title>
    <meta name="description" content="<?php echo $post['excerpt']; ?>">
    <meta name="keywords" content="<?php echo $post['meta_keywords']; ?>">
    <link rel="canonical" href="https://todayeggrates.com/blog/<?php echo $post['slug']; ?>">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="<?php echo $post['title']; ?>">
    <meta property="og:description" content="<?php echo $post['excerpt']; ?>">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://todayeggrates.com/blog/<?php echo $post['slug']; ?>">
    <meta property="og:image" content="https://todayeggrates.com<?php echo $post['featured_image']; ?>">
    <meta property="og:site_name" content="Today Egg Rates">
    <meta property="article:published_time" content="<?php echo $post['published_at']; ?>">
    <meta property="article:modified_time" content="<?php echo $post['updated_at']; ?>">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo $post['title']; ?>">
    <meta name="twitter:description" content="<?php echo $post['excerpt']; ?>">
    <meta name="twitter:image" content="https://todayeggrates.com<?php echo $post['featured_image']; ?>">
    
    <!-- Schema.org markup -->
    <?php echo $blog_schema; ?>
    
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header>
        <div class="container">
            <h1><?php echo $post['title']; ?></h1>
            <div class="breadcrumb">
                <a href="/">Home</a> &raquo; <a href="/blog">Blog</a> &raquo; <?php echo $post['title']; ?>
            </div>
        </div>
    </header>
    
    <main class="container blog-post">
        <article>
            <div class="post-meta">
                <span class="post-date">Published: <?php echo $date_formatted; ?></span>
                <?php if (!empty($post['author_name'])): ?>
                <span class="post-author">By: <?php echo $post['author_name']; ?></span>
                <?php endif; ?>
            </div>
            
            <?php if (!empty($post['featured_image'])): ?>
            <div class="featured-image">
                <img src="<?php echo $post['featured_image']; ?>" alt="<?php echo $post['title']; ?>">
            </div>
            <?php endif; ?>
            
            <div class="post-content">
                <?php echo $post['content']; ?>
            </div>
            
            <?php if (count($faqs) > 0): ?>
            <section class="faq-section">
                <h2>Frequently Asked Questions</h2>
                <div class="faq">
                    <?php foreach ($faqs as $faq): ?>
                    <div class="faq-item">
                        <h3><?php echo $faq['question']; ?></h3>
                        <div class="faq-answer"><?php echo $faq['answer']; ?></div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </section>
            <?php endif; ?>
            
            <?php if (!empty($post['tags'])): ?>
            <div class="post-tags">
                <h3>Tags</h3>
                <?php
                $tags = explode(',', $post['tags']);
                foreach ($tags as $tag):
                    $tag = trim($tag);
                    if (!empty($tag)):
                ?>
                <a href="/blog/tag/<?php echo urlencode(strtolower($tag)); ?>" class="tag"><?php echo $tag; ?></a>
                <?php endif; endforeach; ?>
            </div>
            <?php endif; ?>
        </article>
        
        <?php if (count($related_posts) > 0): ?>
        <section class="related-posts">
            <h2>Related Articles</h2>
            <div class="post-grid">
                <?php foreach ($related_posts as $related): ?>
                <div class="post-card">
                    <a href="/blog/<?php echo $related['slug']; ?>">
                        <?php if (!empty($related['featured_image'])): ?>
                        <div class="post-image">
                            <img src="<?php echo $related['featured_image']; ?>" alt="<?php echo $related['title']; ?>">
                        </div>
                        <?php endif; ?>
                        <div class="post-details">
                            <h3><?php echo $related['title']; ?></h3>
                            <p class="post-excerpt"><?php echo substr($related['excerpt'], 0, 120); ?>...</p>
                            <p class="post-date"><?php echo date('M j, Y', strtotime($related['published_at'])); ?></p>
                        </div>
                    </a>
                </div>
                <?php endforeach; ?>
            </div>
        </section>
        <?php endif; ?>
        
        <div class="cta-box">
            <h3>Check Today's Egg Rates</h3>
            <p>Get the latest egg prices for cities across India. Updated daily!</p>
            <a href="/" class="btn">View Egg Rates</a>
        </div>
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