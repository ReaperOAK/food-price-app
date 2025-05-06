import React, { useState } from 'react';

const FAQ = ({ location = {} }) => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const cityName = location.cityName || '';
  const stateName = location.stateName || '';
  
  // Default FAQs
  const defaultFAQs = [
    {
      question: `What is today's egg rate in India?`,
      answer: `Today's egg rates in India vary by location. The national average egg rate today is updated daily from NECC (National Egg Coordination Committee) sources. Visit our homepage for the latest egg rates across all major cities.`
    },
    {
      question: `What is NECC egg rate today?`,
      answer: `The official NECC (National Egg Coordination Committee) egg rate today is updated on our website daily. NECC announces egg prices for different zones including Namakkal, Chennai, Delhi, Mumbai, Kolkata and other major markets.`
    },
    {
      question: `How are egg rates determined in India?`,
      answer: `Egg rates in India are determined by the National Egg Coordination Committee (NECC) based on factors like production costs, demand-supply dynamics, seasonal variations, and regional differences. These rates are announced daily and serve as a benchmark for wholesale egg prices across the country.`
    },
    {
      question: `What is a peti of eggs and how much does it cost today?`,
      answer: `A "peti" (box) of eggs typically contains 30 eggs (one tray). The price of 1 peti egg varies by location. Based on today's rates, a peti of eggs costs approximately ₹150-₹200 depending on your city. Check our city-specific pages for exact prices in your area.`
    },
    {
      question: `Why do egg prices fluctuate?`,
      answer: `Egg prices fluctuate due to factors like seasonal demand, feed costs, production levels, transportation costs, festivals, weather conditions, and disease outbreaks affecting poultry. The National Egg Coordination Committee (NECC) monitors these factors when setting daily egg rates.`
    },
    {
      question: `What is the difference between farm eggs and market eggs?`,
      answer: `Farm eggs come directly from producers without passing through the formal market system, while market eggs are distributed through the organized channels regulated by bodies like NECC. Market egg rates are standardized while farm egg prices may vary based on local factors.`
    },
    {
      question: `How much does a tray of 30 eggs cost today?`,
      answer: `The cost of a tray of 30 eggs (commonly referred to as 1 peti) varies by location. In major cities, the current price ranges from ₹150 to ₹200. Our website provides daily updated city-specific egg rates across India.`
    },
    {
      question: `What are the factors that affect egg rates?`,
      answer: `Egg rates are affected by multiple factors including: production costs (feed, labor, maintenance), seasonal demand fluctuations, transportation costs, regional supply-demand balance, weather conditions, disease outbreaks in poultry, and government policies regarding the poultry industry.`
    }
  ];
  
  // Location-specific FAQs
  const locationSpecificFAQs = cityName ? [
    {
      question: `What is today's egg rate in ${cityName}, ${stateName}?`,
      answer: `Today's egg rate in ${cityName}, ${stateName} is updated daily on our website. We source our information directly from the National Egg Coordination Committee (NECC) and local poultry associations to provide the most accurate prices.`
    },
    {
      question: `How do egg prices in ${cityName} compare to national average?`,
      answer: `Egg prices in ${cityName} may differ from the national average based on local factors like transportation costs, regional demand, and distribution network efficiency. You can compare ${cityName}'s egg rates with other cities on our main rates page.`
    },
    {
      question: `Where can I buy eggs in ${cityName} at wholesale prices?`,
      answer: `In ${cityName}, wholesale eggs are typically available at major poultry markets, NECC distribution centers, and large poultry farms. The wholesale price generally follows the official NECC rate with minimal variation.`
    },
    {
      question: `How often do egg rates change in ${cityName}?`,
      answer: `In ${cityName}, egg rates typically update daily based on NECC announcements. However, the retail prices might not change daily as retailers may adjust their prices less frequently, typically weekly or when there are significant changes in the wholesale rates.`
    }
  ] : stateName ? [
    {
      question: `What is the average egg rate in ${stateName}?`,
      answer: `The average egg rate in ${stateName} varies across different cities. We calculate the state average based on NECC rates from major cities in ${stateName}. This information is updated daily on our website.`
    },
    {
      question: `How do egg prices in ${stateName} compare to other states?`,
      answer: `Egg prices in ${stateName} may be higher or lower than other states depending on factors like local production capacity, transportation networks, and consumer demand. You can compare rates across different states on our website.`
    },
    {
      question: `Which city in ${stateName} has the lowest egg prices?`,
      answer: `Egg prices can vary within ${stateName}. Cities closer to major production centers typically have lower prices. Check our state page for ${stateName} to see a comparison of egg rates across different cities in the state.`
    }
  ] : [];

  // Combine default and location-specific FAQs
  const faqList = [...locationSpecificFAQs, ...defaultFAQs];

  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqList.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const toggleFAQ = (index) => {
    if (openFAQ === index) {
      setOpenFAQ(null);
    } else {
      setOpenFAQ(index);
    }
  };

  return (
    <div className="p-6 mt-6 mx-auto bg-white shadow-lg rounded-lg" id="faq-section">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Frequently Asked Questions</h2>
      
      {/* FAQ Schema for SEO */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      
      <div className="divide-y divide-gray-200">
        {faqList.map((faq, index) => (
          <div key={index} className="py-4">
            <button
              className="flex justify-between items-center w-full text-left font-semibold text-gray-800 hover:text-blue-600 transition p-2 rounded-lg"
              onClick={() => toggleFAQ(index)}
              aria-expanded={openFAQ === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="pr-8">{faq.question}</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${openFAQ === index ? "rotate-180 text-blue-500" : "text-gray-500"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div 
              id={`faq-answer-${index}`} 
              className={`mt-2 text-gray-700 px-2 overflow-hidden transition-all duration-300 ${openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <p className="pb-4">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;