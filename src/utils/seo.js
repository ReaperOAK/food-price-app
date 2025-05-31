// Helper function to get formatted date
const getFormattedDate = () => {
  const date = new Date();
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Helper function to format price
const formatPrice = (price) => {
  if (price === 'N/A' || !price) return 'N/A';
  return parseFloat(price).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
};

export const getUniqueH1 = (selectedCity, selectedState, today = getFormattedDate()) => {
  if (selectedCity) {
    return `Egg Rates in ${selectedCity}`;
  } else if (selectedState) {
    return `${selectedState} Egg Rates`;
  } else {
    return `India Egg Rates Today`;
  }
};

export const getSeoTitle = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  const formattedRate = formatPrice(todayRate);
  if (selectedCity) {
    return `${selectedCity} Egg Rate Today: ₹${formattedRate}/egg | Updated ${today} NECC Prices`;
  } else if (selectedState) {
    return `${selectedState} Egg Rates Today: Live NECC Price Updates (${today})`;
  } else {
    return `Today's Egg Rates India: Live NECC Price List (${today}) | TodayEggRates`;
  }
};

export const getSeoDescription = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  if (selectedCity) {
    const trayPrice = todayRate !== 'N/A' ? formatPrice(todayRate * 30) : 'N/A';
    return `✓ Live wholesale egg rates in ${selectedCity}, ${selectedState}: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (30 eggs). Get official NECC egg prices, wholesale market trends, and daily price updates for ${selectedCity}'s egg market - ${today}. Compare retail and wholesale rates from authorized dealers.`;
  } else if (selectedState) {
    return `✓ Today's ${selectedState} wholesale egg rates: Get live NECC egg prices from major city markets. Compare wholesale & retail egg rates, market analysis, and daily price trends in ${selectedState}'s poultry markets. Updated ${today} with reliable market data.`;
  } else {
    return `✓ Check today's wholesale egg rates across India. Live NECC egg prices from Mumbai, Chennai, Bangalore, Kolkata, Barwala & 100+ city markets. Compare official wholesale & retail rates, real-time market insights & daily price trends (${today}). Trusted by traders nationwide.`;
  }
};

export const getSeoKeywords = (selectedCity, selectedState) => {
  const baseKeywords = [
    'egg rate today',
    'necc egg rate',
    'egg price',
    'egg rate per dozen',
    'wholesale egg rate',
    'retail egg price',
    'live egg rates',
    'egg market price',
    'egg tray price',
    'current egg rates',
    'poultry market rates',
    'egg trading price'
  ];

  if (selectedCity) {
    return [
      `${selectedCity.toLowerCase()} egg rate today`,
      `${selectedState.toLowerCase()} egg price`,
      `egg rate in ${selectedCity.toLowerCase()}`,
      `${selectedCity.toLowerCase()} egg price today`,
      `necc egg rate in ${selectedCity.toLowerCase()}`,
      `${selectedCity.toLowerCase()} wholesale egg price`,
      `${selectedCity.toLowerCase()} egg market rate`,
      `${selectedCity.toLowerCase()} poultry market price`,
      ...baseKeywords
    ].join(', ');
  } else if (selectedState) {
    return [
      `${selectedState.toLowerCase()} egg rate`,
      `egg price in ${selectedState.toLowerCase()}`,
      `today egg rate in ${selectedState.toLowerCase()}`,
      `${selectedState.toLowerCase()} egg price today`,
      `necc egg rate in ${selectedState.toLowerCase()}`,
      `${selectedState.toLowerCase()} wholesale egg market`,
      `${selectedState.toLowerCase()} poultry rates`,
      `egg market price ${selectedState.toLowerCase()}`,
      ...baseKeywords
    ].join(', ');
  } else {
    return [
      'egg rate today india',
      'necc egg rate today',
      'today egg rate',
      'national egg rate',
      'all india egg rate',
      'wholesale egg market india',
      'indian poultry market rates',
      'egg trading price india',
      'today egg rate in mumbai',
      'today egg rate in chennai',
      'today egg rate in kolkata',
      'today egg rate in bangalore',
      'barwala egg rate today',
      'live egg market rates',
      ...baseKeywords
    ].join(', ');
  }
};

export const generateStructuredData = (selectedCity, selectedState, todayRate, trayPrice) => {
  const baseUrl = 'https://todayeggrates.com';
  const today = getFormattedDate();
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": selectedCity 
      ? `Eggs in ${selectedCity}, ${selectedState}`
      : selectedState 
        ? `Eggs in ${selectedState}`
        : "Eggs in India",
    "description": getSeoDescription(selectedCity, selectedState, todayRate, today),
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": todayRate,
      "highPrice": trayPrice,
      "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Today Egg Rates",
        "url": baseUrl
      }
    },
    "image": [
      `${baseUrl}/eggpic.webp`,
      `${baseUrl}/eggrate2.webp`,
      `${baseUrl}/eggrate3.webp`
    ],
    "review": {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "4.8",
        "bestRating": "5"
      },
      "author": {
        "@type": "Organization",
        "name": "Today Egg Rates"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1250"
    }
  };
};
