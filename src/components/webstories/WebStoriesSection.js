import React, { memo, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import WebStoriesCarousel from './WebStoriesCarousel';
import { fetchStatesAndCities } from '../../services/api';

const WebStoriesSection = memo(({
  showWebStories,
  setShowWebStories,
  webStoriesLoading,
  allWebStories
}) => {
  const [apiData, setApiData] = useState({ cities: [], states: [] });
  const [apiDataLoading, setApiDataLoading] = useState(false);

  // Fetch API data for related cities linking
  useEffect(() => {
    const fetchApiData = async () => {
      if (apiData.cities?.length === 0) {
        try {
          setApiDataLoading(true);
          const data = await fetchStatesAndCities();
          setApiData(data);
        } catch (error) {
          console.error('Error fetching states and cities:', error);
          // Fallback data in case API fails
          setApiData({
            cities: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Ahmedabad'],
            states: ['Maharashtra', 'Delhi', 'West Bengal', 'Tamil Nadu', 'Karnataka', 'Telangana']
          });
        } finally {
          setApiDataLoading(false);
        }
      }
    };
    
    fetchApiData();
  }, [apiData.cities?.length]);

  // Memoized random cities for better performance and orphan page coverage
  const randomCities = useMemo(() => {
    if (apiData.cities?.length === 0) return [];
    return apiData.cities
      ?.sort(() => 0.5 - Math.random())
      .slice(0, 8);
  }, [apiData.cities]);

  const buttonLabel = webStoriesLoading ? 'Loading Stories...' : (showWebStories ? 'Hide Stories' : 'Show Stories');  return (
    <section className="mt-8 sm:mt-10 px-4 sm:px-6 lg:px-8" aria-labelledby="webstories-heading">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h2 id="webstories-heading" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Web Stories - All Cities ({allWebStories?.length || 0})
        </h2>
        <button
          onClick={() => setShowWebStories(!showWebStories)}
          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:active:bg-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium shadow-md hover:shadow-lg"
          disabled={webStoriesLoading}
          aria-expanded={showWebStories}
          aria-controls="stories-carousel"
        >
          {webStoriesLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2 text-white dark:text-gray-200" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="sr-only">Loading stories</span>
              <span aria-live="polite">Loading Stories...</span>
            </>
          ) : (
            <>
              <span>{buttonLabel}</span>
              <svg 
                className={`w-5 h-5 transform transition-transform duration-300 ${showWebStories ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      </div>

      <div 
        id="stories-carousel"
        className={`transition-all duration-500 ease-in-out ${
          showWebStories ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'
        }`}
      >        {webStoriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden="true">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                role="presentation"
              >
                <div className="webstories-skeleton h-40 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4 space-y-3">
                  <div className="webstories-skeleton h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="webstories-skeleton h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <WebStoriesCarousel webStories={allWebStories} />
          </div>
        )}
      </div>      {/* Related Cities for Orphan Page Linking */}
      {showWebStories && !apiDataLoading && randomCities?.length > 0 && (
        <div className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
            Discover Egg Rates in More Cities
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Explore comprehensive egg rate information and web stories from cities across India
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
            {randomCities.map((city) => (
              <Link
                key={city}
                to={`/${city.toLowerCase().replace(/\s+/g, '-')}-egg-rate-today`}
                className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 
                           rounded-lg p-2 sm:p-3 text-center hover:shadow-md transition-all duration-200
                           hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-gray-600 dark:hover:to-gray-500
                           border border-indigo-200 dark:border-gray-600 group transform hover:scale-105"
              >
                <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-300 truncate">
                  {city}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  View Stories
                </p>
              </Link>
            ))}
          </div>
          
          {/* Link to full web stories list */}
          <div className="mt-4 sm:mt-6 text-center">
            <Link
              to="/webstories"
              className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                         transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm sm:text-base font-medium shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="hidden sm:inline">View All Web Stories</span>
              <span className="sm:hidden">View All</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
});

WebStoriesSection.displayName = 'WebStoriesSection';

export default WebStoriesSection;
