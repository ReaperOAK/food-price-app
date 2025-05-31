import React, { useState, useCallback, useMemo, memo } from 'react';
import { useInView } from 'react-intersection-observer';

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
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "itemListElement": faqItems.map(faq => ({
      "@type": "Question",
      "position": faqItems.indexOf(faq) + 1,
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

const FAQItem = memo(({ faq, index, isOpen, onToggle }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div 
      ref={ref} 
      className={`py-4 transform transition-transform duration-300 ${inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      <button
        className={`
          flex justify-between items-center w-full text-left p-4 rounded-lg
          font-semibold text-gray-900 dark:text-gray-100
          hover:bg-blue-50 dark:hover:bg-blue-900
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all duration-300 ease-in-out
          ${isOpen ? 'bg-blue-50 dark:bg-blue-900' : ''}
        `}
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="flex-grow pr-8">{faq.question}</span>
        <span 
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <svg
            className={`w-6 h-6 ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div 
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className={`
          overflow-hidden transition-all duration-500 ease-in-out
          ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-4 text-gray-700 dark:text-gray-300 prose prose-blue max-w-none">
          {faq.answer}
        </div>
      </div>
    </div>
  );
});

FAQItem.displayName = 'FAQItem';

const FAQ = memo(({ selectedCity, selectedState, eggRates }) => {
  const [openFAQ, setOpenFAQ] = useState(null);
  
  const { currentRate, trayPrice, formattedDate } = useMemo(() => {
    const rate = eggRates?.length > 0 ? eggRates[0].rate : 'N/A';
    return {
      currentRate: rate,
      trayPrice: rate !== 'N/A' ? (rate * 30).toFixed(2) : 'N/A',
      formattedDate: new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };
  }, [eggRates]);

  const faqList = useMemo(() => 
    generateFaqList(selectedCity, selectedState, currentRate, trayPrice, formattedDate),
    [selectedCity, selectedState, currentRate, trayPrice, formattedDate]
  );

  const toggleFAQ = useCallback((index) => {
    setOpenFAQ(prev => prev === index ? null : index);
  }, []);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <section 
      ref={ref}
      className={`
        p-6 mt-6 mx-auto bg-white dark:bg-gray-800 
        shadow-lg rounded-lg transition-all duration-500
        max-w-4xl w-full transform
        ${inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `} 
      id="faq-section"
      aria-label="Frequently Asked Questions"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        Frequently Asked Questions
      </h2>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {faqList.map((faq, index) => (
          <FAQItem
            key={index}
            faq={faq}
            index={index}
            isOpen={openFAQ === index}
            onToggle={toggleFAQ}
          />
        ))}
      </div>

      {/* Skip to next section link for better accessibility */}
      <a 
        href="#footer"
        className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:bg-blue-500 focus:text-white"
      >
        Skip FAQ section
      </a>
    </section>
  );
});

FAQ.displayName = 'FAQ';

export default FAQ;