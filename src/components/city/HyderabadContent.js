import React from 'react';
import { memo } from 'react';

const HyderabadContent = memo(({ todayRate, trayPrice }) => {
  const formatPrice = (price) => {
    if (price === 'N/A' || !price) return 'N/A';
    return parseFloat(price).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Today Egg Rate in Hyderabad - Comprehensive Market Guide
      </h2>
      
      {/* Current Rates Section */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Current NECC Egg Rates in Hyderabad Today
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Per Piece Rate</h4>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">₹{formatPrice(todayRate)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Today's NECC rate per egg</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tray Price (30 eggs)</h4>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{formatPrice(trayPrice)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Wholesale tray pricing</p>
          </div>
        </div>
      </section>

      {/* Market Information */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Hyderabad Egg Market Overview
        </h3>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Hyderabad, the pharmaceutical capital of India and a major IT hub in Telangana, has a robust egg market that serves both local consumption and distribution to neighboring states. The city's strategic location as the capital of Telangana makes it a crucial distribution center for egg trade in South India.
          </p>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            The <strong>National Egg Coordination Committee (NECC)</strong> closely monitors and regulates egg rates in Hyderabad today. With the current rate at ₹{formatPrice(todayRate)} per egg, Hyderabad maintains competitive pricing compared to other major metropolitan cities. The egg rate today in Hyderabad reflects the balance between local demand from its 10+ million population and supply from poultry farms across Telangana.
          </p>
        </div>
      </section>

      {/* Major Markets */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Major Egg Markets in Hyderabad
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Begum Bazaar</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              The oldest and largest wholesale market in Hyderabad for eggs and poultry products. Located in the heart of the old city.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Secunderabad Market</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Major distribution center serving the twin city and northern Telangana with fresh egg supplies daily.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Gachibowli Market</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Modern market serving the IT corridor including HITEC City and Financial District with premium egg varieties.
            </p>
          </div>
        </div>
      </section>

      {/* Economic Impact */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Economic Factors Affecting Hyderabad Egg Rates
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <div>
                <strong>Tech Industry Demand:</strong> High consumption from IT companies and tech workers in Cyberabad drives consistent demand for protein-rich foods including eggs.
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <div>
                <strong>Pharma Sector Influence:</strong> As the pharmaceutical hub, Hyderabad's prosperity increases purchasing power, supporting premium egg varieties and consistent demand.
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <div>
                <strong>Transportation Hub:</strong> Excellent connectivity via Rajiv Gandhi International Airport and national highways facilitates efficient distribution, keeping costs competitive.
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <div>
                <strong>Regional Supply Chain:</strong> Strong network with Telangana and Andhra Pradesh poultry farms ensures steady supply and stable pricing throughout the year.
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Price Comparison */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Hyderabad vs Other Cities - Egg Rate Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">City</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">Today's Rate (₹/egg)</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">Market Position</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-semibold">Hyderabad</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">₹{formatPrice(todayRate)}</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Competitive pricing in South India</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Bangalore</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">₹5.80</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Similar metro pricing</td>
              </tr>
              <tr>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Chennai</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">₹6.10</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Coastal premium pricing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Consumer Tips */}
      <section>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Tips for Egg Buyers in Hyderabad
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Best Buying Times</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Early morning (6-8 AM) for freshest stock</li>
              <li>• Weekdays typically have better rates than weekends</li>
              <li>• Bulk purchases during festival seasons for savings</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Quality Indicators</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Check for NECC certification at retail outlets</li>
              <li>• Look for clean, uncracked shells</li>
              <li>• Verify expiry dates on packaged eggs</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
});

export default HyderabadContent;
