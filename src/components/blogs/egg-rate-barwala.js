import React, { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css'; // Ensure Tailwind CSS is imported
import RateTable from '../RateTable';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EggRates = () => {
  const [eggRates, setEggRates] = useState([]);

  useEffect(() => {
    // Fetch the rates for the last 7 days
    fetch('/php/get_rates.php?city=Barwala&days=7')
      .then(res => res.json())
      .then(data => {
        const convertedData = data.map(item => ({
          ...item,
          rate: parseFloat(item.rate), // Convert rate to a number
        }));
        setEggRates(convertedData);
      })
      .catch(error => console.error('Error fetching rates:', error));
  }, []);

  const todayRate = eggRates.length > 0 ? eggRates[0].rate : 'N/A';
  const last7DaysRates = eggRates.slice(0, 7);

  const data = {
    labels: last7DaysRates.map(rate => rate.date),
    datasets: [
      {
        label: 'Egg Rates',
        data: last7DaysRates.map(rate => rate.rate),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Egg Rates in Barwala (Last 7 Days)',
      },
    },
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Eggs and Egg Prices in Barwala, Hisar: A Comprehensive Overview</h1>
      <img src="/desiegg.jpg" alt="Egg Rates Banner" className="w-full mb-8 rounded-lg shadow-md" />
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Introduction</h2>
        <p className="text-lg text-gray-600">
            Barwala, a small yet bustling town near Hisar, is renowned for its vibrant markets and thriving poultry industry. For both locals and visitors, eggs from Barwala represent a perfect combination of quality and affordability. In this blog, we’ll explore the dynamics of egg prices in Barwala and what makes this town a vital player in the regional egg market.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Today's Egg Rate</h2>
        <p className="text-lg text-gray-600">The egg rate in Barwala today is ₹{todayRate} per egg.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Egg Rates in the Last 7 Days</h2>
        <RateTable eggRates={last7DaysRates} selectedCity="Barwala" selectedState="Haryana" />
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Egg Rate Chart (Last 7 Days)</h2>
        <div className="mt-8">
          <Bar data={data} options={options} />
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">The Egg Economy of Barwala</h2>
        <p className="text-lg text-gray-600 mb-4">
            Barwala’s poultry industry is a cornerstone of its local economy, with numerous farms ranging from small-scale operations to large commercial ventures. These farms produce a substantial quantity of eggs daily, which are supplied to neighboring towns, cities, and even other states. 
        One of the key factors contributing to Barwala’s reputation in the egg industry is its commitment to sustainable and humane farming practices. Farmers in the area often emphasize quality over quantity, resulting in eggs that are fresh, nutritious, and flavorful.
        </p>
        <img src="/eggchicken.jpg" alt="Egg Production" className="w-full mb-8 rounded-lg shadow-md" />
      </section>
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Current Egg Prices in Barwala</h2>
        <p className="text-lg text-gray-600 mb-4">
        Egg prices in Barwala fluctuate based on several factors, including seasonal demand, feed costs, and transportation expenses. As of recent trends, the average price per dozen eggs in Barwala ranges between ₹60 to ₹80, depending on the quality and type of eggs (e.g., free-range, organic, or standard).

        For those buying in bulk, wholesale prices often offer additional discounts, making Barwala an attractive source for restaurants, bakeries, and other businesses that rely heavily on eggs. Despite occasional price variations, Barwala’s eggs remain competitively priced compared to other regions, thanks to efficient farming and distribution systems.
        </p>
        <img src="/eggchicken.jpg" alt="Egg Production" className="w-full mb-8 rounded-lg shadow-md" />
      </section>
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">What Makes Barwala’s Eggs Special?</h2>
        
        <ul className="list-disc list-inside text-lg text-gray-600 mb-4">
          <li><b>Freshness:</b> Eggs from Barwala are delivered to local markets and stores within hours of being laid. This ensures unmatched freshness, which is crucial for taste and nutritional value.
          </li>
          <li><b>Nutritional Value:</b> Thanks to the balanced diets provided to the hens, Barwala’s eggs are rich in high-quality protein, vitamins, and minerals. Some farms even produce omega-3 enriched eggs, catering to health-conscious consumers.</li>
          <li><b>Affordability:</b> Despite their premium quality, Barwala’s eggs remain affordable, making them a favorite among households and businesses alike.</li>
        </ul>
        <img src="/eggchicken.jpg" alt="Egg Production" className="w-full mb-8 rounded-lg shadow-md" />
      </section>
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Seasonal Trends and eggs Price Fluctuations</h2>
        <p className="text-lg text-gray-600 mb-4">
            Egg prices in Barwala tend to rise during the winter months due to increased demand for high-protein foods. Additionally, festivals and wedding seasons can also contribute to temporary price spikes. Conversely, prices may dip slightly during the summer when demand is relatively lower. Understanding these seasonal trends can help consumers plan their purchases more effectively.
        </p>
        <img src="/eggpic.png" alt="Egg Price Chart" className="w-full mb-8 rounded-lg shadow-md" />
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Supporting Local Farmers</h2>
        <p className="text-lg text-gray-600 mb-4">
        Choosing eggs from Barwala not only ensures access to a superior product but also supports local farmers and their sustainable practices. By purchasing locally produced eggs, consumers contribute to the economic well-being of the community and encourage environmentally friendly farming methods.</p>
        <img src="/eggpic.png" alt="Egg Price Chart" className="w-full mb-8 rounded-lg shadow-md" />
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Visiting Barwala’s Market</h2>
        <p className="text-lg text-gray-600 mb-4">
        If you’re in or near Hisar, visiting Barwala’s markets is a must. These bustling hubs offer a variety of fresh produce, including the famous eggs. Engaging with local vendors provides a glimpse into the hard work and dedication that goes into every carton of eggs sold.</p>
        <img src="/eggpic.png" alt="Egg Price Chart" className="w-full mb-8 rounded-lg shadow-md" />
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Conclusion</h2>
        <p className="text-lg text-gray-600 mb-4">
        Barwala’s eggs are more than just a staple; they are a testament to the town’s commitment to quality, sustainability, and affordability. Whether you’re a local resident or a visitor, exploring the egg market in Barwala offers both culinary and economic insights. So, the next time you’re shopping for eggs, consider sourcing them from Barwala—you’ll be supporting a thriving local industry while enjoying some of the best eggs the region has to offer.</p>
      </section>
    </div>
  );
};

export default EggRates;