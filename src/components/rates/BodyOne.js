import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BodyOne = ({ selectedCity, selectedState }) => {
  const displayName = selectedCity ? selectedCity : selectedState ? selectedState : 'India';
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const [featuredWebStories, setFeaturedWebStories] = useState([]);
  const [showWebStories, setShowWebStories] = useState(false);
  
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

  return (
    <div className="max-w-4xl mx-auto mb-8">
      {/* Hero Section with Unique H1 and Display Name */}
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
    </div>
  );
};

export default BodyOne;