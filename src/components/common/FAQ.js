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
    const schema = {
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
  
  return schema;
};

// Function to generate the FAQ list (used by both schema and component)
export const generateFaqList = (selectedCity, selectedState, currentRate, trayPrice, formattedDate) => {
  // Default FAQs that appear on all pages
  const defaultFAQs = [
    {
      question: `What is today's egg rate in India?`,
      answer: `Today's egg rates in India vary by location. The national average NECC egg rate today (${formattedDate}) is continuously monitored and updated. Our real-time egg price tracking system provides live wholesale and retail egg rates from the National Egg Coordination Committee (NECC) for all major cities. Visit our homepage for comprehensive egg price updates across India's wholesale markets.`
    },
    {
      question: `What is NECC egg rate today?`,
      answer: `The official NECC (National Egg Coordination Committee) egg rate today is meticulously tracked and updated on our platform. NECC announces daily wholesale and retail egg prices for different zones including Namakkal, Chennai, Delhi, Mumbai, Kolkata, and other major markets. These NECC rates serve as the authoritative benchmark for egg prices across India's poultry industry.`
    },
    {
      question: `How are egg rates determined in India?`,
      answer: `Egg rates in India are determined by the National Egg Coordination Committee (NECC) through a comprehensive analysis of multiple factors: current poultry feed costs, market demand-supply dynamics, seasonal variations, regional market conditions, and transportation costs. NECC egg prices are announced daily and serve as the standard reference for wholesale and retail egg rates across India's poultry markets.`
    },
    {
      question: `What is a peti of eggs and how much does it cost today?`,
      answer: `A "peti" (box) or tray of eggs contains 30 eggs, which is the standard wholesale unit in India's egg market. Today's peti rates vary by location and are directly influenced by NECC price guidelines. Based on current market rates (${formattedDate}), a peti of eggs typically costs between ₹150-₹200, with exact wholesale and retail prices varying by city and state. Check our location-specific pages for precise egg tray rates in your area.`
    },
    {
      question: `Why do egg prices fluctuate in the Indian market?`,
      answer: `Egg prices in India's wholesale and retail markets fluctuate due to several key factors: seasonal demand variations, poultry feed costs, production levels, transportation expenses, regional festival demands, weather conditions affecting poultry farms, and any disease outbreaks impacting poultry. The National Egg Coordination Committee (NECC) monitors these market dynamics when establishing daily egg rates for different regions.`
    },
    {
      question: `What is the difference between farm eggs and NECC market eggs?`,
      answer: `Farm eggs are sourced directly from local poultry producers without passing through the formal market system, while NECC market eggs are distributed through organized channels regulated by the National Egg Coordination Committee. NECC egg rates are standardized across wholesale markets, ensuring consistent pricing, while farm egg prices may vary based on local market conditions and direct-to-consumer sales.`
    },
    {
      question: `How much does a wholesale tray of 30 eggs cost today in the Indian market?`,
      answer: `The wholesale cost of a tray (30 eggs) varies across India's markets. Currently in major wholesale markets, prices range from ₹150 to ₹200 per tray based on NECC guidelines. Our website provides daily updated wholesale and retail egg rates specific to each city and state, helping you track market prices effectively.`
    },
    {
      question: `What market factors affect egg rates in India?`,
      answer: `Indian egg market rates are influenced by multiple factors: poultry feed costs, labor expenses, farm maintenance costs, seasonal wholesale demand patterns, transportation logistics, regional supply-demand dynamics, weather impacts on poultry farms, disease prevention measures, and government policies affecting the poultry industry. The NECC considers all these factors in determining daily egg rates.`
    }
  ];

  // Location-specific FAQs
  const locationSpecificFAQs = selectedCity ? [
    {
      question: `What is today's egg rate in ${selectedCity} wholesale market?`,
      answer: `Today's NECC egg rate in ${selectedCity}, ${selectedState || ''} is ₹${currentRate} per egg (updated ${formattedDate}). This price reflects current wholesale market conditions and is based on official NECC guidelines for ${selectedCity}'s poultry market.`
    },
    {
      question: `What is the wholesale price of 30 eggs (1 tray) in ${selectedCity} today?`,
      answer: `The current wholesale price of 30 eggs (1 tray) in ${selectedCity}'s market is ₹${trayPrice} (as of ${formattedDate}). This rate follows NECC's price guidelines and reflects local market conditions in ${selectedCity}'s wholesale egg market.`
    },
    {
      question: `What is the official NECC egg rate in ${selectedCity} today?`,
      answer: `The official NECC wholesale egg rate in ${selectedCity} today is ₹${currentRate} per egg. This price is set by the National Egg Coordination Committee (NECC) based on ${selectedCity}'s local market conditions and updated daily to reflect accurate market rates.`
    },
    {
      question: `How do ${selectedCity}'s egg market prices compare to national rates?`,
      answer: `${selectedCity}'s egg market prices may differ from the national average due to local factors such as transportation costs to wholesale markets, regional consumer demand, and distribution network efficiency. Compare ${selectedCity}'s current egg rates with other major markets on our comprehensive rates page.`
    }
  ] : selectedState ? [
    {
      question: `What is the average egg rate in ${selectedState}'s markets today?`,
      answer: `The average egg rate in ${selectedState}'s wholesale markets varies across different cities. We calculate the state average based on official NECC rates from major wholesale markets in ${selectedState}. This market information is updated daily on our platform to reflect current prices.`
    },
    {
      question: `How do ${selectedState}'s egg market prices compare to other states?`,
      answer: `${selectedState}'s egg market prices may be higher or lower than other states depending on factors like local poultry production capacity, wholesale market distribution networks, and regional consumer demand. Compare current rates across different state markets on our website.`
    },
    {
      question: `Which wholesale market in ${selectedState} has the lowest egg prices?`,
      answer: `Egg prices vary across wholesale markets in ${selectedState}. Markets closer to major poultry production centers typically offer lower wholesale rates. Visit our detailed ${selectedState} market page to compare current egg rates across different wholesale markets in the state.`
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