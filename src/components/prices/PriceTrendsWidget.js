import { formatPrice } from '../../utils/formatters';
import { memo } from 'react';

const PriceTrendsWidget = memo(({ today, todayRate, rate7DaysAgo }) => {
  const weeklyChange = rate7DaysAgo !== 'N/A' ? ((todayRate - rate7DaysAgo) / rate7DaysAgo * 100)?.tofixed(2) : 'N/A';
  const isPositiveChange = weeklyChange !== 'N/A' && parseFloat(weeklyChange) > 0;

  return (
    <div 
      className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 sm:p-8 mt-6 transform transition-all duration-300 hover:shadow-xl" 
      role="region" 
      aria-label="Price Trends Overview"
    >
      <div className="flex items-center justify-between mb-6">        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
          <span>Fresh Eggs in India Price Trends</span>
        </h2>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last 30 days</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Rate Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
                       rounded-xl p-5 transform transition-all duration-300 hover:shadow-md hover:scale-102
                       hover:-translate-y-1 border border-blue-100 dark:border-blue-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Farm Fresh Eggs Rate</h3>
            <span className="text-xs text-blue-600 dark:text-blue-300" aria-label={`Price as of ${today}`}>
              {today}
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100" 
               aria-label={`Today's price: ${formatPrice(todayRate)} rupees`}>
              ₹{formatPrice(todayRate)}
            </p>
            <span className="ml-2 text-sm text-blue-600 dark:text-blue-300">per piece</span>
          </div>
        </div>
        
        {/* 7 Days Ago Card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 
                       rounded-xl p-5 transform transition-all duration-300 hover:shadow-md hover:scale-102
                       hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">7 Days Ago</h3>
            <span className="text-xs text-gray-600 dark:text-gray-400" 
                  aria-label="Price from seven days ago">
              {new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100" 
               aria-label={`Price 7 days ago: ${formatPrice(rate7DaysAgo)} rupees`}>
              ₹{formatPrice(rate7DaysAgo)}
            </p>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">per piece</span>
          </div>
        </div>

        {/* Weekly Change Card */}
        {weeklyChange !== 'N/A' && (
          <div className={`rounded-xl p-5 transform transition-all duration-300 hover:shadow-md hover:scale-102
                          hover:-translate-y-1 border ${
            isPositiveChange 
              ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-100 dark:border-red-800' 
              : 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-100 dark:border-green-800'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Weekly Change</h3>
              <svg className={`w-5 h-5 ${
                isPositiveChange 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'}`} 
                   fill="none" 
                   stroke="currentColor" 
                   viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d={isPositiveChange 
                    ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                    : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"}
                />
              </svg>
            </div>
            <div className="flex items-baseline">
              <p className={`text-2xl sm:text-3xl font-bold ${
                isPositiveChange 
                  ? 'text-red-700 dark:text-red-400' 
                  : 'text-green-700 dark:text-green-400'
              }`} aria-label={`Price changed by ${weeklyChange}% in the last week`}>
                {isPositiveChange ? '+' : ''}{weeklyChange}%
              </p>
              <span className={`ml-2 text-sm ${
                isPositiveChange 
                  ? 'text-red-600 dark:text-red-300' 
                  : 'text-green-600 dark:text-green-300'
              }`}>
                from last week
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

PriceTrendsWidget.displayName = 'PriceTrendsWidget';

export default PriceTrendsWidget;
