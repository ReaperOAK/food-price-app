export const fetchWebStories = async () => {
  const response = await fetch('/php/get_web_stories.php');
  if (!response.ok) {
    throw new Error('Failed to fetch web stories');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const fetchRates = async (city, state) => {
  try {
    // Build URL with proper encoding and validation
    let url;
    if (city || state) {
      // Use get_rates.php when we have either city or state
      const params = new URLSearchParams();
      if (city) {
        params.append('city', city.trim());
      }
      if (state) {
        params.append('state', state.trim());
      }
      url = `/php/api/rates/get_rates.php?${params.toString()}`;
    } else {
      // Only use get_latest_rates.php when we have no specific location
      url = `/php/api/rates/get_latest_rates.php`;
    }

    console.log('Fetching rates from:', url); // Debug log
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate that we got an array
    if (!Array.isArray(data)) {
      console.warn('Expected array but got:', typeof data, data);
      return [];
    }
    
    // Transform and validate rate data
    return data.map(item => {
      const rate = parseFloat(item.rate);
      return {
        ...item,
        rate: isNaN(rate) ? 0 : rate,
      };
    });
  } catch (error) {
    console.error('Error in fetchRates:', error);
    throw error; // Re-throw to let the hook handle it
  }
};

export const fetchSpecialRates = async () => {
  const response = await fetch('/php/api/rates/get_special_rates.php');
  const data = await response.json();
  return data.map(item => ({
    ...item,
    rate: parseFloat(item.rate),
  }));
};

export const fetchStates = async () => {
  const response = await fetch('/php/api/location/get_states.php');
  return response.json();
};

export const fetchCities = async (state) => {
  const response = await fetch(`/php/api/location/get_cities.php?state=${state}`);
  return response.json();
};

export const fetchStateForCity = async (city) => {
  const response = await fetch(`/php/api/location/get_state_for_city.php?city=${city}`);
  return response.json();
};

export const fetchStatesAndCities = async (signal) => {
  const response = await fetch('/php/api/location/get_states_and_cities.php', {
    signal
  });
  if (!response.ok) {
    throw new Error('Failed to fetch locations');
  }
  return response.json();
};

export const checkWebStoryFileExists = async (slug) => {
  const response = await fetch(`/ampstory/${slug}.html`, { 
    method: 'HEAD',
    headers: {
      'Accept': 'text/html',
    },
  });
  if (!response.ok) {
    throw new Error('Web story content not found');
  }
  return true;
};

export const fetchRatesForDays = async (city, state, days) => {
  const response = await fetch(`/php/api/rates/get_rates.php?city=${city}&state=${state}&days=${days}`);
  if (!response.ok) {
    throw new Error('Failed to fetch rates');
  }
  const data = await response.json();
  return data.map(item => ({
    id: item.id || String(Math.random()),
    city: item.city || city,
    state: item.state || state,
    date: item.date || new Date().toISOString().split('T')[0],
    rate: typeof item.rate === 'number' ? item.rate : parseFloat(item.rate) || 0
  }));
};

export const fetchAllRates = async (date) => {
  try {
    const response = await fetch(`/php/api/rates/get_all_rates.php?date=${date}`);
    if (!response.ok) {
      throw new Error('Failed to fetch all rates');
    }
    
    const data = await response.json();
    
    // Validate that we got an array
    if (!Array.isArray(data)) {
      console.warn('Expected array but got:', typeof data, data);
      return [];
    }
    
    // Transform and validate rate data (same as fetchRates)
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

export const fetchLatestRates = async (cityStateArray = null) => {
  try {
    const options = {
      method: cityStateArray ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (cityStateArray) {
      options.body = JSON.stringify(cityStateArray);
    }
    
    const response = await fetch('/php/api/rates/get_latest_rates.php', options);
    if (!response.ok) {
      throw new Error('Failed to fetch latest rates');
    }
    
    const data = await response.json();
    
    // Handle the response structure - it might be an array or an object with a message
    if (Array.isArray(data)) {
      // Transform and validate rate data
      return data.map(item => {
        const rate = parseFloat(item.rate);
        return {
          ...item,
          rate: isNaN(rate) ? 0 : rate,
        };
      });
    } else if (data.message === "No rates found") {
      return [];
    } else {
      console.warn('Unexpected response format from get_latest_rates.php:', data);
      return [];
    }
  } catch (error) {
    console.error('Error in fetchLatestRates:', error);
    throw error;
  }
};

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
  const response = await fetch('/php/api/location/add_state_city.php', {
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
  const response = await fetch('/php/api/location/remove_state_city.php', {
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
