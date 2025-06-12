import { useState, useEffect } from 'react';
import { fetchRates, fetchSpecialRates, fetchStateForCity } from '../services/api';

/**
 * Custom hook that coordinates location data resolution with rate fetching
 * This ensures that we have complete location information before making rate API calls
 */
export const useLocationAwareRates = (initialCity, initialState) => {
  const [selectedCity, setSelectedCity] = useState(initialCity || '');
  const [selectedState, setSelectedState] = useState(initialState || '');
  const [eggRates, setEggRates] = useState([]);
  const [specialRates, setSpecialRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationReady, setLocationReady] = useState(false);  // Combined effect to handle both location resolution and rate fetching
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        let finalCity = selectedCity;
        let finalState = selectedState;
        
        // If we have a city but no state, fetch the state first
        if (selectedCity && !selectedState) {
          try {
            const stateData = await fetchStateForCity(selectedCity);
            if (stateData && stateData.state) {
              finalState = stateData.state;
              setSelectedState(stateData.state);
            }
          } catch (error) {
            console.error('Error fetching state for city:', error);
            // Continue with just the city
          }
        }
        
        // Only fetch rates if we have at least city or state
        if (finalCity || finalState) {
          const [ratesData, specialRatesData] = await Promise.all([
            fetchRates(finalCity, finalState),
            fetchSpecialRates()
          ]);
          
          // Update state only if data is valid
          if (Array.isArray(ratesData)) {
            setEggRates(ratesData);
          } else {
            console.warn('Invalid rates data received:', ratesData);
            setEggRates([]);
          }
          
          if (Array.isArray(specialRatesData)) {
            setSpecialRates(specialRatesData);
          } else {
            console.warn('Invalid special rates data received:', specialRatesData);
            setSpecialRates([]);
          }
        } else {
          // No location data available
          setEggRates([]);
          setSpecialRates([]);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        setEggRates([]);
        setSpecialRates([]);
      } finally {
        setLoading(false);
        setLocationReady(true);
      }
    };

    // Only run if we have some location data or if this is the initial load
    if (selectedCity || selectedState) {
      loadData();
    } else {
      setLoading(false);
      setLocationReady(true);
      setEggRates([]);
      setSpecialRates([]);
    }
  }, [selectedCity, selectedState]);

  return {
    selectedCity,
    selectedState,
    setSelectedCity,
    setSelectedState,
    eggRates,
    specialRates,
    loading,
    locationReady
  };
};

export default useLocationAwareRates;
