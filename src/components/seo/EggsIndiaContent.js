import React, { memo } from 'react';
import { Link } from 'react-router-dom';

// SEO-optimized content component specifically for "eggs in india" keywords
const EggsIndiaContent = memo(({ selectedCity, selectedState }) => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Complete Guide to Eggs in India
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Nutrition & Health Benefits */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Nutrition Facts: Fresh Eggs in India
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Fresh eggs in India are packed with essential nutrients, making them perfect for healthy breakfast meals. 
                  Farm fresh eggs contain high-quality protein rich content, essential fatty acids, and vitamin D. 
                  Brown egg varieties and organic eggs offer superior nutrition facts with omega 3 content.
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Protein rich: 6g per egg for muscle building</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Vitamin D: Essential for bone health</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Fatty acids: Omega-3 for heart health</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Cholesterol free options available</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Types of Eggs */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Types of Eggs Available in India
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Indian markets offer diverse egg varieties from local farms across the country. 
                  Each type provides unique benefits for different dietary preferences and health goals.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Premium Varieties</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Brown egg varieties</li>
                      <li>• Organic eggs</li>
                      <li>• Free range eggs</li>
                      <li>• Cage free options</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Traditional Options</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Desi eggs</li>
                      <li>• Country eggs</li>
                      <li>• Village eggs</li>
                      <li>• Farm fresh eggs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>          {/* Market Information with Internal Links */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Eggs in India Market Overview
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">129.6B</div>
                <p className="text-gray-600 dark:text-gray-400">Annual egg production in India</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">7%</div>
                <p className="text-gray-600 dark:text-gray-400">Annual growth rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">95</div>
                <p className="text-gray-600 dark:text-gray-400">Average eggs per person yearly</p>
              </div>
            </div>
            
            {/* Internal Navigation with Semantic Keywords */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Explore Egg Rates by Location
                </h4>
                <div className="space-y-2">
                  <Link 
                    to="/mumbai-egg-rate-today" 
                    className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    → Mumbai fresh eggs in India market rates
                  </Link>
                  <Link 
                    to="/delhi-egg-rate-today" 
                    className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    → Delhi farm fresh eggs pricing today
                  </Link>
                  <Link 
                    to="/bangalore-egg-rate-today" 
                    className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    → Bangalore organic eggs in India rates
                  </Link>
                  <Link 
                    to="/kolkata-egg-rate-today" 
                    className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    → Kolkata brown egg varieties pricing
                  </Link>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Browse by State Markets
                </h4>
                <div className="space-y-2">
                  <Link 
                    to="/maharashtra-egg-rate-today" 
                    className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    → Maharashtra eggs in India market analysis
                  </Link>
                  <Link 
                    to="/tamil-nadu-egg-rate-today" 
                    className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    → Tamil Nadu cage free eggs pricing
                  </Link>
                  <Link 
                    to="/uttar-pradesh-egg-rate-today" 
                    className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    → UP fresh produce eggs market rates
                  </Link>
                  <Link 
                    to="/bihar-egg-rate-today" 
                    className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    → Bihar village eggs and country eggs rates
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Health Benefits */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Health Benefits of Fresh Eggs in India
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">For Active Lifestyle</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  Fresh eggs provide complete protein for muscle building and recovery. Farm fresh eggs 
                  from local farms offer the best quality protein rich nutrition for athletes and 
                  fitness enthusiasts seeking healthy breakfast options.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">For Family Nutrition</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  Brown egg varieties and organic eggs provide essential fatty acids and vitamin D 
                  for growing children. Desi eggs and village eggs offer traditional nutrition 
                  with superior taste and nutrition facts.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-600 pt-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Explore Egg Rates Across India
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <Link 
                to="/mumbai-egg-rate-today" 
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                title="Mumbai eggs in India - today egg rate"
              >
                Mumbai Rates
              </Link>
              <Link 
                to="/delhi-egg-rate-today" 
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                title="Delhi eggs in India - fresh egg prices"
              >
                Delhi Rates
              </Link>
              <Link 
                to="/bangalore-egg-rate-today" 
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                title="Bangalore eggs in India - farm fresh rates"
              >
                Bangalore Rates
              </Link>
              <Link 
                to="/chennai-egg-rate-today" 
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                title="Chennai eggs in India - brown egg varieties"
              >
                Chennai Rates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

EggsIndiaContent.displayName = 'EggsIndiaContent';

export default EggsIndiaContent;
