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
        Egg rates in {displayName} change daily by the NECC. On this page, you can find out the daily egg price mandi rate of 1 tray egg and 1 peti egg across {selectedCity ? 'the city' : 'the state'} of {displayName}.
      </p>

      {featuredWebStories.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-center mb-4">Web Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {featuredWebStories.map((story, index) => (
              <a 
                key={index}
                href={`/webstories/${story.slug}.html`}
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-w-9 aspect-h-16 mb-2">
                  <img 
                    src={story.thumbnail} 
                    alt={story.title} 
                    className="object-cover w-full h-48 rounded-lg"
                  />
                </div>
                <h3 className="font-bold">{story.title}</h3>
                <p className="text-sm text-gray-600">{story.date}</p>
              </a>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/webstories" className="text-blue-600 hover:text-blue-800 font-semibold">
              View All Web Stories
            </Link>
          </div>
        </div>
      )}

      <div className="bg-gray-200 rounded-lg w-full p-6 mt-6">
        <h2 className="text-center text-2xl font-semibold text-gray-800">Egg Rate Today ({today})</h2>
        <p className="text-left text-gray-700 mt-4">
          Here is the live NECC egg rate today list across some of the popular {selectedCity ? 'areas of' : 'cities in'} {displayName}.
        </p>
      </div>
    </div>
  );
};

export default BodyOne;