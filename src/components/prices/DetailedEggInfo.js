import { memo, useMemo } from 'react';
import OptimizedImage from '../common/OptimizedImage';

const DetailedEggInfo = memo(({ selectedCity, selectedState }) => {
  const location = useMemo(() => 
    selectedCity 
      ? `${selectedCity}, ${selectedState}`
      : selectedState || 'India'
  , [selectedCity, selectedState]);
  return (
    <section 
      className="p-4 sm:p-6 mt-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg" 
      aria-label="Today's Egg Rates and NECC Price Information"
    >
      <div className="max-w-7xl mx-auto space-y-8">        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 transform transition-transform hover:scale-[1.02]">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Egg Daily and Monthly Prices - {location}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            Our platform Today Egg rates provides the daily and monthly prices of egg throughout the different cities, states and areas of India. This Egg rate indicator is beneficial for both consumers and sellers in the Indian egg market. The daily or today's egg rate refers to the current price rates of the eggs. Users can scroll up to the previous day's price rates as well, limited to the current month. The egg rates depend on several factors such as production cost, transportation, egg quality, etc.
          </p>
        </div>        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Wholesale Egg Prices Today
          </h2>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              The wholesale egg prices represent the rates that retailers and distributors pay when purchasing eggs in bulk quantities. In India, these prices have been experiencing a notable upward trend in recent years, influenced by a variety of factors.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              One of the primary contributors to this increase is the rise in chicken feeding costs. Corn and soybeans, which are the main ingredients in chicken feed, have seen substantial price hikes. This surge in feed prices has a direct impact on the overall costs incurred by egg producers or poultry farms, as feed constitutes a significant portion of their operational expenses.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              Additionally, other factors such as fluctuations in demand and supply, changes in production levels, and economic conditions can also play a role in influencing wholesale egg prices. For instance, periods of high demand—such as during festivals or holidays—can lead to further increases in prices, while production challenges, such as disease outbreaks among poultry, can also restrict supply and drive prices higher.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              The egg market is a dynamic landscape that is ever-evolving, making it essential for consumers to remain well-informed about current egg prices and wholesale egg rates. This knowledge empowers them to make thoughtful and informed purchasing choices. For farmers and egg producers, staying attuned to daily and monthly fluctuations in egg prices is equally vital. By closely monitoring these trends, they can optimize their production strategies and pricing decisions, ensuring sustainability and profitability in their operations.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              At TodayEggRates.com, we offer a comprehensive overview of daily and monthly NECC egg rates throughout the different areas/cities and states of India, allowing you to effortlessly compare rates and make informed decisions. Whether you're a farmer eager to sell your eggs or a consumer searching for the best prices, our platform serves as your trusted resource for the latest egg rate information. Discover today's price for a tray of eggs or explore the current cost of a peti of eggs. Stay updated with live NECC rates through our detailed pricing data, ensuring you always have access to the most accurate market insights.
            </p>
          </div>
        </div>        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 h-full">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              NECC-National Egg Coordination Committee
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                Eggs are a fantastic addition to any meal, whether it's breakfast, lunch, or dinner! You can enjoy them scrambled or boiled, and they work wonderfully in dishes like Anda Bhurji or even Anda Ka Halwa. Just like us Indians, eggs can fit into a variety of recipes while keeping their special charm. If you're curious about egg prices in India, they change daily, as shared by the NECC (National Egg Coordination Committee). We make it easy for you to stay updated with the latest egg rates so you can continue enjoying your favorite egg dishes!
              </p>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden shadow-xl transform transition-transform hover:scale-[1.02]">
            <OptimizedImage 
              src="/eggrate2.webp" 
              alt="NECC egg price analysis chart showing latest market trends and pricing patterns"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Today's NECC Egg Rate Analysis
            </h2>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                The National Egg Coordination Committee (NECC) considers purchasing trends and the efforts of egg farmers when recommending current egg prices. This organization provides price suggestions for over 50 cities and states across the country. By disseminating today's egg prices, we ensure that users remain informed about NECC's recommendations, thereby enabling them to make more informed purchasing decisions.
              </p>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden shadow-xl transform transition-transform hover:scale-[1.02]">
            <OptimizedImage 
              src="/desiegg.webp" 
              alt="Visualization of India's egg production statistics and global market position"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Egg Consumption in India
            </h2>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                India is a major player in the global egg production industry, generating approximately 129.6 billion eggs each year. This production figure is experiencing a steady growth rate of 7% annually, reflecting the increasing demand for eggs among the population. According to data published by Agrospectrum, the average egg consumption per person in India is estimated to be 95 eggs per year. This indicates not only a high level of consumption but also a cultural acceptance of eggs as a staple food source. Furthermore, India holds the position of third largest egg producer globally, trailing only behind China and the United States. This prominent ranking underscores the significant role eggs play in the Indian diet, as well as the growing awareness among consumers regarding the nutritional benefits of eggs, including their high protein content and essential vitamins.
              </p>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden shadow-xl transform transition-transform hover:scale-[1.02]">
            <OptimizedImage 
              src="/eggrate3.webp" 
              alt="Visualization of India's egg production statistics and global market position"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Factors Affecting Egg Prices in India
            </h2>
            <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                Egg prices in India are influenced by a multitude of factors that can fluctuate over time. One of the primary determinants is the balance between demand and supply; when demand for eggs rises, prices tend to increase, whereas a surplus can lead to lower prices. The cost of production plays a crucial role as well, particularly the price of essential inputs such as bird feed, which can vary based on agricultural conditions and market trends.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mt-4">
                Disease outbreaks, especially recurring incidents of bird flu, can have a profound effect on the egg market. Such outbreaks often lead to a decrease in egg production and concerns about food safety, causing prices to spike. Furthermore, the impact of seasonal changes should not be overlooked; egg production typically sees a slight increase during the warmer months of summer due to improved laying conditions, while it often diminishes in the colder winter months when laying can be less consistent. These dynamics create a complex landscape that shapes the pricing of eggs across the country.
              </p>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden shadow-xl transform transition-transform hover:scale-[1.02]">
            <OptimizedImage 
              src="/eggchicken.webp" 
              alt="Factors affecting egg prices in India including feed costs and production"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative rounded-lg overflow-hidden shadow-xl transform transition-transform hover:scale-[1.02]">
            <OptimizedImage 
              src="/eggrate3.webp" 
              alt="How NECC sets egg prices and market coordination"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              How NECC Sets Egg Prices
            </h2>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                NECC (National Egg Coordination Committee) does not set egg prices directly. Instead, it provides a platform for stakeholders to work together and share information. Prices are determined daily by NECC after careful consideration and are updated every day at midnight. Key players in setting these prices include market forces, traders, distributors, and sometimes retailers.
              </p>
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong className="font-semibold">Market Forces:</strong> Egg prices are influenced by several factors, including demand and supply, inflation, and weather. Seasonal events, like festivals, can also affect egg prices.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong className="font-semibold">Traders and Distributors:</strong> Traders and distributors play a major role in deciding egg prices in India. They have control over pricing and can negotiate prices, which they then suggest to NECC. They act as middlemen between consumers and egg farmers.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong className="font-semibold">Consumers and Consumer Behavior:</strong> Consumers do not directly affect prices, but their preferences can have a significant impact. Demand can change due to dietary choices, cultural habits, seasonal factors, and economic conditions. Tracking daily egg prices can be unpredictable, requiring careful attention to get the best results.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            <strong className="font-semibold">Note:</strong> While we provide today's egg rate, NECC egg rate today, and live egg price updates, this website is not affiliated with NECC. We aggregate today egg rate data, NECC rates, and daily egg rate information from various sources to provide convenient access to current egg pricing. All NECC egg rates, today's egg rate data, and egg rate today information are for reference only - actual market rates may vary by location and dealer.
          </p>
        </div>

        {/* City-specific NECC Rates Section */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Major Cities NECC Egg Rate Today & Live Updates
          </h2>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              Track NECC egg rate today across major Indian cities including Barwala egg rate today, Mumbai, Chennai, Bangalore, and Delhi. Our comprehensive today egg rate tracking covers live NECC rates, daily egg rate updates, and current egg prices from key markets. Compare Barwala egg rate with other cities and get accurate today's egg rate information.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>Barwala egg rate today and daily updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>Mumbai NECC egg rate today tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>Chennai today egg rate and market analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>Bangalore daily egg rate monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>Delhi NECC rates and today egg rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 dark:text-orange-400">•</span>
                <span>Kolkata egg rate today and live prices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

DetailedEggInfo.displayName = 'DetailedEggInfo';

export default DetailedEggInfo;
