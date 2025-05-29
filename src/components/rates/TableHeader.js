import React, { memo } from 'react';

const TableHeader = memo(({
  selectedCity,
  showMarket,
  showState,
  showDate,
  showPriceColumns,
  showSpecialRates,
  showAdmin,
  sortConfig,
  requestSort,
  getSortIcon
}) => {
  const headerCellStyle = {
    height: '48px',
    minHeight: '48px',
    padding: '0.75rem 1rem',
    backgroundColor: '#F59E0B', // Improved color for better contrast
    transition: 'background-color 0.2s ease-in-out',
    position: 'sticky',
    top: 0,
    zIndex: 10
  };

  const renderHeaderCell = (key, label, showSort = true, tooltip = '') => (
    <th
      className="border border-gray-300 cursor-pointer hover:bg-amber-500 transition-colors duration-200 whitespace-nowrap"
      onClick={() => showSort && requestSort(key)}
      role="columnheader"
      aria-sort={sortConfig.key === key ? sortConfig.direction : 'none'}
      style={headerCellStyle}
      title={tooltip}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-gray-900 font-semibold text-sm md:text-base">
          {label}
        </span>
        {showSort && (
          <span className="text-xs ml-1" aria-hidden="true">
            {getSortIcon(key)}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <tr className="sticky top-0">
      {(!selectedCity && showMarket) && renderHeaderCell(
        'city',
        showSpecialRates ? 'Market Location' : 'Market',
        true,
        'Click to sort by market name'
      )}
      
      {showState && renderHeaderCell(
        'state',
        'State',
        true,
        'Click to sort by state'
      )}
      
      {showDate && renderHeaderCell(
        'date',
        'Date',
        true,
        'Click to sort by date'
      )}
      
      {renderHeaderCell(
        'rate',
        'Rate Per Piece',
        true,
        'Click to sort by rate'
      )}

      {showPriceColumns && (
        <>
          {renderHeaderCell(
            'tray',
            'Tray Price (30)',
            false,
            'Price for a tray of 30 eggs'
          )}
          
          {!showSpecialRates && (
            <>
              {renderHeaderCell(
                'hundred',
                'Price (100 Pcs)',
                false,
                'Price for 100 eggs'
              )}
              {renderHeaderCell(
                'peti',
                'Peti (210)',
                false,
                'Price for a peti of 210 eggs'
              )}
            </>
          )}
        </>
      )}

      {showAdmin && renderHeaderCell(
        'actions',
        'Actions',
        false,
        'Edit or delete entries'
      )}
    </tr>
  );
});

TableHeader.displayName = 'TableHeader';

export default TableHeader;
