import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';

// Comprehensive list of cities from orphan pages CSV
const orphanCities = [
  'jalandhar', 'bareilly', 'ranchi', 'aurangabad', 'allahabad', 'agra',
  'vizag', 'nagpur', 'jaipur', 'luknow', 'faridabad', 'muzaffurpur',
  'kanpur', 'coimbatore', 'hospet', 'warangal', 'aligarh', 'nashik',
  'bhopal', 'patna', 'salem', 'meerut', 'vijayawada', 'ludhiana',
  'brahmapur', 'moradabad', 'namakkal', 'siliguri', 'jodhpur', 'mysore',
  'bhubaneswar', 'raipur', 'varanasi', 'dhanbad', 'durgapur', 'chennai',
  'bangalore', 'mumbai', 'delhi', 'pune', 'indore', 'barwala'
];

// Corresponding webstory cities from orphan pages
const webstoryCities = [
  'raipur', 'vizag', 'varanasi', 'nagpur', 'hospet', 'delhi', 'mumbai',
  'muzaffurpur', 'bangalore', 'indore', 'barwala', 'pune', 'warangal',
  'dhanbad', 'durgapur', 'aligarh', 'jodhpur', 'siliguri', 'allahabad',
  'meerut', 'mysore', 'bhubaneswar', 'chennai'
];

const CityLinkGrid = memo(({ 
  title = "Explore Egg Rates in All Cities", 
  showWebStories = false,
  maxCities = 40,
  className = ""
}) => {
  // Format city name for display
  const formatCityName = (city) => {
    return city
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get randomized cities for display
  const displayCities = useMemo(() => {
    const shuffled = [...orphanCities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, maxCities);
  }, [maxCities]);

  // Get webstory cities for display  
  const displayWebStories = useMemo(() => {
    if (!showWebStories) return [];
    const shuffled = [...webstoryCities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(maxCities / 2, 20));
  }, [showWebStories, maxCities]);

  return (
    <section className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
          Get today's fresh egg rates and market prices in cities across India
        </p>
      </div>
      
      <div className="p-6">
        {/* City Rate Pages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
          {displayCities.map((city) => (
            <Link 
              key={city}
              to={`/${city}-egg-rate-today`}
              className="group flex flex-col items-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border border-blue-200 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 hover:scale-105"
              title={`Check today's egg rate in ${formatCityName(city)} - Fresh eggs, wholesale prices, NECC rates`}
            >
              <span className="text-sm font-semibold text-blue-700 group-hover:text-blue-800 dark:text-blue-400 dark:group-hover:text-blue-300 text-center">
                {formatCityName(city)}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Egg Rates
              </span>
            </Link>
          ))}
        </div>

        {/* WebStories Grid */}
        {showWebStories && displayWebStories.length > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-4">
                Featured Web Stories
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {displayWebStories.map((city) => (
                  <Link 
                    key={`webstory-${city}`}
                    to={`/webstory/${city}-egg-rate-today`}
                    className="group flex flex-col items-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 border border-green-200 dark:border-gray-600 rounded-lg hover:border-green-400 dark:hover:border-green-500 hover:shadow-md transition-all duration-200 hover:scale-105"
                    title={`View web story about egg rates in ${formatCityName(city)} - Visual price guide`}
                  >
                    <span className="text-sm font-semibold text-green-700 group-hover:text-green-800 dark:text-green-400 dark:group-hover:text-green-300 text-center">
                      {formatCityName(city)}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Web Story
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Compare egg prices across {orphanCities.length}+ cities in India
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View All Rates
            </Link>
            {showWebStories && (
              <Link
                to="/webstories"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                All Web Stories
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

CityLinkGrid.displayName = 'CityLinkGrid';

export default CityLinkGrid;
