import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const StateNavigationGrid = memo(({ selectedState }) => {
  // All states with their regions for better SEO
  const allStates = [
    { name: 'Maharashtra', region: 'Western India', popular: true },
    { name: 'Uttar Pradesh', region: 'Northern India', popular: true },
    { name: 'West Bengal', region: 'Eastern India', popular: true },
    { name: 'Tamil Nadu', region: 'Southern India', popular: true },
    { name: 'Karnataka', region: 'Southern India', popular: true },
    { name: 'Telangana', region: 'Southern India', popular: true },
    { name: 'Gujarat', region: 'Western India', popular: true },
    { name: 'Rajasthan', region: 'Northern India', popular: true },
    { name: 'Andhra Pradesh', region: 'Southern India', popular: true },
    { name: 'Madhya Pradesh', region: 'Central India', popular: true },
    { name: 'Haryana', region: 'Northern India', popular: true },
    { name: 'Punjab', region: 'Northern India', popular: true },
    { name: 'Bihar', region: 'Eastern India' },
    { name: 'Kerala', region: 'Southern India' },
    { name: 'Assam', region: 'North-Eastern India' },
    { name: 'Jharkhand', region: 'Eastern India' },
    { name: 'Odisha', region: 'Eastern India' },
    { name: 'Himachal Pradesh', region: 'Northern India' },
    { name: 'Chhattisgarh', region: 'Central India' },
    { name: 'Uttarakhand', region: 'Northern India' },
    { name: 'Goa', region: 'Western India' },
    { name: 'Jammu and Kashmir', region: 'Northern India' },
    { name: 'Manipur', region: 'North-Eastern India' },
    { name: 'Puducherry', region: 'Southern India' },
    { name: 'Chandigarh', region: 'Northern India' },
    { name: 'Delhi', region: 'Northern India' }
  ];

  // Filter out current state
  const otherStates = allStates.filter(state => 
    (state.name.toLowerCase()||'').replace(/\s+/g, '-') !== (selectedState?.toLowerCase()||'').replace(/\s+/g, '-')
  );

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Explore Egg Rates Across India
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Compare egg prices and market trends across different states. Get insights into regional variations and market dynamics.
        </p>
      </div>

      {/* Popular States First */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
          Popular Egg Markets
        </h4>        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {otherStates.filter(state => state.popular).map((state) => (
            <Link
              key={state.name}
              to={`/state/${(state.name?.toLowerCase() || '').replace(/\s+/g, '-')}-egg-rate`}
              className="group bg-white dark:bg-gray-700 rounded-lg p-4 text-center hover:shadow-md 
                         transition-all duration-200 border border-blue-200 dark:border-gray-600 
                         hover:border-blue-400 dark:hover:border-blue-500 hover:scale-105"
              title={`Check egg rates in ${state.name}, ${state.region}`}
            >
              <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {state.name}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {state.region}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* All Other States */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
          All States & Territories
        </h4>        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {otherStates.filter(state => !state.popular).map((state) => (
            <Link
              key={state.name}
              to={`/state/${(state.name?.toLowerCase() || '').replace(/\s+/g, '-')}-egg-rate`}
              className="group bg-white dark:bg-gray-700 rounded-md p-3 text-center hover:shadow-sm 
                         transition-all duration-200 border border-gray-200 dark:border-gray-600 
                         hover:border-gray-400 dark:hover:border-gray-500 hover:scale-102"
              title={`View egg rates in ${state.name}, ${state.region}`}
            >
              <div className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {state.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {state.region}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* SEO Benefits Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Compare egg rates, understand market trends, and track price variations across India's major markets.
        </p>
      </div>
    </section>
  );
});

StateNavigationGrid.displayName = 'StateNavigationGrid';

export default StateNavigationGrid;
