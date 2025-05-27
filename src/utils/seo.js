// Helper function to get formatted date
const getFormattedDate = () => {
  const date = new Date();
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getUniqueH1 = (selectedCity, selectedState, today = getFormattedDate()) => {
  if (selectedCity) {
    return `Egg Rate in ${selectedCity}, ${selectedState} (${today})`;
  } else if (selectedState) {
    return `${selectedState} Egg Rate: Latest NECC Prices (${today})`;
  } else {
    return `Today's Egg Rate in India: NECC Price List (${today})`;
  }
};

export const getSeoTitle = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  if (selectedCity) {
    return `${selectedCity} Egg Rate Today - ₹${todayRate} (${today}) | NECC Egg Price`;
  } else if (selectedState) {
    return `${selectedState} Egg Rates Today: State-wide NECC Price List (${today})`;
  } else {
    return `Today's Egg Rate: Check NECC Egg Prices Across India (${today})`;
  }
};

export const getSeoDescription = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  if (selectedCity) {
    const trayPrice = todayRate !== 'N/A' ? (todayRate * 30).toFixed(2) : 'N/A';
    return `Current egg rate in ${selectedCity}, ${selectedState}: ₹${todayRate}/egg, ₹${trayPrice}/tray (30 eggs). Check latest NECC egg price in ${selectedCity} updated on ${today}. Live updates and market analysis.`;
  } else if (selectedState) {
    return `Today's egg rate in ${selectedState}: Get latest NECC egg prices and daily market updates from all major cities in ${selectedState}. Compare wholesale and retail egg rates updated on ${today}.`;
  } else {
    return `Check today's egg rates across India. Daily updated NECC egg prices from Mumbai, Chennai, Bangalore, Kolkata, Barwala & 100+ cities. Compare wholesale & retail egg prices (${today}).`;
  }
};

export const getSeoKeywords = (selectedCity, selectedState) => {
  if (selectedCity) {
    return `${selectedCity.toLowerCase()} egg rate today, ${selectedState.toLowerCase()} egg price, egg rate in ${selectedCity.toLowerCase()}, ${selectedCity.toLowerCase()} egg price today, necc egg rate in ${selectedCity.toLowerCase()}`;
  } else if (selectedState) {
    return `${selectedState.toLowerCase()} egg rate, egg price in ${selectedState.toLowerCase()}, today egg rate in ${selectedState.toLowerCase()}, ${selectedState.toLowerCase()} egg price today, necc egg rate in ${selectedState.toLowerCase()}`;
  } else {
    return 'egg rate today, necc egg rate today, today egg rate, egg rate, national egg rate, all india egg rate, today egg rate in mumbai, today egg rate in chennai, today egg rate kolkata, barwala egg rate today';
  }
};
