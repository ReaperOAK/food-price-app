<?php
// Check if GD library is available
if (extension_loaded('gd')) {
    echo "GD library is available.<br>";
    echo "GD Version: " . gd_info()['GD Version'] . "<br>";
    
    echo "<h3>Supported image formats:</h3>";
    $gd_info = gd_info();
    echo "<pre>";
    print_r($gd_info);
    echo "</pre>";
} else {
    echo "GD library is NOT available. This is required for generating thumbnails.";
}
?>