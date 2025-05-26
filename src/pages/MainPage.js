import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Navbar from '../components/layout/Navbar';
import RateTable from '../components/rates/RateTable';
import Footer from '../components/layout/Footer';
import BodyOne from '../components/rates/BodyOne';
import BodyTwo from '../components/rates/BodyTwo';
import BodyThree from '../components/rates/BodyThree';
import StatePage from '../components/rates/StatePage';
import StateList from '../components/rates/StateList';
import BlogList from '../components/blog/BlogList';
import FAQ, { generateFaqSchema } from '../components/common/FAQ';
import Breadcrumb from '../components/layout/Breadcrumb';
import blogs from '../data/blogs';

const MainPage = () => {
  const { city: cityParam, state: stateParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState(stateParam ? stateParam.replace('-egg-rate', '') : '');
  const [selectedCity, setSelectedCity] = useState(cityParam ? cityParam.replace('-egg-rate', '') : '');
  const [eggRates, setEggRates] = useState([]);
  const displayName = selectedCity ? selectedCity : selectedState ? selectedState : 'India';
  
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

  // Define handleFetchRates function
  const handleFetchRates = useCallback(() => {
    if (selectedCity && selectedState) {
      // Fetch rates for selected city and state
      fetch(`/php/api/rates/get_rates.php?city=${selectedCity}&state=${selectedState}`)
        .then(res => res.json())
        .then(data => {
          const convertedData = data.map(item => ({
            ...item,
            rate: parseFloat(item.rate), // Convert rate to a number
          }));
          setEggRates(convertedData);
        })
        .catch(error => console.error('Error fetching rates:', error));
    } else {
      // Fetch latest rates when no city/state is selected
      fetch(`/php/api/rates/get_latest_rates.php`)
        .then(res => res.json())
        .then(data => {
          const convertedData = data.map(item => ({
            ...item,
            rate: parseFloat(item.rate), // Convert rate to a number
          }));
          setEggRates(convertedData);
        })
        .catch(error => console.error('Error fetching latest rates:', error));
    }
  }, [selectedCity, selectedState]);

  // Fetch rates when component mounts or when city/state changes
  useEffect(() => {
    handleFetchRates();
    // Disabling exhaustive deps warning as we only want to run this when these specific props change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState, selectedCity]);

  // Check if the current URL matches /state/:state
  const stateMatch = matchPath(
    { path: '/state/:state' },
    location.pathname
  );

  // This memoized function will be used to update URLs based on state changes
  // but with navigation safeguards to prevent history errors
  const updateURL = useCallback(() => {
    // Current path without trailing slash for consistent comparison
    const currentPath = location.pathname.endsWith('/') 
      ? location.pathname.slice(0, -1) 
      : location.pathname;
    
    // Only update URL when necessary to avoid redundant history entries
    if (selectedCity && !currentPath.includes(`-egg-rate`)) {
      const newPath = `/${selectedCity.toLowerCase()}-egg-rate`;
      if (currentPath !== newPath) {
        // Using replace: true to avoid stacking history entries
        navigate(newPath, { replace: true });
      }
    } else if (selectedState && !selectedCity && !currentPath.includes(`-egg-rate`)) {
      const newPath = `/state/${selectedState.toLowerCase()}-egg-rate`;
      if (currentPath !== newPath) {
        navigate(newPath, { replace: true });
      }
    }
  }, [selectedCity, selectedState, navigate, location.pathname]);
  
  // Use a ref to track if we're currently processing a URL update
  // to prevent competing updates
  const isUpdatingRef = React.useRef(false);
  
  // Update URL with proper debouncing to prevent rapid changes
  useEffect(() => {
    // Skip if we're already processing an update
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    const timeoutId = setTimeout(() => {
      updateURL();
      isUpdatingRef.current = false;
    }, 50); // Slightly longer timeout for better batching
    
    return () => {
      clearTimeout(timeoutId);
      isUpdatingRef.current = false;
    };
  }, [updateURL]);

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
  
  // Get formatted date for SEO
  const formattedDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Get current rate and tray price
  const currentRate = eggRates.length > 0 ? eggRates[0].rate : 'N/A';
  const trayPrice = currentRate !== 'N/A' ? (currentRate * 30).toFixed(2) : 'N/A';
  
  // Prepare structured data for search engines
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Eggs in ${displayName}`,
    "description": `Latest egg rates in ${displayName}. Check today's egg prices updated on ${formattedDate}. Single egg price: ₹${currentRate}, Tray (30 eggs) price: ₹${trayPrice}`,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": currentRate,
      "highPrice": trayPrice,
      "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock"
    }
  };
    // We'll get FAQ data from the FAQ component instead of duplicating it here
  
  // Create SEO title and description based on location  
  const getSeoTitle = () => {
    if (selectedCity) {
      return `${selectedCity} Egg Rate Today - ₹${currentRate} (${formattedDate}) | NECC Egg Price`;
    } else if (selectedState) {
      return `${selectedState} Egg Rates Today: State-wide NECC Price List (${formattedDate})`;
    } else {
      return `Today's Egg Rate: Check NECC Egg Prices Across India (${formattedDate})`;
    }
  };

  const getSeoDescription = () => {
    if (selectedCity) {
      const trayPrice = currentRate !== 'N/A' ? (currentRate * 30).toFixed(2) : 'N/A';
      return `Current egg rate in ${selectedCity}, ${selectedState}: ₹${currentRate}/egg, ₹${trayPrice}/tray (30 eggs). Check latest NECC egg price in ${selectedCity} updated on ${formattedDate}. Live updates and market analysis.`;
    } else if (selectedState) {
      return `Today's egg rate in ${selectedState}: Get latest NECC egg prices and daily market updates from all major cities in ${selectedState}. Compare wholesale and retail egg rates updated on ${formattedDate}.`;
    } else {
      return `Check today's egg rates across India. Daily updated NECC egg prices from Mumbai, Chennai, Bangalore, Kolkata, Barwala & 100+ cities. Compare wholesale & retail egg prices (${formattedDate}).`;
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

  return (
    <>
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
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          setSelectedCity={setSelectedCity}
          selectedCity={selectedCity}
          states={states}
          cities={cities}
        />
        <div className="flex-grow p-4 md:p-8 lg:p-12">
          {/* Breadcrumb component */}
          <div className="max-w-4xl mx-auto mb-4">
            <Breadcrumb />
          </div>
          
          <BodyOne selectedCity={selectedCity} selectedState={selectedState} />
          <div className="bg-white rounded-lg shadow-md p-6">
            {stateMatch ? (
              <StatePage />
            ) : (
              <>                {selectedCity && selectedState ? (
                  <RateTable
                    key={`${selectedCity}-${selectedState}`}
                    selectedCity={selectedCity}
                    selectedState={selectedState}
                    rates={eggRates}
                    showPriceColumns={true}
                    showChart={true}
                    showDate={true}
                  />
                ) : (                  <RateTable
                    key="default-table"
                    rates={eggRates}
                    showPriceColumns={true}
                    showChart={true}
                    chartType="bar"
                  />
                )}
              </>
            )}
            <StateList states={states} cities={cities} />
            <RateTable
              rates={eggRates}
              showSpecialRates={true}
              showPriceColumns={false}
              showChart={false}
            />
          </div>
          <BodyTwo selectedCity={selectedCity} selectedState={selectedState} />
          <BlogList blogs={blogs} selectedCity={selectedCity} selectedState={selectedState} />
          <BodyThree selectedCity={selectedCity} selectedState={selectedState} eggRates={eggRates} />
          <FAQ selectedCity={selectedCity} selectedState={selectedState} eggRates={eggRates} />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MainPage;