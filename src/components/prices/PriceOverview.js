import { formatPrice } from '../../utils/formatters';
import { memo } from 'react';

const PriceOverview = memo(({
  getUniqueH1,
  displayName,
  selectedCity,
  selectedState,
  todayRate,
  trayPrice,
  weeklyChange,
  averagePrice
}) => {
  const locationDescription = selectedCity 
    ? `${selectedCity}, ${selectedState}`
    : selectedState || 'India';

  return (
    <section 
      className="max-w-5xl mx-auto mb-8 px-4 sm:px-6 lg:px-8"
      aria-label="Price Overview"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
      >
        <div 
          className="bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 p-8 min-h-[200px] flex flex-col justify-center relative overflow-hidden"
          style={{ 
            willChange: 'transform', 
            containIntrinsicSize: '0 200px', 
            contentVisibility: 'auto' 
          }}
        >
          {/* Decorative background pattern - low opacity for subtle effect */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
              <rect width="100" height="100" fill="url(#grid)"/>
            </svg>
          </div>

          <h1 
            className="relative text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center mb-4 tracking-tight"
          >
            {getUniqueH1(selectedCity, selectedState)}
          </h1>
          <p className="relative text-center text-blue-100 text-lg sm:text-xl font-medium mb-2">
            Updated {new Date().toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </p>          <p className="relative text-center text-blue-200 text-base sm:text-lg">
            {selectedCity 
              ? `Latest farm fresh eggs in India wholesale and retail prices for ${locationDescription}`
              : selectedState
                ? `Compare organic eggs and brown egg varieties rates across ${locationDescription} cities`
                : 'Daily NECC fresh eggs in India rates from major Indian cities'
            }
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Today's Rate Card */}
            <div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
                         rounded-xl p-5 transition-all duration-300 hover:shadow-md hover:scale-102
                         transform hover:-translate-y-1 border border-blue-100 dark:border-blue-800"
            >
              <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Today's Rate</h2>
              <div className="flex items-baseline">
                <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
                  <span className="sr-only">Price:</span>
                  ₹{formatPrice(todayRate)}
                </p>
                <span className="ml-2 text-sm text-blue-600 dark:text-blue-300">per piece</span>
              </div>
            </div>

            {/* Tray Price Card */}
            <div 
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 
                         rounded-xl p-5 transition-all duration-300 hover:shadow-md hover:scale-102
                         transform hover:-translate-y-1 border border-green-100 dark:border-green-800"
            >
              <h2 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Tray Price</h2>
              <div className="flex items-baseline">
                <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">
                  <span className="sr-only">Tray Price:</span>
                  ₹{formatPrice(trayPrice)}
                </p>
                <span className="ml-2 text-sm text-green-600 dark:text-green-300">per tray</span>
              </div>
            </div>

            {/* Weekly Change Card */}
            <div 
              className={`bg-gradient-to-br rounded-xl p-5 transition-all duration-300 hover:shadow-md hover:scale-102
                         transform hover:-translate-y-1 border ${
                weeklyChange > 0 
                  ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-100 dark:border-red-800' 
                  : weeklyChange < 0 
                    ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-100 dark:border-green-800'
                    : 'from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-700'
              }`}
            >
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Weekly Change</h2>
              <div className="flex items-baseline">
                <p className={`text-2xl sm:text-3xl font-bold ${
                  weeklyChange > 0 
                    ? 'text-red-700 dark:text-red-400' 
                    : weeklyChange < 0 
                      ? 'text-green-700 dark:text-green-400' 
                      : 'text-gray-700 dark:text-gray-300'
                }`}>
                  <span className="sr-only">Weekly Change:</span>
                  {weeklyChange !== 'N/A' 
                    ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange}%` 
                    : 'N/A'
                  }
                </p>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">from last week</span>
              </div>
            </div>

            {/* 30-Day Average Card */}
            <div 
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 
                         rounded-xl p-5 transition-all duration-300 hover:shadow-md hover:scale-102
                         transform hover:-translate-y-1 border border-purple-100 dark:border-purple-800"
            >
              <h2 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">30-Day Avg</h2>
              <div className="flex items-baseline">
                <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">
                  <span className="sr-only">30 Day Average:</span>
                  ₹{formatPrice(averagePrice)}
                </p>
                <span className="ml-2 text-sm text-purple-600 dark:text-purple-300">per piece</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

PriceOverview.displayName = 'PriceOverview';

export default PriceOverview;
