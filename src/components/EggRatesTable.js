import React from 'react';

const EggRatesTable = ({ sortedEggRates, handleSort, setEggRate, handleDelete }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th
            className="border border-gray-300 p-3 text-left cursor-pointer"
            onClick={() => handleSort('city')}
          >
            City
          </th>
          <th
            className="border border-gray-300 p-3 text-left cursor-pointer"
            onClick={() => handleSort('state')}
          >
            State
          </th>
          <th
            className="border border-gray-300 p-3 text-left cursor-pointer"
            onClick={() => handleSort('date')}
          >
            Date
          </th>
          <th
            className="border border-gray-300 p-3 text-left cursor-pointer"
            onClick={() => handleSort('rate')}
          >
            Rate
          </th>
          <th className="border border-gray-300 p-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedEggRates.map((rate) => (
          <tr key={`${rate.city}-${rate.state}-${rate.date}`} className="hover:bg-gray-100">
            <td className="border border-gray-300 p-3">{rate.city}</td>
            <td className="border border-gray-300 p-3">{rate.state}</td>
            <td className="border border-gray-300 p-3">{rate.date}</td>
            <td className="border border-gray-300 p-3">${rate.rate}</td>
            <td className="border border-gray-300 p-3 flex space-x-2">
              <button
                onClick={() => setEggRate(rate)}
                className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(rate)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EggRatesTable;