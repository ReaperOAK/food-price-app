<?php
/**
 * SEO Utility Functions for PHP
 * Mirrors the JavaScript SEO functions but optimized for server-side rendering
 */

/**
 * State abbreviations for optimizing long state names in titles
 */
function getStateAbbreviation($state) {
    $abbreviations = [
        'andhra-pradesh' => 'AP',
        'arunachal-pradesh' => 'Arunachal',
        'himachal-pradesh' => 'HP',
        'jammu-and-kashmir' => 'J&K',
        'madhya-pradesh' => 'MP',
        'tamil-nadu' => 'TN',
        'uttar-pradesh' => 'UP',
        'west-bengal' => 'WB',
        'andaman-and-nicobar' => 'A&N',
        'dadra-and-nagar-haveli' => 'DNH'
    ];
    
    return isset($abbreviations[$state]) ? $abbreviations[$state] : ucwords(str_replace('-', ' ', $state));
}

/**
 * Generate optimized SEO title (under 60 characters)
 */
function generateOptimizedSeoTitle($city = '', $state = '', $rate = null) {
    $baseTitle = "NECC Egg Rate Today";
    
    if (!$city && !$state) {
        return $baseTitle . " - Live Egg Prices India";
    }
    
    $location = '';
    if ($city && $state) {
        $cityName = ucwords(str_replace('-', ' ', $city));
        $stateName = getStateAbbreviation($state);
        $location = $cityName . ', ' . $stateName;
    } elseif ($state) {
        $location = getStateAbbreviation($state);
    } elseif ($city) {
        $location = ucwords(str_replace('-', ' ', $city));
    }
    
    // Build title with rate if available
    if ($rate && $rate > 0) {
        $rateStr = '₹' . number_format($rate, 2);
        $title = $location . ' Egg Rate ' . $rateStr . ' Today';
    } else {
        $title = $location . ' Egg Rate Today - Live Prices';
    }
    
    // Ensure title is under 60 characters
    if (strlen($title) > 60) {
        // Try shorter version
        if ($rate && $rate > 0) {
            $rateStr = '₹' . number_format($rate, 2);
            $title = $location . ' Egg ₹' . $rateStr;
        } else {
            $title = $location . ' Egg Rate Today';
        }
        
        // If still too long, truncate location
        if (strlen($title) > 60) {
            $maxLocationLength = 60 - strlen(' Egg Rate Today');
            if ($maxLocationLength > 0) {
                $location = substr($location, 0, $maxLocationLength);
                $title = $location . ' Egg Rate Today';
            } else {
                $title = $baseTitle;
            }
        }
    }
    
    return $title;
}

/**
 * Generate optimized SEO description (150-160 characters)
 */
function generateOptimizedSeoDescription($city = '', $state = '', $rate = null) {
    $location = '';
    if ($city && $state) {
        $cityName = ucwords(str_replace('-', ' ', $city));
        $stateName = ucwords(str_replace('-', ' ', $state));
        $location = $cityName . ', ' . $stateName;
    } elseif ($state) {
        $location = ucwords(str_replace('-', ' ', $state));
    } elseif ($city) {
        $location = ucwords(str_replace('-', ' ', $city));
    }
    
    if (!$location) {
        return "Get live NECC egg rates across India today. Updated daily egg prices, market trends, and wholesale rates from all major cities and states.";
    }
    
    // Handle rate formatting
    $rateText = '';
    if ($rate && $rate > 0) {
        $rateText = '₹' . number_format($rate, 2) . '/egg';
    } else {
        $rateText = 'live rates';
    }
    
    $description = "Today's NECC egg rate in {$location}: {$rateText}. Get updated daily egg prices, market analysis, and wholesale rates for {$location}.";
    
    // Ensure description is within 150-160 characters
    if (strlen($description) > 160) {
        $description = "NECC egg rate in {$location}: {$rateText}. Updated daily prices and market trends for {$location}.";
        
        if (strlen($description) > 160) {
            $description = "Egg rate in {$location}: {$rateText}. Daily updated NECC prices and market trends.";
        }
    }
    
    return $description;
}

/**
 * Generate SEO keywords
 */
function generateSeoKeywords($city = '', $state = '') {
    $keywords = ['NECC egg rate', 'egg rate today', 'live egg prices', 'egg market rates'];
    
    if ($city) {
        $cityName = strtolower(str_replace('-', ' ', $city));
        $keywords[] = $cityName . ' egg rate';
        $keywords[] = $cityName . ' egg price';
    }
    
    if ($state) {
        $stateName = strtolower(str_replace('-', ' ', $state));
        $keywords[] = $stateName . ' egg rate';
        $keywords[] = $stateName . ' egg price';
    }
    
    $keywords[] = 'poultry prices';
    $keywords[] = 'wholesale egg rates';
    $keywords[] = 'daily egg rates';
    
    return implode(', ', $keywords);
}

/**
 * Fetch live egg rate from database/API
 * This would connect to your actual data source
 */
function fetchLiveEggRate($city = '', $state = '') {
    // Placeholder - replace with actual database connection
    // For now, return a default rate
    return 5.50;
}

/**
 * Get tray price (30 eggs)
 */
function getTrayPrice($eggRate) {
    if (!$eggRate || $eggRate <= 0) {
        return null;
    }
    return $eggRate * 30;
}
?>
