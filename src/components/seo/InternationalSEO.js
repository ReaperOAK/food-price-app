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
    return typeof convertedPrice === 'number' ? convertedPrice.toFixed(2) : 'N/A';
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
  };  // Safe string conversion function to prevent toLowerCase errors
  const safeToLowerCase = (value) => {
    if (!value) return '';
    return String(value).toLowerCase();
  };

  // Safe string conversion for React Helmet
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
  const getLocalizedContent = () => {
    const currency = userCountry === 'United Arab Emirates' ? 'AED' :
                    userCountry === 'United States' ? 'USD' :
                    userCountry === 'Canada' ? 'CAD' :
                    userCountry === 'Australia' ? 'AUD' :
                    userCountry === 'Qatar' ? 'QAR' :
                    userCountry === 'Saudi Arabia' ? 'SAR' :
                    userCountry === 'United Kingdom' ? 'GBP' : 'USD';

    const convertedPrice = formatCurrency(todayRate, currency);
    const symbol = getCurrencySymbol(currency);    return {
      title: `Indian NECC Egg Rates for ${userCountry || ''} | ₹${todayRate || 'N/A'} ≈ ${symbol}${convertedPrice}`,
      description: `Latest Indian egg prices for expats in ${userCountry || ''}. NECC egg rate: ₹${todayRate || 'N/A'}/egg (≈${symbol}${convertedPrice}). Stay updated with India market rates while abroad.`,
      keywords: [
        `indian egg prices ${safeToLowerCase(userCountry || '')}`,
        `necc rates for nri ${safeToLowerCase(userCountry || '')}`,
        `indian food prices in ${safeToLowerCase(userCountry || '')}`,
        `egg rates india to ${safeToLowerCase(currency || '')}`,
        `indian market rates ${safeToLowerCase(userCountry || '')}`,
        'nri food price tracking',
        'indian agricultural prices abroad',
        'expat indian food costs'
      ].filter(Boolean), // Remove any empty strings
      currency: currency
    };
  };

  const isInternational = userCountry && userCountry !== 'India';
  
  if (!isInternational) return null;

  const content = getLocalizedContent();

  return (    <Helmet>      {/* International SEO meta tags */}
      <meta name="international-audience" content={safeStringify(userCountry)} />
      <meta name="target-country" content={safeStringify(userCountry)} />
      <meta name="diaspora-content" content="true" />
        {/* Alternate titles and descriptions for international audience */}
      <meta name="alternate-title" content={safeStringify(content.title)} />
      <meta name="alternate-description" content={safeStringify(content.description)} />
      <meta name="geo.region" content={safeStringify(userCountry === 'United Arab Emirates' ? 'AE' : 'IN')} />
      
      {/* International keywords */}
      <meta name="international-keywords" content={safeStringify(content.keywords?.join(', '))} />{/* Currency-specific structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PriceSpecification",
          "name": `NECC Egg Rate for ${String(userCountry || '')} Residents`,
          "price": String(formatCurrency(todayRate, content.currency) || ''),
          "priceCurrency": String(content.currency || 'USD'),
          "referenceQuantity": {
            "@type": "QuantitativeValue",
            "value": "1",
            "unitCode": "C62"
          },
          "validFrom": String(new Date().toISOString()),
          "validThrough": String(new Date(Date.now() + 24*60*60*1000).toISOString()),
          "eligibleRegion": {
            "@type": "Country",
            "name": String(userCountry || '')
          }
        })}
      </script>{/* International audience schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": String(content.title || ''),
          "description": String(content.description || ''),
          "audience": {
            "@type": "Audience",
            "audienceType": "Indian Diaspora",
            "geographicArea": {
              "@type": "Country",
              "name": String(userCountry || '')
            }
          },
          "about": {
            "@type": "Thing",
            "name": "Indian Food Prices",
            "description": "Current market rates for Indian agricultural products"
          }
        })}
      </script>      {/* Hreflang for different regions */}
      <link rel="alternate" hrefLang="en-ae" href={`https://todayeggrates.com${String(window?.location?.pathname || '')}?region=uae`} />
      <link rel="alternate" hrefLang="en-us" href={`https://todayeggrates.com${String(window?.location?.pathname || '')}?region=usa`} />
      <link rel="alternate" hrefLang="en-ca" href={`https://todayeggrates.com${String(window?.location?.pathname || '')}?region=canada`} />
      <link rel="alternate" hrefLang="en-au" href={`https://todayeggrates.com${String(window?.location?.pathname || '')}?region=australia`} />
      <link rel="alternate" hrefLang="en-in" href={`https://todayeggrates.com${String(window?.location?.pathname || '')}`} />
    </Helmet>
  );
});

InternationalSEO.displayName = 'InternationalSEO';

export default InternationalSEO;
