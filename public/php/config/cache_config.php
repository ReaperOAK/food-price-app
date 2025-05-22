<?php
return [
    'cache_enabled' => true,
    'cache_ttl' => 86400, // 24 hours in seconds
    'cache_path' => dirname(__DIR__) . '/cache',
    'no_cache_params' => [
        'nocache',
        'refresh'
    ]
];
?>
