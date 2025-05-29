import { memo } from 'react';
import OptimizedImage from '../common/OptimizedImage';

const DetailedEggInfo = memo(({ selectedCity, selectedState }) => {
  const location = selectedCity 
    ? `${selectedCity}, ${selectedState}`
    : selectedState || 'India';

  return (
    <section className="p-4 sm:p-6 mt-6 bg-white rounded-lg shadow-lg" aria-label="Detailed Egg Information">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            Daily and Monthly Egg Prices
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Our platform provides comprehensive daily and monthly egg prices across {location}. Our price indicators help both consumers and sellers make informed decisions in the Indian egg market. Prices are updated daily and reflect various factors including production costs, transportation, and egg quality.
          </p>
        </div>

        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            Wholesale Market Analysis
          </h2>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              The wholesale egg market in India has shown significant price fluctuations in recent years. Key factors influencing these changes include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Rising chicken feed costs (corn and soybean price increases)</li>
              <li>Supply and demand fluctuations</li>
              <li>Seasonal production variations</li>
              <li>Market conditions and economic factors</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
              NECC Price Setting Process
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                The National Egg Coordination Committee (NECC) facilitates price determination through:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Daily market analysis and updates</li>
                <li>Stakeholder collaboration</li>
                <li>Price recommendations for 50+ cities</li>
                <li>Consideration of market dynamics</li>
              </ul>
            </div>
          </div>

          <div className="relative h-[300px] rounded-lg overflow-hidden">
            <OptimizedImage 
              src="/eggrate2.webp" 
              alt="NECC egg price analysis chart"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              India's Position in Global Egg Production
            </h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <ul className="space-y-2 text-gray-700">
                <li>• Annual production: ~129.6 billion eggs</li>
                <li>• Growth rate: 7% yearly</li>
                <li>• Per capita consumption: 95 eggs/year</li>
                <li>• Global ranking: 3rd largest producer</li>
              </ul>
            </div>
          </div>

          <div className="relative h-[300px] rounded-lg overflow-hidden">
            <OptimizedImage 
              src="/eggrate3.webp" 
              alt="India egg production statistics"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            Price Influencing Factors
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Primary Factors</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Supply and demand balance</li>
                <li>Production costs</li>
                <li>Seasonal variations</li>
                <li>Feed prices</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Secondary Factors</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Transportation costs</li>
                <li>Storage facilities</li>
                <li>Market competition</li>
                <li>Consumer preferences</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 italic">
            <strong>Note:</strong> This website is not affiliated with NECC. We aggregate prices from various sources to provide convenient, user-friendly information. Prices are for reference only and actual market rates may vary.
          </p>
        </div>
      </div>
    </section>
  );
});

DetailedEggInfo.displayName = 'DetailedEggInfo';

export default DetailedEggInfo;
