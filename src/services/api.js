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
