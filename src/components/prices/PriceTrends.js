import { formatPrice } from '../../utils/formatters';
import { memo, useMemo } from 'react';
import { Helmet } from 'react-helmet';

const PriceTrends = memo(({ selectedCity, selectedState, eggRates }) => {
  const location = selectedCity || selectedState || 'your area';
  
  // Memoize calculations for performance
  const {
    todayRate,
    rate7DaysAgo,
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
    <>      <Helmet>
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
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-6 sm:p-8">            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-4">
              Egg Price Trends in {location}
            </h1>
            <p className="text-blue-100 text-center text-sm sm:text-base">
              Last Updated: {today} - Daily Egg Rate Analysis & Market Insights
            </p>
          </div>
          
          <div className="p-6 sm:p-8 space-y-8">
            <section aria-labelledby="market-analysis" className="space-y-6">              <h2 id="market-analysis" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {location}
              </h2>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300">
                  As per the latest report, the egg rate in {location} has reached ₹{formatPrice(todayRate)} per piece. But this is not the highest price for eggs in the city in the last one year. The price of eggs has been on the rise in the city for the last few months. The rise in the price of eggs is due to the increase in the cost of chicken feed. The cost of chicken feed has gone up by 10% in the last few months. This has led to an increase in the price of eggs in {location}.
                </p>
                
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  Egg prices in {location} have been on the rise in recent months, due to a variety of factors. The cost of feed, transportation, and labor have all increased, leading to higher prices at the farm gate. Consumers are now paying more for eggs, with the average price of a tray of eggs now exceeding ₹{formatPrice(todayRate * 30)}. This is a significant increase from just a few years ago, when a tray of eggs could be purchased for as little as ₹{formatPrice(todayRate * 30 - 20)}. The higher prices are having an impact on egg consumption in {location}, as many families are cutting back on their consumption of this staple food. While the current situation is difficult for consumers, it is important to remember that egg prices are still relatively low compared to other staples such as rice and wheat.
                </p>

                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  The current egg price situation in {location} is not likely to change in the near future, as the cost of production is still high. However, as the industry adjusts to the new reality of higher prices, egg production is likely to increase, which could help to bring prices down over time. In the meantime, consumers will need to continue to pay more for their eggs.
                </p>

                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  Poultry farmers in {location} said they are incurring losses as the cost of chicken feed accounts for around 60 percent of the total cost of production.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
                {/* Today's Rate Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
                             rounded-xl p-5 border border-blue-200 dark:border-blue-800
                             transform transition-all duration-300 hover:scale-105">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">NECC Egg Rate Today</h3>
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
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">NECC Egg Tray Rate Today (30 Eggs)</h3>
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">
                      ₹{formatPrice(todayRate * 30)}
                    </span>
                    <span className="ml-2 text-sm text-purple-600 dark:text-purple-300">per tray</span>
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="price-details" className="mt-8">              <h2 id="price-details" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                NECC Egg Rate Today - Detailed Price Information & Live Updates
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        NECC Egg Rate Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Today's NECC Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">NECC Rate Today</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">₹{formatPrice(todayRate)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">Last Week's NECC Rate</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">₹{formatPrice(rate7DaysAgo)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">NECC Wholesale Rate Today</td>
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

            <section aria-labelledby="market-insights" className="mt-8">              <h2 id="market-insights" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                NECC Egg Rate Market Insights - Today's Price Trends & Analysis
              </h2>
              
              <div className="prose prose-lg dark:prose-invert max-w-none space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  The NECC egg rate market in {location} shows {isPositiveChange ? 'increasing' : 'decreasing'} rates today. 
                  Current egg rate today and NECC egg price trends are influenced by key factors affecting today's egg rate, daily egg rate fluctuations, and live market conditions:
                </p>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400">•</span>
                    <span>Today egg rate fluctuations based on feed costs</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400">•</span>
                    <span>Live NECC egg rate updates and market trends</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400">•</span>
                    <span>Daily egg rate seasonal production variations</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400">•</span>
                    <span>NECC rate today wholesale and retail conditions</span>
                  </li>
                </ul>                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  Stay updated with live NECC egg rates and today's egg rate changes in {location}. Compare today's egg rate with historical data to make informed purchasing decisions. Whether you're looking for NECC egg rate today, daily egg rate updates, or today egg rate information, our live updates provide comprehensive market data and current egg pricing.
                </p>
              </div>
            </section>

            <section aria-labelledby="todays-rate" className="mt-8">
              <h2 id="todays-rate" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Today's Egg Rate in {location}
              </h2>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300">
                  Today's egg rate in {location} stands at ₹{formatPrice(todayRate)} per piece, reflecting the current market dynamics and production costs. This rate is determined by various factors including feed prices, transportation costs, and seasonal demand patterns. The egg rate today in {location} shows the real-time market value that farmers and wholesalers are operating with.
                </p>
                
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  Compared to last week's rate of ₹{formatPrice(rate7DaysAgo)}, the market has experienced a {isPositiveChange ? 'rise' : 'decline'} of {weeklyChangePercent}%. This fluctuation is typical in the egg market and reflects the ongoing adjustments based on supply and demand factors specific to {location}.
                </p>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Market Update</h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    The egg rate in {location} is updated daily based on NECC guidelines and local market conditions. Prices may vary slightly between different suppliers and retail outlets.
                  </p>
                </div>
              </div>
            </section>

            <section aria-labelledby="tray-rate" className="mt-8">
              <h2 id="tray-rate" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Egg Rate of a Tray in {location}
              </h2>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300">
                  A standard egg tray containing 30 eggs is currently priced at ₹{formatPrice(todayRate * 30)} in {location}. This bulk pricing is particularly important for retailers, restaurants, and large households who purchase eggs in larger quantities. The tray rate represents better value compared to individual piece purchases.
                </p>
                
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  The egg tray rate in {location} offers significant savings for bulk buyers. While individual eggs are priced at ₹{formatPrice(todayRate)} each, buying a full tray provides economies of scale. This pricing structure supports the supply chain from farm to consumer, ensuring fair margins for all stakeholders.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Wholesale Advantage</h3>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Buying eggs by the tray in {location} can save you up to 5-8% compared to individual purchases, making it ideal for families and businesses.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Quality Assurance</h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Tray purchases in {location} often come with better quality assurance as they're typically sourced directly from producers.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-gray-200">Note:</strong> All NECC egg rates, today egg rate, and daily egg rate information are sourced from official channels and local market surveys. 
                  Today's egg rate and NECC egg rate today may vary slightly based on location and vendor. Get live NECC rates, current egg prices, and today's egg rate updates daily. Last updated: {today}.
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
