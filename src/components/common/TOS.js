import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

// Table of Contents component
const TableOfContents = React.memo(({ sections }) => (
  <nav className="hidden lg:block sticky top-24 overflow-y-auto max-h-[calc(100vh-8rem)] p-4 bg-white rounded-lg shadow-sm">
    <h2 className="text-lg font-semibold mb-4 text-gray-900">Table of Contents</h2>
    <ul className="space-y-2">
      {sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className="text-gray-600 hover:text-blue-600 transition-colors text-sm block py-1"
          >
            {section.title}
          </a>
        </li>
      ))}
    </ul>
  </nav>
));

// Breadcrumb component
const Breadcrumb = React.memo(() => (
  <nav className="text-sm mb-6" aria-label="Breadcrumb">
    <ol className="list-none p-0 inline-flex">
      <li className="flex items-center">
        <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
        <svg className="fill-current w-3 h-3 mx-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
          <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/>
        </svg>
      </li>
      <li className="text-gray-500">Terms of Service</li>
    </ol>
  </nav>
));

const TOS = () => {
  const { city, state } = useParams();
  const [selectedState, setSelectedState] = useState(state || '');
  const [selectedCity, setSelectedCity] = useState(city || '');
  
  const sections = useMemo(() => [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'changes', title: '2. Changes to Terms' },
    { id: 'use', title: '3. Use of Our Services' },
    { id: 'intellectual-property', title: '4. Intellectual Property' },
    { id: 'account-termination', title: '5. Account Termination' },
    { id: 'liability', title: '6. Limitation of Liability' },
    { id: 'governing-law', title: '7. Governing Law' },
    { id: 'contact', title: '8. Contact Us' },
  ], []);

  const lastUpdated = '2025-05-29';
  const pageTitle = 'Terms of Service - Today Egg Rates';
  const pageDescription = 'Terms of Service for Today Egg Rates - Your trusted source for daily egg prices across India. Read our terms and conditions of use.';

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index,follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": pageTitle,
            "description": pageDescription,
            "publisher": {
              "@type": "Organization",
              "name": "Today Egg Rates"
            },
            "dateModified": lastUpdated
          })}
        </script>
      </Helmet>

      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Breadcrumb />
          
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            <div className="lg:col-span-1">
              <TableOfContents sections={sections} />
            </div>

            <div className="lg:col-span-3">
              <h1 className="text-4xl font-bold mb-8 text-gray-900">Terms of Service</h1>
              <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>
              
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