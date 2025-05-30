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
  // Enhanced SEO description
  const locationDescription = selectedCity 
    ? `${selectedCity}, ${selectedState}`
    : selectedState || 'India';

  return (
    <section className="max-w-4xl mx-auto mb-8 px-4 sm:px-6 lg:px-8" aria-label="Price Overview">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        <div 
          className="bg-gradient-to-r from-blue-800 to-blue-900 p-6 min-h-[180px] flex flex-col justify-center"
          style={{ 
            willChange: 'transform', 
            containIntrinsicSize: '0 180px', 
            contentVisibility: 'auto' 
          }}
        >
          <h1 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-3"
          >
            {getUniqueH1(selectedCity, selectedState)}
          </h1>
          <p className="text-center text-white text-base sm:text-lg font-medium mb-2">
            Updated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
          <p className="text-center text-blue-100 text-sm sm:text-base">
            {selectedCity 
              ? `Latest wholesale and retail prices for ${locationDescription}`
              : selectedState
                ? `Compare rates across ${locationDescription} cities`
                : 'Daily NECC rates from major Indian cities'
            }
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Today's Rate Card */}
            <div className="bg-blue-50 rounded-lg p-4 transition-transform duration-300 hover:scale-102 hover:bg-blue-100">
              <h2 className="text-sm font-semibold text-blue-900 mb-2">Today's Rate</h2>
              <p className="text-lg sm:text-xl font-bold text-blue-900">
                <span className="sr-only">Price:</span>
                ₹{formatPrice(todayRate)}
              </p>
            </div>

            {/* Tray Price Card */}
            <div className="bg-green-50 rounded-lg p-4 transition-transform duration-300 hover:scale-102 hover:bg-green-100">
              <h2 className="text-sm font-semibold text-green-900 mb-2">Tray Price</h2>
              <p className="text-lg sm:text-xl font-bold text-green-900">
                <span className="sr-only">Tray Price:</span>
                ₹{formatPrice(trayPrice)}
              </p>
            </div>

            {/* Weekly Change Card */}
            <div className="bg-gray-50 rounded-lg p-4 transition-transform duration-300 hover:scale-102 hover:bg-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Weekly Change</h2>
              <p className={`text-lg sm:text-xl font-bold ${
                weeklyChange > 0 
                  ? 'text-green-700' 
                  : weeklyChange < 0 
                    ? 'text-red-700' 
                    : 'text-gray-900'
              }`}>
                <span className="sr-only">Weekly Change:</span>
                {weeklyChange !== 'N/A' 
                  ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange}%` 
                  : 'N/A'
                }
              </p>
            </div>

            {/* 30-Day Average Card */}
            <div className="bg-purple-50 rounded-lg p-4 transition-transform duration-300 hover:scale-102 hover:bg-purple-100">
              <h2 className="text-sm font-semibold text-purple-900 mb-2">30-Day Avg</h2>
              <p className="text-lg sm:text-xl font-bold text-purple-900">
                <span className="sr-only">30 Day Average:</span>
                ₹{formatPrice(averagePrice)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

PriceOverview.displayName = 'PriceOverview';

export default PriceOverview;
