import React, { useEffect, useState } from 'react';

const SpecialRatesTable = () => {
  const [specialRates, setSpecialRates] = useState([]);

  useEffect(() => {
    fetch('/php/api/rates/get_special_rates.php')
      .then(response => response.json())
      .then(data => {
        setSpecialRates(data);
      })
      .catch(error => console.error('Error fetching special rates:', error));
  }, []);

  return (
    <div className="p-6 mt-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Special Rates</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead style={{ backgroundColor: '#f9be0c' }}>
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Market</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Piece</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Tray</th>
            </tr>
          </thead>
          <tbody>
            {specialRates.length > 0 ? (
              specialRates.map((rate, index) => (
                <tr
                  key={index}
                  className={`transition duration-150 ease-in-out ${index % 2 === 0 ? 'bg-[#fffcdf]' : 'bg-[#fff1c8]'} hover:bg-[#ddfafe]`}
                >
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
