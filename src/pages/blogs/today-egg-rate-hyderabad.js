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
    fetchRatesForDays('Hyderabad', 'Telangana', 7)
      .then((data) => {
        setEggRates(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching egg rates of Hyderabad:', error);
        setIsLoading(false);
      });
  }, []);
  const todayRate =
    eggRates.length > 0 ? parseFloat(eggRates[0].rate).toFixed(2) : 'N/A';

  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Today Egg rate in Hyderabad: Current Egg Market and Price Trends
      </h1>
      <OptimizedImage
        src="/desiegg.webp"
        alt="Hyderabad Egg Rates"
        className="w-full mb-8 rounded-lg shadow-md"
        width={400}
        height={300}
      />

      <section className="mb-8">
        <p className="text-lg text-gray-600">
          If you're in Hyderabad, Telangana, and looking to stay updated on the
          latest egg prices, this guide will help you stay informed. Knowing the
          <b>egg price</b> in <b>Hyderabad</b> is important. It can help you
          make better buying choices. This applies to consumers, retailers, and
          wholesalers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Today's Egg Rate
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          The egg rate in Hyderabad today is ₹{todayRate} per egg.
        </p>
        <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            Last 7 Days Price Trend
          </h3>
          <RateTable
            rates={eggRates}
            showChart={true}
            selectedCity="Hyderabad"
            selectedState="Telangana"
            showState={false}
            showDate={true}
            itemsPerPage={7}
            isLoading={isLoading}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          The Egg Market of Hyderabad
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Whether you are an individual consumer shopping for your household, a
          retailer stocking shelves for local customers, or a wholesaler
          managing large volumes and supply chains, understanding the nuances of
          the Hyderabad egg rate directly impacts your bottom line and
          operational strategy. Real-time knowledge of fluctuating prices allows
          for strategic planning, cost management, and ultimately, more
          effective transactions. This guide endeavors to provide you with
          regular updates and insights, ensuring you are always equipped with
          the latest market intelligence. By consistently referencing and
          utilizing this information, you can optimize your purchasing
          strategies and remain competitive within the egg market of Hyderabad.
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
          Hyderabad Egg Rate Today
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          As of today, the Hyderabad egg rate based on the latest available data
          is: Per piece: ₹{todayRate}, Per tray (30 eggs): ₹{todayRate * 30},
          Per 100 eggs: ₹{todayRate * 100} Per peti (180 eggs): ₹
          {todayRate * 180}
        </p>
        <p className="text-lg text-gray-600 mb-4">
          These prices are set by the NECC (National Egg Coordination
          Committee). They update egg prices based on market trends.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          What Makes Hyderabad's egg Special?
        </h2>

        <ul className="list-disc list-inside text-lg text-gray-600 mb-4">
          <li>
            <b>Freshness:</b> Eggs from Hyderabad are delivered to local markets
            and stores within hours of being laid. This ensures unmatched
            freshness, which is crucial for taste and nutritional value.
          </li>
          <li>
            <b>Nutritional Value:</b> Thanks to the balanced diets provided to
            the hens, Hyderabad's eggs are rich in high-quality protein,
            vitamins, and minerals. Some farms even produce omega-3 enriched
            eggs, catering to health-conscious consumers.
          </li>
          <li>
            <b>Affordability:</b> Despite their premium quality, Hyderabad's
            eggs remain affordable, making them a favorite among households and
            businesses alike.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Seasonal Trends and eggs Price Fluctuations in Hyderabad
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Egg prices and egg cost in Hyderabad typically increase during the
          winter months due to higher demand for protein-rich foods. Festivals
          and wedding seasons also play a role in causing temporary price
          surges. On the other hand, prices often decrease slightly during the
          summer when demand is comparatively lower. Being aware of these
          seasonal trends can help consumers make more informed purchasing
          decisions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Retail vs Wholesale Rates
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Different markets in Hyderabad may offer varying prices depending on
          where you shop. Here's a comparison:
        </p>
        <ul>
          Wholesale egg price in hyderabad today: Around ₹{todayRate} per egg
        </ul>
        <ul>Retail rate: Around ₹{todayRate + 0.35} per egg</ul>
        <ul>Supermarket rate: Can go up to ₹{todayRate + 0.46} per egg</ul>
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
          Papaak Egg Rate Hyderabad
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          For those looking for branded or premium egg options, Papaak egg rate
          Hyderabad is a popular choice. Papaak eggs are known for their high
          quality and are often priced slightly higher than the NECC rates.
          Branded eggs sometimes come at a premium, especially if they are
          organic or fortified.
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
          What Affects Egg cost in hyderabad?
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Several key factors influence the hyderabad anda rate:
        </p>
        <ul>
          Feed cost: A rise in chicken feed prices directly increases production
          costs of eggs.
        </ul>
        <ul>
          Seasonal demand: Prices tend to go up during festivals and winters.
        </ul>
        <ul>Supply issues: Fewer eggs in the market mean higher prices.</ul>
        <ul>
          Transport expenses: Rising fuel costs affect egg delivery and final
          market price and egg's cost.
        </ul>
      </section>
    </div>
  );
};

export default EggRates;
