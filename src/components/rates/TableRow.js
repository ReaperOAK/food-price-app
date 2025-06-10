import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

// Safe string conversion helper
const safeToLowerCase = (value) => {
  if (!value) return '';
  return String(value).toLowerCase();
};

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
  const baseCellClasses = useMemo(() => `
    px-3 py-2 align-middle
    text-gray-800 dark:text-gray-200
    transition-colors duration-200
  `.trim(), []);

  const rowClasses = useMemo(() => `
    ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}
    hover:bg-amber-50 dark:hover:bg-amber-900/20
    ${hoveredRow === index ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
    transition-colors duration-200
  `.trim(), [index, hoveredRow]);

  const inputClasses = useMemo(() => `
    w-full px-2 py-1
    border border-gray-300 dark:border-gray-600
    rounded-md
    bg-white dark:bg-gray-700
    text-gray-900 dark:text-gray-100
    focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400
    focus:border-transparent
    transition-all duration-200
    placeholder-gray-400 dark:placeholder-gray-500
  `.trim(), []);

  const buttonBaseClasses = useMemo(() => `
    px-3 py-1
    rounded-md text-sm font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    min-w-[4rem]
  `.trim(), []);

  const renderButton = (type, onClick, label) => {
    const buttonColors = {
      edit: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 text-white',
      save: 'bg-green-500 hover:bg-green-600 focus:ring-green-500 text-white',
      cancel: 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500 text-white',
      delete: 'bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white'
    };

    return (
      <button
        type="button"
        onClick={onClick}
        className={`${buttonBaseClasses} ${buttonColors[type]}`}
        aria-label={label}
      >
        {label}
      </button>
    );
  };

  const renderPriceCell = (amount, tooltip) => (
    <td className={`${baseCellClasses} text-right`} title={tooltip}>
      <span className="font-medium">₹{amount?.tofixed(2)}</span>
    </td>
  );

  const renderEditableInput = (type, name, value, extraProps = {}) => (
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleChange}
      className={inputClasses}
      aria-label={`Edit ${name}`}
      {...extraProps}
    />
  );

  return (
    <tr
      className={rowClasses}
      onMouseEnter={() => setHoveredRow(index)}
      onMouseLeave={() => setHoveredRow(null)}
      style={{ height: rowHeight }}
    >
      {(!selectedCity && showMarket) && (
        <td className={baseCellClasses}>          <a 
            href={`/${safeToLowerCase(rate?.city)}-egg-rate-today`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            aria-label={`View egg rates for ${rate.city}`}
          >
            {rate.city || 'N/A'}
          </a>
        </td>
      )}

      {showState && (
        <td className={baseCellClasses}>
          {rate.state || 'N/A'}
        </td>
      )}

      {showDate && (
        <td className={baseCellClasses}>
          {editingRate === rate.id ? (
            renderEditableInput('date', 'date', editedRate.date)
          ) : (
            <time dateTime={rate.date}>{rate.date}</time>
          )}
        </td>
      )}

      <td className={baseCellClasses}>
        {editingRate === rate.id ? (
          renderEditableInput('number', 'rate', editedRate.rate, {
            step: "0.01",
            min: "0",
            'aria-label': 'Edit rate per piece'
          })
        ) : (
          <span className="font-medium">₹{parseFloat(rate.rate)?.tofixed(2)}</span>
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
        <td className={`${baseCellClasses} space-x-2`}>
          {editingRate === rate.id ? (
            <div className="flex gap-2">
              {renderButton('save', handleSaveClick, 'Save')}
              {renderButton('cancel', handleCancelClick, 'Cancel')}
            </div>
          ) : (
            <div className="flex gap-2">
              {renderButton('edit', () => handleEditClick(rate), 'Edit')}
              {renderButton('delete', () => onDelete?.(rate), 'Delete')}
            </div>
          )}
        </td>
      )}
    </tr>
  );
});

TableRow.propTypes = {
  rate: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    city: PropTypes.string,
    state: PropTypes.string,
    date: PropTypes.string,
    rate: PropTypes.number
  }).isRequired,
  index: PropTypes.number.isRequired,
  hoveredRow: PropTypes.number,
  selectedCity: PropTypes.string,
  showMarket: PropTypes.bool,
  showState: PropTypes.bool,
  showDate: PropTypes.bool,
  showPriceColumns: PropTypes.bool,
  showSpecialRates: PropTypes.bool,
  showAdmin: PropTypes.bool,
  editingRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  editedRate: PropTypes.object,
  handleChange: PropTypes.func.isRequired,
  handleEditClick: PropTypes.func.isRequired,
  handleSaveClick: PropTypes.func.isRequired,
  handleCancelClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  setHoveredRow: PropTypes.func.isRequired,
  rowHeight: PropTypes.string
};

TableRow.displayName = 'TableRow';

export default TableRow;
