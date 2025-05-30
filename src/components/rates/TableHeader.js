import React, { memo, useMemo } from 'react';

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
  const headerCellClasses = useMemo(() => `
    p-3 text-left align-middle cursor-pointer
    border-b border-amber-600 dark:border-amber-700
    hover:bg-amber-600 dark:hover:bg-amber-700
    transition-colors duration-200
    whitespace-nowrap
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
  `.trim(), []);

  const headerTextClasses = useMemo(() => `
    text-gray-900 dark:text-gray-100 
    font-semibold text-sm md:text-base
    flex items-center gap-2
  `.trim(), []);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-amber-800 dark:text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d={sortConfig.direction === 'ascending' 
            ? "M8 7l4-4m0 0l4 4m-4-4v18" 
            : "M16 17l-4 4m0 0l-4-4m4 4V3"} />
      </svg>
    );
  };

  const renderHeaderCell = (key, label, sortable = true, tooltip = '') => (
    <th
      scope="col"
      className={headerCellClasses}
      onClick={() => sortable && requestSort(key)}
      role={sortable ? 'columnheader button' : 'columnheader'}
      aria-sort={sortConfig.key === key ? sortConfig.direction : undefined}
      title={tooltip || label}
      tabIndex={sortable ? 0 : -1}
    >
      <div className={headerTextClasses}>
        <span>{label}</span>
        {sortable && renderSortIcon(key)}
      </div>
    </th>
  );

  return (
    <tr>
      {(!selectedCity && showMarket) && renderHeaderCell(
        'city',
        showSpecialRates ? 'Market Location' : 'Market',
        true,
        'Sort markets alphabetically'
      )}
      
      {showState && renderHeaderCell(
        'state',
        'State',
        true,
        'Sort by state name'
      )}
      
      {showDate && renderHeaderCell(
        'date',
        'Date',
        true,
        'Sort by date'
      )}
      
      {renderHeaderCell(
        'rate',
        'Rate Per Piece',
        true,
        'Sort by egg rate'
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
