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

  // Get related cities from the same state or nearby popular cities
  const getRelatedCities = useMemo(() => {
    if (apiData.allCities?.length === 0) return [];
    
    const sameCities = apiData.allCities
      .filter(cityData => cityData.state === selectedState && cityData.city !== selectedCity)
      .slice(0, 4);
    
    // Get random cities from different states to fill remaining slots
    const otherCities = apiData.allCities
      .filter(cityData => cityData.city !== selectedCity && cityData.state !== selectedState)
      ?.sort(() => 0.5 - Math.random()) // Randomize
      .slice(0, 8 - sameCities?.length);
    
    return [...sameCities, ...otherCities];
  }, [apiData.allCities, selectedCity, selectedState]);

  // Get related states for cross-linking  
  const getRelatedStates = useMemo(() => {
    if (apiData.allStates?.length === 0) return [];
    
    return apiData.allStates
      .filter(state => state !== selectedState)
      ?.sort(() => 0.5 - Math.random()) // Randomize states
      .slice(0, 6);
  }, [apiData.allStates, selectedState]);
  if (!selectedCity || loading) return null;

  const relatedCities = getRelatedCities;
  const relatedStates = getRelatedStates;

  if (relatedCities?.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden p-8">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Compare Egg Rates in Other Cities
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
