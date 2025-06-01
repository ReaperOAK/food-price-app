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
    return `Today Egg Rate in ${selectedCity} - Egg Rate Today ${selectedCity}`;
  } else if (selectedState) {
    return `${selectedState} Egg Rate Today - Today Egg Rate ${selectedState}`;
  } else {
    return `India Egg Rates Today - NECC Live Price Updates`;
  }
};

export const getSeoTitle = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  const formattedRate = formatPrice(todayRate);
  if (selectedCity) {
    // Enhanced titles for high-traffic cities to improve CTR and include target keywords
    const citySpecificTitles = {
      'Mumbai': `🥚 Today Egg Rate in Mumbai: ₹${formattedRate}/egg | Egg Rate Today Mumbai ${today}`,
      'Bangalore': `🥚 Today Egg Rate in Bangalore: ₹${formattedRate}/egg | Egg Rate Today Bangalore ${today}`,
      'Hyderabad': `🥚 Today Egg Rate in Hyderabad: ₹${formattedRate}/egg | Egg Rate Today Hyderabad ${today}`,
      'Chennai': `🥚 Today Egg Rate in Chennai: ₹${formattedRate}/egg | Egg Rate Today Chennai ${today}`,
      'Kolkata': `🥚 Today Egg Rate in Kolkata: ₹${formattedRate}/egg | Egg Rate Today Kolkata ${today}`
    };
    
    return citySpecificTitles[selectedCity] || 
      `Today Egg Rate in ${selectedCity}: ₹${formattedRate}/egg | Egg Rate Today ${selectedCity} ${today}`;
  } else if (selectedState) {
    return `Today Egg Rate in ${selectedState}: Live Price Updates (${today}) | Egg Rate Today ${selectedState}`;
  } else {
    return `🥚 Today Egg Rate India: Live NECC Price List (${today}) | Egg Rate Today & NECC Rates`;
  }
};

export const getSeoDescription = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  if (selectedCity) {
    const trayPrice = todayRate !== 'N/A' ? formatPrice(todayRate * 30) : 'N/A';
    
    // Enhanced descriptions for city-specific pages to match SERP requirements
    const citySpecificDescriptions = {
      'Mumbai': `Today egg rate in Mumbai: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live Mumbai egg prices from NECC. Egg rate today Mumbai with wholesale rates, market updates & daily egg rate. National egg coordination committee rates.`,
      'Bangalore': `Today egg rate in Bangalore: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live Bangalore egg prices from NECC. Egg rate today Bangalore with wholesale & retail rates. Daily egg rate updates.`,
      'Hyderabad': `Today egg rate in Hyderabad: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live Hyderabad egg prices from NECC. Egg rate today Hyderabad with wholesale rates, daily egg rate & market trends. National egg rates.`,
      'Chennai': `Today egg rate in Chennai: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live Chennai egg prices from NECC. Egg rate today Chennai with wholesale rates & daily egg rate updates.`,
      'Kolkata': `Today egg rate in Kolkata: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live Kolkata egg prices from NECC. Egg rate today Kolkata with wholesale rates & daily egg rate updates.`
    };
    
    return citySpecificDescriptions[selectedCity] || 
      `Today egg rate in ${selectedCity}: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live ${selectedCity} egg prices from NECC. Egg rate today ${selectedCity} with wholesale rates, daily egg rate & market updates. National egg coordination committee rates.`;
  } else if (selectedState) {
    return `Today egg rate in ${selectedState} (${today}): Live NECC egg prices from major ${selectedState} markets. Egg rate today ${selectedState}, daily egg rate updates, wholesale & retail prices. National egg coordination committee rates.`;
  } else {
    return `Today egg rate India (${today}): Live NECC egg prices from Mumbai, Chennai, Bangalore, Kolkata, Barwala & 100+ cities. Compare egg rate today, daily egg rate, wholesale & retail prices. National egg coordination committee rates.`;
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
    'live egg rates',
    'egg tray price',
    'necc rates',
    'national egg',
    'egg market',
    'poultry market',
    'fresh eggs',
    'daily prices',
    'market rates',
    'wholesale prices',
    'retail prices',
    'egg vendors',
    'egg suppliers',
    'poultry farms',
    'egg prices',
    'daily egg',
    'hyderabad today',
    'egg rates in hyderabad'
  ];
  
  // International SEO keywords for diaspora communities
  const internationalKeywords = [
    'indian egg prices uae',
    'indian egg rates usa',
    'indian food prices abroad',
    'necc rates for nri',
    'indian agriculture prices',
    'egg prices india to usd',
    'egg prices india to aed',
    'indian market rates international',
    'india egg export prices',
    'poultry prices india global'
  ];
    if (selectedCity) {
    const cityLower = selectedCity.toLowerCase?.() || selectedCity;
    const cityKeywords = [
      `necc egg rate ${cityLower}`,
      `${cityLower} egg rate today`,
      `today egg rate in ${cityLower}`,
      `egg rate in ${cityLower}`,
      `${cityLower} egg price today`,
      `necc rate in ${cityLower}`,
      `necc egg rate today ${cityLower}`,
      `today egg rate ${cityLower}`,
      `egg rate today ${cityLower}`,
      `${cityLower} wholesale egg rate`,
      `${cityLower} egg market rate`,
      `${cityLower} daily egg rate`,
      `${cityLower} necc rates`,
      `${cityLower} today`,
      `egg rates in ${cityLower}`,
      `egg prices in ${cityLower}`,
      `daily egg in ${cityLower}`,
      `national egg ${cityLower}`,
      // Add international variations for major cities
      ...(cityLower === 'mumbai' || cityLower === 'bangalore' || cityLower === 'chennai' || cityLower === 'hyderabad' ? 
        [`${cityLower} egg prices for nri`, `${cityLower} market rates international`] : [])
    ];
    
    return [
      ...cityKeywords,
      ...baseKeywords,
      ...internationalKeywords
    ].join(', ');
  }else if (selectedState) {
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
      ...baseKeywords,
      ...internationalKeywords
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
      ...baseKeywords,
      ...internationalKeywords
    ].join(', ');
  }
};

export const generateStructuredData = (selectedCity, selectedState, todayRate, trayPrice) => {
  const baseUrl = 'https://todayeggrates.com';
  const today = getFormattedDate();
  
  return {
    "@context": "https://schema.org",
    "@type": ["Product", "LocalBusiness"],
    "name": selectedCity 
      ? `NECC Egg Rate Today in ${selectedCity}, ${selectedState}`
      : selectedState 
        ? `NECC Egg Rate Today in ${selectedState}`
        : "NECC Egg Rate Today India - Live Updates",
    "description": getSeoDescription(selectedCity, selectedState, todayRate, today),
    "brand": {
      "@type": "Brand",
      "name": "NECC - National Egg Coordination Committee",
      "url": "https://necc.org.in"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": todayRate,
      "highPrice": trayPrice,
      "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "priceSpecification": [
        {
          "@type": "PriceSpecification",
          "price": todayRate,
          "priceCurrency": "INR",
          "unitCode": "C62",
          "unitText": "per piece"
        },
        {
          "@type": "PriceSpecification", 
          "price": trayPrice,
          "priceCurrency": "INR",
          "unitCode": "TNE",
          "unitText": "per tray (30 pieces)"
        }
      ],
      "seller": {
        "@type": "Organization",
        "name": "Today Egg Rates - NECC Rate Updates",
        "url": baseUrl,
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN",
          "addressRegion": "India"
        }
      }
    },
    "image": [
      `${baseUrl}/eggpic.webp`,
      `${baseUrl}/eggrate2.webp`,
      `${baseUrl}/eggrate3.webp`
    ],
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": selectedCity === 'Mumbai' ? "19.0760" : selectedCity === 'Bangalore' ? "12.9716" : "20.5937",
      "longitude": selectedCity === 'Mumbai' ? "72.8777" : selectedCity === 'Bangalore' ? "77.5946" : "78.9629"
    },
    "areaServed": {
      "@type": "Country",
      "name": "India",
      "sameAs": "https://en.wikipedia.org/wiki/India"
    },
    "category": "Agricultural Commodity Prices",
    "keywords": getSeoKeywords(selectedCity, selectedState),
    "dateModified": new Date().toISOString(),
    "datePublished": new Date().toISOString(),
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
      "reviewCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
};
