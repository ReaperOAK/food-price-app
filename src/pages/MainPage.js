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
import StakeAdPopup from '../components/common/StakeAdPopup';
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
    "description": `Latest egg rates in ${displayName}. Check today's egg prices updated on ${formattedDate}.`,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": currentRate,
      "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock"
    }
  };
  
  // Add FAQPage structured data
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": []
  };
  
  // Add FAQ items based on location
  if (selectedCity) {
    faqStructuredData.mainEntity.push(
      {
        "@type": "Question",
        "name": `What is today's egg rate in ${selectedCity}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Today's egg rate in ${selectedCity}, ${selectedState} is ₹${currentRate} per egg (as of ${formattedDate}).`
        }
      },
      {
        "@type": "Question",
        "name": `What is the price of 30 eggs (1 tray) in ${selectedCity} today?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The price of 30 eggs (1 tray) in ${selectedCity} today is ₹${trayPrice} (as of ${formattedDate}).`
        }
      },
      {
        "@type": "Question",
        "name": `What is the NECC egg rate in ${selectedCity} today?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The NECC egg rate in ${selectedCity} today is ₹${currentRate} per egg. NECC (National Egg Coordination Committee) updates egg prices daily based on market conditions.`
        }
      }
    );
  } else if (selectedState) {
    faqStructuredData.mainEntity.push(
      {
        "@type": "Question",
        "name": `What are today's egg rates in ${selectedState}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Today's egg rates in ${selectedState} vary by city. The average egg rate in ${selectedState} is approximately ₹${currentRate} per egg (as of ${formattedDate}).`
        }
      },
      {
        "@type": "Question",
        "name": `How much does a tray of 30 eggs cost in ${selectedState}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `A tray of 30 eggs in ${selectedState} costs approximately ₹${trayPrice} (as of ${formattedDate}). Prices may vary slightly between cities.`
        }
      }
    );
  } else {
    faqStructuredData.mainEntity.push(
      {
        "@type": "Question",
        "name": "What is today's egg rate in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Today's all India egg rate average is ₹${currentRate} per egg (as of ${formattedDate}). Prices vary by city and region.`
        }
      },
      {
        "@type": "Question",
        "name": "What is the NECC egg rate today?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Today's NECC egg rate is ₹${currentRate} per egg. The National Egg Coordination Committee (NECC) updates egg prices daily across India.`
        }
      },
      {
        "@type": "Question",
        "name": "How much does a tray of 30 eggs cost in India today?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `A tray of 30 eggs costs approximately ₹${trayPrice} in India today (as of ${formattedDate}). Prices may vary by city and market conditions.`
        }
      }
    );
  }
  
  // Create SEO title and description based on location
  const getSeoTitle = () => {
    if (selectedCity) {
      return `${selectedCity} Egg Rate Today - ₹${currentRate} (${formattedDate}) | NECC Egg Price`;
    } else if (selectedState) {
      return `${selectedState} Egg Rates Today - NECC Egg Prices in ${selectedState} (${formattedDate})`;
    } else {
      return 'Today Egg Rate - Check Latest NECC Egg Price Across India';
    }
  };
  
  const getSeoDescription = () => {
    if (selectedCity) {
      return `Today's egg rate in ${selectedCity}, ${selectedState}: ₹${currentRate}/egg, ₹${trayPrice}/tray (30 eggs). Check latest NECC egg price in ${selectedCity} updated on ${formattedDate}. Daily updated wholesale and retail rates.`;
    } else if (selectedState) {
      return `Today's egg rates in all cities of ${selectedState}. Check latest NECC egg prices in ${selectedState} updated on ${formattedDate}. Compare egg prices across all major markets in ${selectedState}.`;
    } else {
      return `Today's egg rate: Check latest NECC egg price across India. Daily updated egg rates for Mumbai, Chennai, Bangalore, Kolkata, Barwala & 100+ cities. Compare wholesale & retail egg prices across India (${formattedDate}).`;
    }
  };
  
  const getSeoKeywords = () => {
    if (selectedCity) {
      return `egg rate today, ${selectedCity.toLowerCase()} egg rate, ${selectedCity.toLowerCase()} egg price today, necc egg rate ${selectedCity.toLowerCase()}, ${selectedCity.toLowerCase()} today egg rate, egg price in ${selectedCity.toLowerCase()}, egg rate in ${selectedCity.toLowerCase()} today`;
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
        <link rel="canonical" href={`https://todayeggrates.com${location.pathname}`} />
        <meta name="keywords" content={getSeoKeywords()} />
        
        {/* Add structured data for rich snippets */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        {/* Add FAQ structured data */}
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
        
        {/* Add lastmod date for search engines */}
        <meta property="article:modified_time" content={new Date().toISOString()} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={getSeoTitle()} />
        <meta property="og:description" content={getSeoDescription()} />
        <meta property="og:url" content={`https://todayeggrates.com${location.pathname}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://todayeggrates.com/eggpic.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getSeoTitle()} />
        <meta name="twitter:description" content={getSeoDescription()} />
        <meta name="twitter:image" content="https://todayeggrates.com/eggpic.png" />
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
            <StateList states={states} cities={cities} />
            <SpecialRatesTable />
          </div>
          <BodyTwo selectedCity={selectedCity} selectedState={selectedState} />
          <BlogList blogs={blogs} selectedCity={selectedCity} selectedState={selectedState} />
          <BodyThree selectedCity={selectedCity} selectedState={selectedState} eggRates={eggRates} />
          <FAQ selectedCity={selectedCity} selectedState={selectedState} eggRates={eggRates} />
        </div>
        <StakeAdPopup />
        <Footer />
      </div>
    </>
  );
};

export default MainPage;