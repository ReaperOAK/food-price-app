import { useState, useCallback, useEffect } from 'react';

const useLocationData = () => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);  const processLocationData = useCallback((data) => {
    if (typeof data !== 'object' || data === null) {
      console.error('Expected object with state/city data, got:', typeof data);
      return [];
    }

    try {
      const combinedOptions = [];
      const processedCities = new Set(); // Track processed cities
      
      // First process normal states and their cities
      Object.entries(data).forEach(([state, cities]) => {
        if (state !== 'Unknown' && state !== 'special') {
          const cityOptions = cities.map(city => {
            processedCities.add(city.toLowerCase());
            return {
              value: city,
              label: city,
              type: 'city',
              state: state
            };
          });

          if (cityOptions.length > 0) {
            combinedOptions.push({
              label: state,
              options: cityOptions
            });
          }
        }
      });

      // Process special category
      if (data.special?.length > 0) {
        const specialOptions = data.special.map(item => ({
          value: item,
          label: item,
          type: 'special'
        }));
        
        combinedOptions.push({
          label: 'Special',
          options: specialOptions
        });
      }

      // Process Unknown cities that haven't been included yet
      if (data.Unknown?.length > 0) {
        const unknownCities = data.Unknown
          .filter(city => !processedCities.has(city.toLowerCase()))
          .map(city => ({
            value: city,
            label: city,
            type: 'city'
          }));

        if (unknownCities.length > 0) {
          combinedOptions.push({
            label: 'Other Cities',
            options: unknownCities
          });
        }
      }

      console.log('Processed options:', combinedOptions);
      return combinedOptions;
    } catch (err) {
      console.error('Error processing location data:', err);
      return { combinedOptions: [] };
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/php/api/location/get_states_and_cities.php', {
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }        const data = await response.json();
        console.log('Fetched data:', data);
        
        const combinedOptions = processLocationData(data);
        setOptions(combinedOptions);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching locations:', err);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();

    return () => abortController.abort();
  }, [processLocationData]);

  return { options, isLoading, error };
};

export default useLocationData;
