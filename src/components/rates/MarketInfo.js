import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

const MarketInfo = memo(({ selectedCity, selectedState, isLoading = false }) => {
  // Market types for better information organization
  const marketTypes = [
    { title: 'Wholesale Markets', description: 'Large-scale trading, bulk purchases' },
    { title: 'Retail Outlets', description: 'Individual consumers, small businesses' },
    { title: 'Supermarkets', description: 'Packaged eggs, premium pricing' }
  ];

  // Schema markup for SEO
  const marketSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `${selectedCity} Egg Market`,
    "description": `Egg market information and daily prices in ${selectedCity}, ${selectedState}`,
    "areaServed": {
      "@type": "City",
      "name": selectedCity,
      "containedInPlace": {
        "@type": "State",
        "name": selectedState
      }
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }
  return (
    <>
      {/* Only render Helmet when not loading to prevent React Helmet errors */}
      {!isLoading && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(marketSchema)}
          </script>
        </Helmet>
      )}

      <section
        className="mt-8 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 
                   p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 
                   border border-blue-100 dark:border-gray-700"
        aria-labelledby="market-info-title"
      >        <h3 
          id="market-info-title"
          className="text-xl sm:text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4 
                     transition-colors duration-200"
        >
          {selectedCity} NECC Egg Rate Market & Today's Price Information
        </h3>

        <div className="space-y-6">
          {/* Overview Section */}
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The NECC egg rate market in {selectedCity}, {selectedState} provides today's egg rate and daily egg rate updates following National Egg Coordination Committee guidelines. Current egg rate today and NECC rates are influenced by feed costs, seasonal demand, transportation, and live market conditions. Check today egg rate, NECC egg price today, and wholesale egg rates for accurate pricing information.
            </p>
          </div>

          {/* Market Types Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {marketTypes.map(({ title, description }) => (
              <div 
                key={title}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm 
                         border border-blue-50 dark:border-gray-700
                         transform transition-all duration-300 hover:-translate-y-1 hover:shadow"
              >
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">{title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
              </div>
            ))}
          </div>

          {/* Price Updates Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6">            <p className="text-gray-700 dark:text-gray-300">
              <strong className="text-blue-900 dark:text-blue-100">Live NECC Rate Updates: </strong>
              {selectedCity}'s egg rate today and NECC egg rates are updated daily based on National Egg Coordination 
              Committee publications and local market surveys. Our platform provides today's egg rate, live NECC rates, 
              and current egg price information to help consumers and traders make informed decisions. Get accurate 
              today egg rate and daily egg rate updates for better market insights.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button 
              className="text-sm px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 
                         rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`View historical prices for ${selectedCity}`}
            >
              Historical Prices
            </button>
            <button 
              className="text-sm px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 
                         rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Compare with nearby markets"
            >
              Compare Markets
            </button>
          </div>
        </div>
      </section>
    </>
  );
});

MarketInfo.propTypes = {
  selectedCity: PropTypes.string.isRequired,
  selectedState: PropTypes.string.isRequired,
  isLoading: PropTypes.bool
};

MarketInfo.displayName = 'MarketInfo';

export default MarketInfo;
