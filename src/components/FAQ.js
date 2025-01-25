import React, { useState } from "react";

const FAQ = ({ selectedCity, selectedState, eggRates }) => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const location = selectedCity || selectedState || 'your area';
  const rate = eggRates[0]?.rate || 'N/A';
  const rate30 = (eggRates[0]?.rate * 30).toFixed(2) || 'N/A';
  const rate100 = (eggRates[0]?.rate * 100).toFixed(2) || 'N/A';

  const faqList = [
    { question: `What is the egg rate today in ${location}?`, answer: `The egg rate in ${location} is ₹${rate} per egg.` },
    { question: `What is the rate of 30 eggs in ${location}?`, answer: `The rate of 30 eggs in ${location} is ₹${rate30}.` },
    { question: `What is the rate of 100 eggs in ${location}?`, answer: `The rate of 100 eggs in ${location} is ₹${rate100}.` },
    { question: `How often are the rates updated?`, answer: `The rates are updated daily. All the rates may not be accurate and exact same.` },
    { question: `What are the current egg prices?`, answer: `The current egg prices in ${location} vary depending on the region and the time of year. However, on average, a tray of eggs costs around ₹110-150.` },
    { question: `What is the average price of eggs in ${location}?`, answer: `The average price of eggs in ${location} is around ₹${rate} per egg.` },
    { question: `What is the most expensive egg in ${location}?`, answer: `The most expensive egg in ${location} can vary, but specialty eggs like organic or free-range eggs tend to be more expensive.` },
    { question: `What is the cheapest egg in ${location}?`, answer: `The cheapest egg in ${location} is usually the standard white egg, which costs around ₹${rate} per egg.` },
    { question: `What is the difference between brown and white eggs?`, answer: `The difference between brown and white eggs is primarily the color of the shell, which is determined by the breed of the hen. Nutritionally, they are the same.` },
    { question: `What is the difference between free-range and cage-free eggs?`, answer: `Free-range eggs come from hens that have access to the outdoors, while cage-free eggs come from hens that are not kept in cages but may not have outdoor access.` },
    { question: `What is the nutritional value of eggs?`, answer: `Eggs are a great source of protein, vitamins, and minerals. They contain all nine essential amino acids and are rich in vitamins A, D, E, and B12, as well as iron, selenium, and choline.` },
  ];

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
          {openFAQ === index && <p className="mt-2 text-gray-700 px-4">{faq.answer}</p>}
        </div>
      ))}
    </div>
  );
};

export default FAQ;