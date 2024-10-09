import React, { useState} from 'react';
import { useParams} from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const PrivacyPolicy = () => {
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
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Privacy Policy</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">1. Introduction</h2>
        <p className="text-gray-600 leading-relaxed">
          At todayEggRates.com , we are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website. By using our services, you agree to the terms outlined in this policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">2. Information We Collect</h2>
        <p className="text-gray-600 leading-relaxed">
          We collect personal information that you provide directly to us, such as your name, email address, and any other details you provide when you sign up or contact us. We may also collect information about how you use our website through cookies and other tracking technologies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">3. How We Use Your Information</h2>
        <p className="text-gray-600 leading-relaxed">
          We use the information we collect to provide and improve our services, communicate with you, respond to your inquiries, and ensure the security of our website. We may also use your information to send you promotional content, but you can opt out of these communications at any time.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">4. Cookies</h2>
        <p className="text-gray-600 leading-relaxed">
          Our website uses cookies to enhance your experience. Cookies are small files stored on your device that allow us to recognize you on future visits and analyze how you use our site. You can manage your cookie preferences through your browser settings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">5. Data Sharing</h2>
        <p className="text-gray-600 leading-relaxed">
          We do not sell or rent your personal information to third parties. We may share your information with trusted third-party service providers who help us operate our website and services, but they are required to keep your information confidential.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">6. Data Security</h2>
        <p className="text-gray-600 leading-relaxed">
          We take the security of your personal information seriously. We implement industry-standard security measures to protect your data from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet is 100% secure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">7. Your Rights</h2>
        <p className="text-gray-600 leading-relaxed">
          You have the right to access, update, or delete your personal information. If you would like to exercise any of these rights, please contact us at support@todayEggRates.com . We will respond to your request in accordance with applicable data protection laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">8. Changes to this Policy</h2>
        <p className="text-gray-600 leading-relaxed">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page, along with the date of the last update. We encourage you to review this page periodically to stay informed about how we are protecting your information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">9. Contact Us</h2>
        <p className="text-gray-600 leading-relaxed">
          If you have any questions or concerns about this Privacy Policy, please contact us at support@todayEggRates.com .
        </p>
      </section>
    </div>
    <Footer />
  </div>
)
}

export default PrivacyPolicy