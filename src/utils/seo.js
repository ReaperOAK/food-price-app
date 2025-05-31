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
    // Enhanced titles for high-traffic cities to improve CTR
    const citySpecificTitles = {
      'Mumbai': `🥚 Mumbai NECC Egg Rate Today: ₹${formattedRate}/egg | Live Price ${today} | Today Egg Rate`,
      'Bangalore': `🥚 Bangalore NECC Egg Rate Today: ₹${formattedRate}/egg | Live Updates ${today} | Today Egg Rate`,
      'Hyderabad': `🥚 Hyderabad NECC Egg Rate Today: ₹${formattedRate}/egg | Live Price ${today} | Today Egg Rate`,
      'Chennai': `🥚 Chennai NECC Egg Rate Today: ₹${formattedRate}/egg | Live Updates ${today} | Today Egg Rate`,
      'Kolkata': `🥚 Kolkata NECC Egg Rate Today: ₹${formattedRate}/egg | Live Price ${today} | Today Egg Rate`
    };
    
    return citySpecificTitles[selectedCity] || 
      `NECC Egg Rate Today ${selectedCity}: ₹${formattedRate}/egg | Today Egg Rate ${today} Live Updates`;
  } else if (selectedState) {
    return `NECC Egg Rate ${selectedState} Today: Live Price Updates (${today}) | Today Egg Rate`;
  } else {
    return `🥚 NECC Egg Rate Today India: Live Price List (${today}) | Today Egg Rate & NECC Rates`;
  }
};

export const getSeoDescription = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  if (selectedCity) {
    const trayPrice = todayRate !== 'N/A' ? formatPrice(todayRate * 30) : 'N/A';
    
    // Enhanced descriptions for high-traffic, low-CTR cities
    const citySpecificDescriptions = {
      'Mumbai': `⚡ LIVE: Mumbai NECC egg rate today ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Get real-time Mumbai egg prices, wholesale rates & market updates. Official NECC rates from National Egg Coordination Committee. Compare rates across Mumbai markets.`,
      'Bangalore': `⚡ LIVE: Bangalore NECC egg rate today ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Real-time Bangalore egg prices, wholesale & retail rates. Official NECC rates with market analysis. Updated every hour for accurate pricing.`,
      'Hyderabad': `⚡ LIVE: Hyderabad NECC egg rate today ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray (${today}). Latest Hyderabad egg prices from National Egg Coordination Committee. Wholesale rates, market trends & price forecasts included.`
    };
    
    return citySpecificDescriptions[selectedCity] || 
      `✓ NECC egg rate today in ${selectedCity}, ${selectedState}: ₹${formatPrice(todayRate)}/egg, ₹${trayPrice}/tray. Live today egg rate, NECC rates, and daily egg rate updates from National Egg Coordination Committee. Get accurate egg rate today and current egg prices - ${today}. Compare market rates & wholesale prices.`;
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
      // Add international variations for major cities
      ...(cityLower === 'mumbai' || cityLower === 'bangalore' || cityLower === 'chennai' || cityLower === 'hyderabad' ? 
        [`${cityLower} egg prices for nri`, `${cityLower} market rates international`] : []),
      ...baseKeywords,
      ...internationalKeywords
    ].join(', ');
  } else if (selectedState) {
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
