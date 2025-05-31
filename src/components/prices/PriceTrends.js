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
    isPositiveChange,
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
        <title>Today's Egg Rate in {location} - Daily NECC Price Updates {today}</title>
        <meta name="description" content={`Latest egg prices and NECC rates in ${location}. Today's egg rate: ₹${formatPrice(todayRate)} per piece. Compare today's egg price with wholesale rates, retail prices, and supermarket rates. Updated ${today} with live egg rates.`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": `Egg Rates in ${location}`,
            "description": `Live egg prices and NECC rates in ${location}. Compare today's egg price, wholesale rates, and retail prices.`,
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": todayRate,
              "highPrice": todayRate + 0.45,
              "priceCurrency": "INR",
              "offerCount": "4",
              "offers": [
                {
                  "@type": "Offer",
                  "price": todayRate,
                  "priceCurrency": "INR",
                  "itemCondition": "https://schema.org/NewCondition",
                  "availability": "https://schema.org/InStock",
                  "name": "NECC Wholesale Rate"
                },
                {
                  "@type": "Offer",
                  "price": todayRate + 0.35,
                  "priceCurrency": "INR",
                  "itemCondition": "https://schema.org/NewCondition",
                  "availability": "https://schema.org/InStock",
                  "name": "Retail Rate"
                }
              ]
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4">
              Today's Egg Rate in {location} - Live NECC Price Updates
            </h1>
            <p className="text-blue-100 text-center text-sm sm:text-base">
              Last Updated: {today} - Check Today's Egg Price
            </p>
          </div>
          
          <div className="p-6 sm:p-8 space-y-8">
            <section aria-labelledby="market-analysis" className="space-y-6">
              <h2 id="market-analysis" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Today's Egg Market Analysis for {location}
              </h2>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300">
                  Today's egg rate in {location} is currently at 
                  <span className="font-semibold text-blue-600 dark:text-blue-400"> ₹{formatPrice(todayRate)} </span> 
                  per piece. The NECC egg price today shows {isPositiveChange 
                    ? "an upward trend, with increased rates driven by higher production costs and market demand." 
                    : "a stabilizing trend with slightly decreased rates."} Compare today's egg price with wholesale rates and retail prices below.
                </p>
                
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  The current egg rate shows a {isPositiveChange ? "rise" : "decline"} of 
                  <span className={`font-semibold ${isPositiveChange ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {" "}₹{formatPrice(Math.abs(weeklyChange))} ({Math.abs(weeklyChangePercent)}%)
                  </span> from last week's NECC egg price. Daily egg rates and live updates help you track price changes in {location}'s egg market.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
                {/* Today's Rate Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
                             rounded-xl p-5 border border-blue-200 dark:border-blue-800
                             transform transition-all duration-300 hover:scale-105">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Today's Egg Rate</h3>
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
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">Today's Egg Tray Price (30 Eggs)</h3>
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
              <h2 id="price-details" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Today's Detailed Egg Price Information - NECC Rates
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Egg Price Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Today's Rate
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
              <h2 id="market-insights" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Live Egg Market Insights - Price Trends
              </h2>
              
              <div className="prose prose-lg dark:prose-invert max-w-none space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  The egg market in {location} shows {isPositiveChange ? 'increasing' : 'decreasing'} NECC rates. 
                  Today's egg price trends are influenced by several key factors affecting wholesale and retail rates:
                </p>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400">•</span>
                    <span>Daily egg rate fluctuations based on feed costs</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400">•</span>
                    <span>Live NECC price updates and market trends</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400">•</span>
                    <span>Seasonal variations in egg production</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400">•</span>
                    <span>Today's wholesale and retail market conditions</span>
                  </li>
                </ul>

                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  Stay updated with live egg rates and NECC price changes in {location}. Compare today's egg prices with historical data to make informed purchasing decisions. Whether you're looking for wholesale egg rates or retail prices, our daily updates provide comprehensive market information.
                </p>
              </div>
            </section>

            <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-gray-200">Note:</strong> All egg prices and NECC rates are sourced from official channels and local market surveys. 
                  Today's egg price may vary slightly based on location and vendor. Last updated: {today}. Check back daily for live egg rate updates.
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
