import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const StatePage = () => {
  const { state } = useParams();
  const [averageRates, setAverageRates] = useState([]);

  useEffect(() => {
    fetch(`https://blueviolet-gerbil-672303.hostingersite.com/php/get_average_rates.php?state=${state}`)
      .then(response => response.json())
      .then(data => {
        console.log('Fetched average rates:', data); // Debugging log
        setAverageRates(data.averageRates || []);
      })
      .catch(error => console.error('Error fetching average rates:', error));
  }, [state]);

  return (
    <div className="p-6 mt-6 bg-gray-100 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Average Rates for {state}</h2>
      <table className="min-w-full border border-gray-300 mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Average Rate</th>
          </tr>
        </thead>
        <tbody>
          {averageRates.map((rate, index) => (
            <tr key={`${rate.date}-${index}`}>
              <td className="border border-gray-300 p-2">{rate.date}</td>
              <td className="border border-gray-300 p-2">
                {rate.averageRate ? `₹${parseFloat(rate.averageRate).toFixed(2)}` : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatePage;