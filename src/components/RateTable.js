import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RateTable = ({ eggRates, selectedCity, selectedState }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' }); // Default to descending order
  const itemsPerPage = 10;

  const handleClick = (event) => {
    setCurrentPage(Number(event.target.id));
  };

  const pages = [];
  for (let i = 1; i <= Math.ceil(eggRates.length / itemsPerPage); i++) {
    pages.push(i);
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const sortedEggRates = [...eggRates].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const currentItems = sortedEggRates.slice(indexOfFirstItem, indexOfLastItem);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (eggRates.length === 0) {
    return <div>No rates available for {selectedCity}, {selectedState}.</div>;
  }

  const data = {
    labels: currentItems.map(rate => rate.date),
    datasets: [
      {
        label: 'Egg Rates',
        data: currentItems.map(rate => rate.rate),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Egg Rates in ${selectedCity}, ${selectedState}`,
      },
    },
  };

  return (
    <div className="dynamic-body p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 mt-4">
          <thead>
            <tr style={{ backgroundColor: '#F9BE0C' }}>
              <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => requestSort('date')}>Date</th>
              <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => requestSort('rate')}>Piece</th>
              <th className="border border-gray-300 p-2">Tray</th>
              <th className="border border-gray-300 p-2">100 Pcs</th>
              <th className="border border-gray-300 p-2">Peti</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((rate, index) => (
              <tr
                key={`${rate.date}-${rate.rate}-${index}`}
                className={`${index % 2 === 0 ? 'bg-[#fffcdf]' : 'bg-[#fff1c8]'} hover:bg-[#ddfafe]`}
              >
                <td className="border border-gray-300 p-2">{rate.date}</td>
                <td className="border border-gray-300 p-2">₹{rate.rate.toFixed(2)}</td>
                <td className="border border-gray-300 p-2">₹{(rate.rate * 30).toFixed(2)}</td>
                <td className="border border-gray-300 p-2">₹{(rate.rate * 100).toFixed(2)}</td>
                <td className="border border-gray-300 p-2">₹{(rate.rate * 210).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination mt-4 flex justify-center">
        {pages.map(number => (
          <button
            key={number}
            id={number}
            onClick={handleClick}
            className={`px-4 py-2 mx-1 border rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-100'}`}
          >
            {number}
          </button>
        ))}
      </div>
      <div className="mt-8">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

RateTable.propTypes = {
  eggRates: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      rate: PropTypes.number.isRequired,
    })
  ).isRequired,
  selectedCity: PropTypes.string.isRequired,
  selectedState: PropTypes.string.isRequired,
};

export default RateTable;