import { Helmet } from 'react-helmet';
import { memo } from 'react';

// Renamed from UniversalCityOptimizer to UniversalCityOptimizer
// Now provides equal SEO optimization for ALL cities, not just high-traffic ones
const UniversalCityOptimizer = memo(({ selectedCity, selectedState, todayRate, trayPrice, isLoading = false }) => {
  
  // Universal city data generator - works for ANY city
  const generateCityData = (city, state) => {
    const commonUrgencyWords = ['LIVE NOW', 'Breaking', 'Just Updated', 'Fresh Rates', 'Latest Update'];
    
    // Universal local context mapping
    const getLocalContext = (cityName) => {
      const contexts = {
        'Mumbai': 'Financial Capital',
        'Bangalore': 'IT Capital', 
        'Hyderabad': 'Pharma Hub',
        'Chennai': 'Detroit of India',
        'Kolkata': 'Cultural Capital',
        'Delhi': 'National Capital',
        'Pune': 'Oxford of East',
        'Ahmedabad': 'Manchester of India',
        'Jaipur': 'Pink City',
        'Lucknow': 'City of Nawabs',
        'Kanpur': 'Leather City',
        'Nagpur': 'Orange City',
        'Indore': 'Commercial Capital of MP',
        'Patna': 'Capital of Bihar',
        'Bhopal': 'City of Lakes',
        'Guwahati': 'Gateway to Northeast'
      };
      return contexts[cityName] || `${cityName} Market Hub`;
    };
    
    // Generate market names for any city
    const generateMarkets = (cityName) => {
      const commonMarketSuffixes = ['Market', 'Bazaar', 'Mandi', 'Trading Center'];
      const areas = ['Main', 'Central', 'Old', 'New', 'Wholesale'];
      
      return areas.slice(0, 3).map(area => `${area} ${cityName} ${commonMarketSuffixes[Math.floor(Math.random() * commonMarketSuffixes?.length)]}`);
    };

    return {
      urgencyWords: commonUrgencyWords,
      localContext: getLocalContext(city),
      majorMarkets: generateMarkets(city),
      targetCTR: 1.0, // Standard target for all cities
      impressions: 1000 // Default value for tracking
    };
  };
  const cityData = generateCityData(selectedCity, selectedState);
  
  if (!selectedCity || isLoading) return null;

  const formatPrice = (price) => {
    if (price === 'N/A' || !price) return 'N/A';
    return parseFloat(price).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };
  const getUrgentTitle = () => {
    const urgencyWord = cityData.urgencyWords[Math.floor(Math.random() * cityData.urgencyWords?.length)];
    const currentTime = getCurrentTime();
    const safeTitle = `🔴 ${String(urgencyWord || '')}: ${String(selectedCity || '')} Egg Rate ₹${formatPrice(todayRate)}/egg | Updated ${currentTime} | NECC Live`;
    return String(safeTitle);
  };  const getCompellingDescription = () => {
    const currentTime = getCurrentTime();
    const priceChange = Math.random() > 0.5 ? '↗️ +₹0.50' : '↘️ -₹0.30'; // Simulated change
    const safeMarkets = (cityData.majorMarkets || []).filter(m => m && String(m).trim()).slice(0, 2);
      const safeDescription = `⚡ BREAKING: ${String(selectedCity || '')} (${String(cityData.localContext || '')}) egg rates LIVE at ₹${formatPrice(todayRate)}/egg ${priceChange} | Tray: ₹${formatPrice(trayPrice)} | Updated ${currentTime} | Major markets: ${safeMarkets.join(', ')} | Get wholesale prices, trends & forecasts NOW!`;
    return String(safeDescription);
  };

  // Safe string conversion function to prevent toLowerCase errors
  const safeToLowerCase = (value) => {
    if (!value) return '';
    return String(value).toLowerCase();
  };
  const getCitySpecificKeywords = () => {
    const cityLower = safeToLowerCase(selectedCity);
    const contextLower = safeToLowerCase(cityData?.localContext);
    
    // Ensure all market keywords are valid strings
    const marketKeywords = (cityData?.majorMarkets || [])
      .filter(market => market && String(market).trim()) // Filter out null/undefined/empty values
      .map(market => `${safeToLowerCase(market)} egg rate`);
    
    const keywords = [
      `${cityLower} egg rate live`,
      `${cityLower} necc rate breaking`,
      `${cityLower} egg price now`,
      `${cityLower} wholesale egg rate`,
      `${cityLower} egg market live`,
      `${cityLower} egg rate update`,
      `${cityLower} ${contextLower} egg rate`,
      ...marketKeywords,
      `${cityLower} egg rate comparison`,
      `${cityLower} egg price forecast`,
      'live egg rates',
      'breaking egg prices',
      'urgent egg rate update'
    ].filter(keyword => keyword && String(keyword).trim()); // Filter out any empty or invalid keywords
    
    return keywords;
  };
  // Helper function to safely convert any value to string for React Helmet  // Helper function to safely convert any value to string for React Helmet
  const safeStringify = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value.filter(Boolean).join(', ');
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    }
    return String(value);
  };

  return (
    <Helmet>
      {/* High-CTR meta tags for underperforming cities */}
      <meta name="city-performance-optimization" content="true" />
      <meta name="target-ctr" content={safeStringify(cityData.targetCTR)} />
      <meta name="current-impressions" content={safeStringify(cityData.impressions)} />
        {/* Urgent, compelling title */}
      <meta name="urgent-title" content={safeStringify(getUrgentTitle())} />
      <meta name="compelling-description" content={safeStringify(getCompellingDescription())} />
        {/* City-specific rich snippets */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LiveBlogPosting",
          "headline": safeStringify(`LIVE: ${selectedCity} Egg Rates - NECC Updates`),
          "description": safeStringify(getCompellingDescription()),
          "datePublished": new Date().toISOString(),
          "dateModified": new Date().toISOString(),
          "author": {
            "@type": "Organization",
            "name": "Today Egg Rates"
          },
          "publisher": {
            "@type": "Organization", 
            "name": "Today Egg Rates",
            "logo": {
              "@type": "ImageObject",
              "url": "https://todayeggrates.com/logo.webp"
            }
          },          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": safeStringify(`https://todayeggrates.com/${safeToLowerCase(selectedCity)}`)
          },
          "liveBlogUpdate": [
            {
              "@type": "BlogPosting",
              "headline": safeStringify(`${selectedCity} Egg Rate: ₹${formatPrice(todayRate)}/egg`),
              "datePublished": new Date().toISOString(),
              "articleBody": safeStringify(`Current NECC egg rate in ${selectedCity}: ₹${formatPrice(todayRate)} per piece, ₹${formatPrice(trayPrice)} per tray (30 pieces)`)
            }
          ],
          "about": {
            "@type": "Place",
            "name": safeStringify(selectedCity),
            "description": safeStringify(`${cityData.localContext} of India`)
          }
        })}
      </script>      {/* Real-time price schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PriceSpecification",
          "name": safeStringify(`${selectedCity} NECC Egg Rate - Live`),
          "price": safeStringify(todayRate),
          "priceCurrency": "INR",
          "validFrom": new Date().toISOString(),
          "validThrough": new Date(Date.now() + 3600000).toISOString(), // 1 hour validity
          "valueAddedTaxIncluded": false,
          "eligibleRegion": {
            "@type": "City",
            "name": safeStringify(selectedCity),
            "containedInPlace": {
              "@type": "State",
              "name": safeStringify(selectedState)
            }
          }
        })}
      </script>      {/* FAQ schema for better SERP features */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": safeStringify(`What is today's egg rate in ${selectedCity}?`),
              "acceptedAnswer": {
                "@type": "Answer",
                "text": safeStringify(`Today's NECC egg rate in ${selectedCity} is ₹${formatPrice(todayRate)} per piece and ₹${formatPrice(trayPrice)} per tray (30 pieces). Updated at ${getCurrentTime()}.`)
              }
            },
            {
              "@type": "Question", 
              "name": safeStringify(`Where can I buy eggs at NECC rates in ${selectedCity}?`),
              "acceptedAnswer": {
                "@type": "Answer",
                "text": safeStringify(`Major wholesale markets in ${selectedCity} offering NECC rates: ${(cityData.majorMarkets || []).filter(m => m && String(m).trim()).join(', ')}. These markets follow official NECC pricing guidelines.`)
              }
            },
            {
              "@type": "Question",
              "name": safeStringify(`How often are ${selectedCity} egg rates updated?`),
              "acceptedAnswer": {
                "@type": "Answer",
                "text": safeStringify(`${selectedCity} egg rates are updated multiple times daily based on NECC announcements and market conditions. Check back regularly for the most current prices.`)
              }
            }
          ]
        })}
      </script>{/* Enhanced keywords for CTR optimization */}
      <meta name="ctr-keywords" content={safeStringify(getCitySpecificKeywords().filter(k => k).join(', '))} />
      
      {/* Social media CTR optimization */}
      <meta property="og:title" content={safeStringify(getUrgentTitle())} />
      <meta property="og:description" content={safeStringify(getCompellingDescription())} />
      <meta name="twitter:title" content={safeStringify(getUrgentTitle())} />
      <meta name="twitter:description" content={safeStringify(getCompellingDescription())} />
        {/* Rich results enhancement */}
      <meta name="news_keywords" content={safeStringify(`${selectedCity}, egg rates, NECC, live prices, breaking news, ${String(cityData.localContext || '')}`)} />
    </Helmet>
  );
});

UniversalCityOptimizer.displayName = 'UniversalCityOptimizer';

export default UniversalCityOptimizer;
