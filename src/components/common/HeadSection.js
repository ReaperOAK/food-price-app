import { Helmet } from 'react-helmet';
import { memo } from 'react';

const HeadSection = memo(({
  getSeoTitle,
  getSeoDescription,
  getSeoKeywords,
  location,
  structuredData,
  generateFaqSchema,
  selectedCity,
  selectedState,
  eggRates
}) => {
  const canonicalUrl = `https://todayeggrates.com${
    location.pathname === '/' 
      ? '' 
      : location.pathname.endsWith('/') 
        ? location.pathname.slice(0, -1) 
        : location.pathname
  }`;

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
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* SEO Meta Tags */}
      <title>{getSeoTitle(selectedCity, selectedState)}</title>
      <meta name="description" content={getSeoDescription(selectedCity, selectedState)} />
      <meta name="keywords" content={getSeoKeywords(selectedCity, selectedState)} />
      <meta name="author" content="Today Egg Rates" />
      <link rel="canonical" href={canonicalUrl} />
      
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
      
      <meta property="article:modified_time" content={new Date().toISOString()} />
      
      {/* OpenGraph Tags */}
      <meta property="og:site_name" content="Today Egg Rates" />
      <meta property="og:title" content={getSeoTitle(selectedCity, selectedState)} />
      <meta property="og:description" content={getSeoDescription(selectedCity, selectedState)} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://todayeggrates.com/eggpic.webp" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@todayeggrates" />
      <meta name="twitter:creator" content="@todayeggrates" />
      <meta name="twitter:title" content={getSeoTitle(selectedCity, selectedState)} />
      <meta name="twitter:description" content={getSeoDescription(selectedCity, selectedState)} />
      <meta name="twitter:image" content="https://todayeggrates.com/eggpic.webp" />
      <meta name="twitter:image:alt" content="Egg rates and prices visualization" />
      
      {/* Performance Optimizations */}
      <link 
        rel="preload" 
        href="/static/fonts/inter-var.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous" 
      />
      
      {/* PWA Tags */}
      <meta name="application-name" content="Today Egg Rates" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Today Egg Rates" />
      <meta name="mobile-web-app-capable" content="yes" />
        {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
    </Helmet>
  );
});

HeadSection.displayName = 'HeadSection';

export default HeadSection;
