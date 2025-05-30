import { formatPrice } from '../../utils/formatters';
import { memo, useMemo } from 'react';

const PriceTrends = memo(({ selectedCity, selectedState, eggRates }) => {
  const location = selectedCity || selectedState || 'India';

  const {
    todayRate,
    weeklyChange,
    weeklyChangePercent,
    averagePrice,
    trayPrice,
  } = useMemo(() => {
    const today = eggRates.length > 0 ? eggRates[0].rate : 'N/A';
    const change = eggRates.length > 7 ? (eggRates[0].rate - eggRates[6].rate).toFixed(2) : 'N/A';
    const changePercent = eggRates.length > 7 ? ((eggRates[0].rate - eggRates[6].rate) / eggRates[6].rate * 100).toFixed(2) : 'N/A';
    const avgPrice = eggRates.length > 0 ? (eggRates.reduce((sum, rate) => sum + rate.rate, 0) / eggRates.length).toFixed(2) : 'N/A';
    const tray = today !== 'N/A' ? (today * 30).toFixed(2) : 'N/A';

    return {
      todayRate: today,
      weeklyChange: change,
      weeklyChangePercent: changePercent,
      averagePrice: avgPrice,
      trayPrice: tray
    };
  }, [eggRates]);

  const isPositiveChange = weeklyChange !== 'N/A' && parseFloat(weeklyChange) > 0;
  const isNegativeChange = weeklyChange !== 'N/A' && parseFloat(weeklyChange) < 0;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 sm:p-8 mt-8 transform transition-all duration-300 hover:shadow-xl">
      <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-800 dark:text-gray-100 text-center tracking-tight">
        Egg Price Trends in {location}
      </h2>
      
      <section className="mb-10" aria-label="Price Analysis">
        <h3 className="text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
          Market Overview - {location}
        </h3>
        <div className="prose dark:prose-invert max-w-none">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 leading-relaxed">
              As per the latest report, the egg rate in {location} has reached{' '}
              <strong className="text-blue-900 dark:text-blue-100">₹{formatPrice(todayRate)}</strong> per piece.
              The price fluctuations are primarily influenced by feed costs, which have seen a{' '}
              <span className="text-blue-900 dark:text-blue-100">10% increase recently</span>.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10" aria-label="Today's Egg Rate">
        <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
          Today's Egg Rate in {location}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
                         rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">Today's Rate</h4>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">₹{formatPrice(todayRate)}</p>
          </div>
          
          <div className={`rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
            isPositiveChange ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-100 dark:border-red-800' : 
            isNegativeChange ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-100 dark:border-green-800' : 
            'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200 dark:border-gray-700'
          }`}>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Weekly Change</h4>
            <p className={`text-3xl font-bold ${
              isPositiveChange ? 'text-red-900 dark:text-red-100' : 
              isNegativeChange ? 'text-green-900 dark:text-green-100' : 
              'text-gray-900 dark:text-gray-100'
            }`}>
              {weeklyChangePercent !== 'N/A' ? `${isPositiveChange ? '+' : ''}${weeklyChangePercent}%` : 'N/A'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 
                         rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-purple-100 dark:border-purple-800">
            <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3">30-Day Average</h4>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">₹{formatPrice(averagePrice)}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden" aria-label="Detailed Price Information">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  { label: 'Wholesale Price', value: todayRate, description: 'Base price for bulk purchases' },
                  { label: 'Retail Price', value: todayRate + 0.35, description: 'Price at local stores' },
                  { label: 'Supermarket Price', value: todayRate + 0.45, description: 'Price at major supermarkets' },
                  { label: 'Tray Price (30 eggs)', value: trayPrice, description: 'Wholesale price for a full tray' },
                ].map(({ label, value, description }) => (
                  <tr key={label} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ₹{formatPrice(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-8 prose dark:prose-invert max-w-none">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-100 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 italic">
            Note: This is not the NECC official website. Prices are collected from NECC for informational purposes only.
            Suggested prices are published solely for reference. Neither NECC nor EggRate.in enforces compliance with these prices.
          </p>
        </div>
      </section>
    </div>
  );
});

PriceTrends.displayName = 'PriceTrends';

export default PriceTrends;
