import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../components/layout/Breadcrumb';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import HeadSection from '../components/common/HeadSection';
import PriceOverview from '../components/prices/PriceOverview';
import { getUniqueH1, getSeoTitle, getSeoDescription, getSeoKeywords } from '../utils/seo';
import { useWebStories, useRates, useLocations, useBlogs } from '../hooks/useData';
import { generateFaqSchema } from '../components/common/FAQ';

// Lazy load non-critical components
const RateTable = lazy(() => import('../components/rates/RateTable'));
const StateList = lazy(() => import('../components/rates/StateList'));
const BlogList = lazy(() => import('../components/blog/BlogList'));
const Footer = lazy(() => import('../components/layout/Footer'));
const FAQ = lazy(() => import('../components/common/FAQ'));
const QuickInfo = lazy(() => import('../components/common/QuickInfo'));
const WebStoriesSection = lazy(() => import('../components/webstories/WebStoriesSection'));
const PriceTrendsWidget = lazy(() => import('../components/prices/PriceTrendsWidget'));
const DetailedEggInfo = lazy(() => import('../components/prices/DetailedEggInfo'));
const PriceTrends = lazy(() => import('../components/prices/PriceTrends'));
const CityMarketInsights = lazy(() => import('../components/content/CityMarketInsights'));
const RelatedCityLinks = lazy(() => import('../components/content/RelatedCityLinks'));
const StateNavigationGrid = lazy(() => import('../components/content/StateNavigationGrid'));



const MainPage = () => {
  // URL and location parameters
  const { state: stateParam, city: cityParam } = useParams();
  const location = useLocation();

  // State management with initialization from URL
  const [selectedState, setSelectedState] = useState(() => stateParam?.replace('-egg-rate', '') || '');
  const [selectedCity, setSelectedCity] = useState(() => cityParam?.replace('-egg-rate', '') || '');
  const [showWebStories, setShowWebStories] = useState(false);
  
  // Custom hooks for data fetching
  const { featuredWebStories, webStoriesLoading } = useWebStories(showWebStories);
  const { eggRates, specialRates, loading } = useRates(selectedCity, selectedState);
  const { states, cities, loadCities, loadStateForCity } = useLocations();
  const { blogs } = useBlogs();

  // Memoized display and formatting helpers
  const displayName = useMemo(() => 
    selectedCity ? `${selectedCity}, ${selectedState}` : (selectedState || 'India'),
    [selectedCity, selectedState]
  );

  const today = useMemo(() => 
    new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    []
  );

  // Memoized price metrics calculations
  const priceMetrics = useMemo(() => {
    if (!eggRates.length) {
      return {
        todayRate: 'N/A',
        rate7DaysAgo: 'N/A',
        weeklyChange: 'N/A',
        weeklyChangePercent: 'N/A',
        averagePrice: 'N/A',
        trayPrice: 'N/A'
      };
    }

    const todayRate = eggRates[0].rate;
    const rate7DaysAgo = eggRates.length > 7 ? eggRates[6].rate : 'N/A';
    const weeklyChange = rate7DaysAgo !== 'N/A' ? (todayRate - rate7DaysAgo).toFixed(2) : 'N/A';
    const weeklyChangePercent = rate7DaysAgo !== 'N/A' 
      ? ((todayRate - rate7DaysAgo) / rate7DaysAgo * 100).toFixed(2) 
      : 'N/A';
    const averagePrice = (eggRates.reduce((sum, rate) => sum + rate.rate, 0) / eggRates.length).toFixed(2);
    const trayPrice = (todayRate * 30).toFixed(2);

    return {
      todayRate,
      rate7DaysAgo,
      weeklyChange,
      weeklyChangePercent,
      averagePrice,
      trayPrice
    };
  }, [eggRates]);

  // Memoized SEO data
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Eggs in ${displayName}`,
    "description": `Latest egg rates in ${displayName}. Check today's egg prices updated on ${today}. Single egg price: ₹${priceMetrics.todayRate}, Tray (30 eggs) price: ₹${priceMetrics.trayPrice}`,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": priceMetrics.todayRate,
      "highPrice": priceMetrics.trayPrice,
      "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock"
    }
  }), [displayName, today, priceMetrics.todayRate, priceMetrics.trayPrice]);

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
  
  // Loading skeleton component with content-visibility optimization
  const LoadingComponent = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div 
        className="container mx-auto px-4 w-full max-w-7xl" 
        style={{ 
          minHeight: '600px',
          contentVisibility: 'auto',
          containIntrinsicSize: '0 600px'
        }}
      >
        <div className="animate-pulse space-y-6 py-8">
          <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl w-3/4 max-w-3xl mx-auto"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
                style={{ height: '180px' }}
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="h-14 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
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

      <main className="container mx-auto px-4 w-full max-w-7xl">
        <Breadcrumb />
        
        <div id="home" className="py-8 space-y-8">
          <section 
            className="min-h-[500px]"
            style={{ 
              contentVisibility: 'auto',
              containIntrinsicSize: '0 500px'
            }}
          >
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <PriceOverview
                getUniqueH1={getUniqueH1}
                displayName={displayName}
                selectedCity={selectedCity}
                selectedState={selectedState}
                {...priceMetrics}
              />
            )}
          </section>
          
          {!loading && (
            <Suspense fallback={<LoadingSkeleton />}>
              <div className="space-y-8">
                {/* Rate Table Section */}
                <section aria-label="Price History Table">
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
                </section>

                {/* Price Trends Section */}
                <section aria-label="Price Trends Analysis">
                  <PriceTrends 
                    selectedCity={selectedCity} 
                    selectedState={selectedState} 
                    eggRates={eggRates} 
                  />
                </section>

                {/* Web Stories Section */}
                <section aria-label="Featured Stories">
                  <WebStoriesSection 
                    showWebStories={showWebStories}
                    setShowWebStories={setShowWebStories}
                    webStoriesLoading={webStoriesLoading}
                    featuredWebStories={featuredWebStories}
                  />
                </section>

                {/* Price Trends Widget Section */}
                <section aria-label="Price Trends Overview">
                  <PriceTrendsWidget 
                    today={today}
                    todayRate={priceMetrics.todayRate}
                    rate7DaysAgo={priceMetrics.rate7DaysAgo}
                  />
                </section>

                {/* Quick Info Section */}
                {priceMetrics.todayRate !== 'N/A' && (
                  <section aria-label="Quick Price Information">
                    <QuickInfo {...priceMetrics} />
                  </section>
                )}

                {/* State List Section */}
                {states.length > 0 && (
                  <section aria-label="States and Cities">
                    <StateList states={states} cities={cities} />
                  </section>
                )}
                
                {/* Special Rates Section */}
                {specialRates.length > 0 && (
                  <section aria-label="Special Market Rates">
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
                  </section>
                )}                {/* Detailed Info Section */}
                <section aria-label="Detailed Egg Information">
                  <DetailedEggInfo 
                    selectedCity={selectedCity} 
                    selectedState={selectedState} 
                  />
                </section>

                {/* City Market Insights Section - Universal SEO content */}
                {selectedCity && (
                  <section aria-label="Market Insights and Analysis">
                    <CityMarketInsights 
                      selectedCity={selectedCity}
                      selectedState={selectedState}
                      todayRate={priceMetrics.todayRate}
                      trayPrice={priceMetrics.trayPrice}
                    />
                  </section>
                )}

                {/* Blog Section */}
                {blogs.length > 0 && (
                  <section aria-label="Related Blog Posts">
                    <BlogList 
                      blogs={blogs} 
                      selectedCity={selectedCity} 
                      selectedState={selectedState} 
                    />
                  </section>
                )}                {/* Related City Links Section - Universal SEO linking */}
                {selectedCity && cities.length > 0 && (
                  <section aria-label="Compare Rates in Other Cities">
                    <RelatedCityLinks 
                      selectedCity={selectedCity}
                      selectedState={selectedState}
                      allCities={cities}
                    />
                  </section>
                )}

                {/* State Navigation Grid - For state pages to link to all states */}
                {selectedState && !selectedCity && (
                  <section aria-label="Explore Other States">
                    <StateNavigationGrid selectedState={selectedState} />
                  </section>
                )}
                
                {/* FAQ Section */}
                <section aria-label="Frequently Asked Questions">
                  <FAQ
                    selectedCity={selectedCity}
                    selectedState={selectedState}
                    eggRates={eggRates}
                  />
                </section>
              </div>
            </Suspense>
          )}
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default React.memo(MainPage);