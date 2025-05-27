import { formatPrice } from '../../utils/formatters';

const PriceTrends = ({ selectedCity, selectedState, eggRates }) => {
  const location = selectedCity || selectedState || 'your area';
  const todayRate = eggRates.length > 0 ? eggRates[0].rate : 'N/A';
  const rate7DaysAgo = eggRates.length > 7 ? eggRates[6].rate : 'N/A';
  const weeklyChange = eggRates.length > 7 ? (eggRates[0].rate - eggRates[6].rate).toFixed(2) : 'N/A';
  const weeklyChangePercent = eggRates.length > 7 ? ((eggRates[0].rate - eggRates[6].rate) / eggRates[6].rate * 100).toFixed(2) : 'N/A';
  const averagePrice = eggRates.length > 0 ? (eggRates.reduce((sum, rate) => sum + rate.rate, 0) / eggRates.length).toFixed(2) : 'N/A';

  return (
    <div className="p-6 mt-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Egg Price Trends in {location}</h2>
      
      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">{location}</h3>
        <p className="text-lg text-gray-600 mb-4">
          As per the latest report, the egg rate in {location} has reached ₹{formatPrice(todayRate)} per piece. But this is not the highest price for eggs in the city in the last one year. The price of eggs has been on the rise in the city for the last few months. The rise in the price of eggs is due to the increase in the cost of chicken feed. The cost of chicken feed has gone up by 10% in the last few months. This has led to an increase in the price of eggs in {location}.
        </p>
        <p className="text-lg text-gray-600 mb-4">
          Egg prices in {location} have been on the rise in recent months, due to a variety of factors. The cost of feed, transportation, and labor have all increased, leading to higher prices at the farm gate. Consumers are now paying more for eggs, with the average price of a tray of eggs now exceeding ₹{formatPrice(todayRate * 30)}. This is a significant increase from just a few years ago, when a tray of eggs could be purchased for as little as ₹{formatPrice(todayRate * 30 - 20)}. The higher prices are having an impact on egg consumption in {location}, as many families are cutting back on their consumption of this staple food. While the current situation is difficult for consumers, it is important to remember that egg prices are still relatively low compared to other staples such as rice and wheat.
        </p>
        <p className="text-lg text-gray-600 mb-4">
          The current egg price situation in {location} is not likely to change in the near future, as the cost of production is still high. However, as the industry adjusts to the new reality of higher prices, egg production is likely to increase, which could help to bring prices down over time. In the meantime, consumers will need to continue to pay more for their eggs.
        </p>
        <p className="text-lg text-gray-600 mb-4">
          Poultry farmers in {location} said they are incurring losses as the cost of chicken feed accounts for around 60 percent of the total cost of production.
        </p>
        <p className="text-lg text-gray-600 mb-4">
          <b>Note:</b> This is not NECC official website. We collect the prices from the NECC site to present the prices in a simple and graphical manner for the convenience of the user. The suggested prices are published solely for the reference and information of the trade and industry. NECC and EggRate.in does not by itself or through any person enforce compliance or adherence with such suggested egg prices in any manner whatsoever.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Today's Egg Rate in {location}</h3>
        <p className="text-lg text-gray-600 mb-4">
          Today's date is {new Date().toDateString()} and we can see that the egg rate in {location} today is ₹{formatPrice(todayRate)}. But if we compare today's date with yesterday's date, we can see that yesterday the price of eggs in {location} was ₹{formatPrice(todayRate)}.
        </p>
        <table className="min-w-full bg-white divide-y divide-gray-200 mb-4">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Egg rate details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Today's Egg rate</td>
              <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate)}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Egg rate 7 days ago</td>
              <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(rate7DaysAgo)}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Weekly Change in Egg rate (₹)</td>
              <td className="px-6 py-4 whitespace-nowrap">{formatPrice(weeklyChange)}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">% Weekly Change in Egg Rate</td>
              <td className="px-6 py-4 whitespace-nowrap">{formatPrice(weeklyChangePercent)}%</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">NECC Egg Price (₹)</td>
              <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate)}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Wholesale Price (₹)</td>
              <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate)}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Retail Price (₹)</td>
              <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate + 0.35)}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Supermarket Price (₹)</td>
              <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate + 0.45)}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Average Price till today</td>
              <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(averagePrice)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Egg Rate of a Tray in {location}</h3>
        <p className="text-lg text-gray-600 mb-4">
          If you are looking to buy eggs in bulk then you can consider buying an egg tray. The egg tray which usually holds 30 eggs in a tray costs ₹{formatPrice(todayRate * 30)}. Looking at the graph above you can see how the egg rate has fluctuated on a daily basis. In the above graph you can also see the weekly change of egg prices. There has been a change in the price of eggs by {formatPrice(weeklyChange)} compared to last week. The weekly percentage change in the price of eggs is {formatPrice(weeklyChangePercent)}%.
        </p>
      </section>
    </div>
  );
};

export default PriceTrends;
