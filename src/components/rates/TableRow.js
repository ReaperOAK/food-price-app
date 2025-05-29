import React, { memo } from 'react';

const TableRow = memo(({
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
    transition: 'all 0.2s ease-in-out',
    padding: '0.75rem 1rem'
  };

  const renderPriceCell = (amount, tooltip) => (
    <td className="border border-gray-300 p-2" style={cellStyle} role="cell">
      <span 
        className="whitespace-nowrap text-sm md:text-base" 
        title={tooltip}
      >
        ₹{amount.toFixed(2)}
      </span>
    </td>
  );

  const renderEditableInput = (type, name, value, extraProps = {}) => (
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleChange}
      className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      style={{ height: '32px' }}
      aria-label={`Edit ${name}`}
      {...extraProps}
    />
  );

  return (
    <tr
      className={`
        ${index % 2 === 0 ? 'bg-amber-50' : 'bg-amber-100'}
        hover:bg-cyan-50 transition-colors duration-200
        ${hoveredRow === index ? 'bg-cyan-50' : ''}
      `}
      style={cellStyle}
      onMouseEnter={() => setHoveredRow(index)}
      onMouseLeave={() => setHoveredRow(null)}
      role="row"
    >
      {(!selectedCity && showMarket) && (
        <td className="border border-gray-300" style={cellStyle} role="cell">
          {rate.city ? (
            <a 
              href={`/${rate.city.toLowerCase()}-egg-rate`}
              className="text-blue-700 hover:text-blue-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 text-sm md:text-base"
              title={`View ${rate.city} egg rates`}
            >
              {rate.city}
            </a>
          ) : (
            <span className="text-gray-500">N/A</span>
          )}
        </td>
      )}

      {showState && (
        <td className="border border-gray-300" style={cellStyle} role="cell">
          <span className="text-sm md:text-base">{rate.state}</span>
        </td>
      )}

      {showDate && (
        <td className="border border-gray-300" style={cellStyle} role="cell">
          {editingRate === rate.id ? (
            renderEditableInput('date', 'date', editedRate.date)
          ) : (
            <span 
              className="text-sm md:text-base"
              title={`Last updated: ${rate.date}`}
            >
              {rate.date}
            </span>
          )}
        </td>
      )}

      <td className="border border-gray-300" style={cellStyle} role="cell">
        {editingRate === rate.id ? (
          renderEditableInput('number', 'rate', editedRate.rate, {
            step: "0.01",
            min: "0"
          })
        ) : (
          <span className="font-medium text-sm md:text-base">
            ₹{parseFloat(rate.rate).toFixed(2)}
          </span>
        )}
      </td>

      {showPriceColumns && (
        <>
          {renderPriceCell(rate.rate * 30, 'Price for 30 eggs')}
          {!showSpecialRates && (
            <>
              {renderPriceCell(rate.rate * 100, 'Price for 100 eggs')}
              {renderPriceCell(rate.rate * 210, 'Price for 210 eggs')}
            </>
          )}
        </>
      )}

      {showAdmin && (
        <td className="border border-gray-300 space-x-2" style={cellStyle} role="cell">
          <div className="flex flex-wrap gap-2">
            {editingRate === rate.id ? (
              <>
                <button
                  onClick={handleSaveClick}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 min-w-[60px]"
                  aria-label="Save changes"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelClick}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 min-w-[60px]"
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEditClick(rate)}
                  className="bg-amber-600 text-white px-3 py-1 rounded text-sm hover:bg-amber-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 min-w-[60px]"
                  aria-label={`Edit ${rate.city} rate`}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete && onDelete(rate)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 min-w-[60px]"
                  aria-label={`Delete ${rate.city} rate`}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

export default TableRow;
