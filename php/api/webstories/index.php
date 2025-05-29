<?php
require_once __DIR__ . '/../core/BaseAPI.php';

class WebStoryManager extends BaseAPI {
    private $templatePath;
    private $webStoriesPath;
    private $webStoriesImagePath;

    public function __construct() {
        parent::__construct();
        $serverRoot = dirname(dirname(dirname(__DIR__))); // Go up to the public folder
        $this->templatePath = $serverRoot . '/templates/webstory_template.html';
        $this->webStoriesPath = $serverRoot . '/webstories/';
        $this->webStoriesImagePath = $serverRoot . '/images/webstories/';

        // Create required directories if they don't exist
        foreach ([$this->webStoriesPath, $this->webStoriesImagePath] as $dir) {
            if (!file_exists($dir)) {
                mkdir($dir, 0777, true);
            }
            if (!is_writable($dir)) {
                chmod($dir, 0777);
            }
        }
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';

        try {
            switch ($method) {
                case 'GET':
                    switch ($action) {
                        case 'list':
                            $this->listWebStories();
                            break;
                        case 'generate':
                            $this->generateWebStories();
                            break;
                        case 'update-thumbnails':
                            $this->updateThumbnails();
                            break;
                        case 'cleanup':
                            $this->deleteOldWebStories();
                            break;
                        case 'sitemap':
                            $this->generateSitemap();
                            break;
                        default:
                            $this->sendError('Invalid action');
                    }
                    break;
                default:
                    $this->sendError('Method not allowed', 405);
            }
        } catch (Exception $e) {
            $this->sendError($e->getMessage());
        }
    }

    private function listWebStories() {
        $cacheKey = $this->getCacheKey('web_stories_list');
        if ($cached = $this->cache->get($cacheKey)) {
            $this->sendResponse($cached);
        }

        // Try normalized tables first
        try {
            $query = "SELECT c.name as city, s.name as state, r.rate, r.date
                     FROM egg_rates_normalized r
                     JOIN cities c ON r.city_id = c.id
                     JOIN states s ON c.state_id = s.id
                     WHERE r.date = (SELECT MAX(date) FROM egg_rates_normalized)";
            $stmt = $this->db->query($query);
            $stories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            // Fallback to original tables
            $query = "SELECT l.city, l.state, r.rate, r.date 
                     FROM rates r 
                     JOIN locations l ON r.location_id = l.id 
                     WHERE r.date = (SELECT MAX(date) FROM rates)";
            $stmt = $this->db->query($query);
            $stories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        foreach ($stories as &$story) {
            $story['slug'] = $this->generateSlug($story['city'], $story['state']);
            $story['thumbnail'] = $this->getWebStoryThumbnailUrl($story['slug']);
        }

        $this->cache->set($cacheKey, $stories, 1800);
        $this->sendResponse($stories);
    }

    private function generateWebStories() {
        $template = @file_get_contents($this->templatePath);
        if (!$template) {
            throw new Exception('Web story template not found at ' . $this->templatePath);
        }

        // Try normalized tables first
        try {
            $query = "SELECT c.name as city, s.name as state, r.rate, r.date
                     FROM egg_rates_normalized r
                     JOIN cities c ON r.city_id = c.id
                     JOIN states s ON c.state_id = s.id
                     WHERE r.date = (SELECT MAX(date) FROM egg_rates_normalized)";
            $stmt = $this->db->query($query);
            $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            // Fallback to original tables
            $query = "SELECT l.city, l.state, r.rate, r.date 
                     FROM rates r 
                     JOIN locations l ON r.location_id = l.id 
                     WHERE r.date = (SELECT MAX(date) FROM rates)";
            $stmt = $this->db->query($query);
            $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        foreach ($rates as $rate) {
            $slug = $this->generateSlug($rate['city'], $rate['state']);
            $content = $this->generateWebStoryContent($template, $rate);
            file_put_contents($this->webStoriesPath . $slug . '.html', $content);
            $this->generateThumbnail($slug);
        }

        $this->createIndex($rates);
        $this->cache->invalidateAll();
        $this->sendResponse(['success' => true, 'count' => count($rates)]);
    }

    private function updateThumbnails() {
        $stories = glob($this->webStoriesPath . '*.html');
        foreach ($stories as $story) {
            $slug = basename($story, '.html');
            $this->generateThumbnail($slug);
        }

        $this->cache->invalidateAll();
        $this->sendResponse(['success' => true, 'count' => count($stories)]);
    }

    private function deleteOldWebStories() {
        $maxAge = 10; // days
        $cutoffDate = date('Y-m-d', strtotime("-{$maxAge} days"));

        // Try normalized tables first
        try {
            $query = "SELECT c.name as city, s.name as state
                     FROM egg_rates_normalized r
                     JOIN cities c ON r.city_id = c.id
                     JOIN states s ON c.state_id = s.id
                     GROUP BY c.id, s.id
                     HAVING MAX(r.date) < ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$cutoffDate]);
            $oldStories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            // Fallback to original tables
            $query = "SELECT l.city, l.state 
                     FROM rates r 
                     JOIN locations l ON r.location_id = l.id 
                     GROUP BY l.id 
                     HAVING MAX(r.date) < ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$cutoffDate]);
            $oldStories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $count = 0;
        foreach ($oldStories as $story) {
            $slug = $this->generateSlug($story['city'], $story['state']);
            $filePath = $this->webStoriesPath . $slug . '.html';
            if (file_exists($filePath)) {
                unlink($filePath);
                $this->deleteThumbnail($slug);
                $count++;
            }
        }

        $this->cache->invalidateAll();
        $this->sendResponse(['success' => true, 'deleted' => $count]);
    }

    private function generateSitemap() {
        $baseUrl = 'https://' . $_SERVER['HTTP_HOST'] . '/webstories/';
        $stories = glob($this->webStoriesPath . '*.html');
        
        $xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
        
        foreach ($stories as $story) {
            $slug = basename($story, '.html');
            $url = $xml->addChild('url');
            $url->addChild('loc', $baseUrl . $slug);
            $url->addChild('lastmod', date('Y-m-d'));
            $url->addChild('changefreq', 'daily');
            $url->addChild('priority', '0.8');
        }

        $sitemapPath = dirname($this->webStoriesPath) . '/webstories-sitemap.xml';
        $xml->asXML($sitemapPath);

        $this->sendResponse(['success' => true, 'count' => count($stories)]);
    }

    private function generateSlug($city, $state) {
        return strtolower(preg_replace('/[^a-z0-9]+/', '-', $city)) . '-egg-rate';
    }

    private function generateWebStoryContent($template, $data) {
        return strtr($template, [
            '{{CITY}}' => $data['city'],
            '{{STATE}}' => $data['state'],
            '{{RATE}}' => number_format($data['rate'], 2),
            '{{DATE}}' => date('F j, Y', strtotime($data['date'])),
            '{{THUMBNAIL}}' => $this->getWebStoryThumbnailUrl($this->generateSlug($data['city'], $data['state']))
        ]);
    }

    private function generateThumbnail($slug) {
        // Make sure the optimized images directory exists
        $optimizedDir = $this->webStoriesImagePath . 'optimized/';
        if (!file_exists($optimizedDir)) {
            mkdir($optimizedDir, 0777, true);
        }

        $sizes = [300, 600];
        foreach ($sizes as $size) {
            $targetPath = $optimizedDir . "{$slug}-{$size}.webp";
            
            // Create a blank image
            $im = imagecreatetruecolor($size, $size);
            
            // Set background color
            $bg = imagecolorallocate($im, 255, 255, 255);
            imagefill($im, 0, 0, $bg);

            // Add text
            $textColor = imagecolorallocate($im, 0, 0, 0);
            $text = str_replace('-egg-rate', '', $slug);
            $text = ucwords(str_replace('-', ' ', $text));
            
            // Calculate text size and position
            $fontSize = $size / 10;
            $textBox = imagettfbbox($fontSize, 0, 'Arial', $text);
            $textWidth = abs($textBox[4] - $textBox[0]);
            $textHeight = abs($textBox[5] - $textBox[1]);
            $x = ($size - $textWidth) / 2;
            $y = ($size + $textHeight) / 2;
            
            imagettftext($im, $fontSize, 0, $x, $y, $textColor, 'Arial', $text);
            
            // Save the image
            imagewebp($im, $targetPath);
            imagedestroy($im);
        }
    }

    private function deleteThumbnail($slug) {
        $sizes = [300, 600];
        foreach ($sizes as $size) {
            $path = $this->webStoriesImagePath . "optimized/{$slug}-{$size}.webp";
            if (file_exists($path)) {
                unlink($path);
            }
        }
    }

    private function getWebStoryThumbnailUrl($slug) {
        return "/images/webstories/optimized/{$slug}-600.webp";
    }

    private function createIndex($rates) {
        $html = "<!DOCTYPE html><html><head>";
        $html .= "<title>Egg Rate Web Stories</title>";
        $html .= "<meta name='viewport' content='width=device-width, initial-scale=1'>";
        $html .= "<style>";
        $html .= "body { font-family: Arial, sans-serif; margin: 20px; }";
        $html .= "h1 { text-align: center; color: #333; }";
        $html .= ".stories { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }";
        $html .= ".story { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }";
        $html .= ".story img { width: 100%; height: auto; border-radius: 4px; }";
        $html .= ".story h2 { margin: 10px 0; font-size: 1.2em; }";
        $html .= ".story p { color: #666; margin: 5px 0; }";
        $html .= "</style></head><body>";
        
        $html .= "<h1>Egg Rate Web Stories</h1><div class='stories'>";
        
        foreach ($rates as $rate) {
            $slug = $this->generateSlug($rate['city'], $rate['state']);
            $html .= "<div class='story'>";
            $html .= "<a href='{$slug}.html'>";
            $html .= "<img src='" . $this->getWebStoryThumbnailUrl($slug) . "' alt='{$rate['city']} Egg Rate'>";
            $html .= "<h2>{$rate['city']}, {$rate['state']}</h2>";
            $html .= "<p>Rate: ₹" . number_format($rate['rate'], 2) . "</p>";
            $html .= "<p>Updated: " . date('F j, Y', strtotime($rate['date'])) . "</p>";
            $html .= "</a></div>";
        }
        
        $html .= "</div></body></html>";
        
        file_put_contents($this->webStoriesPath . 'index.html', $html);
    }
}

// Initialize and handle request
$manager = new WebStoryManager();
$manager->handleRequest();
