import React, { useState, memo } from 'react';
import { useParams } from 'react-router-dom';
import HeadSection from './HeadSection';
import TableOfContents from '../blog/TableOfContents';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Breadcrumb from '../layout/Breadcrumb';

const DisclaimerSection = memo(({ title, children, id }) => (
  <section 
    id={id}
    className="mb-8 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
  >
    <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
    {children}
  </section>
));

const Disclaimer = () => {
  const { city, state } = useParams();
  const [selectedState, setSelectedState] = useState(state || '');
  const [selectedCity, setSelectedCity] = useState(city || '');

  const pageTitle = "Disclaimer | Today Egg Rates";
  const pageDescription = "Important disclaimer about egg prices and rates information provided on TodayEggRates.com. Learn about our data accuracy, limitations, and terms of use.";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": pageDescription,
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
        getSeoKeywords={() => "egg rates, disclaimer, terms of service, egg price accuracy"}
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
        
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Disclaimer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Please read this disclaimer carefully before using our egg price information
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <TableOfContents contentId="disclaimer-content" blogId="disclaimer" isSticky={true} />
          </div>
          <div className="lg:col-span-3">
            <div id="disclaimer-content" className="space-y-6">
              <DisclaimerSection id="information-accuracy" title="Information Accuracy">
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The egg prices listed on TodayEggRates.com are provided for informational purposes only and are subject to change without notice. Please note that the prices may not always be accurate or up-to-date due to fluctuations in supply, demand, and regional pricing variations.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Actual prices may vary, and we recommend verifying the rates with your local supplier or retailer for the most current and accurate pricing.
                  </p>
                </div>
              </DisclaimerSection>

              <DisclaimerSection id="liability" title="Liability and Responsibility">
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The rates posted do not constitute an offer, and TodayEggRates.com is not responsible for any discrepancies or losses resulting from reliance on the rates shown on this website.
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Prices are subject to market fluctuations</li>
                    <li>Information is updated regularly but may not reflect real-time changes</li>
                    <li>Local prices may vary from displayed rates</li>
                    <li>Always confirm prices with your local vendor</li>
                  </ul>
                </div>
              </DisclaimerSection>

              <DisclaimerSection id="data-sources" title="Data Sources">
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    Our egg price data is collected from various sources including local markets, vendors, and official price lists. While we strive to maintain accuracy, the dynamic nature of market prices means that actual rates may differ.
                  </p>
                </div>
              </DisclaimerSection>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-blue-700">
                  Last Updated: {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

DisclaimerSection.displayName = 'DisclaimerSection';

export default memo(Disclaimer);