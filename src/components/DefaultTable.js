import React, { useState } from 'react';

const DefaultTable = ({ eggRates = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'city', direction: 'ascending' });
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
    return <div>No rates available at the moment.</div>;
  }

  return (
    <div className="dynamic-body">
      <table className="min-w-full border border-gray-300 mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => requestSort('city')}>Market</th>
            <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => requestSort('rate')}>Piece</th>
            <th className="border border-gray-300 p-2">Tray</th>
            <th className="border border-gray-300 p-2">100 Pcs</th>
            <th className="border border-gray-300 p-2">Peti</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((rate, index) => (
            <tr key={`${rate.city}-${rate.date}-${index}`}>
              <td className="border border-gray-300 p-2">{rate.city}</td>
              <td className="border border-gray-300 p-2">₹{rate.rate.toFixed(2)}</td>
              <td className="border border-gray-300 p-2">₹{(rate.rate * 30).toFixed(2)}</td>
              <td className="border border-gray-300 p-2">₹{(rate.rate * 100).toFixed(2)}</td>
              <td className="border border-gray-300 p-2">₹{(rate.rate * 210).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination mt-4">
        {pages.map(number => (
          <button
            key={number}
            id={number}
            onClick={handleClick}
            className={`px-4 py-2 mx-1 border ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DefaultTable;