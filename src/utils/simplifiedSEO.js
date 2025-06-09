/**
 * Simplified SEO Strategy for Better Search Engine Trust
 * 
 * This approach focuses on:
 * 1. Static, compelling titles that don't change daily
 * 2. URL-parameter based content (city/state) instead of API response data
 * 3. Consistent meta descriptions that search engines can trust
 * 4. Human-friendly, actionable titles
 */

// Static, compelling titles that search engines will trust
export const getSimplifiedSeoTitle = (selectedCity, selectedState) => {
  // City-specific titles (most specific)
  if (selectedCity && selectedState) {
    return `${selectedCity} Egg Rates - Live NECC Prices & Market Updates`;
  }
  
  // State-specific titles
  if (selectedState) {
    return `${selectedState} Egg Rates - NECC Prices Across All Cities`;
  }
  
  // Homepage title (most general)
  return 'Today Egg Rates - Live NECC Prices Across India';
};

// Static meta descriptions that provide value without daily changes
export const getSimplifiedSeoDescription = (selectedCity, selectedState) => {
  // City-specific descriptions
  if (selectedCity && selectedState) {
    return `Get live egg rates for ${selectedCity}, ${selectedState}. Official NECC prices, market trends, and daily updates for poultry businesses and consumers.`;
  }
  
  // State-specific descriptions  
  if (selectedState) {
    return `Live egg rates across ${selectedState}. Compare NECC prices from all major cities, track market trends, and get reliable poultry price updates.`;
  }
  
  // Homepage description
  return 'Live egg rates from NECC across India. Get today\'s poultry prices, market trends, and reliable updates for all major Indian cities and states.';
};

// Simplified keywords that focus on intent rather than daily data
export const getSimplifiedSeoKeywords = (selectedCity, selectedState) => {
  const baseKeywords = ['egg rates', 'NECC prices', 'poultry prices', 'today egg rate'];
  
  if (selectedCity && selectedState) {
    return [
      `${selectedCity} egg rate`,
      `${selectedCity} NECC price`, 
      `${selectedState} egg rates`,
      ...baseKeywords
    ].join(', ');
  }
  
  if (selectedState) {
    return [
      `${selectedState} egg rates`,
      `${selectedState} NECC prices`,
      `${selectedState} poultry market`,
      ...baseKeywords
    ].join(', ');
  }
  
  return [...baseKeywords, 'India egg prices', 'live poultry rates', 'egg market India'].join(', ');
};

// Generate simplified structured data that doesn't rely on changing daily rates
export const getSimplifiedStructuredData = (selectedCity, selectedState, location) => {
  const baseUrl = 'https://todayeggrates.com';
  const currentUrl = `${baseUrl}${location.pathname}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": getSimplifiedSeoTitle(selectedCity, selectedState),
    "description": getSimplifiedSeoDescription(selectedCity, selectedState),
    "url": currentUrl,
    "publisher": {
      "@type": "Organization",
      "name": "Today Egg Rates",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.webp`
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        ...(selectedState ? [{
          "@type": "ListItem", 
          "position": 2,
          "name": selectedState,
          "item": `${baseUrl}/${selectedState.toLowerCase().replace(/\s+/g, '-')}`
        }] : []),
        ...(selectedCity ? [{
          "@type": "ListItem",
          "position": selectedState ? 3 : 2,
          "name": selectedCity,
          "item": currentUrl
        }] : [])
      ]
    },
    "mainEntity": {
      "@type": "Dataset",
      "name": `Egg Rates ${selectedCity || selectedState || 'India'}`,
      "description": `Live NECC egg price data for ${selectedCity || selectedState || 'India'}`,
      "url": currentUrl,
      "temporalCoverage": "2024/..",
      "spatialCoverage": {
        "@type": "Place",
        "name": selectedCity || selectedState || "India"
      }
    }
  };
};