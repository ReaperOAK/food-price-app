import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Helmet } from 'react-helmet';

const WebStoriesList = () => {
  const [webStories, setWebStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    fetch('/php/get_web_stories.php')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setWebStories(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching web stories:', error);
        setError(error.toString());
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          setSelectedCity={setSelectedCity}
          selectedCity={selectedCity}
        />
        <div className="container mx-auto p-6 flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          setSelectedCity={setSelectedCity}
          selectedCity={selectedCity}
        />
        <div className="container mx-auto p-6 flex-grow">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error loading web stories: {error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Helmet>
        <title>Egg Rate Web Stories - View Latest Egg Prices Across India</title>
        <meta name="description" content="Browse visual web stories featuring the latest egg rates in cities across India. Get quick and easy access to current egg prices in an engaging format." />
        <meta name="keywords" content="egg rate web stories, egg price updates, visual egg rates, India egg prices, NECC egg rates stories" />
        <link rel="canonical" href="https://todayeggrates.com/webstories" />
      </Helmet>
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />
      <div className="container mx-auto p-6 flex-grow">
        <h1 className="text-3xl font-bold text-center mb-8">Egg Rate Web Stories</h1>
        
        {webStories.length > 0 ? (
          <>
            <p className="text-gray-600 text-center mb-10">
              Browse our collection of web stories featuring the latest egg rates across different cities in India. 
              Click on any story to view detailed and up-to-date egg prices in a visually engaging format.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {webStories.map((story, index) => (
                <Link 
                  to={`/webstory/${story.slug}`} 
                  key={index}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  aria-label={`Web story about egg rates in ${story.city}, ${story.state}`}
                >
                  <div className="relative">
                    <img 
                      src={story.thumbnail} 
                      alt={`Egg Rate in ${story.city}, ${story.state}`} 
                      className="w-full h-48 object-cover"
                      loading={index < 8 ? 'eager' : 'lazy'} // Optimize content loading
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm font-medium">
                        {story.date}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-xl mb-2">{story.title}</h2>
                    <p className="text-gray-600">{story.date}</p>
                    <p className="text-red-600 font-bold mt-2">₹{story.rate} per egg</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">No web stories available at the moment.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WebStoriesList;
