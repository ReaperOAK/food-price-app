import React, { useEffect, useState } from 'react';

const SpecialRatesTable = () => {
  const [specialRates, setSpecialRates] = useState([]);

  useEffect(() => {
    fetch('https://todayeggrates.com/php/get_special_rates.php')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched special rates:', data); // Log the special rates
        setSpecialRates(data);
      })
      .catch(error => console.error('Error fetching special rates:', error));
  }, []);

  return (
    <div className="p-6 mt-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Special Rates</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Market</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Piece</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Tray</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {specialRates.length > 0 ? (
              specialRates.map((rate, index) => (
                <tr key={index} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{rate.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{parseFloat(rate.rate).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{parseFloat((rate.rate) * 30).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No special rates available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpecialRatesTable;
