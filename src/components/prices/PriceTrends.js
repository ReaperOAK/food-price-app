import { formatPrice } from '../../utils/formatters';
import { memo, useMemo } from 'react';
import { Helmet } from 'react-helmet';

const PriceTrends = memo(({ selectedCity, selectedState, eggRates }) => {
  const location = selectedCity || selectedState || 'your area';
  
  // Memoize calculations for performance
  const {
    todayRate,
    rate7DaysAgo,
    weeklyChange,
    weeklyChangePercent,
    averagePrice,
    isPositiveChange,
    monthlyTrend
  } = useMemo(() => {
    const todayRate = eggRates.length > 0 ? eggRates[0].rate : 'N/A';
    const rate7DaysAgo = eggRates.length > 7 ? eggRates[6].rate : 'N/A';
    const weeklyChange = eggRates.length > 7 ? (eggRates[0].rate - eggRates[6].rate).toFixed(2) : 'N/A';
    const weeklyChangePercent = eggRates.length > 7 ? ((eggRates[0].rate - eggRates[6].rate) / eggRates[6].rate * 100).toFixed(2) : 'N/A';
    const averagePrice = eggRates.length > 0 ? (eggRates.reduce((sum, rate) => sum + rate.rate, 0) / eggRates.length).toFixed(2) : 'N/A';
    const isPositiveChange = weeklyChange !== 'N/A' && parseFloat(weeklyChange) > 0;
    const monthlyTrend = eggRates.length > 30 ? eggRates.slice(0, 30).map(rate => rate.rate) : [];
    
    return {
      todayRate,
      rate7DaysAgo,
      weeklyChange,
      weeklyChangePercent,
      averagePrice,
      isPositiveChange,
      monthlyTrend
    };
  }, [eggRates]);

  // Format today's date consistently
  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Egg Price Trends in {location} - {today}</title>
        <meta name="description" content={`Latest egg price trends and analysis for ${location}. Today's rate: ₹${formatPrice(todayRate)} per piece. Weekly change: ${weeklyChangePercent}%. Updated ${today}.`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Eggs",
            "description": `Egg prices and trends in ${location}`,
            "offers": {
              "@type": "Offer",
              "price": todayRate,
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4">
              Egg Price Trends in {location}
            </h2>
            <p className="text-blue-100 text-center text-sm sm:text-base">
              Updated on {today}
            </p>
          </div>
          
          <div className="p-6 sm:p-8 space-y-8">
            <section aria-labelledby="market-analysis" className="space-y-6">
              <h3 id="market-analysis" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Market Analysis for {location}
              </h3>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300">
                  As per the latest report, the egg rate in {location} has reached 
                  <span className="font-semibold text-blue-600 dark:text-blue-400"> ₹{formatPrice(todayRate)} </span> 
                  per piece. {isPositiveChange 
                    ? "This indicates an upward trend in prices, primarily driven by increased production costs and market demand." 
                    : "The market is showing signs of stabilization with a slight decrease in prices."}
                </p>
                
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  The recent trend shows a {isPositiveChange ? "rise" : "decline"} of 
                  <span className={`font-semibold ${isPositiveChange ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {" "}₹{formatPrice(Math.abs(weeklyChange))} ({Math.abs(weeklyChangePercent)}%)
                  </span> compared to last week's prices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
                {/* Today's Rate Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
                             rounded-xl p-5 border border-blue-200 dark:border-blue-800
                             transform transition-all duration-300 hover:scale-105">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Today's Rate</h4>
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
                      ₹{formatPrice(todayRate)}
                    </span>
                    <span className="ml-2 text-sm text-blue-600 dark:text-blue-300">per piece</span>
                  </div>
                </div>

                {/* Weekly Change Card */}
                <div className={`bg-gradient-to-br rounded-xl p-5 border
                              transform transition-all duration-300 hover:scale-105
                              ${isPositiveChange 
                                ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800' 
                                : 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800'
                              }`}>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Weekly Change</h4>
                  <div className="flex items-baseline">
                    <span className={`text-2xl sm:text-3xl font-bold ${
                      isPositiveChange 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {isPositiveChange ? '+' : ''}{weeklyChangePercent}%
                    </span>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">vs last week</span>
                  </div>
                </div>

                {/* Tray Price Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 
                             rounded-xl p-5 border border-purple-200 dark:border-purple-800
                             transform transition-all duration-300 hover:scale-105">
                  <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">Tray Price (30 Eggs)</h4>
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">
                      ₹{formatPrice(todayRate * 30)}
                    </span>
                    <span className="ml-2 text-sm text-purple-600 dark:text-purple-300">per tray</span>
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="price-details" className="mt-8">
              <h3 id="price-details" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Detailed Price Information
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">Today's Rate</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">₹{formatPrice(todayRate)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">Last Week's Rate</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">₹{formatPrice(rate7DaysAgo)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">Wholesale Price</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">₹{formatPrice(todayRate)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">Retail Price</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">₹{formatPrice(todayRate + 0.35)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">Supermarket Price</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">₹{formatPrice(todayRate + 0.45)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="market-insights" className="mt-8">
              <h3 id="market-insights" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Market Insights
              </h3>
              
              <div className="prose prose-lg dark:prose-invert max-w-none space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  The egg market in {location} has shown {isPositiveChange ? 'an upward' : 'a downward'} trend in recent weeks. 
                  Key factors influencing current prices include:
                </p>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400">•</span>
                    <span>Feed costs (corn and soybean prices)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400">•</span>
                    <span>Transportation and logistics</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400">•</span>
                    <span>Seasonal demand variations</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400">•</span>
                    <span>Market supply conditions</span>
                  </li>
                </ul>
              </div>
            </section>

            <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-gray-200">Note:</strong> All prices are sourced from NECC and local market surveys. 
                  Prices may vary slightly based on location and vendor. Last updated: {today}
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
});

PriceTrends.displayName = 'PriceTrends';

export default PriceTrends;
