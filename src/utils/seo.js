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
    return `NECC Egg Rate Today ${selectedCity}: ₹${formattedRate}/egg | Today Egg Rate ${today} Live Updates`;
  } else if (selectedState) {
    return `NECC Egg Rate ${selectedState} Today: Live Price Updates (${today}) | Today Egg Rate`;
  } else {
    return `NECC Egg Rate Today India: Live Price List (${today}) | Today Egg Rate & NECC Rates`;
  }
};

export const getSeoDescription = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  if (selectedCity) {
    const trayPrice = todayRate !== 'N/A' ? formatPrice(todayRate * 30) : 'N/A';
    return `✓ NECC egg rate today in ${selectedCity}, ${selectedState}: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray. Live today egg rate, NECC rates, and daily egg rate updates from National Egg Coordination Committee. Get accurate egg rate today and current egg prices - ${today}. Compare market rates & wholesale prices.`;
  } else if (selectedState) {
    return `✓ NECC egg rate today ${selectedState} (${today}): Official today egg rate from National Egg Coordination Committee. Live NECC rates, daily egg rate updates from major ${selectedState} markets. Get today's egg rate, wholesale & retail prices, and current egg market analysis.`;
  } else {
    return `✓ NECC egg rate today India (${today}): Live today egg rate from National Egg Coordination Committee. Official NECC rates from Mumbai, Chennai, Bangalore, Kolkata, Barwala & 100+ cities. Compare today's egg rate, daily egg rate, wholesale & retail prices. Most reliable egg price source.`;
  }
};

export const getSeoKeywords = (selectedCity, selectedState) => {
  const baseKeywords = [
    'necc egg rate',
    'necc rate',
    'egg rate today',
    'today egg rate',
    'necc egg rate today',
    'today egg price',
    'egg price today',
    'daily egg rate',
    'necc egg price',
    'necc egg',
    'egg rate',
    'wholesale egg rate',
    'egg market price',
    'national egg rate',
    'all india egg rate',
    'barwala egg rate today',
    'barwala egg rate',
    'live egg rates',
    'egg tray price',
    'necc rates'
  ];
  if (selectedCity) {
    const cityLower = selectedCity.toLowerCase?.() || selectedCity;
    return [
      `necc egg rate ${cityLower}`,
      `${cityLower} egg rate today`,
      `today egg rate in ${cityLower}`,
      `egg rate in ${cityLower}`,
      `${cityLower} egg price today`,
      `necc rate in ${cityLower}`,
      `necc egg rate today ${cityLower}`,
      `today egg rate ${cityLower}`,
      `${cityLower} wholesale egg rate`,
      `${cityLower} egg market rate`,
      `${cityLower} daily egg rate`,
      `${cityLower} necc rates`,
      ...baseKeywords
    ].join(', ');  } else if (selectedState) {
    const stateLower = selectedState.toLowerCase?.() || selectedState;
    return [
      `necc egg rate ${stateLower}`,
      `${stateLower} egg rate today`,
      `today egg rate in ${stateLower}`,
      `egg rate in ${stateLower}`,
      `${stateLower} egg price today`,
      `necc rate in ${stateLower}`,
      `necc egg rate today ${stateLower}`,
      `today egg rate ${stateLower}`,
      `${stateLower} wholesale egg market`,
      `${stateLower} daily egg rate`,
      `${stateLower} necc rates`,
      ...baseKeywords
    ].join(', ');
  } else {
    return [
      'necc egg rate today',
      'necc egg rate india',
      'today egg rate',
      'egg rate today india',
      'necc egg rate today india',
      'today egg rate india',
      'national egg rate',
      'all india egg rate',
      'daily egg rate',
      'necc rate today',
      'today egg rate in mumbai',
      'today egg rate in chennai',
      'today egg rate in kolkata',
      'today egg rate in bangalore',
      'barwala egg rate today',
      'barwala egg rate',
      'wholesale egg market india',
      'necc egg',
      'egg rate',
      'necc rates',
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
      ? `NECC Egg Rate Today in ${selectedCity}, ${selectedState}`
      : selectedState 
        ? `NECC Egg Rate Today in ${selectedState}`
        : "NECC Egg Rate Today India - Live Updates",
    "description": getSeoDescription(selectedCity, selectedState, todayRate, today),
    "brand": {
      "@type": "Brand",
      "name": "NECC - National Egg Coordination Committee"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": todayRate,
      "highPrice": trayPrice,
      "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Today Egg Rates - NECC Rate Updates",
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
