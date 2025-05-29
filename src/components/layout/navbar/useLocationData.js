import { useState, useCallback, useEffect } from 'react';

const useLocationData = () => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const processLocationData = useCallback((data) => {
    if (typeof data !== 'object' || data === null) {
      console.error('Expected object with state/city data, got:', typeof data);
      return { combinedOptions: [] };
    }

    try {
      // Create options for both states and cities
      const combinedOptions = [];

      // Process each state and its cities
      Object.entries(data).forEach(([state, cities]) => {
        if (state !== 'Unknown' && state !== 'special') { // Skip Unknown and special categories
          // Add state as a group header
          combinedOptions.push({
            label: state,
            options: cities.map(city => ({
              value: city,
              label: city,
              type: 'city',
              state: state
            }))
          });
        }
      });

      // If there are cities in the Unknown category, add them directly
      if (data['Unknown']) {
        data['Unknown'].forEach(city => {
          // Only add if not already present
          if (!combinedOptions.some(group => 
            group.options.some(option => option.value.toLowerCase() === city.toLowerCase())
          )) {
            combinedOptions.push({
              value: city,
              label: city,
              type: 'city'
            });
          }
        });
      }

      console.log('Processed options:', combinedOptions);
      return { combinedOptions };
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
        }

        const data = await response.json();
        console.log('Fetched data:', data);
        
        const { combinedOptions } = processLocationData(data);
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
