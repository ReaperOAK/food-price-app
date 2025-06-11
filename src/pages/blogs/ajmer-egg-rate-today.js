import React, { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import OptimizedImage from '../../components/common/OptimizedImage';
import RateTable from '../../components/rates/RateTable';
import { fetchRatesForDays } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EggRates = () => {
  const [eggRates, setEggRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRatesForDays('Ajmer', 'Rajasthan', 7)
      .then((data) => {
        setEggRates(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching egg rates of Ajmer:', error);
        setIsLoading(false);
      });
  }, []);
  const todayRate =
    eggRates.length > 0 ? parseFloat(eggRates[0].rate).toFixed(2) : 'N/A';

  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Ajmer Egg Rate Today: Current Prices and Market Trends
      </h1>
      <OptimizedImage
        src="/desiegg.webp"
        alt="Ajmer Egg Rates"
        className="w-full mb-8 rounded-lg shadow-md"
        width={400}
        height={300}
      />

      <section className="mb-8">
        <p className="text-lg text-gray-600">
          If you're in Ajmer, Rajasthan, and looking to stay updated on the
          latest egg prices, this guide will help you stay informed. Knowing the
          <b>egg price</b> in <b>Ajmer</b> is important. It can help you make
          better buying choices. This applies to consumers, retailers, and
          wholesalers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Today's Egg Rate
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          The egg rate in Ajmer today is ₹{todayRate} per egg.
        </p>
        <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            Last 7 Days Price Trend
          </h3>
          <RateTable
            rates={eggRates}
            showChart={true}
            selectedCity="Ajmer"
            selectedState="Rajasthan"
            showState={false}
            showDate={true}
            itemsPerPage={7}
            isLoading={isLoading}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          The Egg Economy of Ajmer
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Whether you are an individual consumer shopping for your household, a
          retailer stocking shelves for local customers, or a wholesaler
          managing large volumes and supply chains, understanding the nuances of
          the Ajmer egg rate directly impacts your bottom line and operational
          strategy. Real-time knowledge of fluctuating prices allows for
          strategic planning, cost management, and ultimately, more effective
          transactions. This guide endeavors to provide you with regular updates
          and insights, ensuring you are always equipped with the latest market
          intelligence. By consistently referencing and utilizing this
          information, you can optimize your purchasing strategies and remain
          competitive within the egg market of Ajmer.
        </p>
        <OptimizedImage
          src="/eggchicken.webp"
          alt="Egg Production"
          className="w-full mb-8 rounded-lg shadow-md"
          width={300}
          height={200}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Ajmer Egg Rate Today
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          As of today, the Ajmer egg rate based on the latest available data is:
          Per piece: ₹4.15 Per tray (30 eggs): ₹124.50 Per 100 eggs: ₹415 Per
          peti (180 eggs): ₹872
        </p>
        <p className="text-lg text-gray-600 mb-4">
          These prices are set by the NECC (National Egg Coordination
          Committee). They update egg prices based on market trends.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          What Makes Agra's egg Special?
        </h2>

        <ul className="list-disc list-inside text-lg text-gray-600 mb-4">
          <li>
            <b>Freshness:</b> Eggs from Agra are delivered to local markets and
            stores within hours of being laid. This ensures unmatched freshness,
            which is crucial for taste and nutritional value.
          </li>
          <li>
            <b>Nutritional Value:</b> Thanks to the balanced diets provided to
            the hens, Agra's eggs are rich in high-quality protein, vitamins,
            and minerals. Some farms even produce omega-3 enriched eggs,
            catering to health-conscious consumers.
          </li>
          <li>
            <b>Affordability:</b> Despite their premium quality, Agra's eggs
            remain affordable, making them a favorite among households and
            businesses alike.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Seasonal Trends and eggs Price Fluctuations in Ajmer
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Egg prices in Ajmer tend to rise during the winter months due to
          increased demand for high-protein foods. Additionally, festivals and
          wedding seasons can also contribute to temporary price spikes.
          Conversely, prices may dip slightly during the summer when demand is
          relatively lower. Understanding these seasonal trends can help
          consumers plan their purchases more effectively.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Retail vs Wholesale Rates
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Different markets in Ajmer may offer varying prices depending on where
          you shop. Here's a comparison:
        </p>
        <ul>Wholesale rate: Around ₹4.55 per egg</ul>
        <ul>Retail rate: Around ₹4.87 per egg</ul>
        <ul>Supermarket rate: Can go up to ₹4.96 per egg</ul>
        <p className="text-lg text-gray-600 mb-4">
          These differences arise due to packaging, brand value, and logistics
          costs.
        </p>

        <OptimizedImage
          src="/eggpic.webp"
          alt="Egg Price Chart"
          className="w-full mb-8 rounded-lg shadow-md"
          width={300}
          height={200}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Papaak Egg Rate Ajmer
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          For those looking for branded or premium egg options, Papaak egg rate
          Ajmer may vary slightly from NECC rates. Branded eggs sometimes come
          at a premium, especially if they are organic or fortified.
        </p>
        <OptimizedImage
          src="/eggpic.webp"
          alt="Egg Price Chart"
          className="w-full mb-8 rounded-lg shadow-md"
          width={300}
          height={200}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          What Affects Today’s Egg Rate?
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Several key factors influence the today egg rate in Ajmer:
        </p>
        <ul>
          Feed cost: A rise in chicken feed prices directly increases production
          costs.
        </ul>
        <ul>
          Seasonal demand: Prices tend to go up during festivals and winters.
        </ul>
        <ul>Supply issues: Fewer eggs in the market mean higher prices.</ul>
        <ul>
          Transport expenses: Rising fuel costs affect egg delivery and final
          market price.
        </ul>
      </section>
    </div>
  );
};

export default EggRates;
