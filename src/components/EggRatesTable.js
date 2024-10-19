import React, { useState } from 'react';

const EggRatesTable = ({ sortedEggRates, handleSort, setEggRate, handleDelete, handleEditRate }) => {
  const [editingRate, setEditingRate] = useState(null);
  const [editedRate, setEditedRate] = useState({});

  const handleEditClick = (rate) => {
    setEditingRate(rate.id);
    setEditedRate(rate);
  };

  const handleSaveClick = () => {
    handleEditRate(editedRate);
    setEditingRate(null);
  };

  const handleCancelClick = () => {
    setEditingRate(null);
    setEditedRate({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedRate((prevRate) => ({
      ...prevRate,
      [name]: value,
    }));
  };

  return (
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
              <td className="border border-gray-300 p-3">
                {editingRate === rate.id ? (
                  <input
                    type="date"
                    name="date"
                    value={editedRate.date}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full"
                  />
                ) : (
                  rate.date
                )}
              </td>
              <td className="border border-gray-300 p-3">
                {editingRate === rate.id ? (
                  <input
                    type="number"
                    name="rate"
                    value={editedRate.rate}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full"
                  />
                ) : (
                  `$${rate.rate}`
                )}
              </td>
              <td className="border border-gray-300 p-3 flex space-x-2">
                {editingRate === rate.id ? (
                  <>
                    <button
                      onClick={handleSaveClick}
                      className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditClick(rate)}
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
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EggRatesTable;