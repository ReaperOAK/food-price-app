import React from "react";

const SEOText = ({ selectedCity, selectedState }) => {
    return (
      <div className="p-6 mt-6 bg-gray-100 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Why Egg Rates Matter in {selectedCity}, {selectedState}</h2>
        <p>
          The egg industry is a significant part of the economy in {selectedCity}, {selectedState}. Keeping track of daily egg prices is essential for traders, farmers, and consumers. 
          Fluctuations in egg rates can be due to market demand, supply chain issues, and other economic factors.
        </p>
      </div>
    );
  };
  
  export default SEOText;
  