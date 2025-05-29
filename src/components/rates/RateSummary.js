import React, { memo } from 'react';
import PropTypes from 'prop-types';

const RateSummary = memo(({ latestRate, latestRateDate, rateChange, percentageChange, trayPrice }) => {
  // Format rate change for screen readers
  const rateChangeText = `${rateChange >= 0 ? 'Increased by' : 'Decreased by'} ₹${Math.abs(rateChange).toFixed(2)} (${Math.abs(percentageChange).toFixed(1)}%)`;

  return (
    <div 
      className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 mb-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
      role="region" 
      aria-label="Price Summary"
    >
      <time 
        dateTime={new Date(latestRateDate).toISOString()}
        className="text-sm text-gray-600 dark:text-gray-400 mb-2 block font-medium"
      >
        Last Updated: {latestRateDate}
      </time>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow transition-all duration-200">
          <div className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Current Rate</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100" aria-label={`Current rate: ₹${latestRate.toFixed(2)}`}>
            ₹{latestRate.toFixed(2)}
            <span className="text-xs text-gray-500 ml-1">per piece</span>
          </div>
        </div>

        <div 
          className={`bg-white p-4 rounded-lg shadow-sm hover:shadow transition-all duration-200 ${
            rateChange >= 0 ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'
          }`}
        >
          <div className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Price Change</div>
          <div 
            className={`text-xl sm:text-2xl font-bold ${
              rateChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
            aria-label={rateChangeText}
          >
            {rateChange >= 0 ? '+' : ''}{rateChange.toFixed(2)}
            <span className="text-sm ml-1">({percentageChange.toFixed(1)}%)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow transition-all duration-200">
          <div className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Tray Price</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100" aria-label={`Tray price for 30 eggs: ₹${trayPrice.toFixed(2)}`}>
            ₹{trayPrice.toFixed(2)}
            <span className="text-xs text-gray-500 ml-1">(30 eggs)</span>
          </div>
        </div>
      </div>
    </div>
  );
});

RateSummary.propTypes = {
  latestRate: PropTypes.number.isRequired,
  latestRateDate: PropTypes.string.isRequired,
  rateChange: PropTypes.number.isRequired,
  percentageChange: PropTypes.number.isRequired,
  trayPrice: PropTypes.number.isRequired
};

RateSummary.displayName = 'RateSummary';

export default RateSummary;
