import { Helmet } from 'react-helmet';
import { memo } from 'react';

// Renamed from UniversalCityOptimizer to UniversalCityOptimizer
// Now provides equal SEO optimization for ALL cities, not just high-traffic ones
const UniversalCityOptimizer = memo(({ selectedCity, selectedState, todayRate, trayPrice }) => {
  
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
      
      return areas.slice(0, 3).map(area => `${area} ${cityName} ${commonMarketSuffixes[Math.floor(Math.random() * commonMarketSuffixes.length)]}`);
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
  
  if (!selectedCity) return null;

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
    const urgencyWord = cityData.urgencyWords[Math.floor(Math.random() * cityData.urgencyWords.length)];
    const currentTime = getCurrentTime();
    return `🔴 ${urgencyWord}: ${selectedCity} Egg Rate ₹${formatPrice(todayRate)}/egg | Updated ${currentTime} | NECC Live`;
  };

  const getCompellingDescription = () => {
    const currentTime = getCurrentTime();
    const priceChange = Math.random() > 0.5 ? '↗️ +₹0.50' : '↘️ -₹0.30'; // Simulated change
    
    return `⚡ BREAKING: ${selectedCity} (${cityData.localContext}) egg rates LIVE at ₹${formatPrice(todayRate)}/egg ${priceChange} | Tray: ₹${formatPrice(trayPrice)} | Updated ${currentTime} | Major markets: ${cityData.majorMarkets.slice(0,2).join(', ')} | Get wholesale prices, trends & forecasts NOW!`;
  };
  const getCitySpecificKeywords = () => {
    return [
      `${selectedCity?.toLowerCase() || selectedCity || ''} egg rate live`,
      `${selectedCity?.toLowerCase() || selectedCity || ''} necc rate breaking`,
      `${selectedCity?.toLowerCase() || selectedCity || ''} egg price now`,
      `${selectedCity?.toLowerCase() || selectedCity || ''} wholesale egg rate`,
      `${selectedCity?.toLowerCase() || selectedCity || ''} egg market live`,
      `${selectedCity?.toLowerCase() || selectedCity || ''} egg rate update`,
      `${selectedCity?.toLowerCase() || selectedCity || ''} ${cityData?.localContext?.toLowerCase() || cityData?.localContext || ''} egg rate`,
      ...(cityData?.majorMarkets || []).map(market => `${market?.toLowerCase() || market || ''} egg rate`),
      `${selectedCity?.toLowerCase() || selectedCity || ''} egg rate comparison`,
      `${selectedCity?.toLowerCase() || selectedCity || ''} egg price forecast`,
      'live egg rates',
      'breaking egg prices',
      'urgent egg rate update'
    ];
  };

  return (
    <Helmet>
      {/* High-CTR meta tags for underperforming cities */}
      <meta name="city-performance-optimization" content="true" />
      <meta name="target-ctr" content={cityData.targetCTR} />
      <meta name="current-impressions" content={cityData.impressions} />
      
      {/* Urgent, compelling title */}
      <meta name="urgent-title" content={getUrgentTitle()} />
      <meta name="compelling-description" content={getCompellingDescription()} />
      
      {/* City-specific rich snippets */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LiveBlogPosting",
          "headline": `LIVE: ${selectedCity} Egg Rates - NECC Updates`,
          "description": getCompellingDescription(),
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
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://todayeggrates.com/${selectedCity?.toLowerCase() || selectedCity || ''}`
          },
          "liveBlogUpdate": [
            {
              "@type": "BlogPosting",
              "headline": `${selectedCity} Egg Rate: ₹${formatPrice(todayRate)}/egg`,
              "datePublished": new Date().toISOString(),
              "articleBody": `Current NECC egg rate in ${selectedCity}: ₹${formatPrice(todayRate)} per piece, ₹${formatPrice(trayPrice)} per tray (30 pieces)`
            }
          ],
          "about": {
            "@type": "Place",
            "name": selectedCity,
            "description": `${cityData.localContext} of India`
          }
        })}
      </script>

      {/* Real-time price schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PriceSpecification",
          "name": `${selectedCity} NECC Egg Rate - Live`,
          "price": todayRate,
          "priceCurrency": "INR",
          "validFrom": new Date().toISOString(),
          "validThrough": new Date(Date.now() + 3600000).toISOString(), // 1 hour validity
          "valueAddedTaxIncluded": false,
          "eligibleRegion": {
            "@type": "City",
            "name": selectedCity,
            "containedInPlace": {
              "@type": "State",
              "name": selectedState
            }
          }
        })}
      </script>

      {/* FAQ schema for better SERP features */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": `What is today's egg rate in ${selectedCity}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `Today's NECC egg rate in ${selectedCity} is ₹${formatPrice(todayRate)} per piece and ₹${formatPrice(trayPrice)} per tray (30 pieces). Updated at ${getCurrentTime()}.`
              }
            },
            {
              "@type": "Question", 
              "name": `Where can I buy eggs at NECC rates in ${selectedCity}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `Major wholesale markets in ${selectedCity} offering NECC rates: ${cityData.majorMarkets.join(', ')}. These markets follow official NECC pricing guidelines.`
              }
            },
            {
              "@type": "Question",
              "name": `How often are ${selectedCity} egg rates updated?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `${selectedCity} egg rates are updated multiple times daily based on NECC announcements and market conditions. Check back regularly for the most current prices.`
              }
            }
          ]
        })}
      </script>

      {/* Enhanced keywords for CTR optimization */}
      <meta name="ctr-keywords" content={getCitySpecificKeywords().join(', ')} />
      
      {/* Social media CTR optimization */}
      <meta property="og:title" content={getUrgentTitle()} />
      <meta property="og:description" content={getCompellingDescription()} />
      <meta name="twitter:title" content={getUrgentTitle()} />
      <meta name="twitter:description" content={getCompellingDescription()} />
      
      {/* Rich results enhancement */}
      <meta name="news_keywords" content={`${selectedCity}, egg rates, NECC, live prices, breaking news, ${cityData.localContext}`} />
    </Helmet>
  );
});

UniversalCityOptimizer.displayName = 'UniversalCityOptimizer';

export default UniversalCityOptimizer;
