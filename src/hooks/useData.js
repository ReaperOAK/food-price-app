import { useState, useEffect } from 'react';
import { fetchWebStories, fetchRates, fetchSpecialRates, fetchStates, fetchCities, fetchStateForCity } from '../services/api';

// Helper function to randomly select 3 stories
const getRandomStories = (stories, count = 3) => {
  if (!stories || stories.length === 0) return [];
  if (stories.length <= count) return stories;
  
  const shuffled = [...stories].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const useWebStories = (showWebStories) => {
  const [featuredWebStories, setFeaturedWebStories] = useState([]);
  const [webStoriesLoading, setWebStoriesLoading] = useState(false);

  useEffect(() => {
    const handleFetchWebStories = async () => {
      if (!showWebStories) return;
      try {
        setWebStoriesLoading(true);
        const data = await fetchWebStories();
        // Use random selection instead of just taking first 3
        setFeaturedWebStories(getRandomStories(data, 3));
      } catch (error) {
        console.error('Error fetching web stories:', error);
        setFeaturedWebStories([]);
      } finally {
        setWebStoriesLoading(false);
      }
    };

    handleFetchWebStories();
  }, [showWebStories]);

  return { featuredWebStories, webStoriesLoading };
};

export const useRates = (selectedCity, selectedState) => {
  const [eggRates, setEggRates] = useState([]);
  const [specialRates, setSpecialRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRates = async () => {
      setLoading(true);
      try {
        const [ratesData, specialRatesData] = await Promise.all([
          fetchRates(selectedCity, selectedState),
          fetchSpecialRates()
        ]);
        setEggRates(ratesData);
        setSpecialRates(specialRatesData);
      } catch (error) {
        console.error('Error fetching rates:', error);
        setEggRates([]);
        setSpecialRates([]);
      } finally {
        setLoading(false);
      }
    };

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
