import React, { useState } from "react";

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqList = [
    { question: "What is mean by NECC rate?", answer: "NECC rates refers to the National Egg Coordination Committee, NECC is the world's largest and leading association of poultry farmers with over 25000+ active members. It provides the egg price data in India." },
    { question: "What is the 1 egg market rate today?", answer: "The market rate of 1 egg is around ₹5.30." },
    { question: "What is the rate of 30 eggs?", answer: "₹158.94 is the current price of 30-eggs in India." },
    { question: "Egg price in Namakkal today( or Namakkal egg rate today)?", answer: "The Namakkal egg price is ₹5.04 for a single egg, ₹151.2 for 1 egg tray and ₹504 per 100 Eggs." },
    { question: "Barwala egg rate today?", answer: "The egg rate in Barwala is ₹5.19 for 1 egg and ₹519 per 100 Eggs." },
    { question: "What is the egg rate(anda rate) today in India?", answer: "₹530 per 100 Eggs(Approx)." },
    { question: "What is the 1 tray of egg price today in India?", answer: "₹159.36 per tray of eggs." },
    { question: "What is the egg rate in Gujarat market?", answer: "1 egg rate is ₹5.5, For dozen eggs price will be ₹66. And, for 100 eggs the rate is around ₹550." },
    { question: "Egg rate in Govandi west Mumbai?", answer: "₹5.5 per egg piece in Govandi west Mumbai. Click here to see the top egg wholesalers in Govandi West, Mumbai." },
    { question: "How often rates are updates?", answer: "Daily egg rate updates are given. All the rates may not be accurate and exact same." },
    { question: "What is the egg price in Delhi?", answer: "The market rate of 100 eggs in Delhi is around ₹530. Single Delhi egg rate is around ₹5.3." },
    { question: "Egg price in Hyderabad (or egg rate today in Hyderabad)?", answer: "Hyderabad egg rate today is ₹4.8 per egg, ₹480 per 100 eggs." },
    { question: "Egg rate today Mumbai?", answer: "₹5.5 for a single egg in Mumbai, Maharashtra." },
    { question: "Today egg rate in Bangalore?", answer: "₹5.5 per 1 egg and egg tray price is ₹165 in Bengaluru, Karnataka." },
    { question: "What is broiler rate today in India?", answer: "White broiler chicken cost around ₹195/kg." },
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