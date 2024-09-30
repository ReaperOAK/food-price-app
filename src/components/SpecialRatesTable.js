import React, { useEffect, useState } from 'react';

const SpecialRatesTable = () => {
  const [specialRates, setSpecialRates] = useState([]);

  useEffect(() => {
    fetch('https://blueviolet-gerbil-672303.hostingersite.com/php/get_special_rates.php')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched special rates:', data); // Log the special rates
        setSpecialRates(data);
      })
      .catch(error => console.error('Error fetching special rates:', error));
  }, []);

  return (
    <div className="p-6 mt-6 bg-gray-100 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Special Rates</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Piece</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tray</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {specialRates.map((rate, index) => (
            <tr key={index} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4">{rate.city}</td>
              <td className="px-6 py-4">₹{parseFloat(rate.rate).toFixed(2)}</td>
              <td className="px-6 py-4">₹{parseFloat((rate.rate)*30).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpecialRatesTable;