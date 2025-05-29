import { formatPrice } from '../../utils/formatters';
import { memo, useMemo } from 'react';

const PriceTrends = memo(({ selectedCity, selectedState, eggRates }) => {
  const location = selectedCity || selectedState || 'your area';

  const {
    todayRate,
    weeklyChange,
    weeklyChangePercent,
    averagePrice,
    trayPrice,
  } = useMemo(() => {
    const today = eggRates.length > 0 ? eggRates[0].rate : 'N/A';
    const sevenDaysAgo = eggRates.length > 7 ? eggRates[6].rate : 'N/A';
    const change = eggRates.length > 7 ? (eggRates[0].rate - eggRates[6].rate).toFixed(2) : 'N/A';
    const changePercent = eggRates.length > 7 ? ((eggRates[0].rate - eggRates[6].rate) / eggRates[6].rate * 100).toFixed(2) : 'N/A';
    const avgPrice = eggRates.length > 0 ? (eggRates.reduce((sum, rate) => sum + rate.rate, 0) / eggRates.length).toFixed(2) : 'N/A';
    const tray = today !== 'N/A' ? today * 30 : 'N/A';

    return {
      todayRate: today,
      rate7DaysAgo: sevenDaysAgo,
      weeklyChange: change,
      weeklyChangePercent: changePercent,
      averagePrice: avgPrice,
      trayPrice: tray
    };
  }, [eggRates]);

  const isPositiveChange = weeklyChange !== 'N/A' && parseFloat(weeklyChange) > 0;
  const isNegativeChange = weeklyChange !== 'N/A' && parseFloat(weeklyChange) < 0;

  return (
    <div className="p-4 sm:p-6 mt-4 sm:mt-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        Egg Price Trends in {location}
      </h2>
      
      <section className="mb-8" aria-label="Price Analysis">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Market Overview - {location}</h3>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-4">
            As per the latest report, the egg rate in {location} has reached ₹{formatPrice(todayRate)} per piece.
            The price fluctuations are primarily influenced by feed costs, which have seen a 10% increase recently.
          </p>
        </div>
      </section>

      <section className="mb-8 overflow-x-auto" aria-label="Price Details">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Today's Egg Rate in {location}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Today's Rate</h4>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">₹{formatPrice(todayRate)}</p>
          </div>
          
          <div className={`rounded-lg p-4 ${
            isPositiveChange ? 'bg-red-50 dark:bg-red-900/20' : 
            isNegativeChange ? 'bg-green-50 dark:bg-green-900/20' : 
            'bg-gray-50 dark:bg-gray-700'
          }`}>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Weekly Change</h4>
            <p className={`text-2xl font-bold ${
              isPositiveChange ? 'text-red-900 dark:text-red-100' : 
              isNegativeChange ? 'text-green-900 dark:text-green-100' : 
              'text-gray-900 dark:text-gray-100'
            }`}>
              {weeklyChangePercent !== 'N/A' ? `${isPositiveChange ? '+' : ''}${weeklyChangePercent}%` : 'N/A'}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">30-Day Average</h4>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">₹{formatPrice(averagePrice)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { label: 'Wholesale Price', value: todayRate },
                { label: 'Retail Price', value: todayRate + 0.35 },
                { label: 'Supermarket Price', value: todayRate + 0.45 },
                { label: 'Tray Price (30 eggs)', value: trayPrice },
              ].map(({ label, value }) => (
                <tr key={label} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{label}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">₹{formatPrice(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Note: This is not the NECC official website. Prices are collected from NECC for informational purposes only.
          Suggested prices are published solely for reference. Neither NECC nor EggRate.in enforces compliance with these prices.
        </p>
      </section>
    </div>
  );
});

PriceTrends.displayName = 'PriceTrends';

export default PriceTrends;
