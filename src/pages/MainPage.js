import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import RateTable from '../components/rates/RateTable';
import StateList from '../components/rates/StateList';
import BlogList from '../components/blog/BlogList';
import Footer from '../components/layout/Footer';
import FAQ, { generateFaqSchema } from '../components/common/FAQ';

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

  // Format price helper
  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : price;
  };

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
    <div className="bg-gray-50">
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
      <div className="container mx-auto px-4">
        <div id="home" className="py-8">
          {loading ? (
            <div className="text-center p-4">Loading...</div>
          ) : (
            <>
              {/* Hero Section */}
              <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
                    {getUniqueH1()}
                  </h1>
                  <p className="text-center text-lg font-semibold text-gray-700 mb-2">
                    Current Rates for {displayName}
                  </p>
                  <p className="text-center text-gray-600 mb-4">
                    {selectedCity 
                      ? `Get the latest egg rates for ${selectedCity}. Updated daily with wholesale and retail prices.`
                      : selectedState
                        ? `Check current egg prices across ${selectedState}. Compare rates from different cities.`
                        : 'Track egg prices across India with our daily updated NECC rates from major cities.'
                    }
                  </p>
                </div>

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
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowWebStories(!showWebStories)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    disabled={webStoriesLoading}
                  >
                    {webStoriesLoading ? 'Loading Stories...' : (showWebStories ? 'Hide Web Stories' : 'Show Web Stories')}
                  </button>
                </div>

                {showWebStories && (
                  <div className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Featured Web Stories</h2>
                    {webStoriesLoading ? (
                      <div className="text-center p-4">Loading web stories...</div>
                    ) : featuredWebStories.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featuredWebStories.map((story, index) => (
                          <div key={story.slug} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <Link 
                              to={`/webstory/${story.slug}`}
                              className="block h-full"
                            >
                              <div className="relative">
                                <img 
                                  src={story.thumbnail} 
                                  alt={`Egg Rate in ${story.city}, ${story.state}`}
                                  className="w-full h-48 object-cover"
                                  onError={(e) => {
                                    console.log('Image failed to load:', e.target.src);
                                    e.target.onerror = null;
                                    e.target.src = '/eggpic.webp';
                                  }}
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                  <p className="text-white text-sm font-medium">
                                    {story.date}
                                  </p>
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                                  {story.title}
                                </h3>
                                <p className="text-red-600 font-bold mt-2">₹{story.rate} per egg</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {story.city}, {story.state}
                                </p>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-gray-600">
                        No web stories available at the moment. Please check back later.
                      </div>
                    )}
                  </div>
                )}

                {/* Price Trends Section */}
                <div className="p-6 mt-6 bg-white shadow-lg rounded-lg">
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Price Trends</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <h3 className="text-md font-semibold text-gray-800 mb-2">Today's Rate</h3>
                      <p className="text-xl font-bold text-gray-900">₹{formatPrice(todayRate)}</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <h3 className="text-md font-semibold text-gray-800 mb-2">Rate 7 Days Ago</h3>
                      <p className="text-xl font-bold text-gray-900">₹{formatPrice(rate7DaysAgo)}</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <h3 className="text-md font-semibold text-gray-800 mb-2">Weekly Change</h3>
                      <p className="text-xl font-bold text-gray-900">
                        {weeklyChange > 0 ? (
                          <span className="text-green-500">+₹{formatPrice(weeklyChange)} ({weeklyChangePercent}%)</span>
                        ) : weeklyChange < 0 ? (
                          <span className="text-red-500">-₹{formatPrice(-weeklyChange)} ({weeklyChangePercent}%)</span>
                        ) : (
                          <span className="text-gray-500">No change</span>
                        )}
                      </p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <h3 className="text-md font-semibold text-gray-800 mb-2">Average Price (30 days)</h3>
                      <p className="text-xl font-bold text-gray-900">₹{formatPrice(averagePrice)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <StateList states={states} cities={cities} />
              
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
                <BlogList blogs={blogs} selectedCity={selectedCity} selectedState={selectedState} />
              
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