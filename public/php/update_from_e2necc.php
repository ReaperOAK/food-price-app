<?php
header('Content-Type: application/json');



// Set a timeout for the HTTP request
$context = stream_context_create([
    'http' => [
        'timeout' => 60 // Timeout in seconds
    ]
]);

// Fetch the latest egg prices
$url = 'https://e2necc.com/home/eggprice';
$html = @file_get_contents($url, false, $context);

// Database connection
$servername = "localhost";
$username = "u901337298_test";
$password = "A12345678b*";
$dbname = "u901337298_test";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

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
        }

        // Insert or update data in the database
        $today = date('Y-m-d');
        $dayOfMonth = date('j'); // Get the current day of the month (1-31)

        foreach ($rows as $row) {
            $city = $row[0];
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

            // Check if data for today already exists
            $checkQuery = "SELECT * FROM egg_rates WHERE city = ? AND date = ?";
            $stmt = $conn->prepare($checkQuery);
            $stmt->bind_param("ss", $city, $today);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows == 0) {
                // Insert new data
                $insertQuery = "INSERT INTO egg_rates (city, date, rate) VALUES (?, ?, ?)";
                $stmt = $conn->prepare($insertQuery);
                $stmt->bind_param("sss", $city, $today, $rate);
                $stmt->execute();
            } else {
                // Update existing data
                $updateQuery = "UPDATE egg_rates SET rate = ? WHERE city = ? AND date = ?";
                $stmt = $conn->prepare($updateQuery);
                $stmt->bind_param("sss", $rate, $city, $today);
                $stmt->execute();
            }
        }

        echo json_encode(['status' => 'success', 'message' => 'Data updated successfully']);
    } else {
        echo json_encode(['error' => 'Failed to find the table']);
    }
} else {
    echo json_encode(['error' => 'Failed to retrieve the page']);
}

$conn->close();
?>