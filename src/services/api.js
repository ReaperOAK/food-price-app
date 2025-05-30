export const fetchWebStories = async () => {
  const response = await fetch('/php/get_web_stories.php');
  if (!response.ok) {
    throw new Error('Failed to fetch web stories');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const fetchRates = async (city, state) => {
  const url = city && state
    ? `/php/api/rates/get_rates.php?city=${city}&state=${state}`
    : `/php/api/rates/get_latest_rates.php`;

  const response = await fetch(url);
  const data = await response.json();
  return data.map(item => ({
    ...item,
    rate: parseFloat(item.rate),
  }));
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
  const response = await fetch(`/webstories/${slug}.html`, { 
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
  const response = await fetch(`/php/api/rates/get_all_rates.php?date=${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch all rates');
  }
  return response.json();
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
