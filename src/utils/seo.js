// Safe string conversion helper
const safeToLowerCase = (value) => {
  if (!value) return '';
  return String(value).toLowerCase();
};

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

export const getUniqueH1 = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  const formattedRate = formatPrice(todayRate);
  
  if (selectedCity) {
    if (todayRate && todayRate !== 'N/A' && !isNaN(todayRate)) {
      return `Today Egg Rate in ${selectedCity} - ₹${formattedRate} (${today})`;
    }
    return `Today Egg Rate in ${selectedCity} - Eggs in India Price ${today}`;
  } else if (selectedState) {
    return `${selectedState} Egg Rate Today - Today Egg Rate Eggs in India ${today}`;
  } else {
    return `Eggs in India - Today Egg Rate NECC Live Updates ${today}`;
  }
};

export const getSeoTitle = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  const formattedRate = formatPrice(todayRate);
  
  // Helper function to truncate title if it exceeds 60 characters for better SERP display
  const truncateTitle = (title, maxLength = 58) => {
    if (title?.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };
  
  if (selectedCity) {
    // Handle N/A prices gracefully in titles
    if (todayRate === 'N/A' || !todayRate || todayRate === null || todayRate === undefined) {
      const title = `Today Egg Rate ${selectedCity} - Eggs in India Live`;
      return truncateTitle(title);
    }
    
    // Optimized title format with target keywords
    const cityTitle = `Today Egg Rate ${selectedCity} ₹${formattedRate} | Eggs India`;
    return truncateTitle(cityTitle);
    
  } else if (selectedState) {
    const stateTitle = `${selectedState} Egg Rate Today - Eggs in India Live`;
    return truncateTitle(stateTitle);
    
  } else {
    return `Today Egg Rate India - Eggs in India NECC Live`;
  }
};

export const getSeoDescription = (selectedCity, selectedState, todayRate, today = getFormattedDate()) => {
  // Helper function to ensure description stays within optimal 120-160 chars for SEO
  const truncateDescription = (desc, maxLength = 160) => {
    if (desc?.length <= maxLength) return desc;
    return desc.substring(0, maxLength - 3) + '...';
  };
  // Helper function to get state context for cities (future use)
  /*
  const getStateContext = (city) => {
    const stateMapping = {
      'Mumbai': 'Maharashtra',
      'Pune': 'Maharashtra',
      'Nagpur': 'Maharashtra',
      'Bangalore': 'Karnataka',
      'Mysore': 'Karnataka',
      'Hyderabad': 'Telangana',
      'Chennai': 'Tamil Nadu',
      'Coimbatore': 'Tamil Nadu',
      'Kolkata': 'West Bengal',
      'Delhi': 'NCR',
      'Gurgaon': 'NCR',
      'Noida': 'NCR',
      'Lucknow': 'Uttar Pradesh',
      'Kanpur': 'Uttar Pradesh',
      'Ahmedabad': 'Gujarat',
      'Surat': 'Gujarat',
      'Jaipur': 'Rajasthan',
      'Indore': 'Madhya Pradesh',
      'Bhopal': 'Madhya Pradesh',
      'Patna': 'Bihar',
      'Ranchi': 'Jharkhand',
      'Bhubaneswar': 'Odisha',
      'Guwahati': 'Assam',
      'Chandigarh': 'Punjab',
      'Thiruvananthapuram': 'Kerala',
      'Kochi': 'Kerala'
    };
    return stateMapping[city] || selectedState || 'markets';
  };
  */
    if (selectedCity) {
    // Handle N/A prices gracefully
    if (todayRate === 'N/A' || !todayRate || todayRate === null || todayRate === undefined) {
      const desc = `Today egg rate in ${selectedCity} - Live NECC prices & market updates. Check eggs in India wholesale rates daily. Current market trends ${today}.`;
      return truncateDescription(desc);
    }
    
    const trayPrice = formatPrice(todayRate * 30);
    
    // Optimized description with target keywords for better CTR
    const cityDesc = `Today egg rate ${selectedCity}: ₹${formatPrice(todayRate)}/egg. Eggs in India market update ${today}. Live NECC prices, wholesale ₹${trayPrice}/tray rates.`;
    return truncateDescription(cityDesc);
    
  } else if (selectedState) {
    const stateDesc = `${selectedState} egg rate today - Live NECC prices & eggs in India market updates. Today egg rate from major cities ${today}. Daily wholesale rates.`;
    return truncateDescription(stateDesc);
    
  } else {
    const mainDesc = `Today egg rate India - Live NECC prices from 100+ cities. Eggs in India market updates ${today}. Compare wholesale & retail rates nationwide.`;
    return truncateDescription(mainDesc);
  }
};

export const getSeoKeywords = (selectedCity, selectedState, todayRate) => {
  const today = getFormattedDate();
  const formattedRate = formatPrice(todayRate);
  
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
    // Enhanced semantic keywords from Semrush recommendations
    'brown egg',
    'fatty acids',
    'farm fresh',
    'organic eggs',
    'free range eggs',
    'protein rich',
    'healthy breakfast',
    'nutrition facts',
    'cholesterol free',
    'vitamin d',
    'omega 3 eggs',
    'cage free',
    'local farms',
    'fresh produce',
    'eggs in india',
    'indian eggs',
    'desi eggs',
    'country eggs',
    'village eggs'
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
    const cityLower = safeToLowerCase(selectedCity);
      // Comprehensive keyword generation for ALL cities - no special treatment
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
      `${cityLower} egg market`,
      `${cityLower} poultry market`,
      `${cityLower} wholesale market`,
      `${cityLower} market trends`,
      `${cityLower} egg suppliers`,
      `${cityLower} fresh eggs`,
      // International keywords for ALL cities (not just major ones)
      `${cityLower} egg prices for nri`,
      `${cityLower} market rates international`
    ];
    
    // Add date and rate specific keywords if rate is available
    if (todayRate && todayRate !== 'N/A' && !isNaN(todayRate)) {
      cityKeywords.push(
        `${cityLower} egg rate ₹${formattedRate}`,
        `egg rate ${cityLower} ${today}`,
        `${cityLower} egg price ${today}`,
        `necc rate ${cityLower} ${formattedRate}`,
        `today ${today} egg rate ${cityLower}`,
        `${cityLower} egg ${today} price`
      );
    }
    
    // Add today's date keywords
    cityKeywords.push(
      `${cityLower} egg rate ${today}`,
      `${today} egg rate ${cityLower}`,
      `${cityLower} ${today} rates`
    );
    
    return [
      ...cityKeywords,
      ...baseKeywords,
      ...internationalKeywords
    ].join(', ');
    } else if (selectedState) {
    const stateLower = safeToLowerCase(selectedState);
    const stateKeywords = [
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
      `${stateLower} market trends`,
      `${stateLower} poultry market`,
      `${stateLower} egg suppliers`,
      // Date-specific state keywords
      `${stateLower} egg rate ${today}`,
      `${today} egg rate ${stateLower}`,
      `${stateLower} ${today} rates`,
      `egg prices ${stateLower} ${today}`
    ];
    
    return [
      ...stateKeywords,
      ...baseKeywords,
      ...internationalKeywords
    ].join(', ');
      } else {
    // National level keywords with today's date
    const nationalKeywords = [
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
      // Date-specific national keywords
      `egg rate india ${today}`,
      `necc rate ${today}`,
      `today ${today} egg rate`,
      `india egg prices ${today}`,
      `${today} necc rates`,
      `egg market india ${today}`,
      `${today} egg rate india`
    ];
    
    return [
      ...nationalKeywords,
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
    "keywords": getSeoKeywords(selectedCity, selectedState, todayRate),
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

// Export alias for consistency with imports
export const getStructuredData = generateStructuredData;
