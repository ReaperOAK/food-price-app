import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

const RateSummary = memo(({ 
  latestRate, 
  latestRateDate, 
  rateChange, 
  percentageChange, 
  trayPrice 
}) => {
  const containerClasses = useMemo(() => `
    bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
    p-4 sm:p-6 mb-4 rounded-lg
    shadow-md hover:shadow-lg
    transition-all duration-300
    border border-gray-100 dark:border-gray-700
  `.trim(), []);

  const cardClasses = useMemo(() => `
    bg-white dark:bg-gray-800
    p-4 rounded-lg
    shadow-sm hover:shadow
    transition-all duration-200
  `.trim(), []);

  const labelClasses = useMemo(() => `
    text-gray-600 dark:text-gray-400
    text-sm font-medium mb-1
  `.trim(), []);

  const getPriceChangeColor = (change) => {
    if (change > 0) return 'text-red-600 dark:text-red-400';
    if (change < 0) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const priceChangeClasses = `text-xl sm:text-2xl font-bold ${getPriceChangeColor(rateChange)}`;
  
  // Format rate change for screen readers
  const rateChangeText = rateChange === 0 
    ? 'Price unchanged' 
    : `Price ${rateChange > 0 ? 'increased' : 'decreased'} by ₹${Math.abs(rateChange)?.tofixed(2)} (${Math.abs(percentageChange)?.tofixed(1)}%)`;

  return (
    <div 
      className={containerClasses}
      role="region" 
      aria-label="Price Summary"
    >
      <time 
        dateTime={new Date(latestRateDate).toISOString()}
        className="text-sm text-gray-600 dark:text-gray-400 mb-3 block font-medium"
      >
        Last Updated: {latestRateDate}
      </time>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={cardClasses}>
          <div className={labelClasses}>Current Rate</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100" aria-label={`Current rate: ₹${latestRate?.tofixed(2)}`}>
            ₹{latestRate?.tofixed(2)}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">per piece</span>
          </div>
        </div>

        <div 
          className={`${cardClasses} ${
            rateChange !== 0 
              ? rateChange > 0 
                ? 'bg-red-50 dark:bg-red-900/10' 
                : 'bg-green-50 dark:bg-green-900/10'
              : ''
          }`}
        >
          <div className={labelClasses}>Price Change</div>
          <div 
            className={priceChangeClasses}
            aria-label={rateChangeText}
          >
            {rateChange > 0 ? '+' : ''}{rateChange?.tofixed(2)}
            <span className="text-sm ml-1">({percentageChange > 0 ? '+' : ''}{percentageChange?.tofixed(1)}%)</span>
          </div>
        </div>

        <div className={cardClasses}>
          <div className={labelClasses}>Tray Price</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100" aria-label={`Tray price: ₹${trayPrice?.tofixed(2)}`}>
            ₹{trayPrice?.tofixed(2)}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(30 eggs)</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        * Prices are updated daily based on market rates
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
