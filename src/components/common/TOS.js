import React, { useState} from 'react';
import { useParams} from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const TOS = () => {
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
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Terms of Service</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">1. Introduction</h2>
        <p className="text-gray-600 leading-relaxed">
          Welcome to todayEggRates.com . By using our website, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern todayEggRates.com's relationship with you regarding this website.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">2. Changes to Terms</h2>
        <p className="text-gray-600 leading-relaxed">
          We may update these Terms of Service from time to time. The updated version will be indicated by an updated “Revised” date and the updated version will be effective as soon as it is accessible. It is your responsibility to review these terms periodically.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">3. Use of Our Services</h2>
        <p className="text-gray-600 leading-relaxed">
          You agree to use our services in compliance with all applicable laws and regulations. You will not use our services for any unlawful or fraudulent purpose, or in any way that could harm us or third parties. 
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">4. Intellectual Property</h2>
        <p className="text-gray-600 leading-relaxed">
          The content, layout, design, data, databases, and graphics on this website are protected by copyright and intellectual property laws. You agree not to copy, distribute, or otherwise infringe on any of the intellectual property rights belonging to us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">5. Account Termination</h2>
        <p className="text-gray-600 leading-relaxed">
          We may terminate or suspend your access to our services without notice if you breach these terms or engage in any activity that we deem harmful, fraudulent, or illegal. 
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">6. Limitation of Liability</h2>
        <p className="text-gray-600 leading-relaxed">
          In no event shall TodayEggRates.com be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">7. Governing Law</h2>
        <p className="text-gray-600 leading-relaxed">
          These Terms of Service are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">8. Contact Us</h2>
        <p className="text-gray-600 leading-relaxed">
          If you have any questions regarding these terms, please contact us at support@TodayEggRates.com.
        </p>
      </section>
    </div>
    <Footer />
  </div>
)
}

export default TOS