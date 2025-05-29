<?php
class CacheService {
    private $cacheDir;
    private $cacheTime = 86400; // 24 hours in seconds

    public function __construct() {
        $this->cacheDir = dirname(dirname(dirname(__FILE__))) . '/cache/';
        if (!file_exists($this->cacheDir)) {
            mkdir($this->cacheDir, 0777, true);
        }
    }

    public function getCacheKey($key) {
        return $this->cacheDir . md5($key) . '.json';
    }

    public function get($key) {
        $cacheFile = $this->getCacheKey($key);
        
        if (file_exists($cacheFile)) {
            $content = file_get_contents($cacheFile);
            $cache = json_decode($content, true);
            
            // Check if cache is still valid
            if (time() - $cache['timestamp'] < $this->cacheTime) {
                return $cache['data'];
            }
        }
        return null;
    }

    public function set($key, $data) {
        $cacheFile = $this->getCacheKey($key);
        $cache = [
            'timestamp' => time(),
            'data' => $data
        ];
        
        file_put_contents($cacheFile, json_encode($cache));
    }

    public function clear($key = null) {
        if ($key) {
            $cacheFile = $this->getCacheKey($key);
            if (file_exists($cacheFile)) {
                unlink($cacheFile);
            }
        } else {
            // Clear all cache files
            array_map('unlink', glob($this->cacheDir . '*.json'));
        }
    }

    public function isExpired($key) {
        $cacheFile = $this->getCacheKey($key);
        
        if (file_exists($cacheFile)) {
            $content = file_get_contents($cacheFile);
            $cache = json_decode($content, true);
            return (time() - $cache['timestamp'] >= $this->cacheTime);
        }
        return true;
    }
}
?>
