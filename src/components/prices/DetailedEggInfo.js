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
      aria-label="Detailed Egg Information"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 transform transition-transform hover:scale-[1.02]">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Daily and Monthly Egg Prices
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            Our platform provides comprehensive daily and monthly egg prices across {location}. Our price indicators help both consumers and sellers make informed decisions in the Indian egg market. Prices are updated daily and reflect various factors including production costs, transportation, and egg quality.
          </p>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Wholesale Market Analysis
          </h2>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              The wholesale egg market in India has shown significant price fluctuations in recent years. Key factors influencing these changes include:
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
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 h-full">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              NECC Price Setting Process
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                The National Egg Coordination Committee (NECC) facilitates price determination through:
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>Daily market analysis and updates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>Stakeholder collaboration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>Price recommendations for 50+ cities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>Consideration of market dynamics</span>
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
              India's Position in Global Egg Production
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

        <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Price Influencing Factors
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Primary Factors</h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Supply and demand balance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Production costs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Seasonal variations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Feed prices</span>
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

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            <strong className="font-semibold">Note:</strong> This website is not affiliated with NECC. We aggregate prices from various sources to provide convenient, user-friendly information. Prices are for reference only and actual market rates may vary.
          </p>
        </div>
      </div>
    </section>
  );
});

DetailedEggInfo.displayName = 'DetailedEggInfo';

export default DetailedEggInfo;
