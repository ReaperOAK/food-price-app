<?php
// Test script to check image availability for web stories
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Web Stories Image Test</h1>";

// Set up paths
$serverRoot = dirname(dirname(dirname(__FILE__))); // Go up to the public folder
$webstoriesImagesPath = $serverRoot . '/images/webstories';

echo "<h2>Image Directory: {$webstoriesImagesPath}</h2>";

// Check if directory exists
if (!is_dir($webstoriesImagesPath)) {
    echo "<p style='color: red;'>❌ Images directory does not exist!</p>";
    echo "<p>Creating directory...</p>";
    
    if (mkdir($webstoriesImagesPath, 0777, true)) {
        echo "<p style='color: green;'>✅ Directory created successfully</p>";
        chmod($webstoriesImagesPath, 0777);
    } else {
        echo "<p style='color: red;'>❌ Failed to create directory</p>";
        exit;
    }
} else {
    echo "<p style='color: green;'>✅ Images directory exists</p>";
}

// Scan for images
$backgroundImages = [];
echo "<h2>Scanning for images...</h2>";

$files = scandir($webstoriesImagesPath);
if ($files === false) {
    echo "<p style='color: red;'>❌ Failed to scan directory</p>";
    exit;
}

foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;
    
    $filePath = $webstoriesImagesPath . '/' . $file;
    $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    
    if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
        continue;
    }

    // Skip thumbnail files
    if (strpos($file, 'thumbnail-') === 0) {
        continue;
    }

    // Validate image
    $imageInfo = @getimagesize($filePath);
    if ($imageInfo === false) {
        echo "<p style='color: orange;'>⚠️ Invalid image file: {$file}</p>";
        continue;
    }

    $backgroundImages[] = $file;
    echo "<p style='color: green;'>✅ Valid image: {$file} ({$imageInfo[0]}x{$imageInfo[1]})</p>";
}

echo "<h2>Results</h2>";
echo "<p><strong>Total valid images found:</strong> " . count($backgroundImages) . "</p>";

if (empty($backgroundImages)) {
    echo "<p style='color: orange;'>⚠️ No valid background images found. The script will create a default image.</p>";
    echo "<p>You should upload some background images to: <code>{$webstoriesImagesPath}</code></p>";
    echo "<p>Recommended formats: JPG, PNG, WebP (1200x1600 pixels)</p>";
} else {
    echo "<p style='color: green;'>✅ Images are available for web story generation</p>";
    echo "<h3>Available images:</h3>";
    echo "<ul>";
    foreach ($backgroundImages as $image) {
        echo "<li>{$image}</li>";
    }
    echo "</ul>";
}

// Test image assignment
if (!empty($backgroundImages)) {
    echo "<h3>Test Image Assignment (like in web stories):</h3>";
    $coverImage = $backgroundImages[array_rand($backgroundImages)];
    $trayPriceImage = $backgroundImages[array_rand($backgroundImages)];
    $ctaImage = $backgroundImages[array_rand($backgroundImages)];
    
    echo "<p><strong>Cover Image:</strong> {$coverImage}</p>";
    echo "<p><strong>Tray Price Image:</strong> {$trayPriceImage}</p>";
    echo "<p><strong>CTA Image:</strong> {$ctaImage}</p>";
    
    // Test format function
    function formatImagePath($imagePath) {
        $imagePath = ltrim($imagePath, '/');
        if (strpos($imagePath, '/') === false) {
            return '/images/webstories/' . $imagePath;
        }
        if (strpos($imagePath, 'images/webstories/') === 0) {
            return '/' . $imagePath;
        }
        return '/images/webstories/' . $imagePath;
    }
    
    echo "<h3>Formatted Image Paths (for HTML):</h3>";
    echo "<p><strong>Cover Image Path:</strong> " . formatImagePath($coverImage) . "</p>";
    echo "<p><strong>Tray Price Image Path:</strong> " . formatImagePath($trayPriceImage) . "</p>";
    echo "<p><strong>CTA Image Path:</strong> " . formatImagePath($ctaImage) . "</p>";
}

echo "<p style='color: blue;'>ℹ️ Test completed. If images are found, the web story generation should work properly.</p>";
?>
