import { useState, useEffect } from 'react';
import { fetchStatesAndCities } from '../services/api';

// Helper function to randomly select items from an array
const getRandomItems = (array, count) => {
  if (!array || array.length === 0) return [];
  if (array.length <= count) return array;
  
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Safe string conversion helper
const safeToLowerCase = (value) => {
  if (!value) return '';
  return String(value).toLowerCase();
};

// Helper function to format city name for URL
const formatCityForUrl = (city) => {
  return safeToLowerCase(city).replace(/\s+/g, '-').replace(/[()]/g, '');
};

// Helper function to format state name for URL
const formatStateForUrl = (state) => {
  return safeToLowerCase(state).replace(/\s+/g, '-').replace(/[()]/g, '');
};

export const useRandomSeoLinks = (selectedCity, selectedState) => {
  const [randomCities, setRandomCities] = useState([]);
  const [randomStates, setRandomStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomLinks = async () => {
      try {
        setLoading(true);
        const data = await fetchStatesAndCities();
        
        // Extract all cities with their states
        const allCities = [];
        const allStates = Object.keys(data).filter(state => 
          state !== 'Unknown' && 
          state !== 'special' && 
          state !== selectedState // Exclude current state
        );

        Object.entries(data).forEach(([state, cities]) => {
          if (state !== 'Unknown' && state !== 'special') {
            cities.forEach(city => {
              // Exclude current city
              if (city !== selectedCity) {
                allCities.push({ city, state });
              }
            });
          }
        });

        // Get 6 random cities and 6 random states
        const selectedRandomCities = getRandomItems(allCities, 6);
        const selectedRandomStates = getRandomItems(allStates, 6);

        setRandomCities(selectedRandomCities);
        setRandomStates(selectedRandomStates);
      } catch (error) {
        console.error('Error fetching random SEO links:', error);
        setRandomCities([]);
        setRandomStates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomLinks();
  }, [selectedCity, selectedState]);

  // Format cities for display
  const formattedCities = randomCities.map(({ city, state }) => ({
    name: city,
    state: state,
    url: `/${formatCityForUrl(city)}-egg-rate`,
    displayName: `${city} Rates`
  }));

  // Format states for display
  const formattedStates = randomStates.map(state => ({
    name: state,
    url: `/state/${formatStateForUrl(state)}-egg-rate`,
    displayName: state
  }));

  return {
    randomCities: formattedCities,
    randomStates: formattedStates,
    loading
  };
};
