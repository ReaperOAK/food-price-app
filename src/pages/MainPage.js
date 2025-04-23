import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Navbar from '../components/layout/Navbar';
import RateTable from '../components/rates/RateTable';
import DefaultTable from '../components/rates/DefaultTable';
import Footer from '../components/layout/Footer';
import BodyOne from '../components/rates/BodyOne';
import BodyTwo from '../components/rates/BodyTwo';
import BodyThree from '../components/rates/BodyThree';
import StatePage from '../components/rates/StatePage';
import StateList from '../components/rates/StateList';
import SpecialRatesTable from '../components/rates/SpecialRatesTable';
import BlogList from '../components/blog/BlogList';
import FAQ from '../components/common/FAQ';
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
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
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

  // Fetch rates automatically when state or city changes
  useEffect(() => {
    handleFetchRates();
  }, [selectedState, selectedCity, handleFetchRates]); // Run effect whenever selectedState or selectedCity changes

  // Check if the current URL matches /state/:state
  const stateMatch = matchPath('/state/:state-egg-rate', location.pathname);

  // Update URL when selectedCity or selectedState changes
  useEffect(() => {
    if (selectedCity && !location.pathname.includes(`-egg-rate`)) {
      // Update the URL format to /city-egg-rate (for frontend)
      navigate(`/${selectedCity.toLowerCase()}-egg-rate/`);
    } else if (selectedState && !selectedCity && !location.pathname.includes(`-egg-rate`)) {
      // Update the URL format to /state/state-egg-rate (for frontend)
      navigate(`/state/${selectedState.toLowerCase()}-egg-rate`);
    }
  }, [selectedCity, selectedState, navigate, location.pathname]);

  // Update selectedState and selectedCity when URL parameters change
  useEffect(() => {
    if (stateParam) {
      setSelectedState(stateParam.replace('-egg-rate', ''));
      setSelectedCity('');
    }
    if (cityParam) {
      setSelectedCity(cityParam.replace('-egg-rate', ''));
    }
    if (!stateParam && !cityParam) {
      setSelectedCity('');
      setSelectedState('');
    }
  }, [stateParam, cityParam]);
  
  // Prepare structured data for search engines
  const currentRate = eggRates.length > 0 ? eggRates[0].rate : 'N/A';
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Eggs in ${displayName}`,
    "description": `Latest egg rates in ${displayName}. Check today's egg prices updated on ${today}.`,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": currentRate,
      "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock"
    }
  };
  
  // Add FAQ structured data if we're on a city or state page
  if ((selectedCity || selectedState) && eggRates.length > 0) {
    structuredData.mainEntity = {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `What is the egg rate today in ${displayName}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `The egg rate in ${displayName} today (${today}) is ₹${currentRate} per egg.`
          }
        },
        {
          "@type": "Question",
          "name": `What is the rate of 30 eggs (one tray) in ${displayName}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `The rate of 30 eggs (one tray) in ${displayName} is ₹${(currentRate * 30).toFixed(2)}.`
          }
        }
      ]
    };
  }

  return (
    <>
      <Helmet>
        <title>{selectedCity ? `Egg Rate in ${selectedCity}, ${selectedState} - Today's Price ₹${currentRate}` : 
               selectedState ? `Egg Rates in ${selectedState} - Today's NECC Prices` : 
               'Today Egg Rates - Check Latest Egg Price in India'}</title>
        <meta name="description" content={selectedCity ? 
              `Check today's egg rate in ${selectedCity}, ${selectedState}. Current price: ₹${currentRate} per egg. Get the latest egg prices updated on ${today}.` : 
              selectedState ? 
              `Check today's egg rates in ${selectedState}. Latest prices from all cities in ${selectedState}. Daily updated NECC egg prices and trends.` : 
              'Get the latest egg rates across India. Check today\'s egg prices, wholesale rates, and NECC egg price list for all major cities and states.'} />
        <link rel="canonical" href={`https://todayeggrates.com${location.pathname}`} />
        {selectedCity || selectedState ? 
          <meta name="keywords" content={`egg rate, ${displayName.toLowerCase()} egg price, egg market price, necc egg rate, today egg price, ${displayName.toLowerCase()} egg rate today`} /> : 
          <meta name="keywords" content="egg rates, egg price today, NECC egg rates, egg mandi rate, egg wholesale price, today egg rate, daily egg price" />
        }
        
        {/* Add structured data for rich snippets */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          setSelectedCity={setSelectedCity}
          selectedCity={selectedCity}
          states={states} // Pass states to Navbar
          cities={cities} // Pass cities to Navbar
        />
        <div className="flex-grow p-4 md:p-8 lg:p-12">
          {/* Add Breadcrumb component */}
          <Breadcrumb selectedCity={selectedCity} selectedState={selectedState} />
          
          <BodyOne selectedCity={selectedCity} selectedState={selectedState} />
          <div className="bg-white rounded-lg shadow-md p-6">
            {stateMatch ? (
              <StatePage />
            ) : (
              <>
                {selectedCity && selectedState ? (
                  <RateTable
                    key={`${selectedCity}-${selectedState}`}
                    selectedCity={selectedCity}
                    selectedState={selectedState}
                    eggRates={eggRates}
                  />
                ) : (
                  <DefaultTable key="default-table" eggRates={eggRates} />
                )}
              </>
            )}
            <StateList states={states} cities={cities} /> {/* Pass states and cities to StateList */}
            <SpecialRatesTable />
          </div>
          <BodyTwo selectedCity={selectedCity} selectedState={selectedState} />
          <BlogList blogs={blogs} />
          <BodyThree selectedCity={selectedCity} selectedState={selectedState} eggRates={eggRates} /> {/* Pass props to BodyThree */}
          <FAQ selectedCity={selectedCity} selectedState={selectedState} eggRates={eggRates} /> {/* Pass props to FAQ */}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MainPage;