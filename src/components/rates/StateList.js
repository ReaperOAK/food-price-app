import React, { memo, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { fetchStatesAndCities } from '../../services/api';

// Safe string conversion function to prevent toLowerCase errors
const safeToLowerCase = (value) => {
  if (!value) return '';
  return String(value).toLowerCase();
};

const StateList = memo(({ states = [], cities = [], isLoading = false }) => {
  // State for API-driven dynamic data
  const [apiData, setApiData] = useState({ allCities: [], allStates: [] });
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch API data to replace hardcoded lists
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setDataLoading(true);
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
                allCities.push({ name: city, state });
              }
            });
          }
        });

        setApiData({ allCities, allStates });
      } catch (error) {
        console.error('Error fetching API data for StateList:', error);
        // Fallback to some default data if API fails
        setApiData({ 
          allCities: [
            { name: 'Mumbai', state: 'Maharashtra' },
            { name: 'Delhi', state: 'Delhi' },
            { name: 'Bangalore', state: 'Karnataka' },
            { name: 'Chennai', state: 'Tamil Nadu' },
            { name: 'Hyderabad', state: 'Telangana' },
            { name: 'Kolkata', state: 'West Bengal' }
          ], 
          allStates: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal']
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchApiData();
  }, []);

  // Get randomized subset of cities for display (12-16 cities per load)
  const displayCities = useMemo(() => {
    if (apiData.allCities?.length === 0) return [];
    const shuffled = [...apiData.allCities]?.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 16);
  }, [apiData.allCities]);

  // Get randomized subset of states for display (8-10 states per load)  
  const displayStates = useMemo(() => {
    if (apiData.allStates?.length === 0) return [];
    const shuffled = [...apiData.allStates]?.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, [apiData.allStates]);  // Generate schema markup for SEO
  const generateSchemaMarkup = useMemo(() => {
    if (displayStates?.length === 0) return {};
    
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "India Egg Rates - State and City Wise Egg Prices",
      "description": "Check today's egg rates across different states and cities in India. Updated daily wholesale and NECC egg prices.",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
          ...displayStates.map((state, index) => ({
            "@type": "ListItem",
            "position": String(index + 1),
            "item": {
              "@type": "Place",
              "name": String(`${state} Egg Market`),
              "description": String(`Check daily egg rates in ${state} India`)
            }
          }))
        ]
      }
    };
  }, [displayStates]);

  const renderStateTableRows = () => {
    const rows = [];
    for (let i = 0; i < states?.length; i += 3) {
      rows.push(
        <tr key={i} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
          {states.slice(i, i + 3).map(state => (
            <td key={state} className="px-6 py-4 text-center">              <Link
                to={`/state/${safeToLowerCase(state)}-egg-rate-today`}
                className="inline-flex items-center justify-center w-full px-4 py-2 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
                title={`Today's Egg Rate in ${state} - NECC Egg Price`}
                aria-label={`View egg rates for ${state}`}
              >
                <span className="text-lg font-semibold">{state}</span>
                <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-300">View Rates</span>
              </Link>
            </td>
          ))}
        </tr>
      );
    }
    return rows;
  };

  const renderCityTableRows = () => {
    const rows = [];
    for (let i = 0; i < cities?.length; i += 3) {
      rows.push(
        <tr key={i} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
          {cities.slice(i, i + 3).map(city => (
            <td key={city} className="px-6 py-4 text-center">              <Link
                to={`/${safeToLowerCase(city)}-egg-rate-today`}
                className="inline-flex items-center justify-center w-full px-4 py-2 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
                title={`Today's Egg Rate in ${city} - Latest NECC Egg Price`}
                aria-label={`View egg rates for ${city}`}
              >
                <span className="text-lg font-semibold">{city}</span>
                <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-300">View Rates</span>
              </Link>
            </td>
          ))}
        </tr>
      );
    }
    return rows;
  };

  const renderLoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
  const renderPopularCities = () => {
    const popularCities = displayCities.slice(0, 8); // Get first 8 cities from dynamic data
    
    return (
      <section className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-sm dark:from-gray-800 dark:to-gray-900" aria-labelledby="popular-cities-heading">
        <h3 id="popular-cities-heading" className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Popular City Egg Rates</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {popularCities.map(({ name, state }) => (
            <Link 
              key={name}
              to={`/${safeToLowerCase(name)}-egg-rate-today`}
              className="group flex flex-col items-center p-4 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-md transition duration-200 dark:bg-gray-800 dark:border-blue-800 dark:hover:border-blue-600"
              title={`Check today's egg rate in ${name}, ${state}`}
            >
              <span className="text-lg font-semibold text-blue-700 group-hover:text-blue-800 dark:text-blue-400 dark:group-hover:text-blue-300">{name}</span>
              <span className="text-sm text-gray-600 mt-1 dark:text-gray-400">{state}</span>
            </Link>
          ))}
        </div>
      </section>
    );
  };

  const renderPopularStates = () => {
    const popularStates = displayStates.slice(0, 6); // Get first 6 states from dynamic data
    
    return (
      <section className="mt-6 p-6 bg-gradient-to-br from-green-50 to-white rounded-lg shadow-sm dark:from-gray-800 dark:to-gray-900" aria-labelledby="popular-states-heading">
        <h3 id="popular-states-heading" className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Popular State Egg Rates</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {popularStates.map((state) => (
            <Link 
              key={state}
              to={`/state/${safeToLowerCase(state)}-egg-rate-today`}
              className="group flex flex-col items-center p-4 bg-white border border-green-200 rounded-lg hover:border-green-400 hover:shadow-md transition duration-200 dark:bg-gray-800 dark:border-green-800 dark:hover:border-green-600"
              title={`Check today's egg rates in ${state} India`}
            >
              <span className="text-lg font-semibold text-green-700 group-hover:text-green-800 dark:text-green-400 dark:group-hover:text-green-300">{state}</span>
              <span className="text-sm text-gray-600 mt-1 dark:text-gray-400">India</span>
            </Link>
          ))}
        </div>
      </section>
    );
  };
  return (
    <>      {/* Only render Helmet when not loading to prevent React Helmet errors */}
      {!isLoading && !dataLoading && Object.keys(generateSchemaMarkup)?.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(generateSchemaMarkup)}
          </script>
        </Helmet>
      )}

      <main className="p-4 sm:p-6 mt-6 bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-lg max-w-7xl mx-auto dark:from-gray-900 dark:to-gray-800">
        <h2 className="text-center bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-lg w-full p-6 mt-4 text-2xl sm:text-3xl font-bold text-gray-800 dark:from-yellow-900 dark:to-yellow-800 dark:text-gray-100">
          Daily Egg Price in Mandi - National Wholesale Market Rate
        </h2>
          {(isLoading || dataLoading) ? renderLoadingSkeleton() : (
          <>
            {renderPopularCities()}
            {renderPopularStates()}
            
            <section className="mt-8" aria-labelledby="state-rates-heading">
              <h2 id="state-rates-heading" className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">State-wise Egg Rates</h2>
              <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table">
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {states?.length > 0 ? renderStateTableRows() : (
                      <tr>
                        <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300" colSpan="3">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {cities?.length > 0 && (
              <section className="mt-8" aria-labelledby="city-rates-heading">
                <h2 id="city-rates-heading" className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">City-wise Egg Rates</h2>
                <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table">
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {renderCityTableRows()}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
        
        <footer className="mt-8 text-sm text-gray-600 dark:text-gray-400 text-center">
          <p>Egg rates updated daily. Last updated: {new Date().toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </footer>
      </main>
    </>
  );
});

StateList.propTypes = {
  states: PropTypes.arrayOf(PropTypes.string).isRequired,
  cities: PropTypes.arrayOf(PropTypes.string).isRequired,
  isLoading: PropTypes.bool
};

StateList.displayName = 'StateList';

export default StateList;