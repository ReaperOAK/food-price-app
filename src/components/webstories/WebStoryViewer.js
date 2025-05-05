import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Helmet } from 'react-helmet';

const WebStoryViewer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [storyData, setStoryData] = useState(null);

  useEffect(() => {
    // First try to fetch the story data to get city/state info
    fetch('/php/get_web_stories.php')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch web stories data');
        }
        return response.json();
      })
      .then(data => {
        const story = data.find(s => s.slug === slug);
        if (story) {
          setStoryData(story);
        }
        
        // Check if the webstory file exists
        fetch(`/webstories/${slug}.html`, { method: 'HEAD' })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Webstory file does not exist: ${slug}.html`);
            }
            setLoading(false);
          })
          .catch(err => {
            console.error('Error checking webstory file:', err);
            setError(err.message || 'Failed to load web story file');
            setLoading(false);
          });
      })
      .catch(err => {
        console.error('Error fetching web story data:', err);
        setError(err.message || 'Failed to load web story');
        setLoading(false);
      });
  }, [slug]);

  // If story data is available, set the metadata for SEO
  const renderHelmet = () => {
    if (storyData) {
      return (
        <Helmet>
          <title>{storyData.title} - Today Egg Rates</title>
          <meta name="description" content={`Egg Rate in ${storyData.city}, ${storyData.state}: ₹${storyData.rate} per egg. Updated on ${storyData.date}.`} />
          <meta property="og:title" content={storyData.title} />
          <meta property="og:description" content={`Egg Rate in ${storyData.city}, ${storyData.state}: ₹${storyData.rate} per egg. Updated on ${storyData.date}.`} />
          <meta property="og:image" content={storyData.thumbnail} />
          <meta property="og:type" content="article" />
        </Helmet>
      );
    }
    return null;
  };

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
      {renderHelmet()}
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />
      <div className="flex-grow relative w-full" style={{ height: 'calc(100vh - 140px)' }}>
        <iframe 
          src={`/webstories/${slug}.html`}
          title={storyData ? storyData.title : `Web Story - ${slug}`}
          className="w-full h-full absolute inset-0 border-none"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
        ></iframe>
      </div>
      <div className="p-4 bg-white shadow-md">
        <button 
          onClick={() => navigate('/webstories')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to All Web Stories
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default WebStoryViewer;
