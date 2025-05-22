<?php
// Add cache control headers
header('Cache-Control: public, max-age=31536000, immutable');
header('Vary: Accept-Encoding');

// Handle WebP support
$accept = isset($_SERVER['HTTP_ACCEPT']) ? $_SERVER['HTTP_ACCEPT'] : '';
$webp_support = strpos($accept, 'image/webp') !== false;

// Get requested image path
$image_path = $_GET['path'] ?? '';
$webp_path = preg_replace('/\.(jpe?g|png)$/i', '.webp', $image_path);

// Check if WebP version exists and browser supports it
if ($webp_support && file_exists($webp_path)) {
    header('Content-Type: image/webp');
    readfile($webp_path);
    exit;
}

// Serve original image if WebP not available
if (file_exists($image_path)) {
    $ext = strtolower(pathinfo($image_path, PATHINFO_EXTENSION));
    $mime_types = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp'
    ];
    
    if (isset($mime_types[$ext])) {
        header('Content-Type: ' . $mime_types[$ext]);
        readfile($image_path);
        exit;
    }
}

// Return 404 if image not found
header('HTTP/1.0 404 Not Found');
?>
