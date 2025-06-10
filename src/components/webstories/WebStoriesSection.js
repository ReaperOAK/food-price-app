import React, { memo, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../common/OptimizedImage';
import { fetchStatesAndCities } from '../../services/api';

const WebStoriesSection = memo(({
  showWebStories,
  setShowWebStories,
  webStoriesLoading,
  featuredWebStories
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
      .sort(() => 0.5 - Math.random())
      .slice(0, 8);
  }, [apiData.cities]);

  const buttonLabel = webStoriesLoading ? 'Loading Stories...' : (showWebStories ? 'Hide Stories' : 'Show Stories');

  return (
    <section className="mt-10 px-4 sm:px-6 lg:px-8" aria-labelledby="webstories-heading">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 id="webstories-heading" className="text-2xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Featured Web Stories
        </h2>
        <button
          onClick={() => setShowWebStories(!showWebStories)}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:active:bg-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={webStoriesLoading}
          aria-expanded={showWebStories}
          aria-controls="stories-grid"
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
        id="stories-grid"
        className={`transition-all duration-500 ease-in-out ${
          showWebStories ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'
        }`}
      >
        {webStoriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden="true">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                role="presentation"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredWebStories?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWebStories.map((story) => (
              <Link 
                key={story.slug}
                to={`/webstory/${story.slug}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-1"
                aria-label={`View web story about egg rates in ${String(story.city || '')}, ${String(story.state || '')}. Current rate: ₹${String(story.rate || '')} per egg`}
              >
                <div className="relative aspect-w-16 aspect-h-9">
                  <OptimizedImage 
                    src={story.thumbnail} 
                    alt={`Fresh eggs in India rate visualization for ${String(story.city || '')}, ${String(story.state || '')} - Farm fresh eggs market analysis`}
                    className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = '/eggpic.webp' }}
                    width={400}
                    height={225}
                    loading="lazy"
                  />
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"
                    aria-hidden="true"
                  ></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm font-medium">
                      {story.date}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
                    {story.title}
                  </h3>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-indigo-600 font-bold">₹{story.rate} per egg</p>
                    <p className="text-sm text-gray-600">
                      {story.city}, {story.state}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div 
            className="text-center p-8 bg-white rounded-lg shadow-md"
            role="alert"
            aria-live="polite"
          >
            <svg 
              className="w-16 h-16 mx-auto text-gray-400 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-xl font-semibold text-gray-800 mb-2">No Stories Available</p>
            <p className="text-gray-600">Check back later for updates on egg prices and market trends.</p>
          </div>        )}
      </div>

      {/* Related Cities for Orphan Page Linking */}
      {showWebStories && !apiDataLoading && randomCities?.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Discover Egg Rates in More Cities
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Explore comprehensive egg rate information and web stories from cities across India
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {randomCities.map((city) => (
              <Link
                key={city}
                to={`/${city.toLowerCase().replace(/\s+/g, '-')}-egg-rate-today`}
                className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 
                           rounded-lg p-3 text-center hover:shadow-md transition-all duration-200
                           hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-gray-600 dark:hover:to-gray-500
                           border border-indigo-200 dark:border-gray-600 group"
              >
                <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                  {city}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  View Stories
                </p>
              </Link>
            ))}
          </div>
          
          {/* Link to full web stories list */}
          <div className="mt-6 text-center">
            <Link
              to="/webstories"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                         transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              View All Web Stories
            </Link>
          </div>
        </div>
      )}
    </section>
  );
});

WebStoriesSection.displayName = 'WebStoriesSection';

export default WebStoriesSection;
