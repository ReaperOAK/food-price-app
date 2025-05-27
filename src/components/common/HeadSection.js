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
      
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(generateFaqSchema(selectedCity, selectedState, eggRates))}
      </script>
      
      <meta property="article:modified_time" content={new Date().toISOString()} />
      
      <meta property="og:title" content={getSeoTitle()} />
      <meta property="og:description" content={getSeoDescription()} />
      <meta property="og:url" content={`https://todayeggrates.com${location.pathname}`} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://todayeggrates.com/eggpic.webp" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={getSeoTitle()} />
      <meta name="twitter:description" content={getSeoDescription()} />
      <meta name="twitter:image" content="https://todayeggrates.com/eggpic.webp" />
    </Helmet>
  );
};

export default HeadSection;
