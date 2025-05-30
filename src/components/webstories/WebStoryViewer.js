import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Helmet } from 'react-helmet';
import { fetchWebStories, checkWebStoryFileExists } from '../../services/api';

const WebStoryViewer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [storyData, setStoryData] = useState(null);

  const fetchStoryData = useCallback(async () => {
    try {
      setLoading(true);
      const stories = await fetchWebStories();
      const story = stories.find(s => s.slug === slug);
      
      if (story) {
        setStoryData(story);
        setSelectedCity(story.city);
        setSelectedState(story.state);
        
        // Check if the story file exists
        await checkWebStoryFileExists(slug);
      } else {
        throw new Error('Story not found');
      }
    } catch (err) {
      console.error('Error fetching web story:', err);
      setError(err.message || 'Failed to load web story');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchStoryData();
  }, [fetchStoryData]);

  const renderHelmet = () => {
    if (storyData) {
      const ogDescription = `Current egg rate in ${storyData.city}, ${storyData.state}: ₹${storyData.rate} (Updated: ${storyData.date})`;
      const canonicalUrl = `https://todayeggrates.com/webstory/${storyData.slug}`;
      
      return (
        <Helmet>
          <title>{`${storyData.title} - Today Egg Rates`}</title>
          <meta name="description" content={`View the latest egg rates in ${storyData.city}, ${storyData.state}. Current price: ₹${storyData.rate} per egg (Updated: ${storyData.date})`} />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:title" content={storyData.title} />
          <meta property="og:description" content={ogDescription} />
          <meta property="og:image" content={`https://todayeggrates.com${storyData.thumbnail}`} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:type" content="article" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={storyData.title} />
          <meta name="twitter:description" content={ogDescription} />
          <meta name="twitter:image" content={`https://todayeggrates.com${storyData.thumbnail}`} />
        </Helmet>
      );
    }
    return null;
  };

  const renderLoadingState = () => (
    <div className="bg-gray-50 min-h-screen flex flex-col" role="alert" aria-busy="true">
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />
      <div className="container mx-auto p-6 flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div 
            className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"
            role="progressbar"
            aria-label="Loading web story"
          ></div>
          <p className="mt-4 text-gray-600">Loading web story...</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  const renderError = () => (
    <div className="bg-gray-50 min-h-screen flex flex-col" role="alert">
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />
      <div className="container mx-auto p-6 flex-grow">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center text-red-600 mb-4">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold">Error Loading Web Story</h2>
            </div>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/webstories')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Back to Web Stories
              </button>
              <button 
                onClick={() => fetchStoryData()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  const renderContent = () => (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {renderHelmet()}
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        setSelectedCity={setSelectedCity}
        selectedCity={selectedCity}
      />
      <div className="flex-grow relative w-full" style={{ height: 'calc(100vh - 144px)' }}>
        <iframe 
          src={`/webstories/${slug}.html`}
          title={storyData ? storyData.title : `Web Story - ${slug}`}
          className="w-full h-full absolute inset-0 border-none"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
          loading="eager"
        ></iframe>
      </div>
      <div className="bg-white shadow-md border-t border-gray-100">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button 
            onClick={() => navigate('/webstories')}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Web Stories
          </button>
          {storyData && (
            <div className="text-center sm:text-right">
              <p className="text-2xl font-bold text-gray-900">₹{storyData.rate} <span className="text-base font-normal text-gray-600">per egg</span></p>
              <p className="text-sm text-gray-600">Last updated: {storyData.date}</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );

  if (loading) return renderLoadingState();
  if (error) return renderError();
  return renderContent();
};

export default WebStoryViewer;
