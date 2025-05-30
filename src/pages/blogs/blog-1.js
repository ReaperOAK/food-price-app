import React from 'react';
import OptimizedImage from '../../components/common/OptimizedImage';
import { useInView } from 'react-intersection-observer';

const BlogContent1 = () => {
  // Use intersection observer for animation on scroll
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref} className={`transition-opacity duration-1000 ${inView ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header section */}
      <header className="mb-12">
        <OptimizedImage
          src="/desiegg.webp"
          alt="Fresh eggs in a market basket"
          className="w-full rounded-xl shadow-lg mb-8"
          width={1200}
          height={600}
          priority={true}
        />
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Understanding Today's Egg Rates Across Major Indian Cities
        </h1>
      </header>

      {/* Introduction */}
      <section className="mb-12" aria-labelledby="introduction">
        <h2 id="introduction" className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Introduction</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Eggs are a staple in many households across India, providing a rich source of protein and essential nutrients. Whether you're a consumer, retailer, or wholesaler, staying updated with the latest egg rates is crucial. In this blog, we'll explore the current egg rates in various cities, including Barwala, Hyderabad, Namakkal, Delhi, Mumbai, and more. We'll also delve into the factors influencing these rates and how they impact the market.
        </p>
      </section>

      {/* City-wise rates */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Barwala */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300" aria-labelledby="barwala-rate">
          <h2 id="barwala-rate" className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Barwala Egg Rate Today
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Barwala, a significant hub for egg production, sees fluctuating egg rates due to various factors such as demand, supply, and seasonal changes. As of today, the egg rate in Barwala stands at ₹6.50 per egg. This rate is influenced by the high demand in urban areas and the cost of transportation.
          </p>
        </section>

        {/* NECC */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300" aria-labelledby="necc-rate">
          <h2 id="necc-rate" className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            NECC Egg Rate Today
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            The National Egg Coordination Committee (NECC) plays a pivotal role in stabilizing egg prices across India. The NECC egg rate today is ₹6.40 per egg. This rate is determined based on the production costs, market demand, and supply chain logistics. The NECC ensures that farmers get a fair price for their produce while keeping the rates affordable for consumers.
          </p>
        </section>

        {/* Hyderabad */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300" aria-labelledby="hyderabad-rate">
          <h2 id="hyderabad-rate" className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Egg Rate Today in Hyderabad
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Hyderabad, known for its vibrant food culture, has a significant demand for eggs. The egg rate today in Hyderabad is ₹6.30 per egg. This rate is influenced by the city's high consumption rate and the cost of feed for poultry. The NECC closely monitors the rates to ensure stability in the market.
          </p>
        </section>

        {/* Namakkal */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300" aria-labelledby="namakkal-rate">
          <h2 id="namakkal-rate" className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Namakkal Egg Rate Today
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Namakkal, often referred to as the egg city of India, is a major producer of eggs. The egg rate today in Namakkal is ₹6.20 per egg. The rates here are influenced by the large-scale production and efficient supply chain management. Namakkal's egg rates often set the benchmark for other regions.
          </p>
        </section>

        {/* Delhi */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300" aria-labelledby="delhi-rate">
          <h2 id="delhi-rate" className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Delhi Egg Rate
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            In the capital city of Delhi, the egg rate today is ₹6.50 per egg. The rates in Delhi are influenced by the high demand from both households and the hospitality industry. The NECC ensures that the rates remain stable despite the city's high consumption levels.
          </p>
        </section>

        {/* Mumbai */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300" aria-labelledby="mumbai-rate">
          <h2 id="mumbai-rate" className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Mumbai Egg Rate
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Mumbai, the financial capital of India, sees a high demand for eggs due to its diverse population and culinary preferences. The egg rate today in Mumbai is ₹6.40 per egg. The rates are influenced by the cost of transportation and the city's high living costs.
          </p>
        </section>
      </div>

      {/* Factors section */}
      <section className="mb-12 bg-gray-50 dark:bg-gray-800/50 p-8 rounded-xl" aria-labelledby="factors">
        <h2 id="factors" className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
          Factors Influencing Egg Rates
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <ul className="space-y-4 text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 mt-1">
                <span className="material-icons-outlined text-blue-600 dark:text-blue-400 text-sm">trending_up</span>
              </span>
              <div>
                <strong className="text-gray-700 dark:text-gray-200">Demand and Supply:</strong>
                <p className="mt-1">High demand and limited supply can drive up the prices, while an oversupply can lead to lower rates.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3 mt-1">
                <span className="material-icons-outlined text-green-600 dark:text-green-400 text-sm">eco</span>
              </span>
              <div>
                <strong className="text-gray-700 dark:text-gray-200">Feed Costs:</strong>
                <p className="mt-1">The cost of poultry feed significantly impacts the production cost and, consequently, the egg rates.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3 mt-1">
                <span className="material-icons-outlined text-purple-600 dark:text-purple-400 text-sm">local_shipping</span>
              </span>
              <div>
                <strong className="text-gray-700 dark:text-gray-200">Transportation Costs:</strong>
                <p className="mt-1">The cost of transporting eggs from production centers to markets affects the final price.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mr-3 mt-1">
                <span className="material-icons-outlined text-orange-600 dark:text-orange-400 text-sm">wb_sunny</span>
              </span>
              <div>
                <strong className="text-gray-700 dark:text-gray-200">Seasonal Variations:</strong>
                <p className="mt-1">Egg production and consumption can vary with seasons, influencing the rates.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mr-3 mt-1">
                <span className="material-icons-outlined text-red-600 dark:text-red-400 text-sm">policy</span>
              </span>
              <div>
                <strong className="text-gray-700 dark:text-gray-200">Government Policies:</strong>
                <p className="mt-1">Policies related to agriculture and poultry farming can impact the egg rates.</p>
              </div>
            </li>
          </ul>
          <div className="relative">
            <OptimizedImage
              src="/eggchicken.webp"
              alt="Poultry farm illustrating egg production factors"
              className="rounded-lg shadow-lg"
              width={600}
              height={400}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="mb-12 bg-blue-50 dark:bg-blue-900/20 p-8 rounded-xl" aria-labelledby="conclusion">
        <h2 id="conclusion" className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
          Conclusion
        </h2>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Staying updated with the latest egg rates is essential for consumers, retailers, and wholesalers. The NECC plays a crucial role in stabilizing the prices and ensuring fair rates for both producers and consumers. By understanding the factors influencing egg rates, stakeholders can make informed decisions and contribute to a stable market.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            For the latest updates on egg rates, visit our website regularly. Stay informed and make the best choices for your needs.
          </p>
        </div>
      </section>
    </div>
  );
};

export default BlogContent1;