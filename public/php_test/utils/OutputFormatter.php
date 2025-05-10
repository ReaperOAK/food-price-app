<?php
/**
 * Output function for both CLI and web interface with improved formatting
 */
function output($message, $isSuccess = true, $isHeading = false) {
    global $isWebRequest;
    
    $statusChar = $isSuccess ? '✓' : '✗';
    $color = $isSuccess ? 'green' : 'red';
    $neutralColor = '#555';
    
    // Determine if this is an informational message (no success/failure indicator)
    $isInfo = ($message !== '' && $isSuccess === true && $isHeading === false && 
              (strpos($message, 'Testing') === 0 || strpos($message, '...') !== false));
              
    if ($isWebRequest) {
        if ($isHeading) {
            echo "<h2 style='margin: 20px 0 10px; color: #333; font-size: 1.3em; padding-bottom: 5px; border-bottom: 1px solid #eee;'>";
            echo htmlspecialchars($message);
            echo "</h2>";
        } else if ($isInfo) {
            echo "<div style='margin: 10px 0 5px; color: $neutralColor; font-weight: bold;'>";
            echo "ℹ️ " . htmlspecialchars($message);
            echo "</div>";
        } else {
            echo "<div style='margin: 5px 0; color: $color; padding: 3px 0;'>";
            echo "$statusChar " . htmlspecialchars($message);
            echo "</div>";
        }
    } else {
        if ($isHeading) {
            echo "\n\n=== " . strtoupper($message) . " ===\n";
        } else if ($isInfo) {
            echo "ℹ️  " . $message . "\n";
        } else {
            echo ($isSuccess ? "[+] " : "[-] ") . $message . "\n";
        }
    }
}
