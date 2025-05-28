import { Helmet } from 'react-helmet';

const HeadSection = ({
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
  return (
    <Helmet>
      {/* Preload critical resources */}
      <link rel="preload" href="/eggpic.webp" as="image" type="image/webp" />
      <link rel="preconnect" href="https://todayeggrates.com" />
      <link rel="dns-prefetch" href="https://todayeggrates.com" />
      
      {/* Priority hints for LCP */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      
      <title>{getSeoTitle()}</title>
      <meta name="description" content={getSeoDescription()} />
      <meta name="keywords" content={getSeoKeywords()} />
      
      <link 
        rel="canonical" 
        href={`https://todayeggrates.com${
          location.pathname === '/' 
            ? '' 
            : location.pathname.endsWith('/') 
              ? location.pathname.slice(0, -1) 
              : location.pathname
        }`} 
      />
      
      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(generateFaqSchema(selectedCity, selectedState, eggRates))}
      </script>
      
      <meta property="article:modified_time" content={new Date().toISOString()} />
      
      {/* OpenGraph tags */}
      <meta property="og:title" content={getSeoTitle()} />
      <meta property="og:description" content={getSeoDescription()} />
      <meta property="og:url" content={`https://todayeggrates.com${location.pathname}`} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://todayeggrates.com/eggpic.webp" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={getSeoTitle()} />
      <meta name="twitter:description" content={getSeoDescription()} />
      <meta name="twitter:image" content="https://todayeggrates.com/eggpic.webp" />
      
      {/* Performance optimizations */}
      <link rel="preload" as="font" href="/static/fonts/your-font.woff2" type="font/woff2" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default HeadSection;
