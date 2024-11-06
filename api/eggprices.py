from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route('/api/eggprices', methods=['GET'])
def get_egg_prices():
    url = 'https://e2necc.com/home/eggprice'
    response = requests.get(url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        table = soup.find('table', {'border': '1px'})

        headers = [header.text for header in table.find_all('th')]
        rows = []
        for row in table.find_all('tr')[2:]:
            cells = row.find_all('td')
            cells = [cell.text.strip() for cell in cells]
            rows.append(cells)

        data = {
            'headers': headers,
            'rows': rows
        }
        return jsonify(data)
    else:
        return jsonify({'error': 'Failed to retrieve the page'}), response.status_code

# Vercel requires the app to be exported as a module-level variable named "app"
if __name__ != '__main__':
    app = app