import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import RateTable from '../components/rates/RateTable';
import StateList from '../components/rates/StateList';
import BlogList from '../components/blog/BlogList';
import Footer from '../components/layout/Footer';
import FAQ, { generateFaqSchema } from '../components/common/FAQ';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import QuickInfo from '../components/common/QuickInfo';
import HeadSection from '../components/common/HeadSection';
import PriceOverview from '../components/prices/PriceOverview';
import WebStoriesSection from '../components/webstories/WebStoriesSection';
import PriceTrendsWidget from '../components/prices/PriceTrendsWidget';
import DetailedEggInfo from '../components/prices/DetailedEggInfo';
import PriceTrends from '../components/prices/PriceTrends';
import { getUniqueH1, getSeoTitle, getSeoDescription, getSeoKeywords } from '../utils/seo';
import { useWebStories, useRates, useLocations, useBlogs } from '../hooks/useData';

const MainPage = () => {
  // URL and location parameters
  const { state: stateParam, city: cityParam } = useParams();
  const location = useLocation();

  // State management
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showWebStories, setShowWebStories] = useState(false);
  
  // Custom hooks for data fetching
  const { featuredWebStories, webStoriesLoading } = useWebStories(showWebStories);
  const { eggRates, specialRates, loading } = useRates(selectedCity, selectedState);
  const { states, cities, loadCities, loadStateForCity } = useLocations();
  const { blogs } = useBlogs();

  // Display and formatting helpers
  const displayName = selectedCity ? `${selectedCity}, ${selectedState}` : (selectedState || 'India');
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
  const trayPrice = todayRate !== 'N/A' ? (todayRate * 30).toFixed(2) : 'N/A';
  // Web stories fetching is now handled by the useWebStories hook

  // SEO helpers
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Eggs in ${displayName}`,
    "description": `Latest egg rates in ${displayName}. Check today's egg prices updated on ${today}. Single egg price: ₹${todayRate}, Tray (30 eggs) price: ₹${trayPrice}`,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": todayRate,
      "highPrice": trayPrice,
      "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock"
    }
  };
  // Blog fetching is now handled by the useBlogs hook

  // Update selectedState and selectedCity when URL parameters change
  useEffect(() => {
    if (stateParam) {
      const newState = stateParam.replace('-egg-rate', '');
      if (selectedState !== newState) {
        setSelectedState(newState);
        loadCities(newState);
        setSelectedCity('');
      }
    }
    if (cityParam) {
      const newCity = cityParam.replace('-egg-rate', '');
      if (selectedCity !== newCity) {
        setSelectedCity(newCity);
        loadStateForCity(newCity).then(state => {
          if (state) {
            setSelectedState(state);
            loadCities(state);
          }
        });
      }
    }
    if (!stateParam && !cityParam && (selectedState || selectedCity)) {
      setSelectedCity('');
      setSelectedState('');
    }
  }, [stateParam, cityParam, loadStateForCity, loadCities, selectedState, selectedCity]);
  
  // Early return with loading state that matches final layout
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 w-full max-w-7xl" style={{ minHeight: '600px' }}>
          <div className="animate-pulse space-y-4 py-8">
            {/* Header placeholder with fixed height */}
            <div className="h-12 bg-gray-200 rounded-lg w-3/4"></div>
            
            {/* Price info cards with fixed dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm" style={{ height: '160px' }}>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>

            {/* Table placeholder with fixed height */}
            <div className="mt-8 bg-white rounded-lg shadow-sm" style={{ height: '400px' }}>
              <div className="h-12 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render method
  return (
    <div className="bg-gray-50 min-h-screen">
      <HeadSection
        getSeoTitle={getSeoTitle}
        getSeoDescription={getSeoDescription}
        getSeoKeywords={getSeoKeywords}
        location={location}
        structuredData={structuredData}
        generateFaqSchema={generateFaqSchema}
        selectedCity={selectedCity}
        selectedState={selectedState}
        eggRates={eggRates}
      />
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />
      <div className="container mx-auto px-4 w-full max-w-7xl">
        <div id="home" className="py-8">
          <div className="min-h-[500px]">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <PriceOverview
                getUniqueH1={getUniqueH1}
                displayName={displayName}
                selectedCity={selectedCity}
                selectedState={selectedState}
                todayRate={todayRate}
                trayPrice={trayPrice}
                weeklyChange={weeklyChange}
                averagePrice={averagePrice}
              />
            )}
          </div>
          
          {!loading && (
            <>
              {selectedCity || selectedState ? (
                <RateTable
                  key={`${selectedCity}-${selectedState}`}
                  selectedCity={selectedCity}
                  selectedState={selectedState}
                  rates={eggRates}
                  showPriceColumns={true}
                  showChart={true}
                  showDate={true}
                  showState={false}
                  showAdmin={false}
                  showMarket={false}
                />
              ) : (
                <RateTable
                  key="default-table"
                  rates={eggRates}
                  showPriceColumns={true}
                  showChart={true}
                  chartType="bar"
                />
              )}

              <DetailedEggInfo selectedCity={selectedCity} selectedState={selectedState} />
              <PriceTrends selectedCity={selectedCity} selectedState={selectedState} eggRates={eggRates} />

              <WebStoriesSection 
                showWebStories={showWebStories}
                setShowWebStories={setShowWebStories}
                webStoriesLoading={webStoriesLoading}
                featuredWebStories={featuredWebStories}
              />

              <PriceTrendsWidget 
                today={today}
                todayRate={todayRate}
                rate7DaysAgo={rate7DaysAgo}
              />

              {todayRate !== 'N/A' && (
                <QuickInfo 
                  todayRate={todayRate}
                  trayPrice={trayPrice}
                  weeklyChange={weeklyChange}
                  weeklyChangePercent={weeklyChangePercent}
                />
              )}

              {states.length > 0 && (
                <StateList states={states} cities={cities} />
              )}
              
              {specialRates.length > 0 && (
                <RateTable
                  key="special-rates"
                  rates={specialRates}
                  showSpecialRates={true}
                  showPriceColumns={true}
                  showChart={false}
                  showDate={false}
                  showState={false}
                  showMarket={true}
                  itemsPerPage={5}
                />
              )}

              {blogs.length > 0 && (
                <BlogList blogs={blogs} selectedCity={selectedCity} selectedState={selectedState} />
              )}
              
              <FAQ
                selectedCity={selectedCity}
                selectedState={selectedState}
                eggRates={eggRates}
              />
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainPage;