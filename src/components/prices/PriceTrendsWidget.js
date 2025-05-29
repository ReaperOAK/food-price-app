import { formatPrice } from '../../utils/formatters';
import { memo } from 'react';

const PriceTrendsWidget = memo(({ today, todayRate, rate7DaysAgo }) => {
  const weeklyChange = rate7DaysAgo !== 'N/A' ? ((todayRate - rate7DaysAgo) / rate7DaysAgo * 100).toFixed(2) : 'N/A';
  const isPositiveChange = weeklyChange !== 'N/A' && parseFloat(weeklyChange) > 0;
  const isNegativeChange = weeklyChange !== 'N/A' && parseFloat(weeklyChange) < 0;

  return (
    <div className="p-4 sm:p-6 mt-4 sm:mt-6 bg-white shadow-lg rounded-lg transform transition-all duration-300 hover:shadow-xl dark:bg-gray-800" role="region" aria-label="Price Trends Overview">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
        <span className="mr-2">Price Trends</span>
        <span className="text-sm font-normal text-gray-600 dark:text-gray-300">Last 30 days</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transform transition-all duration-300 hover:scale-102 focus-within:ring-2 focus-within:ring-blue-500" tabIndex="0">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">Today's Rate</h3>
            <span className="text-xs text-gray-600 dark:text-gray-300" aria-label={`Price as of ${today}`}>{today}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-2" aria-label={`Today's price: ${formatPrice(todayRate)} rupees`}>
            ₹{formatPrice(todayRate)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Per egg</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transform transition-all duration-300 hover:scale-102 focus-within:ring-2 focus-within:ring-blue-500" tabIndex="0">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">7 Days Ago</h3>
            <span className="text-xs text-gray-600 dark:text-gray-300" aria-label="Price from seven days ago">
              {new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString()}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-2" aria-label={`Price 7 days ago: ${formatPrice(rate7DaysAgo)} rupees`}>
            ₹{formatPrice(rate7DaysAgo)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Per egg</p>
        </div>

        {weeklyChange !== 'N/A' && (
          <div className={`sm:col-span-2 rounded-lg p-4 ${
            isPositiveChange ? 'bg-red-50 dark:bg-red-900/20' : 
            isNegativeChange ? 'bg-green-50 dark:bg-green-900/20' : 
            'bg-gray-50 dark:bg-gray-700'
          }`}>
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">Weekly Change</h3>
            <p className={`text-2xl font-bold mt-2 ${
              isPositiveChange ? 'text-red-600 dark:text-red-400' : 
              isNegativeChange ? 'text-green-600 dark:text-green-400' : 
              'text-gray-900 dark:text-gray-50'
            }`} aria-label={`Price changed by ${weeklyChange}% in the last week`}>
              {isPositiveChange ? '+' : ''}{weeklyChange}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

PriceTrendsWidget.displayName = 'PriceTrendsWidget';

export default PriceTrendsWidget;
