import { Helmet } from 'react-helmet';
import React, { memo } from 'react';
import DesktopOptimizer from '../seo/DesktopOptimizer';
import InternationalSEO from '../seo/InternationalSEO'; 
import UniversalCityOptimizer from '../seo/UniversalCityOptimizer';

const HeadSection = memo(({
  getSeoTitle,
  getSeoDescription,
  getSeoKeywords,
  location,
  structuredData,
  generateFaqSchema,
  selectedCity,
  selectedState,
  eggRates,
  userCountry, // New prop for international optimization
  todayRate,   // New prop for high-traffic city optimization
  trayPrice    // New prop for high-traffic city optimization
}) => {
  const canonicalUrl = `https://todayeggrates.com${
    location.pathname === '/' 
      ? '' 
      : location.pathname.endsWith('/') 
        ? location.pathname.slice(0, -1) 
        : location.pathname
  }`;
  // Generate optimized SEO content
  const currentRate = todayRate || eggRates?.[0]?.rate;
  const seoTitle = getSeoTitle(selectedCity, selectedState, currentRate);
  const seoDescription = getSeoDescription(selectedCity, selectedState, currentRate);
  
  // Ensure title length is optimal for SERP display (under 60 characters)
  const optimizedTitle = seoTitle.length > 60 ? seoTitle.substring(0, 57) + '...' : seoTitle;
  
  // Force title update in DOM (helps with React Helmet timing issues)
  React.useEffect(() => {
    document.title = optimizedTitle;
  }, [optimizedTitle]);

  return (
    <Helmet>
      {/* Performance and Resource Hints */}
      <link 
        rel="preload" 
        href="/eggpic.webp" 
        as="image" 
        type="image/webp"
        fetchpriority="high"
      />
      <link 
        rel="preconnect" 
        href="https://todayeggrates.com"
        crossOrigin="anonymous"
      />
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
        crossOrigin="anonymous"
      />
      <link rel="dns-prefetch" href="https://todayeggrates.com" />
        {/* Core Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="format-detection" content="telephone=no" />
        {/* Desktop Performance Optimization */}
      <meta name="google" content="nositelinkssearchbox" />
      <meta name="msvalidate.01" content="verification-for-bing" />
      
      {/* International SEO - Currency & Location */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="geo.position" content="20.5937;78.9629" />
      <meta name="ICBM" content="20.5937, 78.9629" />
      
      {/* Rich Results Enhancement */}
      <meta name="news_keywords" content="NECC egg rate today, live egg prices, Indian egg market, poultry prices" />
      <meta name="article:publisher" content="https://todayeggrates.com" />
      <meta name="article:section" content="Agriculture & Food Prices" />
      <meta name="article:tag" content="NECC rates, egg prices, poultry market, agricultural commodities" />      {/* SEO Meta Tags - Optimized for better SERP title adoption */}
      <title>{optimizedTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={getSeoKeywords(selectedCity, selectedState)} />
      <meta name="author" content="Today Egg Rates" />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Multiple title signals for better SERP adoption - Google needs confidence */}
      <meta name="title" content={optimizedTitle} />
      <meta property="article:title" content={optimizedTitle} />
      <meta name="page-title" content={optimizedTitle} />
      <meta name="dcterms.title" content={optimizedTitle} />
      <meta name="application-name" content={optimizedTitle} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Content freshness signals */}
      <meta name="last-modified" content={new Date().toISOString()} />
      <meta name="cache-control" content="public, max-age=3600" />
        {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(generateFaqSchema(selectedCity, selectedState, eggRates))}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Today Egg Rates",
          "url": "https://todayeggrates.com",
          "logo": "https://todayeggrates.com/logo.webp",
          "sameAs": [
            "https://facebook.com/todayeggrates",
            "https://twitter.com/todayeggrates",
            "https://instagram.com/todayeggrates"
          ]
        })}
      </script>
      
      {/* Enhanced WebPage schema with title emphasis */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": optimizedTitle,
          "headline": optimizedTitle,
          "description": seoDescription,
          "url": canonicalUrl,
          "dateModified": new Date().toISOString(),
          "datePublished": new Date().toISOString(),
          "inLanguage": "en-IN",
          "isPartOf": {
            "@type": "WebSite",
            "name": "Today Egg Rates",
            "url": "https://todayeggrates.com"
          },
          "mainEntity": currentRate ? {
            "@type": "Product",
            "name": "NECC Egg Rate",
            "offers": {
              "@type": "Offer",
              "price": currentRate,
              "priceCurrency": "INR"
            }
          } : undefined
        })}
      </script>
      
      <meta property="article:modified_time" content={new Date().toISOString()} />      {/* OpenGraph Tags - Enhanced for International Audience */}
      <meta property="og:site_name" content="Today Egg Rates - NECC Egg Rate Today" />
      <meta property="og:title" content={optimizedTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://todayeggrates.com/eggpic.webp" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="en_AU" />
      <meta property="og:locale:alternate" content="en_GB" />
      <meta property="og:image:alt" content="NECC egg rate today and live egg price updates" />
      <meta property="og:updated_time" content={new Date().toISOString()} />
      <meta property="business:contact_data:street_address" content="Mumbai, India" />
      <meta property="business:contact_data:locality" content="Mumbai" />
      <meta property="business:contact_data:region" content="Maharashtra" />
      <meta property="business:contact_data:postal_code" content="400001" />
      <meta property="business:contact_data:country_name" content="India" />
      
      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@todayeggrates" />
      <meta name="twitter:creator" content="@todayeggrates" />
      <meta name="twitter:title" content={optimizedTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content="https://todayeggrates.com/eggpic.webp" />
      <meta name="twitter:image:alt" content="NECC egg rate today, live egg prices and daily egg rate updates" />
      
      {/* Performance Optimizations */}
      <link 
        rel="preload" 
        href="/static/fonts/inter-var.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous" 
      />
        {/* PWA Tags */}
      <meta name="application-name" content="NECC Egg Rate Today - Live Updates" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="NECC Egg Rate Today" />
      <meta name="mobile-web-app-capable" content="yes" />      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Performance and SEO Optimization Components */}
      <DesktopOptimizer />
      <InternationalSEO 
        userCountry={userCountry}
        selectedCity={selectedCity}
        selectedState={selectedState}
        todayRate={todayRate}
      />
      <UniversalCityOptimizer
        selectedCity={selectedCity}
        selectedState={selectedState} 
        todayRate={todayRate}
        trayPrice={trayPrice}
      />
    </Helmet>
  );
});

HeadSection.displayName = 'HeadSection';

export default HeadSection;
