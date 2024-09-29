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
      <div className="p-6 mt-6">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        {faqList.map((faq, index) => (
          <div key={index} className="mb-4">
            <div
              className="font-semibold cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
            </div>
            {openFAQ === index && <p className="mt-2">{faq.answer}</p>}
          </div>
        ))}
      </div>
    );
  };
  
  export default FAQ;
  