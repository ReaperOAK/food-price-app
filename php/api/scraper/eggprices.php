<?php
header('Content-Type: application/json');

// Set a timeout for the HTTP request
$context = stream_context_create([
    'http' => [
        'timeout' => 60 // Timeout in seconds
    ]
]);

$url = 'https://e2necc.com/home/eggprice';
$html = @file_get_contents($url, false, $context);

if ($html !== false) {
    $dom = new DOMDocument();
    @$dom->loadHTML($html);
    $xpath = new DOMXPath($dom);

    $table = $xpath->query('//table[@border="1px"]')->item(0);
    if ($table) {
        $headers = [];
        $rows = [];

        // Get table headers
        $headerNodes = $xpath->query('.//th', $table);
        foreach ($headerNodes as $headerNode) {
            $headers[] = trim($headerNode->textContent);
        }

        // Get table rows
        $rowNodes = $xpath->query('.//tr', $table);
        foreach ($rowNodes as $rowIndex => $rowNode) {
            if ($rowIndex < 2) continue; // Skip the first two rows
            $cells = [];
            $cellNodes = $xpath->query('.//td', $rowNode);
            foreach ($cellNodes as $cellNode) {
                $cells[] = trim($cellNode->textContent);
            }
            if (!empty($cells)) {
                $rows[] = $cells;
            }
        }        // Function to standardize city names by removing state codes
        function standardizeCityName($cityName) {
            // Remove state codes in parentheses and trim
            $cleanName = preg_replace('/\s*\([A-Z]+\)\s*/', '', trim($cityName));
            
            // Handle specific city name variations
            $cityMappings = [
                'Bangalore' => 'Bengaluru',
                'Luknow' => 'Lucknow'
            ];
            
            return isset($cityMappings[$cleanName]) ? $cityMappings[$cleanName] : $cleanName;
        }

        // City to state mapping (using standardized names without state codes)
        $cityToState = [
            "Ahmedabad" => "Gujarat",
            "Ajmer" => "Rajasthan",
            "Barwala" => "Haryana",
            "Bengaluru" => "Karnataka",
            "Brahmapur" => "Odisha",
            "Chennai" => "Tamil Nadu",
            "Chittoor" => "Andhra Pradesh",
            "Delhi" => "Delhi",
            "E.Godavari" => "Andhra Pradesh",
            "Hospet" => "Karnataka",
            "Hyderabad" => "Telangana",
            "Jabalpur" => "Madhya Pradesh",
            "Kolkata" => "West Bengal",
            "Ludhiana" => "Punjab",
            "Mumbai" => "Maharashtra",
            "Mysuru" => "Karnataka",
            "Namakkal" => "Tamil Nadu",
            "Pune" => "Maharashtra",
            "Raipur" => "Chhattisgarh",
            "Surat" => "Gujarat",
            "Vijayawada" => "Andhra Pradesh",
            "Vizag" => "Andhra Pradesh",
            "W.Godavari" => "Andhra Pradesh",
            "Warangal" => "Telangana",
            "Allahabad" => "Uttar Pradesh",
            "Bhopal" => "Madhya Pradesh",
            "Indore" => "Madhya Pradesh",
            "Kanpur" => "Uttar Pradesh",
            "Lucknow" => "Uttar Pradesh",
            "Muzaffurpur" => "Bihar",
            "Nagpur" => "Maharashtra",
            "Patna" => "Bihar",
            "Ranchi" => "Jharkhand",
            "Varanasi" => "Uttar Pradesh"
        ];

        // Get today's date and day of the month
        $today = date('Y-m-d');
        $dayOfMonth = date('j'); // Get the current day of the month (1-31)

        // Filter rows to include only today's data
        $todayRows = [];
        foreach ($rows as $row) {
            $city = $row[0];
            if (strtolower($city) === 'prevailing prices') continue; // Exclude "Prevailing Prices"

            // Standardize city names with consistent capitalization
            if (strtolower($city) === 'bangalore' || 
                strtolower($city) === 'bangalore (cc)' || 
                strtolower($city) === 'bengaluru (cc)' ||
                strtolower($city) === 'bengaluru') {
                $city = 'Bengaluru'; // Always use this capitalization
            }

            $rate = $row[$dayOfMonth]; // Get today's rate

            // If today's rate is not available, find the last available rate
            if ($rate === '-' || $rate === '') {
                for ($i = $dayOfMonth - 1; $i > 0; $i--) {
                    if ($row[$i] !== '-' && $row[$i] !== '') {
                        $rate = $row[$i];
                        break;
                    }
                }
            }

            // Convert rate from paisa to rupees
            $rateInRupees = number_format($rate / 100, 2);

            // Get the state for the city
            $state = isset($cityToState[$city]) ? $cityToState[$city] : 'Unknown';

            $todayRows[] = [
                'city' => $city,
                'state' => $state,
                'date' => $today,
                'rate' => $rateInRupees
            ];
        }

        $data = [
            'headers' => ['City', 'State', 'Date', 'Rate'],
            'rows' => $todayRows
        ];
        echo json_encode($data);
    } else {
        echo json_encode(['error' => 'Failed to find the table']);
    }
} else {
    echo json_encode(['error' => 'Failed to retrieve the page']);
}
?>