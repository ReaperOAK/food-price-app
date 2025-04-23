import React from 'react';
import 'tailwindcss/tailwind.css'; // Ensure Tailwind CSS is imported

const EggRates = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Understanding Egg Rates in India</h1>
      <img src="/desiegg.jpg" alt="Egg Rates Banner" className="w-full mb-8 rounded-lg shadow-md" />
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Introduction</h2>
        <p className="text-lg text-gray-600">
          Eggs are a staple food in many households across India. Understanding the factors that influence egg rates can help consumers make informed purchasing decisions and farmers optimize their production strategies.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Factors Affecting Egg Prices</h2>
        <p className="text-lg text-gray-600 mb-4">
          Several factors influence the price of eggs in India, including:
        </p>
        <ul className="list-disc list-inside text-lg text-gray-600 mb-4">
          <li>Production Costs</li>
          <li>Transportation Costs</li>
          <li>Quality of Eggs</li>
          <li>Seasonal Demand</li>
          <li>Market Supply</li>
        </ul>
        <img src="/eggchicken.jpg" alt="Egg Production" className="w-full mb-8 rounded-lg shadow-md" />
      </section>
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Current Trends in Egg Prices</h2>
        <p className="text-lg text-gray-600 mb-4">
          Recently, egg prices have been on the rise due to increased production costs and higher demand during festive seasons. The following chart shows the trend in egg prices over the past year:
        </p>
        <img src="/eggpic.png" alt="Egg Price Chart" className="w-full mb-8 rounded-lg shadow-md" />
      </section>
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Conclusion</h2>
        <p className="text-lg text-gray-600 mb-4">
          Understanding the factors that influence egg prices can help consumers and farmers alike. By staying informed about current trends and market conditions, stakeholders can make better decisions and ensure a stable supply of eggs in the market.
        </p>
        <p className="text-lg text-gray-600">
          For more information on egg rates and market trends, visit our website regularly and stay updated with the latest data.
        </p>
      </section>
    </div>
  );
};

export default EggRates;