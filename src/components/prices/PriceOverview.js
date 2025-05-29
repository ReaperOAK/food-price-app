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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
        <div 
          className="bg-gradient-to-r from-blue-700 to-blue-800 p-6 min-h-[200px] flex flex-col justify-center"
          style={{ 
            willChange: 'transform', 
            containIntrinsicSize: '0 200px', 
            contentVisibility: 'auto' 
          }}
        >
          <h1 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4 h-auto sm:h-12"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
          >
            {getUniqueH1()}
          </h1>
          <p className="text-center text-white text-lg sm:text-xl font-semibold mb-2">
            Current Rates for {displayName}
          </p>
          <p className="text-center text-white text-sm sm:text-base opacity-95">
            {selectedCity 
              ? `Get the latest egg rates for ${locationDescription}. Updated daily with wholesale and retail prices.`
              : selectedState
                ? `Check current egg prices across ${locationDescription}. Compare rates from different cities.`
                : 'Track egg prices across India with our daily updated NECC rates from major cities.'
            }
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gray-50 rounded-lg p-4 transition-transform hover:scale-105">
              <h2 className="text-sm font-medium text-gray-800 mb-2">Today's Rate</h2>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                <span className="sr-only">Price:</span>
                ₹{formatPrice(todayRate)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 transition-transform hover:scale-105">
              <h2 className="text-sm font-medium text-gray-800 mb-2">Tray Price</h2>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                <span className="sr-only">Tray Price:</span>
                ₹{formatPrice(trayPrice)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 transition-transform hover:scale-105">
              <h2 className="text-sm font-medium text-gray-800 mb-2">Weekly Change</h2>
              <p className={`text-lg sm:text-xl font-bold ${
                weeklyChange > 0 
                  ? 'text-green-800' 
                  : weeklyChange < 0 
                    ? 'text-red-800' 
                    : 'text-gray-900'
              }`}>
                <span className="sr-only">Weekly Change:</span>
                {weeklyChange !== 'N/A' 
                  ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange}%` 
                  : 'N/A'
                }
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 transition-transform hover:scale-105">
              <h2 className="text-sm font-medium text-gray-800 mb-2">30-Day Avg</h2>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
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
