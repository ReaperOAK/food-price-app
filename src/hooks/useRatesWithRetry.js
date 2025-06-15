import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchStateForCity } from '../services/api';

/**
 * Enhanced hook for fetching rates with retry logic and better error handling
 * Addresses the "data not available" issue by implementing robust retry mechanisms
 */
export const useRatesWithRetry = (initialCity, initialState) => {
  const [selectedCity, setSelectedCity] = useState(initialCity || '');
  const [selectedState, setSelectedState] = useState(initialState || '');
  const [eggRates, setEggRates] = useState([]);
  const [specialRates, setSpecialRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [locationReady, setLocationReady] = useState(false);
  
  // Refs to track current requests and prevent race conditions
  const currentRequestRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // Configuration
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 1000; // 1 second
  const REQUEST_TIMEOUT = 10000; // 10 seconds

  // Helper function to add cache-busting parameter
  const addCacheBuster = (url) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}nocache=${Date.now()}`;
  };

  // Enhanced fetch with timeout and retry logic
  const fetchWithRetry = useCallback(async (fetchFunction, ...args) => {
    let lastError = null;
    
    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        // Create abort controller for this request
        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        // Set timeout
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, REQUEST_TIMEOUT);
        
        const result = await fetchFunction(...args, { signal: controller.signal });
        
        clearTimeout(timeoutId);
        
        // Validate result
        if (Array.isArray(result) && result.length >= 0) {
          return result;
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt + 1} failed:`, error.message);
        
        // Don't retry if aborted
        if (error.name === 'AbortError') {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < MAX_RETRY_ATTEMPTS - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
        }
      }
    }
    
    throw lastError;
  }, []);
  // Enhanced fetchRates with cache busting and better error handling
  const fetchRatesWithCacheBuster = useCallback(async (city, state, options = {}) => {
    try {
      let url;
      if (city || state) {
        const params = new URLSearchParams();
        if (city) params.append('city', city.trim());
        if (state) params.append('state', state.trim());
        url = `/php/api/rates/get_rates.php?${params.toString()}`;
      } else {
        // For home page, use get_latest_rates.php with empty body
        url = `/php/api/rates/get_latest_rates.php`;
      }
      
      // Add cache buster on retry attempts
      if (retryCount > 0) {
        url = addCacheBuster(url);
      }

      const fetchOptions = {
        signal: options.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      };

      // For get_latest_rates.php, send empty array as POST data
      if (!city && !state) {
        fetchOptions.method = 'POST';
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify([]);
      }

      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get response text first to validate JSON
      const responseText = await response.text();
      
      if (!responseText.trim()) {
        console.warn('Empty response received');
        return [];
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Invalid JSON response:', responseText.substring(0, 200));
        throw new Error(`Invalid JSON response: ${jsonError.message}`);
      }
      
      // Handle different response formats
      if (data && data.error) {
        throw new Error(data.error);
      }
      
      if (data && data.message && !Array.isArray(data)) {
        console.warn('No data available:', data.message);
        return [];
      }
      
      if (!Array.isArray(data)) {
        console.warn('Expected array but got:', typeof data, data);
        return [];
      }
      
      return data.map(item => {
        const rate = parseFloat(item.rate);
        return {
          ...item,
          rate: isNaN(rate) ? 0 : rate,
        };
      });
    } catch (error) {
      console.error('Error in fetchRatesWithCacheBuster:', error);
      throw error;
    }
  }, [retryCount]);

  // Enhanced fetchSpecialRates with cache busting
  const fetchSpecialRatesWithCacheBuster = useCallback(async (options = {}) => {
    try {
      let url = '/php/api/rates/get_special_rates.php';
      
      // Add cache buster on retry attempts
      if (retryCount > 0) {
        url = addCacheBuster(url);
      }

      const response = await fetch(url, {
        signal: options.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data.map(item => ({
        ...item,
        rate: parseFloat(item.rate),
      }));
    } catch (error) {
      console.error('Error in fetchSpecialRatesWithCacheBuster:', error);
      throw error;
    }
  }, [retryCount]);

  // Retry function
  const retryFetch = useCallback(() => {
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      setRetryCount(prev => prev + 1);
      setError(null);
    }
  }, [retryCount]);

  // Main data loading function
  const loadData = useCallback(async () => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const requestId = Date.now();
    currentRequestRef.current = requestId;
    
    setLoading(true);
    setError(null);
    
    try {
      let finalCity = selectedCity;
      let finalState = selectedState;
      
      // Step 1: Resolve location if needed
      if (selectedCity && !selectedState) {
        try {
          const stateData = await fetchStateForCity(selectedCity);
          if (stateData && stateData.state) {
            finalState = stateData.state;
            setSelectedState(stateData.state);
          }
        } catch (error) {
          console.warn('Error fetching state for city:', error);
          // Continue with just the city
        }
      }
      
      // Check if this request is still current
      if (currentRequestRef.current !== requestId) {
        return; // Request was superseded
      }
        // Step 2: Fetch rates with retry logic
      const [ratesData, specialRatesData] = await Promise.all([
        fetchWithRetry(fetchRatesWithCacheBuster, finalCity, finalState),
        fetchWithRetry(fetchSpecialRatesWithCacheBuster)
      ]);
      
      // Check if this request is still current before updating state
      if (currentRequestRef.current === requestId) {
        setEggRates(ratesData || []);
        setSpecialRates(specialRatesData || []);
        setRetryCount(0); // Reset retry count on success
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Check if this request is still current before updating error state
      if (currentRequestRef.current === requestId) {
        setError(error);
        setEggRates([]);
        setSpecialRates([]);
      }
    } finally {
      // Only update loading state if this request is still current
      if (currentRequestRef.current === requestId) {
        setLoading(false);
        setLocationReady(true);
      }
    }
  }, [selectedCity, selectedState, fetchWithRetry, fetchRatesWithCacheBuster, fetchSpecialRatesWithCacheBuster]);  // Effect to load data when location changes
  useEffect(() => {
    if (selectedCity || selectedState) {
      loadData();
    } else {
      // For home page, fetch default data using the same function but without location
      loadData();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedCity, selectedState, retryCount, loadData]);

  // Effect to retry when retryCount changes
  useEffect(() => {
    if (retryCount > 0) {
      console.log(`Retrying data fetch (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
    }
  }, [retryCount]);

  return {
    selectedCity,
    selectedState,
    setSelectedCity,
    setSelectedState,
    eggRates,
    specialRates,
    loading,
    locationReady,
    error,
    retryCount,
    retryFetch,
    canRetry: retryCount < MAX_RETRY_ATTEMPTS
  };
};

export default useRatesWithRetry;
