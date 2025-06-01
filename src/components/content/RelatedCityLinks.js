import { memo } from 'react';
import { Link } from 'react-router-dom';

const RelatedCityLinks = memo(({ selectedCity, selectedState, allCities = [] }) => {
  if (!selectedCity) return null;

  // Get related cities from the same state or nearby popular cities
  const getRelatedCities = () => {
    const sameCities = allCities
      .filter(city => city.state === selectedState && city.city !== selectedCity)
      .slice(0, 4);
    
    // If not enough cities from same state, add popular cities
    const popularCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata']
      .filter(city => city !== selectedCity)
      .slice(0, 6 - sameCities.length);
    
    return [...sameCities, ...popularCities.map(city => ({ city, state: 'Various' }))];
  };

  const relatedCities = getRelatedCities();

  if (relatedCities.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden p-8">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Compare Egg Rates in Other Cities
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {relatedCities.map((cityData, index) => (
            <Link
              key={index}
              to={`/${cityData.city.toLowerCase()}-egg-rate`}
              className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 
                         rounded-lg p-4 text-center hover:shadow-md transition-all duration-200 
                         hover:from-blue-100 hover:to-blue-200 dark:hover:from-gray-600 dark:hover:to-gray-500"
            >
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {cityData.city}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Egg Rate Today
              </p>
            </Link>
          ))}
        </div>

        {/* State-level link */}
        {selectedState && (
          <div className="mt-6 text-center">
            <Link
              to={`/state/${selectedState.toLowerCase().replace(/\s+/g, '-')}-egg-rate`}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 
                         text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 
                         transition-all duration-200 shadow-md hover:shadow-lg"
            >
              View All {selectedState} Egg Rates
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
});

RelatedCityLinks.displayName = 'RelatedCityLinks';

export default RelatedCityLinks;
