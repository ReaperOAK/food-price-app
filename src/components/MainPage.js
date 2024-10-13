import React, { useState, useEffect } from 'react';
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

const MainPage = () => {
  const { city, state } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState(state || '');
  const [selectedCity, setSelectedCity] = useState(city || '');
  const [eggRates, setEggRates] = useState([]);
  const displayName = selectedCity ? selectedCity : selectedState ? selectedState : 'India';

  // Fetch states on mount
  useEffect(() => {
    fetch('https://todayeggrates.com/php/get_states.php')
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(error => console.error('Error fetching states:', error));
  }, []);

  // Fetch cities when a state is selected
  useEffect(() => {
    if (selectedState) {
      fetch(`https://todayeggrates.com/php/get_cities.php?state=${selectedState}`)
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(error => console.error('Error fetching cities:', error));
    }
  }, [selectedState]);

  // Fetch state for the city from the URL
  useEffect(() => {
    if (city) {
      fetch(`https://todayeggrates.com/php/get_state_for_city.php?city=${city}`)
        .then(res => res.json())
        .then(data => {
          if (data.state) {
            setSelectedState(data.state);
            setSelectedCity(city);
          }
        })
        .catch(error => console.error('Error fetching state for city:', error));
    }
  }, [city]);

  // Define handleFetchRates function
  const handleFetchRates = () => {
    if (selectedCity && selectedState) {
      // Fetch rates for selected city and state
      fetch(`https://todayeggrates.com/php/get_rates.php?city=${selectedCity}&state=${selectedState}`)
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
      fetch(`https://todayeggrates.com/php/get_latest_rates.php`)
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
  };

  // Fetch rates automatically when state or city changes
  useEffect(() => {
    handleFetchRates();
  }, [selectedState, selectedCity]); // Run effect whenever selectedState or selectedCity changes

  // Check if the current URL matches /state/:state
  const stateMatch = matchPath('/state/:state', location.pathname);

  // Update URL when selectedCity or selectedState changes
  useEffect(() => {
    if (selectedCity) {
      // Update the URL format to /city-egg-rate (for frontend)
      navigate(`/${selectedCity.toLowerCase()}-egg-rate/`);
    } else if (selectedState && !selectedCity) {
      // Update the URL format to /state/state-egg-rate (for frontend)
      navigate(`/state/${selectedState.toLowerCase()}-egg-rate`);
    }
  }, [selectedCity, selectedState, navigate]);

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
            <StateList />
            <SpecialRatesTable />
          </div>
          <BodyTwo selectedCity={selectedCity} selectedState={selectedState} />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MainPage;