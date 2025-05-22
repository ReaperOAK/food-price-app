<?php
class CacheManager {
    private $cacheDir;
    private $defaultTTL = 86400; // 24 hours in seconds

    public function __construct($cacheDir = null) {
        $this->cacheDir = $cacheDir ?? dirname(__DIR__) . '/cache';
        if (!file_exists($this->cacheDir)) {
            mkdir($this->cacheDir, 0777, true);
        }
    }

    public function getCacheKey($params) {
        return md5(json_encode($params));
    }

    public function get($key) {
        $cacheFile = $this->cacheDir . '/' . $key . '.json';
        
        if (!file_exists($cacheFile)) {
            return null;
        }

        $cacheContent = file_get_contents($cacheFile);
        $cache = json_decode($cacheContent, true);

        if (!$cache || !isset($cache['expires']) || !isset($cache['data'])) {
            return null;
        }

        // Check if cache has expired
        if (time() > $cache['expires']) {
            // Delete expired cache file
            unlink($cacheFile);
            return null;
        }

        return $cache['data'];
    }

    public function set($key, $data, $ttl = null) {
        $cacheFile = $this->cacheDir . '/' . $key . '.json';
        
        $cache = [
            'expires' => time() + ($ttl ?? $this->defaultTTL),
            'data' => $data
        ];

        return file_put_contents($cacheFile, json_encode($cache), LOCK_EX);
    }

    public function invalidate($key) {
        $cacheFile = $this->cacheDir . '/' . $key . '.json';
        if (file_exists($cacheFile)) {
            return unlink($cacheFile);
        }
        return true;
    }

    public function invalidateAll() {
        $files = glob($this->cacheDir . '/*.json');
        foreach ($files as $file) {
            unlink($file);
        }
        return true;
    }
}
?>
