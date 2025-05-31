import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import HeadSection from '../common/HeadSection';
import OptimizedImage from '../common/OptimizedImage';
import { fetchWebStories } from '../../services/api';

const WebStoriesList = () => {
  const location = useLocation();
  const [webStories, setWebStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Using useCallback to memoize the fetch function
  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWebStories();
      setWebStories(data);
    } catch (error) {
      console.error('Error fetching web stories:', error);
      setError(error.message);
      setWebStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const renderLoadingState = () => (
    <div className="bg-gray-50 min-h-screen flex flex-col" role="alert" aria-busy="true">
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />
      <div className="container mx-auto p-6 flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div 
            className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"
            role="progressbar"
            aria-label="Loading web stories"
          ></div>
          <p className="mt-4 text-gray-600">Loading web stories...</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  const renderError = () => (
    <div className="bg-gray-50 min-h-screen flex flex-col" role="alert">
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />
      <div className="container mx-auto p-6 flex-grow">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center text-red-600 mb-4">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold">Error Loading Web Stories</h2>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchStories()}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  const renderContent = () => (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <HeadSection
        getSeoTitle={() => "Egg Rate Web Stories - Live Price Updates | Today Egg Rates"}
        getSeoDescription={() => "View our collection of web stories featuring live egg rates from cities across India. Get daily price updates, market trends, and regional comparisons in an engaging visual format."}
        getSeoKeywords={() => "egg rate web stories, egg price updates, live egg rates, city egg prices, daily egg updates, egg market trends"}
        location={location}
        structuredData={generateStoriesSchema()}
        generateFaqSchema={() => ({})}
        selectedCity={selectedCity}
        selectedState={selectedState}
      />
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <header className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Egg Rate Web Stories</h1>
          <p className="text-lg text-gray-600">
            Browse our collection of web stories featuring the latest egg rates across different cities in India. 
            Click on any story to view detailed and up-to-date egg prices in a visually engaging format.
          </p>
        </header>
        
        {webStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {webStories.map((story, index) => (
              <Link 
                to={`/webstory/${story.slug}`} 
                key={story.slug}
                className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-1"
                aria-label={`View web story about egg rates in ${story.city}, ${story.state}`}
              >
                <div className="relative aspect-w-16 aspect-h-9">
                  <OptimizedImage
                    src={story.thumbnail}
                    alt={`Egg Rate visualization for ${story.city}, ${story.state}`}
                    className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105"
                    width={400}
                    height={225}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/eggpic.webp';
                    }}
                  />
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-200"
                    aria-hidden="true"
                  ></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm font-medium">
                      Updated: {story.date}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                    {story.title}
                  </h2>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-lg font-bold text-indigo-600">₹{story.rate} <span className="text-sm font-normal">per egg</span></p>
                    <p className="text-sm text-gray-600">{story.city}, {story.state}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div 
            className="max-w-lg mx-auto text-center py-12 px-4 bg-white rounded-lg shadow-md"
            role="alert"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Web Stories Available</h2>
            <p className="text-gray-600">Check back later for updates on egg prices and market trends.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );

  const generateStoriesSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": webStories.map((story, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "headline": story.title,
          "description": `Current egg rate in ${story.city}, ${story.state}: ₹${story.rate}`,
          "image": `https://todayeggrates.com${story.thumbnail}`,
          "datePublished": story.date,
          "dateModified": story.date,
          "url": `https://todayeggrates.com/webstory/${story.slug}`
        }
      }))
    };
  };

  if (loading) return renderLoadingState();
  if (error) return renderError();
  return renderContent();
};

export default WebStoriesList;
