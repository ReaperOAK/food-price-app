import React, { useState, memo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import HeadSection from './HeadSection';
import TableOfContents from '../common/TableOfContents';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Breadcrumb from '../layout/Breadcrumb';

const PolicySection = memo(({ title, children, id }) => (
  <section 
    id={id}
    className="mb-8 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
  >
    <h2 className="text-2xl font-semibold mb-4 text-gray-800">
      {title}
    </h2>
    <div className="prose prose-gray max-w-none">
      {children}
    </div>
  </section>
));

const PrivacyPolicy = () => {
  const { city, state } = useParams();
  const location = useLocation();
  const [selectedState, setSelectedState] = useState(state || '');
  const [selectedCity, setSelectedCity] = useState(city || '');  const lastUpdated = "May 29, 2025";

  return (<div className="bg-gray-50 min-h-screen flex flex-col">
      <HeadSection
        location={location}
        selectedCity="Privacy Policy"
        selectedState=""
        eggRates={[]}
        isLoading={false}
      />

      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />      <main className="flex-grow container mx-auto px-4 py-6 max-w-4xl">
        <Breadcrumb isLoading={false} />
        
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <TableOfContents contentId="privacy-policy-content" blogId="privacy-policy" />
          </div>
          <div className="lg:col-span-3">
            <div id="privacy-policy-content">
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
                <p className="text-gray-600">
                  Last updated: {lastUpdated}</p>
              </header>              <PolicySection id="introduction" title="1. Introduction">
                <p className="text-gray-700 leading-relaxed">
                  At todayEggRates.com, we are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website. By using our services, you agree to the terms outlined in this policy.
                </p>
              </PolicySection>

              <PolicySection id="information-collection" title="2. Information We Collect">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect personal information that you provide directly to us, such as your name, email address, and any other details you provide when you sign up or contact us. We may also collect information about how you use our website through cookies and other tracking technologies.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Personal identifiers (name, email)</li>
                  <li>Usage data (browsing patterns, preferences)</li>
                  <li>Device information (browser type, operating system)</li>
                  <li>Location data (city, state preferences)</li>
                </ul>
              </PolicySection>

              <PolicySection id="information-usage" title="3. How We Use Your Information">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the information we collect to provide and improve our services, communicate with you, respond to your inquiries, and ensure the security of our website. We may also use your information to send you promotional content, but you can opt out of these communications at any time.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Key Uses:</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Service improvement and personalization</li>
                    <li>Communication and support</li>
                    <li>Security and fraud prevention</li>
                    <li>Analytics and performance monitoring</li>
                  </ul>
                </div>
              </PolicySection>

              <PolicySection id="cookies" title="4. Cookies">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our website uses cookies to enhance your experience. Cookies are small files stored on your device that allow us to recognize you on future visits and analyze how you use our site. You can manage your cookie preferences through your browser settings.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-sm text-blue-700">
                    You can manage or disable cookies through your browser settings at any time.
                  </p>
                </div>
              </PolicySection>

              <PolicySection id="data-sharing" title="5. Data Sharing">
                <p className="text-gray-700 leading-relaxed">
                  We do not sell or rent your personal information to third parties. We may share your information with trusted third-party service providers who help us operate our website and services, but they are required to keep your information confidential.
                </p>
              </PolicySection>

              <PolicySection id="data-security" title="6. Data Security">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We take the security of your personal information seriously. We implement industry-standard security measures to protect your data from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <p className="text-sm text-yellow-700">
                    While we implement security best practices, users should also take precautions to protect their personal information online.
                  </p>
                </div>
              </PolicySection>

              <PolicySection id="your-rights" title="7. Your Rights">
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to access, update, or delete your personal information. If you would like to exercise any of these rights, please contact us at privacy@todayeggrates.com. We will respond to your request in accordance with applicable data protection laws.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Your Rights Include:</h3>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li>Access your data</li>
                      <li>Update information</li>
                      <li>Request deletion</li>
                      <li>Data portability</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">How to Exercise:</h3>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li>Email us</li>
                      <li>Use account settings</li>
                      <li>Submit a request form</li>
                      <li>Contact support</li>
                    </ul>
                  </div>
                </div>
              </PolicySection>

              <PolicySection id="policy-changes" title="8. Changes to this Policy">
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. Any changes will be posted on this page, along with the date of the last update. We encourage you to review this page periodically to stay informed about how we are protecting your information.
                </p>
              </PolicySection>

              <PolicySection id="contact" title="9. Contact Us">
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions or concerns about this Privacy Policy, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Email:</strong> privacy@todayeggrates.com</li>
                    <li><strong>Website:</strong> www.todayeggrates.com</li>
                    <li><strong>Response Time:</strong> Within 48 hours</li>
                  </ul>
                </div>
              </PolicySection>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  This privacy policy was last updated on {lastUpdated}. Please check back regularly for any updates.
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

PolicySection.displayName = 'PolicySection';

export default memo(PrivacyPolicy);