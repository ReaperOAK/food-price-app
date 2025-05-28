<?php
// Prevent any output buffering issues
if (ob_get_level()) ob_end_clean();

// Set error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get the requested file path
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file_path = __DIR__ . $request_uri;

// Get file extension
$ext = strtolower(pathinfo($request_uri, PATHINFO_EXTENSION));

// Define allowed MIME types
$mime_types = [
    'css' => 'text/css; charset=utf-8',
    'js' => 'application/javascript; charset=utf-8'
];

// Security check - only allow css and js files from static directory
if (!preg_match('/^\/static\/(css|js)\/[^\/]+\.(css|js)$/', $request_uri)) {
    error_log("Invalid file request: " . $request_uri);
    header('HTTP/1.1 403 Forbidden');
    exit('Access denied');
}

// Verify file exists and is readable
if (!is_file($file_path) || !is_readable($file_path)) {
    error_log("File not found or not readable: " . $file_path);
    header('HTTP/1.1 404 Not Found');
    exit('File not found');
}

// Set the appropriate MIME type
if (isset($mime_types[$ext])) {
    header('Content-Type: ' . $mime_types[$ext]);
} else {
    header('HTTP/1.1 400 Bad Request');
    exit('Invalid file type');
}

// Set caching headers
$etag = '"' . md5_file($file_path) . '"';
header('ETag: ' . $etag);
header('Cache-Control: public, max-age=31536000');
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');

// Check if-none-match
if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
    header('HTTP/1.1 304 Not Modified');
    exit;
}

// Output the file
if (readfile($file_path) === false) {
    error_log("Failed to read file: " . $file_path);
    header('HTTP/1.1 500 Internal Server Error');
    exit('Error reading file');
}
