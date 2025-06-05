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
  if (price === 'N/A' || !price || price === null || price === undefined || isNaN(price)) return 'N/A';
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
  
  // Helper function to truncate title if it exceeds 60 characters
  const truncateTitle = (title, maxLength = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };
  
  // Helper function to get short state names for better SEO
  const getShortStateName = (stateName) => {
    const stateShortNames = {
      'andhra-pradesh': 'AP',
      'arunachal-pradesh': 'Arunachal',
      'himachal-pradesh': 'HP',
      'jammu-and-kashmir': 'J&K',
      'madhya-pradesh': 'MP',
      'tamil-nadu': 'TN',
      'uttar-pradesh': 'UP',
      'west-bengal': 'WB'
    };
    return stateShortNames[stateName] || stateName;
  };
  
  if (selectedCity) {
    // Handle N/A prices gracefully in titles
    if (todayRate === 'N/A' || !todayRate || todayRate === null || todayRate === undefined) {
      const title = `${selectedCity} Egg Rate Today - Live NECC Prices`;
      return truncateTitle(title);
    }
    
    // Optimized titles for cities (under 60 chars)
    const citySpecificTitles = {
      'Mumbai': `🥚 Mumbai Egg Rate: ₹${formattedRate}/egg | Today ${today}`,
      'Bangalore': `🥚 Bangalore Egg Rate: ₹${formattedRate}/egg | ${today}`,
      'Hyderabad': `🥚 Hyderabad Egg Rate: ₹${formattedRate}/egg | ${today}`,
      'Chennai': `🥚 Chennai Egg Rate: ₹${formattedRate}/egg | ${today}`,
      'Kolkata': `🥚 Kolkata Egg Rate: ₹${formattedRate}/egg | ${today}`,
      'Delhi': `🥚 Delhi Egg Rate: ₹${formattedRate}/egg | ${today}`,
      'Pune': `🥚 Pune Egg Rate: ₹${formattedRate}/egg | ${today}`
    };
    
    const customTitle = citySpecificTitles[selectedCity];
    if (customTitle) {
      return truncateTitle(customTitle);
    }
    
    // Generic format for other cities (optimized for length)
    const genericTitle = `${selectedCity} Egg Rate: ₹${formattedRate}/egg | ${today}`;
    return truncateTitle(genericTitle);
    
  } else if (selectedState) {
    const shortStateName = getShortStateName(selectedState);
    const stateTitle = `${shortStateName} Egg Rate: Live Prices ${today}`;
    return truncateTitle(stateTitle);
    
  } else {
    return `🥚 India Egg Rates: Live NECC Prices | ${today}`;
  }
};

export const getSeoDescription = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  // Helper function to ensure description stays within 150-160 chars
  const truncateDescription = (desc, maxLength = 155) => {
    if (desc.length <= maxLength) return desc;
    return desc.substring(0, maxLength - 3) + '...';
  };
  
  if (selectedCity) {
    // Handle N/A prices gracefully
    if (todayRate === 'N/A' || !todayRate || todayRate === null || todayRate === undefined) {
      const desc = `Live egg rates ${selectedCity} (${today}). Check NECC prices, wholesale & retail rates. Daily updates from ${selectedCity} markets.`;
      return truncateDescription(desc);
    }
    
    const trayPrice = formatPrice(todayRate * 30);
    
    // Optimized descriptions for better SEO (under 155 characters)
    const citySpecificDescriptions = {
      'Mumbai': `Mumbai egg rate: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live NECC prices & daily market updates.`,
      'Bangalore': `Bangalore egg rate: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live NECC prices & market updates.`,
      'Hyderabad': `Hyderabad egg rate: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live NECC prices & daily rates.`,
      'Chennai': `Chennai egg rate: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live NECC prices & market updates.`,
      'Kolkata': `Kolkata egg rate: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live NECC prices & daily rates.`,
      'Delhi': `Delhi egg rate: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live NECC prices & market updates.`
    };
    
    const customDesc = citySpecificDescriptions[selectedCity];
    if (customDesc) {
      return truncateDescription(customDesc);
    }
    
    // Generic format for other cities
    const genericDesc = `${selectedCity} egg rate: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Live NECC prices & rates.`;
    return truncateDescription(genericDesc);
    
  } else if (selectedState) {
    const stateDesc = `Live egg rates ${selectedState} (${today}): NECC prices from major markets. Daily updates & wholesale rates.`;
    return truncateDescription(stateDesc);
    
  } else {
    const mainDesc = `Live egg rates India (${today}): NECC prices from 100+ cities. Compare today's egg rates & wholesale prices.`;
    return truncateDescription(mainDesc);
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
    const cityLower = selectedCity.toLowerCase?.() || '';
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
    const stateLower = selectedState.toLowerCase?.() || '';
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
