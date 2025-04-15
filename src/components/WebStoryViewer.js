import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const WebStoryViewer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    // We'll redirect to the actual web story HTML file
    window.location.href = `/webstories/${slug}.html`;
    
    // The following code won't execute because of the redirect,
    // but we'll keep it as a fallback
    setLoading(false);
  }, [slug]);

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
            <p>Error loading web story: {error}</p>
            <button 
              onClick={() => navigate('/webstories')}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Back to Web Stories
            </button>
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
      <div className="container mx-auto p-6 flex-grow flex items-center justify-center">
        <p>Redirecting to web story...</p>
      </div>
      <Footer />
    </div>
  );
};

export default WebStoryViewer;
