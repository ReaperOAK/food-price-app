import { useState, useCallback, useEffect } from 'react';

const useLocationData = () => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const processLocationData = useCallback((data) => {
    if (!Array.isArray(data)) {
      console.error('Expected array of locations, got:', typeof data);
      return { combinedOptions: [] };
    }

    try {
      // Create options for cities
      const cityOptions = data.map(city => ({
        value: city.name,
        label: city.name,
        type: 'city'
      }));

      return { combinedOptions: cityOptions };
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
        console.log('Fetched data:', data); // Debug log
        
        const { combinedOptions } = processLocationData(data);
        console.log('Processed options:', combinedOptions); // Debug log
        
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
