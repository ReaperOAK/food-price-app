import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import HeadSection from './HeadSection';
import TableOfContents from '../common/TableOfContents';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Breadcrumb from '../layout/Breadcrumb';

const TOS = () => {
  const { city, state } = useParams();
  const [selectedState, setSelectedState] = useState(state || '');
  const [selectedCity, setSelectedCity] = useState(city || '');


  const lastUpdated = '2025-05-29';
  const pageTitle = 'Terms of Service - Today Egg Rates';
  const pageDescription = 'Terms of Service for Today Egg Rates - Your trusted source for daily egg prices across India. Read our terms and conditions of use.';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": pageDescription,
    "dateModified": new Date().toISOString(),
    "publisher": {
      "@type": "Organization",
      "name": "Today Egg Rates"
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <HeadSection
        getSeoTitle={() => pageTitle}
        getSeoDescription={() => pageDescription}
        getSeoKeywords={() => "terms of service, terms and conditions, user agreement, legal terms"}
        location={window.location}
        structuredData={structuredData}
        generateFaqSchema={() => ({})}
        selectedCity={selectedCity}
        selectedState={selectedState}
        eggRates={[]}
      />

      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />

      <main className="flex-grow container mx-auto px-4 py-6 max-w-4xl">
        <Breadcrumb />
        
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <TableOfContents contentId="tos-content" blogId="terms-of-service" isSticky={true} />
          </div>
          <div className="lg:col-span-3">
            <div id="tos-content">
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Terms of Service</h1>
                <p className="text-gray-600">Last updated: {lastUpdated}</p>
              </header>
              
              <section id="introduction" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Introduction</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to todayEggRates.com. By using our website, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern todayEggRates.com's relationship with you regarding this website.
                  </p>
                </div>
              </section>
              
              <section id="changes" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Changes to Terms</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    We may update these Terms of Service from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. It is your responsibility to review these terms periodically.
                  </p>
                </div>
              </section>

              <section id="use" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Use of Our Services</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    You agree to use our services in compliance with all applicable laws and regulations. You will not use our services for any unlawful or fraudulent purpose, or in any way that could harm us or third parties.
                  </p>
                </div>
              </section>

              <section id="intellectual-property" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Intellectual Property</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    The content, layout, design, data, databases, and graphics on this website are protected by copyright and intellectual property laws. You agree not to copy, distribute, or otherwise infringe on any of the intellectual property rights belonging to us.
                  </p>
                </div>
              </section>

              <section id="account-termination" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Account Termination</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    We may terminate or suspend your access to our services without notice if you breach these terms or engage in any activity that we deem harmful, fraudulent, or illegal.
                  </p>
                </div>
              </section>

              <section id="liability" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Limitation of Liability</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    In no event shall TodayEggRates.com be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.
                  </p>
                </div>
              </section>

              <section id="governing-law" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Governing Law</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    These Terms of Service are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
                  </p>
                </div>
              </section>

              <section id="contact" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Contact Us</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    If you have any questions regarding these terms, please contact us at{' '}
                    <a href="mailto:support@TodayEggRates.com" className="text-blue-600 hover:text-blue-800">
                      support@TodayEggRates.com
                    </a>.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default React.memo(TOS);