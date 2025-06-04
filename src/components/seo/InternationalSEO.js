import { Helmet } from 'react-helmet';
import { memo } from 'react';

const InternationalSEO = memo(({ userCountry, selectedCity, selectedState, todayRate }) => {
  // Currency conversion rates (would typically come from an API)
  const currencyRates = {
    'USD': 0.012,
    'AED': 0.044, 
    'SAR': 0.045,
    'QAR': 0.044,
    'CAD': 0.016,
    'AUD': 0.018,
    'GBP': 0.0095,
    'EUR': 0.011
  };

  const formatCurrency = (price, currency) => {
    if (!price || price === 'N/A') return 'N/A';
    const convertedPrice = parseFloat(price) * (currencyRates[currency] || 1);
    return convertedPrice.toFixed(2);
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$',
      'AED': 'AED',
      'SAR': 'SAR',
      'QAR': 'QAR',
      'CAD': 'CAD',
      'AUD': 'AUD',
      'GBP': '£',
      'EUR': '€'
    };
    return symbols[currency] || currency;
  };

  const getLocalizedContent = () => {
    const currency = userCountry === 'United Arab Emirates' ? 'AED' :
                    userCountry === 'United States' ? 'USD' :
                    userCountry === 'Canada' ? 'CAD' :
                    userCountry === 'Australia' ? 'AUD' :
                    userCountry === 'Qatar' ? 'QAR' :
                    userCountry === 'Saudi Arabia' ? 'SAR' :
                    userCountry === 'United Kingdom' ? 'GBP' : 'USD';

    const convertedPrice = formatCurrency(todayRate, currency);
    const symbol = getCurrencySymbol(currency);

    return {
      title: `Indian NECC Egg Rates for ${userCountry} | ₹${todayRate} ≈ ${symbol}${convertedPrice}`,
      description: `Latest Indian egg prices for expats in ${userCountry}. NECC egg rate: ₹${todayRate}/egg (≈${symbol}${convertedPrice}). Stay updated with India market rates while abroad.`,
      keywords: [
        `indian egg prices ${(userCountry.toLowerCase()||userCountry)}`,
        `necc rates for nri ${(userCountry.toLowerCase()||userCountry)}`,
        `indian food prices in ${(userCountry.toLowerCase()||userCountry)}`,
        `egg rates india to ${(currency.toLowerCase()||currency)}`,
        `indian market rates ${(userCountry.toLowerCase()||userCountry)}`,
        'nri food price tracking',
        'indian agricultural prices abroad',
        'expat indian food costs'
      ]
    };
  };

  const isInternational = userCountry && userCountry !== 'India';
  
  if (!isInternational) return null;

  const content = getLocalizedContent();

  return (
    <Helmet>
      {/* International SEO meta tags */}
      <meta name="international-audience" content={userCountry} />
      <meta name="target-country" content={userCountry} />
      <meta name="diaspora-content" content="true" />
      
      {/* Alternate titles and descriptions for international audience */}
      <meta name="alternate-title" content={content.title} />
      <meta name="alternate-description" content={content.description} />
      <meta name="geo.region" content={userCountry === 'United Arab Emirates' ? 'AE' : 'IN'} />
      
      {/* International keywords */}
      <meta name="international-keywords" content={content.keywords.join(', ')} />
      
      {/* Currency-specific structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PriceSpecification",
          "name": `NECC Egg Rate for ${userCountry} Residents`,
          "price": formatCurrency(todayRate, content.currency),
          "priceCurrency": content.currency || 'USD',
          "referenceQuantity": {
            "@type": "QuantitativeValue",
            "value": 1,
            "unitCode": "C62"
          },
          "validFrom": new Date().toISOString(),
          "validThrough": new Date(Date.now() + 24*60*60*1000).toISOString(),
          "eligibleRegion": {
            "@type": "Country",
            "name": userCountry
          }
        })}
      </script>

      {/* International audience schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": content.title,
          "description": content.description,
          "audience": {
            "@type": "Audience",
            "audienceType": "Indian Diaspora",
            "geographicArea": {
              "@type": "Country",
              "name": userCountry
            }
          },
          "about": {
            "@type": "Thing",
            "name": "Indian Food Prices",
            "description": "Current market rates for Indian agricultural products"
          }
        })}
      </script>

      {/* Hreflang for different regions */}
      <link rel="alternate" hrefLang="en-ae" href={`https://todayeggrates.com${window.location.pathname}?region=uae`} />
      <link rel="alternate" hrefLang="en-us" href={`https://todayeggrates.com${window.location.pathname}?region=usa`} />
      <link rel="alternate" hrefLang="en-ca" href={`https://todayeggrates.com${window.location.pathname}?region=canada`} />
      <link rel="alternate" hrefLang="en-au" href={`https://todayeggrates.com${window.location.pathname}?region=australia`} />
      <link rel="alternate" hrefLang="en-in" href={`https://todayeggrates.com${window.location.pathname}`} />
    </Helmet>
  );
});

InternationalSEO.displayName = 'InternationalSEO';

export default InternationalSEO;
