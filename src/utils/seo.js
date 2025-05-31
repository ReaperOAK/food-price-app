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
    return `NECC Egg Rate Today ${selectedCity}: ₹${formattedRate}/egg | ${today} Official Prices`;
  } else if (selectedState) {
    return `NECC Egg Rate ${selectedState}: Today's Price Updates (${today}) | Official Rates`;
  } else {
    return `NECC Egg Rate Today: India Price List (${today}) | Today Egg Rates`;
  }
};

export const getSeoDescription = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  if (selectedCity) {
    const trayPrice = todayRate !== 'N/A' ? formatPrice(todayRate * 30) : 'N/A';
    return `✓ Official NECC egg rate in ${selectedCity}, ${selectedState}: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (30 eggs). Daily updated wholesale & retail prices from National Egg Coordination Committee (NECC). Get live ${selectedCity} egg market rates - ${today}. Compare poultry market prices.`;
  } else if (selectedState) {
    return `✓ NECC ${selectedState} egg rates today (${today}): Official wholesale prices from National Egg Coordination Committee. Live updates from major ${selectedState} markets including retail & wholesale rates. Daily poultry market analysis and price trends from authorized dealers.`;
  } else {
    return `✓ NECC egg rate today India (${today}): National Egg Coordination Committee official prices. Live updates from Mumbai, Chennai, Bangalore, Kolkata, Barwala & 100+ cities. Compare wholesale & retail rates, daily market trends. Most reliable egg price source for traders.`;
  }
};

export const getSeoKeywords = (selectedCity, selectedState) => {
  const baseKeywords = [
    'necc egg rate',
    'necc rate',
    'egg rate today',
    'today egg rate',
    'today egg price',
    'egg price today',
    'daily egg rate',
    'necc egg price',
    'wholesale egg rate',
    'egg market price',
    'egg tray price',
    'live egg rates',
    'national egg rate',
    'all india egg rate'
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
      `${cityLower} wholesale egg rate`,
      `${cityLower} egg market rate`,
      `${cityLower} poultry market price`,
      `${cityLower} daily egg rate`,
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
      `${stateLower} wholesale egg market`,
      `${stateLower} daily egg rate`,
      `${stateLower} poultry rates`,
      ...baseKeywords
    ].join(', ');
  } else {
    return [
      'necc egg rate today',
      'necc egg rate india',
      'today egg rate',
      'egg rate today india',
      'national egg rate',
      'all india egg rate',
      'daily egg rate',
      'necc rate today',
      'today egg rate in mumbai',
      'today egg rate in chennai',
      'today egg rate in kolkata',
      'today egg rate in bangalore',
      'barwala egg rate today',
      'wholesale egg market india',
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
