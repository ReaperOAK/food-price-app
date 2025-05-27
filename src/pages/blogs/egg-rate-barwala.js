import React, { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import OptimizedImage from '../../components/common/OptimizedImage';
import RateTable from '../../components/rates/RateTable';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EggRates = () => {
  const [eggRates, setEggRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/php/api/rates/get_rates.php?city=Barwala&state=Haryana&days=7')
      .then(response => response.json())
      .then(data => {
        // Ensure rates are numbers and add default values
        const parsedData = data.map(rate => ({
          id: rate.id || String(Math.random()),
          city: rate.city || 'Barwala',
          state: rate.state || 'Haryana',
          date: rate.date || new Date().toISOString().split('T')[0],
          rate: typeof rate.rate === 'number' ? rate.rate : parseFloat(rate.rate) || 0
        }));
        setEggRates(parsedData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching egg rates:', error);
        setIsLoading(false);
      });
  }, []);
  const todayRate = eggRates.length > 0 ? parseFloat(eggRates[0].rate).toFixed(2) : 'N/A';

  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Eggs and Egg Prices in Barwala, Hisar: A Comprehensive Overview</h1>
      <OptimizedImage src="/desiegg.webp" alt="Egg Rates Banner" className="w-full mb-8 rounded-lg shadow-md" width={400} height={300} />
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Introduction</h2>
        <p className="text-lg text-gray-600">
            Barwala, a small yet bustling town near Hisar, is renowned for its vibrant markets and thriving poultry industry. For both locals and visitors, eggs from Barwala represent a perfect combination of quality and affordability. In this blog, we'll explore the dynamics of egg prices in Barwala and what makes this town a vital player in the regional egg market.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Today's Egg Rate</h2>
        <p className="text-lg text-gray-600 mb-4">The egg rate in Barwala today is ₹{todayRate} per egg.</p>
          <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Last 7 Days Price Trend</h3>
          <RateTable 
            rates={eggRates}
            showChart={true}
            selectedCity="Barwala"
            selectedState="Haryana"
            showState={false}
            showDate={true}
            itemsPerPage={7}
            isLoading={isLoading}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">The Egg Economy of Barwala</h2>
        <p className="text-lg text-gray-600 mb-4">
            Barwala's poultry industry is a cornerstone of its local economy, with numerous farms ranging from small-scale operations to large commercial ventures. These farms produce a substantial quantity of eggs daily, which are supplied to neighboring towns, cities, and even other states. 
        One of the key factors contributing to Barwala's reputation in the egg industry is its commitment to sustainable and humane farming practices. Farmers in the area often emphasize quality over quantity, resulting in eggs that are fresh, nutritious, and flavorful.
        </p>
        <OptimizedImage src="/eggchicken.webp" alt="Egg Production" className="w-full mb-8 rounded-lg shadow-md" width={300} height={200} />
      </section>
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Current Egg Prices in Barwala</h2>
        <p className="text-lg text-gray-600 mb-4">
        Egg prices in Barwala fluctuate based on several factors, including seasonal demand, feed costs, and transportation expenses. As of recent trends, the average price per dozen eggs in Barwala ranges between ₹60 to ₹80, depending on the quality and type of eggs (e.g., free-range, organic, or standard).

        For those buying in bulk, wholesale prices often offer additional discounts, making Barwala an attractive source for restaurants, bakeries, and other businesses that rely heavily on eggs. Despite occasional price variations, Barwala's eggs remain competitively priced compared to other regions, thanks to efficient farming and distribution systems.
        </p>
        <OptimizedImage src="/eggchicken.webp" alt="Egg Production" className="w-full mb-8 rounded-lg shadow-md" width={300} height={200} />
      </section>
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">What Makes Barwala's Eggs Special?</h2>
        
        <ul className="list-disc list-inside text-lg text-gray-600 mb-4">
          <li><b>Freshness:</b> Eggs from Barwala are delivered to local markets and stores within hours of being laid. This ensures unmatched freshness, which is crucial for taste and nutritional value.
          </li>
          <li><b>Nutritional Value:</b> Thanks to the balanced diets provided to the hens, Barwala's eggs are rich in high-quality protein, vitamins, and minerals. Some farms even produce omega-3 enriched eggs, catering to health-conscious consumers.</li>
          <li><b>Affordability:</b> Despite their premium quality, Barwala's eggs remain affordable, making them a favorite among households and businesses alike.</li>
        </ul>
        <OptimizedImage src="/eggchicken.webp" alt="Egg Production" className="w-full mb-8 rounded-lg shadow-md" width={300} height={200} />
      </section>
      
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Seasonal Trends and eggs Price Fluctuations</h2>
        <p className="text-lg text-gray-600 mb-4">
            Egg prices in Barwala tend to rise during the winter months due to increased demand for high-protein foods. Additionally, festivals and wedding seasons can also contribute to temporary price spikes. Conversely, prices may dip slightly during the summer when demand is relatively lower. Understanding these seasonal trends can help consumers plan their purchases more effectively.
        </p>
        <OptimizedImage src="/eggpic.webp" alt="Egg Price Chart" className="w-full mb-8 rounded-lg shadow-md" width={300} height={200} />
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Supporting Local Farmers</h2>
        <p className="text-lg text-gray-600 mb-4">
        Choosing eggs from Barwala not only ensures access to a superior product but also supports local farmers and their sustainable practices. By purchasing locally produced eggs, consumers contribute to the economic well-being of the community and encourage environmentally friendly farming methods.</p>
        <OptimizedImage src="/eggpic.webp" alt="Egg Price Chart" className="w-full mb-8 rounded-lg shadow-md" width={300} height={200} />
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Visiting Barwala's Market</h2>
        <p className="text-lg text-gray-600 mb-4">
        If you're in or near Hisar, visiting Barwala's markets is a must. These bustling hubs offer a variety of fresh produce, including the famous eggs. Engaging with local vendors provides a glimpse into the hard work and dedication that goes into every carton of eggs sold.</p>
        <OptimizedImage src="/eggpic.webp" alt="Egg Price Chart" className="w-full mb-8 rounded-lg shadow-md" width={300} height={200} />
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Conclusion</h2>
        <p className="text-lg text-gray-600 mb-4">
        Barwala's eggs are more than just a staple; they are a testament to the town's commitment to quality, sustainability, and affordability. Whether you're a local resident or a visitor, exploring the egg market in Barwala offers both culinary and economic insights. So, the next time you're shopping for eggs, consider sourcing them from Barwala—you'll be supporting a thriving local industry while enjoying some of the best eggs the region has to offer.</p>
      </section>
    </div>
  );
};

export default EggRates;