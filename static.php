<?php
// Force output buffering off to prevent any unwanted output
while (ob_get_level()) ob_end_clean();

// Set proper MIME types for static files
$file = $_SERVER['REQUEST_URI'];
$ext = pathinfo($file, PATHINFO_EXTENSION);

// Define MIME types
$mime_types = [
    'css' => 'text/css',
    'js' => 'application/javascript',
    'webp' => 'image/webp',
    'ico' => 'image/x-icon',
    'json' => 'application/json',
    'webmanifest' => 'application/manifest+json'
];

// If the file extension is in our MIME types array, set the correct header
if (isset($mime_types[$ext])) {
    header("Content-Type: " . $mime_types[$ext]);
}

// Get the file path relative to this script
$file_path = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Clean the path to prevent directory traversal
$real_file_path = realpath($file_path);
$real_base_path = realpath(__DIR__);

// Security check - ensure the file is within the allowed directory
if ($real_file_path === false || strpos($real_file_path, $real_base_path) !== 0) {
    header("HTTP/1.1 403 Forbidden");
    exit("403 Forbidden");
}

// If file exists, serve it
if (file_exists($real_file_path)) {
    // Enable caching
    $etag = md5_file($real_file_path);
    header("ETag: \"$etag\"");
    header('Cache-Control: public, max-age=31536000');
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
    
    // Check if browser cache is still valid
    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) == "\"$etag\"") {
        header("HTTP/1.1 304 Not Modified");
        exit;
    }
    
    // For CSS files, ensure proper MIME type and UTF-8 encoding
    if ($ext === 'css') {
        header('Content-Type: text/css; charset=utf-8');
    }
    
    readfile($real_file_path);
    exit;
}

// If file doesn't exist, return 404
header("HTTP/1.1 404 Not Found");
exit("404 Not Found");