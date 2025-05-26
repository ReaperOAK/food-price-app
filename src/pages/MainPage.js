import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import RateTable from '../components/rates/RateTable';
import StateList from '../components/rates/StateList';
import BlogList from '../components/blog/BlogList';
import Footer from '../components/layout/Footer';
import FAQ, { generateFaqSchema } from '../components/common/FAQ';

// Add loading skeleton component at the top
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg p-4">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  </div>
);

// Add the QuickInfo component at the top
const QuickInfo = ({ todayRate, trayPrice, weeklyChange, weeklyChangePercent }) => (
  <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs w-full transform transition-transform duration-300 hover:scale-105 z-50">
    <div className="flex justify-between items-center mb-2">
      <h4 className="text-sm font-semibold text-gray-700">Quick Price Info</h4>
      <span className="text-xs text-gray-500">Today</span>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Single Egg:</span>
        <span className="font-bold">₹{formatPrice(todayRate)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Tray (30):</span>
        <span className="font-bold">₹{formatPrice(trayPrice)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Weekly Change:</span>
        <span className={`font-bold ${weeklyChange > 0 ? 'text-green-500' : weeklyChange < 0 ? 'text-red-500' : 'text-gray-500'}`}>
          {weeklyChange !== 'N/A' && (weeklyChange > 0 ? '+' : '')}{weeklyChange}
          <span className="text-xs ml-1">({weeklyChangePercent}%)</span>
        </span>
      </div>
    </div>
  </div>
);

// Format price helper
const formatPrice = (price) => {
  if (price === 'N/A' || price === null || price === undefined) {
    return 'N/A';
  }
  return typeof price === 'number' ? price.toFixed(2) : price;
};

const MainPage = () => {
  // Original MainPage state
  const [eggRates, setEggRates] = useState([]);
  const [specialRates, setSpecialRates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ContentSection state
  const [featuredWebStories, setFeaturedWebStories] = useState([]);
  const [showWebStories, setShowWebStories] = useState(false);
  const [webStoriesLoading, setWebStoriesLoading] = useState(false); // New loading state

  // URL and location parameters
  const { state: stateParam, city: cityParam } = useParams();
  const location = useLocation();

  // Display and formatting helpers
  const displayName = selectedCity ? `${selectedCity}, ${selectedState}` : (selectedState || 'India');
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate price metrics
  const todayRate = eggRates.length > 0 ? eggRates[0].rate : 'N/A';
  const rate7DaysAgo = eggRates.length > 7 ? eggRates[6].rate : 'N/A';
  const weeklyChange = eggRates.length > 7 ? (eggRates[0].rate - eggRates[6].rate).toFixed(2) : 'N/A';
  const weeklyChangePercent = eggRates.length > 7 ? ((eggRates[0].rate - eggRates[6].rate) / eggRates[6].rate * 100).toFixed(2) : 'N/A';
  const averagePrice = eggRates.length > 0 ? (eggRates.reduce((sum, rate) => sum + rate.rate, 0) / eggRates.length).toFixed(2) : 'N/A';
  const trayPrice = todayRate !== 'N/A' ? (todayRate * 30).toFixed(2) : 'N/A';

  // Data fetching functions
  const handleFetchSpecialRates = useCallback(() => {
    return fetch('/php/api/rates/get_special_rates.php')
      .then(res => res.json())
      .then(data => {
        const convertedData = data.map(item => ({
          ...item,
          rate: parseFloat(item.rate),
        }));
        setSpecialRates(convertedData);
      })
      .catch(error => {
        console.error('Error fetching special rates:', error);
        setSpecialRates([]);
      });
  }, []);

  const handleFetchRates = useCallback(() => {
    const fetchPromise = selectedCity && selectedState
      ? fetch(`/php/api/rates/get_rates.php?city=${selectedCity}&state=${selectedState}`)
      : fetch(`/php/api/rates/get_latest_rates.php`);

    return fetchPromise
      .then(res => res.json())
      .then(data => {
        const convertedData = data.map(item => ({
          ...item,
          rate: parseFloat(item.rate),
        }));
        setEggRates(convertedData);
      })
      .catch(error => {
        console.error('Error fetching rates:', error);
        setEggRates([]);
      });
  }, [selectedCity, selectedState]);

  // Fetch web stories
  useEffect(() => {
    const handleFetchWebStories = async () => {
      if (!showWebStories) return; // Only fetch when stories are shown
      try {
        setWebStoriesLoading(true);
        const response = await fetch('/php/get_web_stories.php');
        if (!response.ok) {
          throw new Error('Failed to fetch web stories');
        }
        const data = await response.json();
        // Handle empty array response
        if (!Array.isArray(data) || data.length === 0) {
          setFeaturedWebStories([]);
          return;
        }
        // Use data directly without shuffling since PHP already orders by date DESC
        setFeaturedWebStories(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching web stories:', error);
        setFeaturedWebStories([]);
      } finally {
        setWebStoriesLoading(false);
      }
    };

    handleFetchWebStories();
  }, [showWebStories]); // Only re-run when showWebStories changes

  // Initial data loading
  useEffect(() => {
    setLoading(true);
    Promise.all([handleFetchRates(), handleFetchSpecialRates()])
      .finally(() => setLoading(false));
  }, [handleFetchRates, handleFetchSpecialRates, selectedState, selectedCity]);

  // Fetch states on mount
  useEffect(() => {
    fetch('/php/api/location/get_states.php')
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(error => console.error('Error fetching states:', error));
  }, []);

  // Fetch cities when a state is selected or when the URL changes
  useEffect(() => {
    if (selectedState) {
      fetch(`/php/api/location/get_cities.php?state=${selectedState}`)
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(error => console.error('Error fetching cities:', error));
    }
  }, [selectedState]);

  // Fetch state for the city from the URL
  useEffect(() => {
    if (cityParam) {
      // Normalize city name for display (e.g., convert 'bengaluru' to 'Bengaluru')
      const normalizedCity = cityParam.replace('-egg-rate', '');
      let displayCity = normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1);
      
      // Special handling for Bengaluru
      if (displayCity.toLowerCase() === 'bengaluru') {
        displayCity = 'Bengaluru';
      }
      
      setSelectedCity(displayCity);
      
      fetch(`/php/api/location/get_state_for_city.php?city=${displayCity}`)
        .then(res => res.json())
        .then(data => {
          if (data.state) {
            setSelectedState(data.state);
          }
        })
        .catch(error => console.error('Error fetching state for city:', error));
    }
  }, [cityParam]);

  // Update selectedState and selectedCity when URL parameters change
  useEffect(() => {
    if (stateParam) {
      const newState = stateParam.replace('-egg-rate', '');
      if (selectedState !== newState) {
        setSelectedState(newState);
        setSelectedCity('');
      }
    }
    if (cityParam) {
      const newCity = cityParam.replace('-egg-rate', '');
      if (selectedCity !== newCity) {
        setSelectedCity(newCity);
      }
    }
    if (!stateParam && !cityParam && (selectedState || selectedCity)) {
      setSelectedCity('');
      setSelectedState('');
    }
  }, [stateParam, cityParam, selectedState, selectedCity]);
  
  // SEO helpers
  const getUniqueH1 = () => {
    if (selectedCity) {
      return `Egg Rate in ${selectedCity}, ${selectedState} (${today})`;
    } else if (selectedState) {
      return `${selectedState} Egg Rate: Latest NECC Prices (${today})`;
    } else {
      return `Today's Egg Rate in India: NECC Price List (${today})`;
    }
  };

  // Create SEO title and description based on location  
  const getSeoTitle = () => {
    if (selectedCity) {
      return `${selectedCity} Egg Rate Today - ₹${todayRate} (${today}) | NECC Egg Price`;
    } else if (selectedState) {
      return `${selectedState} Egg Rates Today: State-wide NECC Price List (${today})`;
    } else {
      return `Today's Egg Rate: Check NECC Egg Prices Across India (${today})`;
    }
  };

  const getSeoDescription = () => {
    if (selectedCity) {
      const trayPrice = todayRate !== 'N/A' ? (todayRate * 30).toFixed(2) : 'N/A';
      return `Current egg rate in ${selectedCity}, ${selectedState}: ₹${todayRate}/egg, ₹${trayPrice}/tray (30 eggs). Check latest NECC egg price in ${selectedCity} updated on ${today}. Live updates and market analysis.`;
    } else if (selectedState) {
      return `Today's egg rate in ${selectedState}: Get latest NECC egg prices and daily market updates from all major cities in ${selectedState}. Compare wholesale and retail egg rates updated on ${today}.`;
    } else {
      return `Check today's egg rates across India. Daily updated NECC egg prices from Mumbai, Chennai, Bangalore, Kolkata, Barwala & 100+ cities. Compare wholesale & retail egg prices (${today}).`;
    }
  };

  const getSeoKeywords = () => {
    if (selectedCity) {
      return `${selectedCity.toLowerCase()} egg rate today, ${selectedState.toLowerCase()} egg price, egg rate in ${selectedCity.toLowerCase()}, ${selectedCity.toLowerCase()} egg price today, necc egg rate in ${selectedCity.toLowerCase()}`;
    } else if (selectedState) {
      return `${selectedState.toLowerCase()} egg rate, egg price in ${selectedState.toLowerCase()}, today egg rate in ${selectedState.toLowerCase()}, ${selectedState.toLowerCase()} egg price today, necc egg rate in ${selectedState.toLowerCase()}`;
    } else {
      return 'egg rate today, necc egg rate today, today egg rate, egg rate, national egg rate, all india egg rate, today egg rate in mumbai, today egg rate in chennai, today egg rate kolkata, barwala egg rate today';
    }
  };

  // Structured data for search engines
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Eggs in ${displayName}`,
    "description": `Latest egg rates in ${displayName}. Check today's egg prices updated on ${today}. Single egg price: ₹${todayRate}, Tray (30 eggs) price: ₹${trayPrice}`,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": todayRate,
      "highPrice": trayPrice,
      "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock"
    }
  };

  // Define handleFetchBlogs function
  useEffect(() => {
    // Import blogs from data file
    try {
      import('../data/blogs').then(module => {
        setBlogs(module.default);
      });
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    }
  }, []);

  // Render method
  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>{getSeoTitle()}</title>
        <meta name="description" content={getSeoDescription()} />
        <meta name="keywords" content={getSeoKeywords()} />
        
        {/* Canonical URL with proper handling */}
        <link 
          rel="canonical" 
          href={`https://todayeggrates.com${
            location.pathname === '/' 
              ? '' 
              : location.pathname.endsWith('/') 
                ? location.pathname.slice(0, -1) 
                : location.pathname
          }`} 
        />
        
        {/* Add structured data for rich snippets */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
          {/* Add FAQ structured data */}
        <script type="application/ld+json">
          {JSON.stringify(generateFaqSchema(selectedCity, selectedState, eggRates))}
        </script>
        
        {/* Add lastmod date for search engines */}
        <meta property="article:modified_time" content={new Date().toISOString()} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={getSeoTitle()} />
        <meta property="og:description" content={getSeoDescription()} />
        <meta property="og:url" content={`https://todayeggrates.com${location.pathname}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://todayeggrates.com/eggpic.webp" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getSeoTitle()} />
        <meta name="twitter:description" content={getSeoDescription()} />
        <meta name="twitter:image" content="https://todayeggrates.com/eggpic.webp" />
      </Helmet>
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />
      <div className="container mx-auto px-4 w-full max-w-7xl transition-none">
        <div id="home" className="py-8">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* Hero Section with improved design */}
              <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                    <h1 className="text-3xl font-bold text-white text-center mb-4">
                      {getUniqueH1()}
                    </h1>
                    <p className="text-center text-white text-xl font-semibold mb-2">
                      Current Rates for {displayName}
                    </p>
                    <p className="text-center text-blue-100">
                      {selectedCity 
                        ? `Get the latest egg rates for ${selectedCity}. Updated daily with wholesale and retail prices.`
                        : selectedState
                          ? `Check current egg prices across ${selectedState}. Compare rates from different cities.`
                          : 'Track egg prices across India with our daily updated NECC rates from major cities.'
                      }
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Today's Rate</p>
                        <p className="text-2xl font-bold text-blue-600">₹{formatPrice(todayRate)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Tray Price</p>
                        <p className="text-2xl font-bold text-blue-600">₹{formatPrice(trayPrice)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Weekly Change</p>
                        <p className={`text-2xl font-bold ${weeklyChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {weeklyChange !== 'N/A' ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange}` : 'N/A'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">30-Day Avg</p>
                        <p className="text-2xl font-bold text-blue-600">₹{formatPrice(averagePrice)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Rest of the content */}
              {/* Rate Table and Chart */}
              {selectedCity || selectedState ? (
                <RateTable
                  key={`${selectedCity}-${selectedState}`}
                  selectedCity={selectedCity}
                  selectedState={selectedState}
                  rates={eggRates}
                  showPriceColumns={true}
                  showChart={true}
                  showDate={true}
                  showState={false}
                  showAdmin={false}
                  showMarket={false}
                />
              ) : (
                <RateTable
                  key="default-table"
                  rates={eggRates}
                  showPriceColumns={true}
                  showChart={true}
                  chartType="bar"
                />
              )}

              {/* Web Stories Section */}
              <div className="mt-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-700">Featured Web Stories</h2>
                  <button
                    onClick={() => setShowWebStories(!showWebStories)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={webStoriesLoading}
                  >
                    {webStoriesLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Loading Stories...</span>
                      </>
                    ) : (
                      <>
                        <span>{showWebStories ? 'Hide Stories' : 'Show Stories'}</span>
                        <svg className={`w-5 h-5 transform transition-transform duration-300 ${showWebStories ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                <div className={`transition-all duration-500 ease-in-out ${showWebStories ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                  {webStoriesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                          <div className="h-48 bg-gray-200"></div>
                          <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : featuredWebStories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredWebStories.map((story, index) => (
                        <Link 
                          key={story.slug}
                          to={`/webstory/${story.slug}`}
                          className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="relative">
                            <img 
                              src={story.thumbnail} 
                              alt={`Egg Rate in ${story.city}, ${story.state}`}
                              className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/eggpic.webp';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <p className="text-white text-sm font-medium">
                                {story.date}
                              </p>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                              {story.title}
                            </h3>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-red-600 font-bold">₹{story.rate} per egg</p>
                              <p className="text-sm text-gray-600">
                                {story.city}, {story.state}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-white rounded-lg shadow-md">
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-xl font-semibold text-gray-700 mb-2">No Stories Available</p>
                      <p className="text-gray-500">Check back later for updates on egg prices and market trends.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Trends Section */}
              <div className="p-6 mt-6 bg-white shadow-lg rounded-lg transform transition-all duration-300 hover:shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
                  <span className="mr-2">Price Trends</span>
                  <span className="text-sm font-normal text-gray-500">Last 30 days</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-semibold text-gray-800">Today's Rate</h3>
                      <span className="text-xs text-gray-500">{today}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">₹{formatPrice(todayRate)}</p>
                    <p className="text-sm text-gray-600 mt-1">Per egg</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-semibold text-gray-800">7 Days Ago</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">₹{formatPrice(rate7DaysAgo)}</p>
                    <p className="text-sm text-gray-600 mt-1">Per egg</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Weekly Change</h3>
                    <p className="text-2xl font-bold mt-2">
                      {weeklyChange > 0 ? (
                        <span className="flex items-center text-green-500">
                          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          +₹{formatPrice(weeklyChange)}
                          <span className="text-sm ml-1">({weeklyChangePercent}%)</span>
                        </span>
                      ) : weeklyChange < 0 ? (
                        <span className="flex items-center text-red-500">
                          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                          </svg>
                          -₹{formatPrice(-weeklyChange)}
                          <span className="text-sm ml-1">({weeklyChangePercent}%)</span>
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-500">
                          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                          No change
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">From last week</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-semibold text-gray-800">Average Price</h3>
                      <span className="text-xs text-gray-500">30 days</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">₹{formatPrice(averagePrice)}</p>
                    <p className="text-sm text-gray-600 mt-1">Per egg</p>
                  </div>
                </div>
              </div>

              {/* Add QuickInfo component only if we have rate data */}
              {todayRate !== 'N/A' && (
                <QuickInfo 
                  todayRate={todayRate}
                  trayPrice={trayPrice}
                  weeklyChange={weeklyChange}
                  weeklyChangePercent={weeklyChangePercent}
                />
              )}

              {/* Only render StateList if we have states data */}
              {states.length > 0 && (
                <StateList states={states} cities={cities} />
              )}
              
              {/* Special rates table */}
              {specialRates.length > 0 && (
                <RateTable
                  key="special-rates"
                  rates={specialRates}
                  showSpecialRates={true}
                  showPriceColumns={true}
                  showChart={false}
                  showDate={false}
                  showState={false}
                  showMarket={true}
                  itemsPerPage={5}
                />
              )}

              {/* Only render BlogList if we have blogs data */}
              {blogs.length > 0 && (
                <BlogList blogs={blogs} selectedCity={selectedCity} selectedState={selectedState} />
              )}
              
              {/* FAQ Section */}
              <FAQ
                selectedCity={selectedCity}
                selectedState={selectedState}
                eggRates={eggRates}
              />
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainPage;