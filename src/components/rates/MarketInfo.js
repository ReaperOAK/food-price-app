import React from 'react';

const MarketInfo = ({ selectedCity, selectedState }) => {
  return (
    <div className="mt-8 bg-blue-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-blue-800 mb-2">About {selectedCity} Egg Market</h3>
      <p className="text-gray-700 mb-3">
        The egg market in {selectedCity}, {selectedState} follows the general poultry market trends in the region.
        Prices are influenced by factors such as feed costs, seasonal demand, transportation expenses, and overall market conditions.
      </p>
      <p className="text-gray-700">
        {selectedCity}'s egg rates are typically updated daily based on the National Egg Coordination Committee (NECC) publications
        and local market surveys. Our website provides the most current prices to help consumers and traders make informed decisions.
      </p>
    </div>
  );
};

export default MarketInfo;
