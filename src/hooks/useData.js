import { useState, useEffect } from 'react';
import { fetchWebStories, fetchRates, fetchSpecialRates, fetchStates, fetchCities, fetchStateForCity } from '../services/api';

export const useWebStories = (showWebStories) => {
  const [allWebStories, setAllWebStories] = useState([]);
  const [webStoriesLoading, setWebStoriesLoading] = useState(false);

  useEffect(() => {
    const handleFetchWebStories = async () => {
      // Always fetch web stories data when hook is first used
      // This ensures data is available when the user clicks "Show Stories"
      try {
        setWebStoriesLoading(true);
        const data = await fetchWebStories();
        // Return all web stories for carousel display
        setAllWebStories(data || []);
      } catch (error) {
        console.error('Error fetching web stories:', error);
        setAllWebStories([]);
      } finally {
        setWebStoriesLoading(false);
      }
    };    // Fetch web stories on component mount to have data ready
    if (allWebStories.length === 0) {
      handleFetchWebStories();
    }
  }, [allWebStories.length]); // Include allWebStories.length as dependency

  return { allWebStories, webStoriesLoading };
};

export const useRates = (selectedCity, selectedState) => {
  const [eggRates, setEggRates] = useState([]);
  const [specialRates, setSpecialRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRates = async () => {
      setLoading(true);
      try {
        // Always fetch both rates and special rates
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

    // Always load rates - the API will handle whether to use city, state, or general rates
    loadRates();
  }, [selectedCity, selectedState]);

  return { eggRates, specialRates, loading };
};

export const useLocations = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchStates()
      .then(data => setStates(data))
      .catch(error => console.error('Error fetching states:', error));
  }, []);

  const loadCities = async (state) => {
    if (state) {
      try {
        const data = await fetchCities(state);
        setCities(data);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      }
    }
  };
  const loadStateForCity = async (city) => {
    try {
      const data = await fetchStateForCity(city);
      return data.state;
    } catch (error) {
      console.error('Error fetching state for city:', error);
      return null;
    }
  };

  return { states, cities, loadCities, loadStateForCity };
};

export const useBlogs = () => {
  const [blogs, setBlogs] = useState([]);

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

  return { blogs };
};

// Export the location-aware rates hook
export { useLocationAwareRates } from './useLocationAwareRates';
