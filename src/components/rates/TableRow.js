import React from 'react';

const TableRow = ({
  rate,
  index,
  hoveredRow,
  selectedCity,
  showMarket,
  showState,
  showDate,
  showPriceColumns,
  showSpecialRates,
  showAdmin,
  editingRate,
  editedRate,
  handleChange,
  handleEditClick,
  handleSaveClick,
  handleCancelClick,
  onDelete,
  setHoveredRow,
  rowHeight = '48px'
}) => {
  const cellStyle = {
    height: rowHeight,
    minHeight: rowHeight,
    transition: 'background-color 0.2s ease-in-out'
  };

  return (
    <tr
      className={`
        ${index % 2 === 0 ? 'bg-[#fffcdf]' : 'bg-[#fff1c8]'}
        hover:bg-[#ddfafe]
        ${hoveredRow === index ? 'bg-[#ddfafe]' : ''}
      `}
      style={cellStyle}
      onMouseEnter={() => setHoveredRow(index)}
      onMouseLeave={() => setHoveredRow(null)}
      role="row"
    >
      {(!selectedCity && showMarket) && (
        <td className="border border-gray-300 p-2" style={cellStyle} role="cell">
          {rate.city ? (
            <a 
              href={`/${rate.city.toLowerCase()}-egg-rate`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {rate.city}
            </a>
          ) : (
            'N/A'
          )}
        </td>
      )}
      {showState && (
        <td className="border border-gray-300 p-2" style={cellStyle} role="cell">
          {rate.state}
        </td>
      )}
      {showDate && (
        <td className="border border-gray-300 p-2" style={cellStyle} role="cell">
          {editingRate === rate.id ? (
            <input
              type="date"
              name="date"
              value={editedRate.date}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ height: '32px' }}
              aria-label="Edit date"
            />
          ) : (
            <span title={`Last updated: ${rate.date}`}>{rate.date}</span>
          )}
        </td>
      )}
      <td className="border border-gray-300 p-2" style={cellStyle} role="cell">
        {editingRate === rate.id ? (
          <input
            type="number"
            name="rate"
            value={editedRate.rate}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ height: '32px' }}
            aria-label="Edit rate"
            step="0.01"
          />
        ) : (
          <span className="font-medium">₹{parseFloat(rate.rate).toFixed(2)}</span>
        )}
      </td>
      {showPriceColumns && (
        <>
          <td className="border border-gray-300 p-2" style={cellStyle} role="cell">
            <span title="Price for 30 eggs">₹{(rate.rate * 30).toFixed(2)}</span>
          </td>
          {!showSpecialRates && (
            <>
              <td className="border border-gray-300 p-2" style={cellStyle} role="cell">
                <span title="Price for 100 eggs">₹{(rate.rate * 100).toFixed(2)}</span>
              </td>
              <td className="border border-gray-300 p-2" style={cellStyle} role="cell">
                <span title="Price for 210 eggs">₹{(rate.rate * 210).toFixed(2)}</span>
              </td>
            </>
          )}
        </>
      )}
      {showAdmin && (
        <td className="border border-gray-300 p-2 space-x-2" style={cellStyle} role="cell">
          {editingRate === rate.id ? (
            <>
              <button
                onClick={handleSaveClick}
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                aria-label="Save changes"
              >
                Save
              </button>
              <button
                onClick={handleCancelClick}
                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                aria-label="Cancel editing"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleEditClick(rate)}
                className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                aria-label={`Edit ${rate.city} rate`}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete && onDelete(rate)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                aria-label={`Delete ${rate.city} rate`}
              >
                Delete
              </button>
            </>
          )}
        </td>
      )}
    </tr>
  );
};

export default TableRow;
