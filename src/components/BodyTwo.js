import React from "react";
import FAQ from "./FAQ";

const BodyTwo = ({ selectedCity, selectedState }) => {
  const displayName = selectedCity ? selectedCity : selectedState ? selectedState : 'India';
  
  return (
    <div className="p-6 mt-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-center bg-gray-200 rounded-lg w-full p-4 mt-4 text-2xl font-bold text-gray-800">
        Egg Daily and Monthly Prices in {displayName}
      </h1>
      <p className="text-left text-gray-700 mt-4 leading-relaxed">
        In {displayName}, Sunday ho ya Monday, we Indians love eggs and that is why India is the world’s third-largest layer industry. Today’s egg rate is an important indicator for both consumers and producers in the egg market.
      </p>

      <h1 className="text-center bg-gray-200 rounded-lg w-full p-4 mt-6 text-2xl font-bold text-gray-800">
        Wholesale Egg Prices Today in {displayName}
      </h1>
      <p className="text-left text-gray-700 mt-4 leading-relaxed">
        Wholesale egg prices in {displayName} refer to the price that retailers and distributors pay for eggs in bulk. Wholesale egg rates in {displayName} have been on the rise in recent years due to several factors.
      </p>

      <p className="text-left text-gray-700 mt-4 leading-relaxed">
        Overall, the egg market in {displayName} is constantly changing, and it is important for consumers to stay informed about the current egg rate and wholesale egg prices in order to make informed purchasing decisions.
      </p>

      <p className="text-left text-gray-700 mt-4 leading-relaxed">
        At Todayeggrate.in, we provide daily and monthly egg rates for {displayName}, so you can easily compare prices and make informed decisions. Get the live NECC egg rate with our comprehensive egg pricing data.
      </p>

      <div className="mt-6">
        <FAQ />
      </div>
    </div>
  );
};

export default BodyTwo;
