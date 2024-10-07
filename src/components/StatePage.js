import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const StatePage = () => {
  const { state } = useParams();
  const [averageRates, setAverageRates] = useState([]);

  useEffect(() => {
    fetch(`https://todayeggrates.com/php/get_average_rates.php?state=${state}`)
      .then(response => response.json())
      .then(data => {
        setAverageRates(data.averageRates || []);
      })
      .catch(error => console.error('Error fetching average rates:', error));
  }, [state]);

  return (
    <div className="p-6 mt-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Average Rates for {state}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr style={{ backgroundColor: '#F9BE0C' }}>
              <th className="border border-gray-300 p-4 text-left">Date</th>
              <th className="border border-gray-300 p-4 text-left">Average Rate</th>
            </tr>
          </thead>
          <tbody>
            {averageRates.length > 0 ? (
              averageRates.map((rate, index) => (
                <tr key={`${rate.date}-${index}`} className={`transition duration-150 ${index % 2 === 0 ? 'bg-[#fffcdf]' : 'bg-[#fff1c8]'} hover:bg-[#ddfafe]`}>
                  <td className="border border-gray-300 p-4">{rate.date}</td>
                  <td className="border border-gray-300 p-4">
                    {rate.averageRate ? `₹${parseFloat(rate.averageRate).toFixed(2)}` : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-gray-300 p-4 text-center" colSpan="2">Loading...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatePage;
