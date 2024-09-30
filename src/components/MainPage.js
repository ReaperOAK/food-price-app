import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, matchPath } from 'react-router-dom';
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

  // Fetch states on mount
  useEffect(() => {
    fetch('https://blueviolet-gerbil-672303.hostingersite.com/php/get_states.php')
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(error => console.error('Error fetching states:', error));
  }, []);

  // Fetch cities when a state is selected
  useEffect(() => {
    if (selectedState) {
      fetch(`https://blueviolet-gerbil-672303.hostingersite.com/php/get_cities.php?state=${selectedState}`)
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(error => console.error('Error fetching cities:', error));
    }
  }, [selectedState]);

  // Fetch state for the city from the URL
  useEffect(() => {
    if (city) {
      fetch(`https://blueviolet-gerbil-672303.hostingersite.com/php/get_state_for_city.php?city=${city}`)
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
      fetch(`https://blueviolet-gerbil-672303.hostingersite.com/php/get_rates.php?city=${selectedCity}&state=${selectedState}`)
        .then(res => res.json())
        .then(data => {
          const convertedData = data.map(item => ({
            ...item,
            rate: parseFloat(item.rate) // Convert rate to a number
          }));
          setEggRates(convertedData);
        })
        .catch(error => console.error('Error fetching rates:', error));
    } else {
      // Fetch latest rates when no city/state is selected
      fetch(`https://blueviolet-gerbil-672303.hostingersite.com/php/get_latest_rates.php`)
        .then(res => res.json())
        .then(data => {
          const convertedData = data.map(item => ({
            ...item,
            rate: parseFloat(item.rate) // Convert rate to a number
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

  // Update URL when selectedCity changes
  useEffect(() => {
    if (selectedCity) {
      navigate(`/${selectedCity}`);
    }
  }, [selectedCity, navigate]);

  // Update URL when selectedState changes
  useEffect(() => {
    if (selectedState && !selectedCity) {
      navigate(`/state/${selectedState}`);
    }
  }, [selectedState, selectedCity, navigate]);

  // Check if the current URL matches /state/:state
  const stateMatch = matchPath('/state/:state', location.pathname);

  return (
    <div>
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState} 
        setSelectedCity={setSelectedCity} 
        selectedCity={selectedCity}
      />
      <BodyOne/>

      {stateMatch ? (
        <StatePage />
      ) : (
        <>
          {selectedCity && selectedState ? (
            <RateTable key={`${selectedCity}-${selectedState}`} selectedCity={selectedCity} selectedState={selectedState} eggRates={eggRates} />
          ) : (
            <DefaultTable key="default-table" eggRates={eggRates} />
          )}
        </>
      )}
      <StateList/>
      <SpecialRatesTable/>
      <BodyTwo/>
      <Footer />
    </div>
  );
};

export default MainPage;