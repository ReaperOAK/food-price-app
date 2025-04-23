import React, { useState } from 'react';

const FAQ = ({ selectedCity, selectedState, eggRates }) => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const currentRate = eggRates && eggRates.length > 0 ? eggRates[0].rate : 'varies';
  
  // Create contextual FAQ list based on location
  let faqList = [];
  
  if (selectedCity && selectedState) {
    faqList = [
      {
        question: `What is the current egg rate in ${selectedCity}, ${selectedState}?`,
        answer: `As of today, the egg rate in ${selectedCity}, ${selectedState} is ₹${currentRate} per egg. This price is based on the latest NECC (National Egg Coordination Committee) rates.`
      },
      {
        question: `How often are the egg rates in ${selectedCity} updated?`,
        answer: `The egg rates in ${selectedCity} are updated daily based on market conditions and official NECC publications. Our website ensures you always have access to the most current egg prices.`
      },
      {
        question: `What is the price for a tray of eggs (30 eggs) in ${selectedCity}?`,
        answer: `Based on the current rate of ₹${currentRate} per egg, a full tray of 30 eggs in ${selectedCity} would cost approximately ₹${(currentRate * 30).toFixed(2)}.`
      },
      {
        question: `Why do egg prices fluctuate in ${selectedCity}?`,
        answer: `Egg prices in ${selectedCity} and other regions fluctuate due to various factors including feed costs, seasonal demand, production volumes, transportation costs, and overall market conditions. During festivals and winters, prices often increase due to higher demand.`
      },
      {
        question: `Where can I buy eggs at wholesale rates in ${selectedCity}?`,
        answer: `For wholesale egg purchases in ${selectedCity}, you can check local poultry farms, NECC distribution centers, or wholesale markets. Prices are generally lower when buying in bulk directly from these sources.`
      }
    ];
  } else if (selectedState) {
    faqList = [
      {
        question: `What are the current egg rates across ${selectedState}?`,
        answer: `Egg rates across different cities in ${selectedState} typically range based on local market conditions. You can view the detailed city-wise rates in our rate table above.`
      },
      {
        question: `Which city in ${selectedState} has the lowest egg prices?`,
        answer: `Egg prices can vary between cities in ${selectedState} based on supply chain efficiency and local demand. We recommend checking our comprehensive rate table for the most competitive prices in your area.`
      },
      {
        question: `How does ${selectedState} egg production compare to other states?`,
        answer: `${selectedState} contributes significantly to India's egg production. The state's production volumes affect local pricing, with areas near major production centers typically enjoying more competitive rates.`
      },
      {
        question: `Are egg prices in ${selectedState} affected by seasonal changes?`,
        answer: `Yes, egg prices in ${selectedState} often show seasonal variations. Prices typically increase during winter months and festival seasons due to higher demand and sometimes reduced production.`
      },
      {
        question: `Where can I find official egg rates for ${selectedState}?`,
        answer: `Official egg rates for ${selectedState} are published by the National Egg Coordination Committee (NECC). Our website provides these rates daily, aggregated from official sources.`
      }
    ];
  } else {
    faqList = [
      {
        question: "How are egg rates determined in India?",
        answer: "Egg rates in India are primarily determined by the National Egg Coordination Committee (NECC), which publishes daily prices based on supply, demand, production costs, and market conditions across different regions."
      },
      {
        question: "Why do egg prices vary between different cities in India?",
        answer: "Egg prices vary between cities due to factors like proximity to production centers, transportation costs, local demand, storage facilities, and state-specific market conditions. Cities closer to major egg-producing regions like Namakkal or Barwala often have lower prices."
      },
      {
        question: "When are egg prices typically the highest in India?",
        answer: "Egg prices in India typically peak during winter months (November to February) and during major festival seasons when demand increases. Prices are generally lower during summer months when consumption decreases."
      },
      {
        question: "What affects egg production costs in India?",
        answer: "Egg production costs in India are affected by poultry feed prices (primarily maize and soybean), healthcare costs for birds, farm maintenance, electricity, labor costs, and transportation. Feed alone constitutes about 70% of production costs."
      },
      {
        question: "Are brown eggs more expensive than white eggs?",
        answer: "In India, brown eggs are typically priced slightly higher than white eggs. This price difference is primarily due to consumer perception of brown eggs being more nutritious, though nutritionally they are very similar to white eggs."
      },
      {
        question: "How do egg prices today compare to previous years?",
        answer: "Egg prices in India have shown an overall increasing trend over the years, influenced by rising production costs, growing demand, and inflation. However, short-term fluctuations occur based on seasonal factors and market conditions."
      }
    ];
  }

  const toggleFAQ = (index) => {
    if (openFAQ === index) {
      setOpenFAQ(null);
    } else {
      setOpenFAQ(index);
    }
  };

  return (
    <div className="p-6 mt-6 mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Frequently Asked Questions</h2>
      {faqList.map((faq, index) => (
        <div key={index} className="mb-4 border-b pb-4">
          <div
            className="flex justify-between items-center cursor-pointer transition hover:bg-gray-100 p-4 rounded-lg"
            onClick={() => toggleFAQ(index)}
          >
            <span className="font-semibold text-gray-800">{faq.question}</span>
            <svg
              className={`w-5 h-5 transform transition-transform ${openFAQ === index ? "rotate-180 text-blue-500" : "text-gray-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          {openFAQ === index && (
            <div className="mt-2 text-gray-700 px-4 pb-2 animate-fade-in">
              <p>{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQ;