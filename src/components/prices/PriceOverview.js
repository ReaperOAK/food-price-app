import { formatPrice } from '../../utils/formatters';

const PriceOverview = ({
  getUniqueH1,
  displayName,
  selectedCity,
  selectedState,
  todayRate,
  trayPrice,
  weeklyChange,
  averagePrice
}) => {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 min-h-[200px] flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-white text-center mb-4" style={{ minHeight: '48px', height: '48px' }}>
            {getUniqueH1()}
          </h1>
          <p className="text-center text-white text-xl font-semibold mb-2" style={{ minHeight: '32px', height: '32px' }}>
            Current Rates for {displayName}
          </p>
          <p className="text-center text-white opacity-90" style={{ minHeight: '48px', height: '48px' }}>
            {selectedCity 
              ? `Get the latest egg rates for ${selectedCity}. Updated daily with wholesale and retail prices.`
              : selectedState
                ? `Check current egg prices across ${selectedState}. Compare rates from different cities.`
                : 'Track egg prices across India with our daily updated NECC rates from major cities.'
            }
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">          <div className="text-center py-4" style={{ minHeight: '80px', height: '80px' }}>
              <h2 className="text-sm text-gray-700 mb-2" style={{ minHeight: '16px', height: '16px' }}>Today's Rate</h2>
              <p className="text-xl font-semibold text-gray-900" style={{ height: '32px' }}>₹{formatPrice(todayRate)}</p>
            </div>
            <div className="text-center py-4" style={{ minHeight: '80px', height: '80px' }}>              <h2 className="text-sm text-gray-700 mb-2" style={{ minHeight: '16px', height: '16px' }}>Tray Price</h2>
              <p className="text-xl font-semibold text-gray-900" style={{ height: '32px' }}>₹{formatPrice(trayPrice)}</p>
            </div>
            <div className="text-center py-4" style={{ minHeight: '80px', height: '80px' }}>              <h2 className="text-sm text-gray-700 mb-2" style={{ minHeight: '16px', height: '16px' }}>Weekly Change</h2>
              <p className={`text-xl font-semibold ${weeklyChange > 0 ? 'text-green-700' : 'text-red-700'}`} style={{ height: '32px' }}>
                {weeklyChange !== 'N/A' ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange}` : 'N/A'}
              </p>
            </div>
            <div className="text-center py-4" style={{ minHeight: '80px', height: '80px' }}>
              <h3 className="text-sm text-gray-700 mb-2" style={{ minHeight: '16px', height: '16px' }}>30-Day Avg</h3>
              <p className="text-xl font-semibold text-gray-900" style={{ height: '32px' }}>₹{formatPrice(averagePrice)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceOverview;
