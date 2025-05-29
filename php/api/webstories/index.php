<?php
require_once __DIR__ . '/../core/BaseAPI.php';

class WebStoryManager extends BaseAPI {
    private $templatePath;
    private $webStoriesPath;
    private $webStoriesImagePath;

    public function __construct() {
        parent::__construct();
        $this->templatePath = __DIR__ . '/../../templates/webstory_template.html';
        $this->webStoriesPath = __DIR__ . '/../../webstories/';
        $this->webStoriesImagePath = __DIR__ . '/../../images/webstories/';
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

        $query = "SELECT l.city, l.state, r.rate, r.date 
                 FROM rates r 
                 JOIN locations l ON r.location_id = l.id 
                 WHERE r.date = (SELECT MAX(date) FROM rates)";
        
        $stmt = $this->db->query($query);
        $stories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($stories as &$story) {
            $story['slug'] = $this->generateSlug($story['city'], $story['state']);
            $story['thumbnail'] = $this->getWebStoryThumbnailUrl($story['slug']);
        }

        $this->cache->set($cacheKey, $stories, 1800);
        $this->sendResponse($stories);
    }

    private function generateWebStories() {
        $template = file_get_contents($this->templatePath);
        if (!$template) {
            throw new Exception('Web story template not found');
        }

        $query = "SELECT l.city, l.state, r.rate, r.date 
                 FROM rates r 
                 JOIN locations l ON r.location_id = l.id 
                 WHERE r.date = (SELECT MAX(date) FROM rates)";
        
        $stmt = $this->db->query($query);
        $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rates as $rate) {
            $slug = $this->generateSlug($rate['city'], $rate['state']);
            $content = $this->generateWebStoryContent($template, $rate);
            file_put_contents($this->webStoriesPath . $slug . '.html', $content);
        }

        $this->cache->clear();
        $this->sendResponse(['success' => true, 'count' => count($rates)]);
    }

    private function updateThumbnails() {
        $stories = glob($this->webStoriesPath . '*.html');
        foreach ($stories as $story) {
            $slug = basename($story, '.html');
            $this->generateThumbnail($slug);
        }

        $this->cache->clear();
        $this->sendResponse(['success' => true, 'count' => count($stories)]);
    }

    private function deleteOldWebStories() {
        $maxAge = 10; // days
        $cutoffDate = date('Y-m-d', strtotime("-{$maxAge} days"));

        $query = "SELECT l.city, l.state 
                 FROM rates r 
                 JOIN locations l ON r.location_id = l.id 
                 GROUP BY l.id 
                 HAVING MAX(r.date) < ?";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cutoffDate]);
        $oldStories = $stmt->fetchAll(PDO::FETCH_ASSOC);

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

        $this->cache->clear();
        $this->sendResponse(['success' => true, 'deleted' => $count]);
    }

    private function generateSitemap() {
        $stories = glob($this->webStoriesPath . '*.html');
        $baseUrl = 'https://' . $_SERVER['HTTP_HOST'] . '/webstories/';
        
        $xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
        
        foreach ($stories as $story) {
            $slug = basename($story, '.html');
            $url = $xml->addChild('url');
            $url->addChild('loc', $baseUrl . $slug);
            $url->addChild('lastmod', date('Y-m-d'));
            $url->addChild('changefreq', 'daily');
            $url->addChild('priority', '0.8');
        }

        $sitemapPath = __DIR__ . '/../../webstories-sitemap.xml';
        $xml->asXML($sitemapPath);

        $this->sendResponse(['success' => true, 'count' => count($stories)]);
    }

    private function generateSlug($city, $state) {
        return strtolower(preg_replace('/[^a-z0-9]+/', '-', $city . '-' . $state));
    }

    private function generateWebStoryContent($template, $data) {
        // Replace placeholders in template with actual data
        return strtr($template, [
            '{{CITY}}' => $data['city'],
            '{{STATE}}' => $data['state'],
            '{{RATE}}' => number_format($data['rate'], 2),
            '{{DATE}}' => date('F j, Y', strtotime($data['date'])),
            '{{THUMBNAIL}}' => $this->getWebStoryThumbnailUrl($this->generateSlug($data['city'], $data['state']))
        ]);
    }

    private function generateThumbnail($slug) {
        // Implementation of thumbnail generation using GD or ImageMagick
        // This would create thumbnails in different sizes (300x, 600x)
        // Example implementation not shown for brevity
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
}

// Initialize and handle request
$manager = new WebStoryManager();
$manager->handleRequest();
