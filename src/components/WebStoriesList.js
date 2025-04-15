import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

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
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />
      <div className="container mx-auto p-6 flex-grow">
        <h1 className="text-3xl font-bold text-center mb-8">Egg Rate Web Stories</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {webStories.map((story, index) => (
            <Link 
              to={`/webstory/${story.slug}`} 
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div 
                className="h-48 bg-cover bg-center" 
                style={{ backgroundImage: `url(${story.thumbnail})` }}
              ></div>
              <div className="p-4">
                <h2 className="font-bold text-xl mb-2">{story.title}</h2>
                <p className="text-gray-600">{story.date}</p>
                <p className="text-red-600 font-bold mt-2">₹{story.rate} per egg</p>
              </div>
            </Link>
          ))}
        </div>
        
        {webStories.length === 0 && (
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
