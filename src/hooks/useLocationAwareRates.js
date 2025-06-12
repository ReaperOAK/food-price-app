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
  const [locationReady, setLocationReady] = useState(false);

  // Effect to resolve location data when city is provided without state
  useEffect(() => {
    const resolveLocationData = async () => {
      try {
        setLocationReady(false);
        
        if (selectedCity && !selectedState) {
          // If we have a city but no state, fetch the state first
          const stateData = await fetchStateForCity(selectedCity);
          if (stateData && stateData.state) {
            setSelectedState(stateData.state);
          }
        }
        
        setLocationReady(true);
      } catch (error) {
        console.error('Error resolving location data:', error);
        setLocationReady(true); // Continue even if we can't resolve
      }
    };

    resolveLocationData();
  }, [selectedCity, selectedState]);

  // Effect to fetch rates once location data is ready
  useEffect(() => {
    const loadRates = async () => {
      if (!locationReady) return;
      
      setLoading(true);
      try {
        const [ratesData, specialRatesData] = await Promise.all([
          fetchRates(selectedCity, selectedState),
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
        
      } catch (error) {
        console.error('Error fetching rates:', error);
        setEggRates([]);
        setSpecialRates([]);
      } finally {
        setLoading(false);
      }
    };

    loadRates();
  }, [selectedCity, selectedState, locationReady]);

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
