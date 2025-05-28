<?php
// Force output buffering off
while (ob_get_level()) ob_end_clean();

// Get file info
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$ext = strtolower(pathinfo($request_path, PATHINFO_EXTENSION));

// Define MIME types
$mime_types = [
    'css' => 'text/css; charset=utf-8',
    'js' => 'application/javascript; charset=utf-8',
    'webp' => 'image/webp',
    'ico' => 'image/x-icon',
    'json' => 'application/json; charset=utf-8',
    'webmanifest' => 'application/manifest+json; charset=utf-8'
];

// Set content type header
if (isset($mime_types[$ext])) {
    header('Content-Type: ' . $mime_types[$ext]);
}

// Get file path and validate
$file_path = __DIR__ . $request_path;
$real_file_path = realpath($file_path);
$real_base_path = realpath(__DIR__);

// Security check
if ($real_file_path === false || strpos($real_file_path, $real_base_path) !== 0) {
    header("HTTP/1.1 403 Forbidden");
    exit("403 Forbidden");
}

// Serve the file if it exists
if (file_exists($real_file_path)) {
    // Enable caching
    $etag = md5_file($real_file_path);
    header("ETag: \"$etag\"");
    header('Cache-Control: public, max-age=31536000');
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
    
    // Check browser cache
    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) == "\"$etag\"") {
        header("HTTP/1.1 304 Not Modified");
        exit;
    }

    // Serve file
    readfile($real_file_path);
    exit;
}

// 404 if file not found
header("HTTP/1.1 404 Not Found");
exit("404 Not Found");