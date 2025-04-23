import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const Disclaimer = () => {
  const { city, state } = useParams();
  const [selectedState, setSelectedState] = useState(state || '');
  const [selectedCity, setSelectedCity] = useState(city || '');

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />
      <div className="container mx-auto p-6" style={{height:"69vh"}}>
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Disclaimer</h1>

        <section className="mb-8">
          <p className="text-gray-600 leading-relaxed">
            The egg prices listed on TodayEggRates.com are provided for informational purposes only and are subject to change without notice. Please note that the prices may not always be accurate or up-to-date due to fluctuations in supply, demand, and regional pricing variations. Actual prices may vary, and we recommend verifying the rates with your local supplier or retailer for the most current and accurate pricing.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            The rates posted do not constitute an offer, and TodayEggRates.com is not responsible for any discrepancies or losses resulting from reliance on the rates shown on this website.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Disclaimer;