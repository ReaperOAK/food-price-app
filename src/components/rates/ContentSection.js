import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ContentSection = ({ selectedCity, selectedState, eggRates }) => {
  const [featuredWebStories, setFeaturedWebStories] = useState([]);
  const [showWebStories, setShowWebStories] = useState(false);
  
  const displayName = selectedCity ? selectedCity : selectedState ? selectedState : 'India';
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate price metrics
  const todayRate = eggRates.length > 0 ? eggRates[0].rate : 'N/A';
  const rate7DaysAgo = eggRates.length > 7 ? eggRates[6].rate : 'N/A';
  const weeklyChange = eggRates.length > 7 ? (eggRates[0].rate - eggRates[6].rate).toFixed(2) : 'N/A';
  const weeklyChangePercent = eggRates.length > 7 ? ((eggRates[0].rate - eggRates[6].rate) / eggRates[6].rate * 100).toFixed(2) : 'N/A';
  const averagePrice = eggRates.length > 0 ? (eggRates.reduce((sum, rate) => sum + rate.rate, 0) / eggRates.length).toFixed(2) : 'N/A';

  useEffect(() => {
    // Fetch web stories and randomly select 3
    fetch('/php/get_web_stories.php')
      .then(response => response.json())
      .then(data => {
        // Shuffle array and take first 3
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setFeaturedWebStories(shuffled.slice(0, 3));
      })
      .catch(error => console.error('Error fetching web stories:', error));
  }, []);

  const getUniqueH1 = () => {
    if (selectedCity) {
      return `Egg Rate in ${selectedCity}, ${selectedState} (${today})`;
    } else if (selectedState) {
      return `${selectedState} Egg Rate: Latest NECC Prices (${today})`;
    } else {
      return `Today's Egg Rate in India: NECC Price List (${today})`;
    }
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : price;
  };

  return (
    <div className="max-w-4xl mx-auto mb-8">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
          {getUniqueH1()}
        </h1>
        <p className="text-center text-lg font-semibold text-gray-700 mb-2">
          Current Rates for {displayName}
        </p>
        <p className="text-center text-gray-600 mb-4">
          {selectedCity 
            ? `Get the latest egg rates for ${selectedCity}. Updated daily with wholesale and retail prices.`
            : selectedState
              ? `Check current egg prices across ${selectedState}. Compare rates from different cities.`
              : 'Track egg prices across India with our daily updated NECC rates from major cities.'
          }
        </p>
      </div>

      {/* Web Stories Section */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setShowWebStories(!showWebStories)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {showWebStories ? 'Hide Web Stories' : 'Show Web Stories'}
        </button>
      </div>

      {showWebStories && featuredWebStories.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Latest Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredWebStories.map(story => (
              <Link
                key={story.id}
                to={`/webstories/${story.slug}`}
                className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-w-9 aspect-h-16 mb-2">
                  <img 
                    src={story.thumbnail} 
                    alt={`Egg Rate in ${story.city}, ${story.state}`} 
                    className="object-cover w-full h-48 rounded-lg"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold text-lg mb-1">{story.title}</h3>
                <p className="text-red-600 font-bold mb-1">₹{story.rate} per egg</p>
                <p className="text-gray-600 text-sm">{story.date}</p>
              </Link>
            ))}
          </div>          
        </div>
      )}

      {/* Price Trends Section */}
      <div className="p-6 mt-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Egg Price Trends in {displayName}</h2>
        
        <section className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">{displayName}</h3>
          <p className="text-lg text-gray-600 mb-4">
            As per the latest report, the egg rate in {displayName} has reached ₹{formatPrice(todayRate)} per piece. This price fluctuation is primarily influenced by factors such as chicken feed costs, which have seen a 10% increase in recent months, directly impacting egg prices in {displayName}.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            The current egg price situation reflects broader market trends, with consumers now paying ₹{formatPrice(todayRate * 30)} for a tray of eggs, a notable increase from previous rates of ₹{formatPrice(todayRate * 30 - 20)}.
          </p>
        </section>

        {/* Today's Rates Table */}
        <section className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Today's Egg Rate in {displayName}</h3>
          <table className="min-w-full bg-white divide-y divide-gray-200 mb-4">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Egg rate details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Today's Egg rate</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Egg rate 7 days ago</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(rate7DaysAgo)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Weekly Change in Egg rate (₹)</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatPrice(weeklyChange)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">% Weekly Change in Egg Rate</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatPrice(weeklyChangePercent)}%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">NECC Egg Price (₹)</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Wholesale Price (₹)</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Retail Price (₹)</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate + 0.35)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Supermarket Price (₹)</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate + 0.45)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Average Price till today</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(averagePrice)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Tray Rate Section */}
        <section className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Egg Rate of a Tray in {displayName}</h3>
          <p className="text-lg text-gray-600 mb-4">
            For bulk purchases, a standard egg tray containing 30 eggs costs ₹{formatPrice(todayRate * 30)}. The weekly price change is {formatPrice(weeklyChange)} compared to last week, representing a {formatPrice(weeklyChangePercent)}% change.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            <b>Note:</b> This is not NECC official website. We collect the prices from the NECC site to present the prices in a simple and graphical manner for the convenience of the user. The suggested prices are published solely for the reference and information of the trade and industry.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ContentSection;
