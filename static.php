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
if (!preg_match('/^\/static\/(css|js)\/[^\/]+\.(css|js|chunk\.js)(\.gz)?$/', $request_uri)) {
    error_log("Invalid file request: " . $request_uri);
    error_log("Request URI was: " . $request_uri);
    error_log("File path would be: " . $file_path);
    header('HTTP/1.1 403 Forbidden');
    exit('Access denied');
}

// Handle gzipped files
$is_gzipped = substr($request_uri, -3) === '.gz';
if ($is_gzipped) {
    $ext = strtolower(pathinfo(substr($request_uri, 0, -3), PATHINFO_EXTENSION));
    header('Content-Encoding: gzip');
}

// Verify file exists and is readable
if (!is_file($file_path)) {
    error_log("File does not exist: " . $file_path);
    error_log("Request URI was: " . $request_uri);
    error_log("__DIR__ is: " . __DIR__);
    header('HTTP/1.1 404 Not Found');
    exit('File not found');
}

if (!is_readable($file_path)) {
    error_log("File not readable: " . $file_path);
    error_log("File permissions: " . decoct(fileperms($file_path)));
    header('HTTP/1.1 403 Forbidden');
    exit('File not readable');
}

// Set the appropriate MIME type
if (isset($mime_types[$ext])) {
    header('Content-Type: ' . $mime_types[$ext]);
    // Additional security headers
    header('X-Content-Type-Options: nosniff');
} else {
    error_log("Invalid file type requested: " . $ext);
    error_log("Full request URI: " . $request_uri);
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
