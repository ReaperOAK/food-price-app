/**
 * Enhanced API service with improved error handling, caching, and retry logic
 * Addresses data loading issues by implementing robust data fetching strategies
 */

// Cache for storing recent API responses
const API_CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Configuration
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Enhanced fetch function with timeout, retry, and cache busting
 */
const enhancedFetch = async (url, options = {}) => {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    cacheBust = false,
    useCache = true,
    ...fetchOptions
  } = options;

  // Check cache first
  if (useCache && !cacheBust) {
    const cacheKey = `${url}_${JSON.stringify(fetchOptions)}`;
    const cached = API_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🎯 Cache hit for:', url);
      return cached.data;
    }
  }

  let finalUrl = url;
  
  // Add cache busting parameter if needed
  if (cacheBust) {
    const separator = url.includes('?') ? '&' : '?';
    finalUrl = `${url}${separator}nocache=${Date.now()}&t=${Math.random()}`;
  }

  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`📡 Fetching (attempt ${attempt + 1}/${retries}):`, finalUrl);

      // Create abort controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(finalUrl, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...fetchOptions.headers
        }
      });

      clearTimeout(timeoutId);      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get response text first to check content type
      const responseText = await response.text();
      
      // Check if response is actually JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('❌ Invalid JSON response:', responseText.substring(0, 200));
        throw new Error(`Invalid JSON response: ${jsonError.message}. Response: ${responseText.substring(0, 100)}`);
      }

      // Validate that we got an array (expected format)
      if (!Array.isArray(data)) {
        console.warn('⚠️ Response is not an array:', data);
        // If it's an object with error property, throw that error
        if (data && typeof data === 'object' && data.error) {
          throw new Error(data.error);
        }
        // Otherwise, try to convert to array or return empty array
        data = data ? [data] : [];
      }

      // Cache successful response
      if (useCache) {
        const cacheKey = `${url}_${JSON.stringify(fetchOptions)}`;
        API_CACHE.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      console.log('✅ Successfully fetched:', finalUrl);
      return data;

    } catch (error) {
      lastError = error;
      console.warn(`❌ Attempt ${attempt + 1} failed for ${finalUrl}:`, error.message);

      // Don't retry if aborted or if it's the last attempt
      if (error.name === 'AbortError' || attempt === retries - 1) {
        break;
      }

      // Wait before retrying with exponential backoff
      const delay = RETRY_DELAY * Math.pow(2, attempt);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error('💥 All attempts failed for:', finalUrl, lastError);
  throw lastError;
};

/**
 * Clear API cache
 */
export const clearApiCache = () => {
  console.log('🧹 Clearing API cache');
  API_CACHE.clear();
};

/**
 * Enhanced fetchRates with improved error handling
 */
export const fetchRates = async (city, state, options = {}) => {
  try {
    let url;
    if (city || state) {
      const params = new URLSearchParams();
      if (city) params.append('city', city.trim());
      if (state) params.append('state', state.trim());
      url = `/php/api/rates/get_rates.php?${params.toString()}`;
    } else {
      url = `/php/api/rates/get_latest_rates.php`;
    }

    console.log('🔍 Fetching rates for:', { city, state });

    const data = await enhancedFetch(url, {
      ...options,
      cacheBust: options.forceRefresh || false
    });

    // Validate and transform data
    if (!Array.isArray(data)) {
      console.warn('⚠️ Expected array but got:', typeof data, data);
      
      // Handle different response formats
      if (data && data.rates && Array.isArray(data.rates)) {
        return data.rates;
      } else if (data && data.message === "No rates found") {
        return [];
      } else {
        return [];
      }
    }

    // Transform and validate rate data
    const transformedData = data.map(item => {
      const rate = parseFloat(item.rate);
      return {
        id: item.id || String(Math.random()),
        city: item.city || city || 'Unknown',
        state: item.state || state || 'Unknown',
        date: item.date || new Date().toISOString().split('T')[0],
        rate: isNaN(rate) ? 0 : rate,
      };
    });

    console.log('✅ Successfully processed rates:', transformedData.length, 'items');
    return transformedData;

  } catch (error) {
    console.error('💥 Error in fetchRates:', error);
    throw new Error(`Failed to fetch rates: ${error.message}`);
  }
};

/**
 * Enhanced fetchSpecialRates
 */
export const fetchSpecialRates = async (options = {}) => {
  try {
    console.log('🔍 Fetching special rates');

    const data = await enhancedFetch('/php/api/rates/get_special_rates.php', {
      ...options,
      cacheBust: options.forceRefresh || false
    });

    if (!Array.isArray(data)) {
      console.warn('⚠️ Special rates: expected array but got:', typeof data);
      return [];
    }

    const transformedData = data.map(item => ({
      id: item.id || String(Math.random()),
      city: item.city || 'Special',
      state: item.state || 'Special',
      date: item.date || new Date().toISOString().split('T')[0],
      rate: parseFloat(item.rate) || 0,
    }));

    console.log('✅ Successfully processed special rates:', transformedData.length, 'items');
    return transformedData;

  } catch (error) {
    console.error('💥 Error in fetchSpecialRates:', error);
    throw new Error(`Failed to fetch special rates: ${error.message}`);
  }
};

/**
 * Enhanced fetchLatestRates
 */
export const fetchLatestRates = async (cityStateArray = null, options = {}) => {
  try {
    console.log('🔍 Fetching latest rates');

    let endpoint = '/php/api/rates/get_latest_rates.php';
    let fetchOptions = {
      ...options,
      cacheBust: options.forceRefresh || false,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cityStateArray || []) // Send empty array if no cities specified
    };
    
    const data = await enhancedFetch(endpoint, fetchOptions);

    // Handle different response formats
    if (Array.isArray(data)) {
      const transformedData = data.map(item => {
        const rate = parseFloat(item.rate);
        return {
          id: item.id || String(Math.random()),
          city: item.city || 'Unknown',
          state: item.state || 'Unknown',
          date: item.date || new Date().toISOString().split('T')[0],
          rate: isNaN(rate) ? 0 : rate,
        };
      });

      console.log('✅ Successfully processed latest rates:', transformedData.length, 'items');
      return transformedData;
    } else if (data && data.message === "No rates found") {
      console.log('ℹ️ No rates found');
      return [];
    } else {
      console.warn('⚠️ Unexpected response format:', data);
      return [];
    }

  } catch (error) {
    console.error('💥 Error in fetchLatestRates:', error);
    throw new Error(`Failed to fetch latest rates: ${error.message}`);
  }
};

/**
 * Enhanced fetchStateForCity
 */
export const fetchStateForCity = async (city, options = {}) => {
  try {
    console.log('🔍 Fetching state for city:', city);

    const data = await enhancedFetch(`/php/api/location/get_state_for_city.php?city=${encodeURIComponent(city)}`, {
      ...options,
      cacheBust: options.forceRefresh || false
    });

    if (data && data.state) {
      console.log('✅ Found state for city:', city, '->', data.state);
      return data;
    } else {
      console.warn('⚠️ No state found for city:', city);
      return null;
    }

  } catch (error) {
    console.error('💥 Error in fetchStateForCity:', error);
    throw new Error(`Failed to fetch state for city: ${error.message}`);
  }
};

/**
 * Enhanced fetchStatesAndCities
 */
export const fetchStatesAndCities = async (options = {}) => {
  try {
    console.log('🔍 Fetching states and cities');

    const data = await enhancedFetch('/php/api/location/get_states_and_cities.php', {
      ...options,
      cacheBust: options.forceRefresh || false
    });

    if (typeof data === 'object' && data !== null) {
      console.log('✅ Successfully fetched states and cities');
      return data;
    } else {
      console.warn('⚠️ Invalid states and cities data format');
      return {};
    }

  } catch (error) {
    console.error('💥 Error in fetchStatesAndCities:', error);
    throw new Error(`Failed to fetch states and cities: ${error.message}`);
  }
};

// Re-export existing functions with enhanced versions
export const fetchWebStories = async (options = {}) => {
  try {
    const data = await enhancedFetch('/php/get_web_stories.php', options);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching web stories:', error);
    return [];
  }
};

export const fetchStates = async (options = {}) => {
  try {
    const data = await enhancedFetch('/php/api/location/get_states.php', options);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

export const fetchCities = async (state, options = {}) => {
  try {
    const data = await enhancedFetch(`/php/api/location/get_cities.php?state=${encodeURIComponent(state)}`, options);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

export const fetchRatesForDays = async (city, state, days, options = {}) => {
  try {
    const data = await enhancedFetch(`/php/api/rates/get_rates.php?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&days=${days}`, options);
    
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(item => ({
      id: item.id || String(Math.random()),
      city: item.city || city,
      state: item.state || state,
      date: item.date || new Date().toISOString().split('T')[0],
      rate: typeof item.rate === 'number' ? item.rate : parseFloat(item.rate) || 0
    }));
  } catch (error) {
    console.error('Error fetching rates for days:', error);
    return [];
  }
};

export const fetchAllRates = async (date, options = {}) => {
  try {
    const url = date ? `/php/api/rates/get_all_rates.php?date=${date}` : '/php/api/rates/get_all_rates.php';
    const data = await enhancedFetch(url, options);
    
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
    console.error('Error in fetchAllRates:', error);
    throw error;
  }
};

// Keep existing admin functions unchanged for now
export const updateMultipleRates = async (payload) => {
  const response = await fetch('/php/api/rates/update_multiple_rates.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to update rates');
  }
  return response.json();
};

export const deleteRate = async (id) => {
  const response = await fetch('/php/api/rates/delete_rate.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error('Failed to delete rate');
  }
  return response.json();
};

export const addStateOrCity = async (type, name, state = null) => {
  const response = await fetch('/php/api/location/add_state_or_city.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, name, ...(state && { state }) }),
  });
  if (!response.ok) {
    throw new Error(`Failed to add ${type}`);
  }
  return response.json();
};

export const removeStateOrCity = async (type, name, state = null) => {
  const response = await fetch('/php/api/location/remove_state_or_city.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, name, ...(state && { state }) }),
  });
  if (!response.ok) {
    throw new Error(`Failed to remove ${type}`);
  }
  return response.json();
};

export const updateRate = async (rate) => {
  const response = await fetch('/php/api/rates/update_rate.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rate),
  });
  if (!response.ok) {
    throw new Error('Failed to update rate');
  }
  return response.json();
};
