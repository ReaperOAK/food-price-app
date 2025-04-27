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
  const [isWebStoriesExpanded, setIsWebStoriesExpanded] = useState(false);
  
  useEffect(() => {
    // Fetch top 3 web stories to feature
    fetch('/php/get_web_stories.php?limit=3')
      .then(response => response.json())
      .then(data => {
        setFeaturedWebStories(data);
      })
      .catch(error => console.error('Error fetching web stories:', error));
  }, []);

  return (
    <div className="p-6 mt-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-center font-bold text-3xl text-gray-800">Today Egg Rate in {displayName} (Daily NECC Egg Price)</h1>
      <p className="text-center text-lg text-gray-600 mt-4">
        {selectedCity ? 
          `Get the latest egg rates in ${displayName}, ${selectedState}. Daily updated NECC egg prices in ${displayName} for April ${new Date().getDate()}, ${new Date().getFullYear()}.` :
          selectedState ? 
          `Find today's egg rates across different cities in ${displayName}. Updated NECC egg prices for all cities in ${displayName} state.` :
          `Find today's egg rates across different cities and states in India. Updated NECC egg prices from Barwala, Namakkal, Mumbai, Delhi, Hyderabad, and more.`
        }
      </p>

      {featuredWebStories.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Featured Egg Rate Stories</h2>
            <button 
              onClick={() => setIsWebStoriesExpanded(!isWebStoriesExpanded)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              {isWebStoriesExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          
          {isWebStoriesExpanded && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {featuredWebStories.map((story, index) => (
                  <Link 
                    key={index}
                    to={`/webstory/${story.slug}`}
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
              <div className="text-center mt-4">
                <Link to="/webstories" className="text-blue-600 hover:text-blue-800 font-semibold">
                  View All Web Stories
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      <div className="bg-gray-200 rounded-lg w-full p-6 mt-6">
        <h2 className="text-center text-2xl font-semibold text-gray-800">Egg Rate Today ({today})</h2>
        <p className="text-left text-gray-700 mt-4">
          Here is the live NECC egg rate today list across some of the popular {selectedCity ? 'areas of' : 'cities in'} {displayName}.
          {selectedCity && ` These prices are collected directly from reliable sources in ${displayName} and updated daily.`}
          {selectedState && !selectedCity && ` These prices reflect the current market trends in ${displayName} state and are updated regularly.`}
        </p>
      </div>
    </div>
  );
};

export default BodyOne;