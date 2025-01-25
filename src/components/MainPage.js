import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Navbar from './Navbar';
import RateTable from './RateTable';
import DefaultTable from './DefaultTable';
import Footer from './Footer';
import BodyOne from './BodyOne';
import BodyTwo from './BodyTwo';
import StatePage from './StatePage';
import StateList from './StateList';
import SpecialRatesTable from './SpecialRatesTable';
import BlogList from './BlogList';
import FAQ from './FAQ'; // Import the FAQ component
import blogs from '../data/blogs'; // Import the blogs list

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
    fetch('/php/get_states.php')
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(error => console.error('Error fetching states:', error));
  }, []);

  // Fetch cities when a state is selected or when the URL changes
  useEffect(() => {
    if (selectedState) {
      fetch(`/php/get_cities.php?state=${selectedState}`)
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(error => console.error('Error fetching cities:', error));
    }
  }, [selectedState]);

  // Fetch state for the city from the URL
  useEffect(() => {
    if (cityParam) {
      fetch(`/php/get_state_for_city.php?city=${selectedCity}`)
        .then(res => res.json())
        .then(data => {
          if (data.state) {
            setSelectedState(data.state);
            setSelectedCity(selectedCity);
          }
        })
        .catch(error => console.error('Error fetching state for city:', error));
    }
  }, [cityParam, selectedCity]);

  // Define handleFetchRates function
  const handleFetchRates = useCallback(() => {
    if (selectedCity && selectedState) {
      // Fetch rates for selected city and state
      fetch(`/php/get_rates.php?city=${selectedCity}&state=${selectedState}`)
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
      fetch(`/php/get_latest_rates.php`)
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
      setSelectedState('');
    }
  }, [stateParam, cityParam]);

  return (
    <>
      <Helmet>
        <title>{`Egg Rates in ${displayName}`}</title>
        <meta name="description" content={`Get the latest egg rates in ${displayName}.`} />
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
          <FAQ selectedCity={selectedCity} selectedState={selectedState} eggRates={eggRates} /> {/* Pass props to FAQ */}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MainPage;