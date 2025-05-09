import React, { useState } from 'react';

// Function to generate FAQ schema (separate from component rendering)
export const generateFaqSchema = (selectedCity, selectedState, eggRates) => {
  // We only need currentRate and trayPrice for the FAQ schema
  const currentRate = eggRates?.length > 0 ? eggRates[0].rate : 'N/A';
  const trayPrice = currentRate !== 'N/A' ? (currentRate * 30).toFixed(2) : 'N/A';
  
  // Format date for display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Generate FAQ items based on data
  const faqItems = generateFaqList(selectedCity, selectedState, currentRate, trayPrice, formattedDate);
  
  // Return the structured data object
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

// Function to generate the FAQ list (used by both schema and component)
export const generateFaqList = (selectedCity, selectedState, currentRate, trayPrice, formattedDate) => {
  // Default FAQs that appear on all pages
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
  const locationSpecificFAQs = selectedCity ? [
    {
      question: `What is today's egg rate in ${selectedCity}?`,
      answer: `Today's egg rate in ${selectedCity}, ${selectedState || ''} is ₹${currentRate} per egg (as of ${formattedDate}).`
    },
    {
      question: `What is the price of 30 eggs (1 tray) in ${selectedCity} today?`,
      answer: `The price of 30 eggs (1 tray) in ${selectedCity} today is ₹${trayPrice} (as of ${formattedDate}).`
    },
    {
      question: `What is the NECC egg rate in ${selectedCity} today?`,
      answer: `The NECC egg rate in ${selectedCity} today is ₹${currentRate} per egg. NECC (National Egg Coordination Committee) updates egg prices daily based on market conditions.`
    },
    {
      question: `How do egg prices in ${selectedCity} compare to national average?`,
      answer: `Egg prices in ${selectedCity} may differ from the national average based on local factors like transportation costs, regional demand, and distribution network efficiency. You can compare ${selectedCity}'s egg rates with other cities on our main rates page.`
    }
  ] : selectedState ? [
    {
      question: `What is the average egg rate in ${selectedState}?`,
      answer: `The average egg rate in ${selectedState} varies across different cities. We calculate the state average based on NECC rates from major cities in ${selectedState}. This information is updated daily on our website.`
    },
    {
      question: `How do egg prices in ${selectedState} compare to other states?`,
      answer: `Egg prices in ${selectedState} may be higher or lower than other states depending on factors like local production capacity, transportation networks, and consumer demand. You can compare rates across different states on our website.`
    },
    {
      question: `Which city in ${selectedState} has the lowest egg prices?`,
      answer: `Egg prices can vary within ${selectedState}. Cities closer to major production centers typically have lower prices. Check our state page for ${selectedState} to see a comparison of egg rates across different cities in the state.`
    }
  ] : [];

  // Combine and return all FAQs
  return [...locationSpecificFAQs, ...defaultFAQs];
};

const FAQ = ({ selectedCity, selectedState, eggRates }) => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const currentRate = eggRates.length > 0 ? eggRates[0].rate : 'N/A';
  const trayPrice = currentRate !== 'N/A' ? (currentRate * 30).toFixed(2) : 'N/A';
  
  // Format date for display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  // Get the list of FAQs using the shared function
  const faqList = generateFaqList(selectedCity, selectedState, currentRate, trayPrice, formattedDate);

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
      
      {/* Note: FAQ Schema is now centralized and rendered only in MainPage.js */}
      
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