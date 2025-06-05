import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useRandomSeoLinks } from '../../hooks/useRandomSeoLinks';

const CityMarketInsights = memo(({ selectedCity, selectedState, todayRate, trayPrice }) => {
  // Get random cities and states for SEO links
  const { randomCities, randomStates, loading: linksLoading } = useRandomSeoLinks(selectedCity, selectedState);

  if (!selectedCity) return null;

  const formatPrice = (price) => {
    if (price === 'N/A' || !price) return 'N/A';
    return parseFloat(price).toFixed(2);
  };

  // Generic market insights that apply to all cities
  const getMarketInsights = () => {
    const insights = [
      {
        title: `Egg Market Dynamics in ${selectedCity}`,
        content: `The egg market in ${selectedCity}, ${selectedState} is influenced by various factors including local demand, transportation costs, and seasonal variations. Today's egg rate of ₹${formatPrice(todayRate)} per egg reflects current market conditions and NECC guidelines.`
      },
      {
        title: `Wholesale vs Retail Prices`,
        content: `Wholesale egg rates in ${selectedCity} typically offer better value for bulk buyers. A tray of 30 eggs is priced at ₹${formatPrice(trayPrice)}, making it economical for restaurants, bakeries, and large families.`
      },
      {
        title: `Quality and Freshness Standards`,
        content: `Eggs available in ${selectedCity} markets follow strict quality standards. Local vendors ensure freshness by maintaining proper storage conditions and quick turnover, guaranteeing consumers get the best value for their money.`
      },
      {
        title: `Seasonal Price Trends`,
        content: `Egg prices in ${selectedCity} typically fluctuate based on seasonal demand. Festival seasons and winter months often see increased consumption, while summer periods may experience slight price adjustments based on local market conditions.`
      }
    ];

    return insights;
  };

  const insights = getMarketInsights();

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Market Insights for {selectedCity}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {insights.map((insight, index) => (
              <div key={index} className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {insight.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {insight.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Price comparison section */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Current Price Summary for {selectedCity}
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400">Per Egg</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{formatPrice(todayRate)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400">Per Tray (30)</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{formatPrice(trayPrice)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400">Per Dozen</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹{formatPrice(todayRate * 12)}</p>
              </div>
            </div>
          </div>

          {/* Market tips section */}
          <div className="mt-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Shopping Tips for {selectedCity} Egg Buyers
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Buy in bulk during stable price periods to save costs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Check for freshness by examining egg shell quality</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Compare prices across different vendors in {selectedCity}</span>
                </li>
              </ul>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Monitor daily NECC rates for best purchasing decisions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Consider seasonal variations when planning purchases</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Store eggs properly to maintain freshness and quality</span>
                </li>
              </ul>            </div>
          </div>          {/* Internal Links Section for SEO */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Related Egg Rate Information
            </h3>
            {linksLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading related links...</span>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Popular Cities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {randomCities.map((city, index) => (
                      <Link 
                        key={index}
                        to={city.url} 
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        title={`Check today's egg rate in ${city.name}, ${city.state}`}
                      >
                        {city.displayName}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">State Markets</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {randomStates.map((state, index) => (
                      <Link 
                        key={index}
                        to={state.url} 
                        className="text-sm text-green-600 dark:text-green-400 hover:underline"
                        title={`View egg rates across ${state.name} state`}
                      >
                        {state.displayName}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

CityMarketInsights.displayName = 'CityMarketInsights';

export default CityMarketInsights;
