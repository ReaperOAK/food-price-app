import { memo, useMemo } from 'react';
import OptimizedImage from '../common/OptimizedImage';

const DetailedEggInfo = memo(({ selectedCity, selectedState }) => {
  const location = useMemo(() => 
    selectedCity 
      ? `${selectedCity}, ${selectedState}`
      : selectedState || 'India'
  , [selectedCity, selectedState]);

  return (
    <section 
      className="p-4 sm:p-6 mt-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg" 
      aria-label="Today's Egg Rates and NECC Price Information"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 transform transition-transform hover:scale-[1.02]">          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            NECC Egg Rate Today & Live Price Updates - {location}
          </h1>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            Get today's egg rate and live NECC egg rate updates for {location}. Our comprehensive egg rate today platform provides daily NECC rates, today egg rate tracking, and current egg price information. Check today egg rate, NECC egg price today, and explore wholesale egg rates including Barwala egg rate today across major cities. Whether you need today's egg rate for business or personal use, find accurate NECC egg rates and daily egg rate updates here.
          </p>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Live Egg Rate Analysis & NECC Price Market Updates
          </h2>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              Today's egg rate and NECC egg rate market analysis shows current price trends affecting both wholesale and retail segments. Our egg rate today tracking includes live NECC rates, today egg rate fluctuations, and comprehensive market data. Monitor daily egg rate changes, NECC egg price today updates, and get insights into factors driving current egg pricing including feed costs and seasonal variations.
            </p>
            <ul className="grid sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <li className="flex items-center space-x-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <span>Rising chicken feed costs (corn and soybean price increases)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <span>Supply and demand fluctuations</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <span>Seasonal production variations</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <span>Market conditions and economic factors</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 h-full">            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              NECC Rate Setting & Today's Egg Rate Coordination
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                The National Egg Coordination Committee (NECC) determines today's egg rate and facilitates NECC egg rate recommendations through comprehensive market analysis. Get live NECC rate updates, today egg rate information, and daily egg rate data for over 50 cities. Our platform tracks NECC egg rate today, current egg prices, and provides accurate today's egg rate across major markets including Barwala egg rate today:
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">                <li className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>Live NECC egg rate tracking and today egg rate updates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>Daily egg rate coordination across major markets</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>NECC rate recommendations for 50+ cities including Barwala</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>Market dynamics analysis for egg rate today pricing</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden shadow-xl transform transition-transform hover:scale-[1.02]">
            <OptimizedImage 
              src="/eggrate2.webp" 
              alt="NECC egg price analysis chart showing latest market trends and pricing patterns"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              India's Position in Global Egg Production & Today's Market
            </h2>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-lg">
                <li className="flex items-center space-x-2">
                  <span className="text-purple-600 dark:text-purple-400">•</span>
                  <span>Annual production: ~129.6 billion eggs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-600 dark:text-purple-400">•</span>
                  <span>Growth rate: 7% yearly</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-600 dark:text-purple-400">•</span>
                  <span>Per capita consumption: 95 eggs/year</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-600 dark:text-purple-400">•</span>
                  <span>Global ranking: 3rd largest producer</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden shadow-xl transform transition-transform hover:scale-[1.02]">
            <OptimizedImage 
              src="/desiegg.webp" 
              alt="Visualization of India's egg production statistics and global market position"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Today's Egg Rate Factors & NECC Price Determinants
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Primary NECC Rate Factors</h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Today egg rate fluctuations and live market demand</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>NECC egg rate today recommendations and updates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Daily egg rate seasonal production variations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Live NECC rates and current egg price trends</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Secondary Factors</h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Transportation costs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Storage facilities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Market competition</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Consumer preferences</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            <strong className="font-semibold">Note:</strong> While we provide today's egg rate, NECC egg rate today, and live egg price updates, this website is not affiliated with NECC. We aggregate today egg rate data, NECC rates, and daily egg rate information from various sources to provide convenient access to current egg pricing. All NECC egg rates, today's egg rate data, and egg rate today information are for reference only - actual market rates may vary by location and dealer.
          </p>
        </div>

        {/* City-specific NECC Rates Section */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Major Cities NECC Egg Rate Today & Live Updates
          </h2>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              Track NECC egg rate today across major Indian cities including Barwala egg rate today, Mumbai, Chennai, Bangalore, and Delhi. Our comprehensive today egg rate tracking covers live NECC rates, daily egg rate updates, and current egg prices from key markets. Compare Barwala egg rate with other cities and get accurate today's egg rate information.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>Barwala egg rate today and daily updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>Mumbai NECC egg rate today tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>Chennai today egg rate and market analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>Bangalore daily egg rate monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>Delhi NECC rates and today egg rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>Kolkata egg rate today and live prices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

DetailedEggInfo.displayName = 'DetailedEggInfo';

export default DetailedEggInfo;
