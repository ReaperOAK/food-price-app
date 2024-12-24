<?php
header('Content-Type: application/json');

$url = 'https://e2necc.com/home/eggprice';
$html = file_get_contents($url);

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

        $data = [
            'headers' => $headers,
            'rows' => $rows
        ];
        echo json_encode($data);
    } else {
        echo json_encode(['error' => 'Failed to find the table']);
    }
} else {
    echo json_encode(['error' => 'Failed to retrieve the page']);
}
?>