import React from "react";
import FAQ from "./FAQ";

const BodyTwo = ({ selectedCity, selectedState }) => {
  return (
    <div className="p-6 mt-6 bg-cover bg-center rounded-lg shadow-lg">
      <h1 className="text-center bg-gray-200 bg-opacity-75 rounded-lg w-full p-4 mt-4 text-2xl font-bold text-gray-800">
        Egg Daily and Monthly Prices
      </h1>
      <p className="text-left text-gray-700 mt-4 leading-relaxed bg-white bg-opacity-75 p-2 rounded">
        Our platform Today Egg rates provides the daily and monthly prices of egg throughout the different cities, states and areas of India. This Egg rate indicator is beneficial for both consumers and sellers in the Indian egg market. The daily or today’s egg rate refers to the current price rates of the eggs. Users can scroll up to the previous day's price rates as well, limited to the current month. The egg rates depend on several factors such as production cost, transportation, egg quality, etc.
      </p>

      <h1 className="text-center bg-gray-200 bg-opacity-75 rounded-lg w-full p-4 mt-6 text-2xl font-bold text-gray-800">
        Wholesale Egg Prices Today
      </h1>
      <p className="text-left text-gray-700 mt-4 leading-relaxed bg-white bg-opacity-75 p-2 rounded">
        The wholesale egg prices represent the rates that retailers and distributors pay when purchasing eggs in bulk quantities. In India, these prices have been experiencing a notable upward trend in recent years, influenced by a variety of factors.
      </p>
      <p className="text-left text-gray-700 mt-4 leading-relaxed bg-white bg-opacity-75 p-2 rounded">
        One of the primary contributors to this increase is the rise in chicken feeding costs. Corn and soybeans, which are the main ingredients in chicken feed, have seen substantial price hikes. This surge in feed prices has a direct impact on the overall costs incurred by egg producers or poultry farms, as feed constitutes a significant portion of their operational expenses.
      </p>
      <p className="text-left text-gray-700 mt-4 leading-relaxed bg-white bg-opacity-75 p-2 rounded">
        Additionally, other factors such as fluctuations in demand and supply, changes in production levels, and economic conditions can also play a role in influencing wholesale egg prices. For instance, periods of high demand—such as during festivals or holidays—can lead to further increases in prices, while production challenges, such as disease outbreaks among poultry, can also restrict supply and drive prices higher.
      </p>
      <p className="text-left text-gray-700 mt-4 leading-relaxed bg-white bg-opacity-75 p-2 rounded">
        The egg market is a dynamic landscape that is ever-evolving, making it essential for consumers to remain well-informed about current egg prices and wholesale egg rates. This knowledge empowers them to make thoughtful and informed purchasing choices. For farmers and egg producers, staying attuned to daily and monthly fluctuations in egg prices is equally vital. By closely monitoring these trends, they can optimize their production strategies and pricing decisions, ensuring sustainability and profitability in their operations. In this intricate dance of supply and demand, awareness becomes a key advantage for all stakeholders involved.
      </p>
      <p className="text-left text-gray-700 mt-4 leading-relaxed bg-white bg-opacity-75 p-2 rounded">
        At TodayEggRates.com, we offer a comprehensive overview of daily and monthly NECC egg rates throughout the different areas/cities and states of India, allowing you to effortlessly compare rates and make informed decisions. Whether you’re a farmer eager to sell your eggs or a consumer searching for the best prices, our platform serves as your trusted resource for the latest egg rate information. Discover today’s price for a tray of eggs or explore the current cost of a peti of eggs. Stay updated with live NECC rates through our detailed pricing data, ensuring you always have access to the most accurate market insights.
      </p>

      <h1 className="text bg-green-200 bg-opacity-75 rounded-lg w-full p-4 mt-6 text-2xl font-bold text-gray-800">
        NECC-National Egg Coordination Committee
      </h1>
      <div className="grid lg:grid-cols-2 gap-5"> 
          <img src="/eggrate2.jpg" alt="Egg rate chart" className="col-span-1 object-contain shadow rounded border-none" />
          <div>
            <p className="text-left text-gray-700 leading-relaxed bg-white bg-opacity-75 p-4 rounded">
              Eggs are a fantastic addition to any meal, whether it's breakfast, lunch, or dinner! You can enjoy them scrambled or boiled, and they work wonderfully in dishes like Anda Bhurji or even Anda Ka Halwa. Just like us Indians, eggs can fit into a variety of recipes while keeping their special charm. If you're curious about egg prices in India, they change daily, as shared by the NECC (National Egg Coordination Committee). We make it easy for you to stay updated with the latest egg rates so you can continue enjoying your favorite egg dishes!
            </p> 
          </div>
      </div>
      <h1 className="text bg-green-200 bg-opacity-75 rounded-lg w-full p-4 mt-6 text-2xl font-bold text-gray-800">
      Today Egg Rates
      </h1>
      <div className="grid lg:grid-cols-2 gap-5"> 
        <div>
          <p className="text-left text-gray-700 leading-relaxed bg-white bg-opacity-75 p-4 rounded">
          The National Egg Coordination Committee (NECC) considers purchasing trends and the efforts of egg farmers when recommending current egg prices. This organization provides price suggestions for over 50 cities and states across the country. By disseminating today’s egg prices, we ensure that users remain informed about NECC’s recommendations, thereby enabling them to make more informed purchasing decisions.
          </p> 
        </div>
        <img src="/desiegg.jpg" alt="Desi eggs" className="col-span-1 object-contain shadow rounded border-none" />
      </div>
      <h1 className="text bg-green-200 bg-opacity-75 rounded-lg w-full p-4 mt-6 text-2xl font-bold text-gray-800">
        Egg Consumption in India
      </h1>
      <div className="grid lg:grid-cols-2 gap-5"> 
          <img src="/eggrate3.jpg" alt="Egg consumption chart" className="col-span-1 object-contain shadow rounded border-none" />
          <div>
            <p className="text-left text-gray-700 leading-relaxed bg-white bg-opacity-75 p-4 rounded">
            India is a major player in the global egg production industry, generating approximately 129.6 billion eggs each year. This production figure is experiencing a steady growth rate of 7% annually. The increasing demand for eggs in India can be attributed to several factors, including population growth, rising incomes, and changing dietary preferences. As more people recognize the nutritional benefits of eggs, their consumption continues to rise, making India one of the largest egg consumers in the world.
            </p> 
          </div>
      </div>
      <FAQ />
    </div>
  );
};

export default BodyTwo;