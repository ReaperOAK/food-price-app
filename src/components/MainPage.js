import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import RateTable from './RateTable';
import DefaultTable from './DefaultTable';
import SEOText from './SEOText';
import FAQ from './FAQ';
import Footer from './Footer';
import BodyOne from './BodyOne';

const MainPage = () => {
  const { city } = useParams();
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState('');
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

  return (
    <div>
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState} 
        setSelectedCity={setSelectedCity} 
        selectedCity={selectedCity}
      />
      <BodyOne/>

      {selectedCity && selectedState ? (
        <RateTable key={`${selectedCity}-${selectedState}`} selectedCity={selectedCity} selectedState={selectedState} eggRates={eggRates} />
      ) : (
        <DefaultTable key="default-table" eggRates={eggRates} />
      )}
      <SEOText selectedCity={selectedCity} selectedState={selectedState} />
      
      
      <FAQ />
      <Footer />
    </div>
  );
};

export default MainPage;