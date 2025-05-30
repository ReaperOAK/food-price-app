import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../common/OptimizedImage';

const WebStoriesSection = memo(({
  showWebStories,
  setShowWebStories,
  webStoriesLoading,
  featuredWebStories
}) => {
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
        ) : featuredWebStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWebStories.map((story) => (
              <Link 
                key={story.slug}
                to={`/webstory/${story.slug}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-1"
                aria-label={`View web story about egg rates in ${story.city}, ${story.state}. Current rate: ₹${story.rate} per egg`}
              >
                <div className="relative aspect-w-16 aspect-h-9">
                  <OptimizedImage 
                    src={story.thumbnail} 
                    alt={`Egg Rate visualization for ${story.city}, ${story.state}`}
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
          </div>
        )}
      </div>
    </section>
  );
});

WebStoriesSection.displayName = 'WebStoriesSection';

export default WebStoriesSection;
