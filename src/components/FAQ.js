import React, { useState } from "react";

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqList = [
    { question: "How often are egg rates updated?", answer: "Egg rates are updated daily based on market fluctuations." },
    { question: "Why do egg rates vary by state?", answer: "Egg rates can vary due to production levels, demand, and transportation costs." },
    { question: "Can I view historical rates?", answer: "Yes, our platform provides past egg rates for comparison." },
  ];

  return (
    <div className="p-6 mt-6 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
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
