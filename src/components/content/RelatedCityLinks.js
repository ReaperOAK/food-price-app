import { memo, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchStatesAndCities } from '../../services/api';

// Safe string conversion function to prevent toLowerCase errors
const safeToLowerCase = (value) => {
  if (!value) return '';
  return String(value).toLowerCase();
};

const RelatedCityLinks = memo(({ selectedCity, selectedState, allCities = [] }) => {
  const [apiData, setApiData] = useState({ allCities: [], allStates: [] });
  const [loading, setLoading] = useState(true);

  // Fetch dynamic data from API to replace hardcoded lists
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setLoading(true);
        const data = await fetchStatesAndCities();
        
        // Extract all cities with their states from API
        const allCities = [];
        const allStates = Object.keys(data).filter(state => 
          state !== 'Unknown' && state !== 'special'
        );

        Object.entries(data).forEach(([state, cities]) => {
          if (state !== 'Unknown' && state !== 'special' && Array.isArray(cities)) {
            cities.forEach(city => {
              if (city && typeof city === 'string') {
                allCities.push({ city, state });
              }
            });
          }
        });

        setApiData({ allCities, allStates });
      } catch (error) {
        console.error('Error fetching API data for RelatedCityLinks:', error);
        // Fallback to basic data if API fails
        setApiData({ 
          allCities: [
            { city: 'Mumbai', state: 'Maharashtra' },
            { city: 'Delhi', state: 'Delhi' },
            { city: 'Bangalore', state: 'Karnataka' },
            { city: 'Chennai', state: 'Tamil Nadu' },
            { city: 'Hyderabad', state: 'Telangana' },
            { city: 'Kolkata', state: 'West Bengal' }
          ], 
          allStates: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal']
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, []);
  // Get related cities - prioritize next cities in alphabetical order for better internal linking
  const getRelatedCities = useMemo(() => {
    if (apiData.allCities?.length === 0) return [];
    
    // Sort all cities alphabetically for consistent ordering
    const sortedCities = apiData.allCities
      .filter(cityData => cityData.city !== selectedCity)
      .sort((a, b) => a.city.localeCompare(b.city));
    
    if (!selectedCity) {
      // If no selected city (homepage), return first 15 cities
      return sortedCities.slice(0, 15);
    }
    
    // Find current city index in sorted list
    const currentIndex = sortedCities.findIndex(
      cityData => safeToLowerCase(cityData.city) === safeToLowerCase(selectedCity)
    );
    
    if (currentIndex === -1) {
      // Current city not found, return first 15 cities
      return sortedCities.slice(0, 15);
    }
    
    // Get next 15 cities after current city (wrapping around if necessary)
    const nextCities = [];
    for (let i = 1; i <= 15; i++) {
      const nextIndex = (currentIndex + i) % sortedCities.length;
      const nextCity = sortedCities[nextIndex];
      if (nextCity && safeToLowerCase(nextCity.city) !== safeToLowerCase(selectedCity)) {
        nextCities.push(nextCity);
      }
    }
    
    return nextCities;
  }, [apiData.allCities, selectedCity]);

  // Get related states for cross-linking  
  const getRelatedStates = useMemo(() => {
    if (apiData.allStates?.length === 0) return [];
    
    return apiData.allStates
      .filter(state => state !== selectedState)
      ?.sort(() => 0.5 - Math.random()) // Randomize states
      .slice(0, 6);
  }, [apiData.allStates, selectedState]);  if (loading) {
    return (
      <div className="animate-pulse max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(15)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const relatedCities = getRelatedCities;
  const relatedStates = getRelatedStates;

  if (relatedCities?.length === 0) return null;

  const componentTitle = selectedCity 
    ? `Compare ${selectedCity} egg rates with other cities`
    : "Explore egg rates across India's major cities";

  return (    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden p-8">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          {componentTitle}
        </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {relatedCities.map((cityData, index) => (
            <Link
              key={index}
              to={`/${safeToLowerCase(cityData.city)}-egg-rate-today`}
              className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 
                         rounded-lg p-4 text-center hover:shadow-md transition-all duration-200
                         hover:from-blue-100 hover:to-blue-200 dark:hover:from-gray-600 dark:hover:to-gray-500"
            >
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {cityData.city}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Fresh Eggs in India
              </p>
            </Link>
          ))}
        </div>

        {/* Web Stories Section */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6 mb-8">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            📱 Visual Stories - Today's Egg Rates
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Current city webstory if on a city page */}
            {selectedCity && (
              <Link
                to={`/webstory/${safeToLowerCase(selectedCity)}-egg-rate-today`}
                className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20
                           rounded-lg p-3 text-center hover:shadow-md transition-all duration-200 
                           hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30
                           border-2 border-purple-300 dark:border-purple-600"
                title={`Visual story about egg rates in ${selectedCity}`}
              >
                <p className="font-medium text-purple-900 dark:text-purple-100 text-xs">
                  {selectedCity} Story
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  📱 Current City
                </p>
              </Link>
            )}
            
            {/* Next 5 cities' webstories */}
            {relatedCities.slice(0, selectedCity ? 5 : 6).map((cityData, index) => (
              <Link
                key={`webstory-${index}`}
                to={`/webstory/${safeToLowerCase(cityData.city)}-egg-rate-today`}
                className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20
                           rounded-lg p-3 text-center hover:shadow-md transition-all duration-200 
                           hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30"
                title={`Visual story about egg rates in ${cityData.city}`}
              >
                <p className="font-medium text-gray-900 dark:text-white text-xs">
                  {cityData.city} Story
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  📱 Web Story
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* State-level links */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Explore Farm Fresh Eggs by State Markets
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {relatedStates.map((state, index) => (
              <Link
                key={index}
                to={`/state/${safeToLowerCase(state).replace(/\s+/g, '-')}-egg-rate-today`}
                className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20
                           rounded-lg p-3 text-center hover:shadow-md transition-all duration-200 
                           hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30"
              >
                <p className="font-medium text-gray-900 dark:text-white text-xs">
                  {state}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Eggs in India
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Current state link if viewing a city */}
        {selectedState && (
          <div className="mt-6 text-center">            <Link
              to={`/state/${safeToLowerCase(selectedState).replace(/\s+/g, '-')}-egg-rate-today`}
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
