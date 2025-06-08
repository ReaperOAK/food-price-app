import React from 'react';
import { useInView } from 'react-intersection-observer';
import OptimizedImage from '../../components/common/OptimizedImage';

const EggRates = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <article ref={ref} className={`transition-opacity duration-1000 ${inView ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <header className="relative mb-12">
        <OptimizedImage 
          src="/desiegg.webp" 
          alt="Fresh eggs in India traditional market - farm fresh brown egg varieties with nutrition facts" 
          className="w-full h-[60vh] object-cover rounded-xl shadow-lg"
          width={1200}
          height={600}
          priority={true}
          quality={90}
        />
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-800 dark:text-gray-100 mt-8">
          Understanding Egg Rates in India
        </h1>
      </header>

      {/* Introduction Section */}
      <section className="mb-12 max-w-prose mx-auto" aria-labelledby="introduction">
        <h2 id="introduction" className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
          Introduction
        </h2>        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Eggs are a staple food in many households across India. Understanding the factors that influence egg rates can help consumers make informed purchasing decisions and farmers optimize their production strategies. Fresh eggs in India include farm fresh varieties, brown egg options, desi eggs, and organic eggs with essential fatty acids, protein rich nutrition, and vitamin D for healthy breakfast meals.
        </p>
      </section>

      {/* Factors Section */}
      <section className="mb-16" aria-labelledby="factors">
        <h2 id="factors" className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-8">
          Factors Affecting Egg Prices
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Several factors influence the price of eggs in India, including:
            </p>
            
            <div className="grid gap-4">
              {[
                {
                  title: 'Production Costs',
                  description: 'Feed prices, labor costs, and infrastructure maintenance affect base prices',
                  icon: '💰'
                },
                {
                  title: 'Transportation Costs',
                  description: 'Distance from farms to markets impacts final pricing',
                  icon: '🚛'
                },
                {
                  title: 'Quality Standards',
                  description: 'Different grades and sizes command varying prices',
                  icon: '⭐'
                },
                {
                  title: 'Seasonal Demand',
                  description: 'Festivals and weather conditions influence consumption patterns',
                  icon: '📅'
                },
                {
                  title: 'Market Supply',
                  description: 'Available stock levels affect daily price fluctuations',
                  icon: '📦'
                }
              ].map((factor, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {factor.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        {factor.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {factor.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <OptimizedImage 
              src="/eggchicken.webp" 
              alt="Modern poultry farm producing fresh eggs in India with cage free and organic options" 
              className="rounded-xl shadow-lg"
              width={600}
              height={400}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
          </div>
        </div>
      </section>

      {/* Trends Section */}
      <section className="mb-16 bg-gray-50 dark:bg-gray-800/50 p-8 rounded-xl" aria-labelledby="trends">
        <h2 id="trends" className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-8">
          Current Trends in Egg Prices
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="prose prose-lg dark:prose-invert">
            <p className="text-gray-600 dark:text-gray-300">
              Recently, egg prices have been on the rise due to increased production costs and higher demand during festive seasons. The following visualization shows the trend in egg prices over the past year:
            </p>
          </div>
          
          <div className="relative">
            <OptimizedImage 
              src="/eggpic.webp" 
              alt="Eggs in India price trends graph - market analysis and today egg rate patterns" 
              className="rounded-xl shadow-lg"
              width={600}
              height={400}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Conclusion Section */}
      <section className="mb-12 bg-blue-50 dark:bg-blue-900/20 p-8 rounded-xl" aria-labelledby="conclusion">
        <h2 id="conclusion" className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
          Conclusion
        </h2>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Understanding the factors that influence egg prices can help consumers and farmers alike. By staying informed about current trends and market conditions, stakeholders can make better decisions and ensure a stable supply of eggs in the market.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            For more information on egg rates and market trends, visit our website regularly and stay updated with the latest data.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <a
          href="/egg-rates"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Check Today's Egg Rates
          <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </article>
  );
};

export default EggRates;