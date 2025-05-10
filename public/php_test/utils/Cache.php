<?php
/**
 * Cache Class
 * 
 * This class provides caching functionality for API responses and queries
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/Logger.php';
require_once __DIR__ . '/FileSystem.php';

class Cache {
    // Cache storage location
    private static $cacheDir;
    
    // Cache enabled flag
    private static $enabled;
    
    // Default expiry time in seconds
    private static $defaultExpiry;
    
    /**
     * Initialize cache settings
     * 
     * @return void
     */
    public static function init() {
        self::$cacheDir = BASE_PATH . '/cache';
        self::$enabled = defined('ENABLE_CACHE') ? ENABLE_CACHE : false;
        self::$defaultExpiry = defined('CACHE_EXPIRY') ? CACHE_EXPIRY : 3600; // 1 hour default
        
        if (self::$enabled) {
            FileSystem::ensureDirectoryExists(self::$cacheDir);
        }
    }
    
    /**
     * Get a cached item
     * 
     * @param string $key Cache key
     * @return mixed|false The cached data or false if not found or expired
     */
    public static function get($key) {
        if (!self::$enabled) {
            return false;
        }
        
        $cacheFile = self::getCacheFilePath($key);
        
        if (!file_exists($cacheFile)) {
            return false;
        }
        
        $content = FileSystem::readFile($cacheFile);
        
        if (empty($content)) {
            return false;
        }
        
        $cacheData = unserialize($content);
        
        if (!is_array($cacheData) || !isset($cacheData['expires']) || !isset($cacheData['data'])) {
            return false;
        }
        
        // Check expiration
        if ($cacheData['expires'] < time()) {
            self::delete($key);
            return false;
        }
        
        return $cacheData['data'];
    }
    
    /**
     * Store an item in the cache
     * 
     * @param string $key Cache key
     * @param mixed $data Data to cache
     * @param int $expiry Expiry time in seconds (0 = never expire)
     * @return bool Success status
     */
    public static function set($key, $data, $expiry = null) {
        if (!self::$enabled) {
            return false;
        }
        
        if ($expiry === null) {
            $expiry = self::$defaultExpiry;
        }
        
        $cacheData = [
            'expires' => $expiry > 0 ? time() + $expiry : 0,
            'data' => $data
        ];
        
        $content = serialize($cacheData);
        $cacheFile = self::getCacheFilePath($key);
        
        return FileSystem::writeFile($cacheFile, $content, true);
    }
    
    /**
     * Delete a cached item
     * 
     * @param string $key Cache key
     * @return bool Success status
     */
    public static function delete($key) {
        if (!self::$enabled) {
            return false;
        }
        
        $cacheFile = self::getCacheFilePath($key);
        
        if (!file_exists($cacheFile)) {
            return true;
        }
        
        return FileSystem::deleteFile($cacheFile);
    }
    
    /**
     * Check if a cache key exists and is valid
     * 
     * @param string $key Cache key
     * @return bool True if cache exists and is valid
     */
    public static function has($key) {
        if (!self::$enabled) {
            return false;
        }
        
        $cacheFile = self::getCacheFilePath($key);
        
        if (!file_exists($cacheFile)) {
            return false;
        }
        
        $content = FileSystem::readFile($cacheFile);
        
        if (empty($content)) {
            return false;
        }
        
        $cacheData = unserialize($content);
        
        if (!is_array($cacheData) || !isset($cacheData['expires']) || !isset($cacheData['data'])) {
            return false;
        }
        
        // Check expiration (0 = never expire)
        if ($cacheData['expires'] > 0 && $cacheData['expires'] < time()) {
            self::delete($key);
            return false;
        }
        
        return true;
    }
    
    /**
     * Clear all cached items
     * 
     * @return bool Success status
     */
    public static function clear() {
        if (!self::$enabled) {
            return false;
        }
        
        $files = FileSystem::listFiles(self::$cacheDir, '*.cache');
        
        if (!$files) {
            return true;
        }
        
        $result = true;
        
        foreach ($files as $file) {
            if (!FileSystem::deleteFile($file)) {
                $result = false;
            }
        }
        
        return $result;
    }
    
    /**
     * Get or compute a cached value
     * 
     * @param string $key Cache key
     * @param callable $callback Function to generate value if not cached
     * @param int $expiry Expiry time in seconds
     * @return mixed The cached or computed value
     */
    public static function remember($key, $callback, $expiry = null) {
        if (!self::$enabled) {
            return call_user_func($callback);
        }
        
        $cached = self::get($key);
        
        if ($cached !== false) {
            return $cached;
        }
        
        $fresh = call_user_func($callback);
        
        self::set($key, $fresh, $expiry);
        
        return $fresh;
    }
    
    /**
     * Generate a cache file path from a key
     * 
     * @param string $key Cache key
     * @return string Cache file path
     */
    private static function getCacheFilePath($key) {
        $safeKey = preg_replace('/[^a-zA-Z0-9_-]/', '_', $key);
        $hash = md5($key);
        return self::$cacheDir . '/' . $safeKey . '_' . $hash . '.cache';
    }
}

// Initialize cache
Cache::init();
