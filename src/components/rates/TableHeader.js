import React from 'react';

const TableHeader = ({
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
  return (
    <tr style={{ backgroundColor: '#F9BE0C' }}>
      {(!selectedCity && showMarket) && (
        <th
          className="border border-gray-300 p-2 cursor-pointer hover:bg-yellow-500 transition-colors duration-200"
          onClick={() => requestSort('city')}
          role="columnheader"
          aria-sort={sortConfig.key === 'city' ? sortConfig.direction : 'none'}
        >
          <div className="flex items-center justify-between">
            <span>{showSpecialRates ? 'Market Location' : 'Market'}</span>
            <span className="text-xs ml-1">{getSortIcon('city')}</span>
          </div>
        </th>
      )}
      {showState && (
        <th
          className="border border-gray-300 p-2 cursor-pointer hover:bg-yellow-500 transition-colors duration-200"
          onClick={() => requestSort('state')}
          role="columnheader"
          aria-sort={sortConfig.key === 'state' ? sortConfig.direction : 'none'}
        >
          <div className="flex items-center justify-between">
            <span>State</span>
            <span className="text-xs ml-1">{getSortIcon('state')}</span>
          </div>
        </th>
      )}
      {showDate && (
        <th
          className="border border-gray-300 p-2 cursor-pointer hover:bg-yellow-500 transition-colors duration-200"
          onClick={() => requestSort('date')}
          role="columnheader"
          aria-sort={sortConfig.key === 'date' ? sortConfig.direction : 'none'}
        >
          <div className="flex items-center justify-between">
            <span>Date</span>
            <span className="text-xs ml-1">{getSortIcon('date')}</span>
          </div>
        </th>
      )}
      <th
        className="border border-gray-300 p-2 cursor-pointer hover:bg-yellow-500 transition-colors duration-200"
        onClick={() => requestSort('rate')}
        role="columnheader"
        aria-sort={sortConfig.key === 'rate' ? sortConfig.direction : 'none'}
      >
        <div className="flex items-center justify-between">
          <span>Rate Per Piece</span>
          <span className="text-xs ml-1">{getSortIcon('rate')}</span>
        </div>
      </th>
      {showPriceColumns && (
        <>
          <th 
            className="border border-gray-300 p-2"
            role="columnheader"
          >
            <div className="flex items-center justify-between">
              <span>Tray Price (30)</span>
              <span className="text-xs text-gray-500 ml-1" title="Calculated value">📊</span>
            </div>
          </th>
          {!showSpecialRates && (
            <>
              <th 
                className="border border-gray-300 p-2"
                role="columnheader"
              >
                <div className="flex items-center justify-between">
                  <span>Price (100 Pcs)</span>
                  <span className="text-xs text-gray-500 ml-1" title="Calculated value">📊</span>
                </div>
              </th>
              <th 
                className="border border-gray-300 p-2"
                role="columnheader"
              >
                <div className="flex items-center justify-between">
                  <span>Peti (210)</span>
                  <span className="text-xs text-gray-500 ml-1" title="Calculated value">📊</span>
                </div>
              </th>
            </>
          )}
        </>
      )}
      {showAdmin && (
        <th 
          className="border border-gray-300 p-2"
          role="columnheader"
        >Actions</th>
      )}
    </tr>
  );
};

export default TableHeader;
