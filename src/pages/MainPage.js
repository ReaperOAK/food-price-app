import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../components/layout/Breadcrumb';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import HeadSection from '../components/common/HeadSection';
import PriceOverview from '../components/prices/PriceOverview';
import { getUniqueH1 } from '../utils/seo';
import { useWebStories, useRates, useLocations, useBlogs } from '../hooks/useData';
import { fetchRates } from '../services/api';

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
const EggsIndiaContent = lazy(() => import('../components/seo/EggsIndiaContent'));
const CityLinkGrid = lazy(() => import('../components/navigation/CityLinkGrid'));

const MainPage = () => {
  // URL and location parameters
  const { state: stateParam, city: cityParam } = useParams();
  const location = useLocation();

  // List of non-city pages that should not be treated as cities
  const nonCityPages = ['blog', 'egg-rates', 'webstories', 'privacy', 'disclaimer', 'contact', 'about'];
  
  // Validate and clean state/city parameters
  const validateCityParam = (param) => {
    if (!param) return '';
    const cleanParam = param.replace('-egg-rate-today', '');
    return nonCityPages.includes(cleanParam) ? '' : cleanParam;
  };  // State management with initialization from URL
  const [selectedState, setSelectedState] = useState(() => stateParam?.replace('-egg-rate-today', '') || '');
  const [selectedCity, setSelectedCity] = useState(() => validateCityParam(cityParam));
  const [showWebStories, setShowWebStories] = useState(false);
  const [allRates, setAllRates] = useState([]);
  const [allRatesLoading, setAllRatesLoading] = useState(false);
    // Custom hooks for data fetching
  const { allWebStories, webStoriesLoading } = useWebStories(showWebStories);
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
  );  // Memoized price metrics calculations
  const priceMetrics = useMemo(() => {
    if (!eggRates?.length) {
      // If no data available, provide fallback values instead of N/A for better SEO
      // Use a reasonable fallback price (e.g., average Indian egg price)
      const fallbackRate = 5.50; // Average egg price in India
      return {
        todayRate: fallbackRate,
        rate7DaysAgo: fallbackRate,
        weeklyChange: '0.00',
        weeklyChangePercent: '0.00',
        averagePrice: fallbackRate.toFixed(2),
        trayPrice: (fallbackRate * 30).toFixed(2),
        isEstimate: true // Flag to indicate this is estimated data
      };
    }

    const todayRate = parseFloat(eggRates[0].rate) || 0;
    const rate7DaysAgo = eggRates?.length > 7 ? (parseFloat(eggRates[6].rate) || 0) : todayRate;
    const weeklyChange = rate7DaysAgo !== todayRate ? (todayRate - rate7DaysAgo).toFixed(2) : '0.00';
    const weeklyChangePercent = rate7DaysAgo !== todayRate && rate7DaysAgo > 0
      ? ((todayRate - rate7DaysAgo) / rate7DaysAgo * 100).toFixed(2) 
      : '0.00';
    const totalSum = eggRates.reduce((sum, rate) => sum + (parseFloat(rate.rate) || 0), 0);
    const averagePrice = eggRates.length > 0 ? (totalSum / eggRates.length).toFixed(2) : '0.00';
    const trayPrice = (todayRate * 30).toFixed(2);

    return {
      todayRate,
      rate7DaysAgo,
      weeklyChange,
      weeklyChangePercent,
      averagePrice,
      trayPrice,
      isEstimate: false
    };
  }, [eggRates]);

  // Update selectedState and selectedCity when URL parameters change
  useEffect(() => {
    const updateStateFromUrl = async () => {
      // Handle city parameter
      if (cityParam) {
        const newCity = validateCityParam(cityParam);
        if (newCity && newCity !== selectedCity) {
          setSelectedCity(newCity);
          // Load state for the city
          try {
            const stateForCity = await loadStateForCity(newCity);
            if (stateForCity && stateForCity !== selectedState) {
              setSelectedState(stateForCity);
              loadCities(stateForCity);
            }
          } catch (error) {
            console.error('Error loading state for city:', error);
          }
        }
      }
      // Handle state parameter (only if no city)
      else if (stateParam) {
        const newState = stateParam.replace('-egg-rate-today', '');
        if (newState !== selectedState) {
          setSelectedState(newState);
          setSelectedCity(''); // Clear city when navigating to state
          loadCities(newState);
        }
      }
      // Handle home page (no parameters)
      else if (!stateParam && !cityParam) {
        if (selectedState || selectedCity) {
          setSelectedCity('');
          setSelectedState('');
        }
      }
    };    updateStateFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateParam, cityParam, loadStateForCity, loadCities]); // Intentionally excluding selectedState and selectedCity to prevent circular dependencies
  // Fetch all rates data for SEO table
  useEffect(() => {
    const fetchAllRatesData = async () => {
      try {
        setAllRatesLoading(true);
        // Use fetchRates without parameters to get latest rates per city (no duplicates)
        const data = await fetchRates(null, null);
        setAllRates(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching all rates:', error);
        setAllRates([]); // Set empty array on error
      } finally {
        setAllRatesLoading(false);
      }
    };

    // Only fetch all rates when we're on a city or state page
    if (selectedCity || selectedState) {
      fetchAllRatesData();
    }
  }, [selectedCity, selectedState]);
  
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">      {/* Only render HeadSection when not loading to prevent React Helmet errors */}
      {!loading && (
        <HeadSection
          location={location}
          selectedCity={selectedCity}
          selectedState={selectedState}
          eggRates={eggRates}
          todayRate={priceMetrics.todayRate}
          trayPrice={priceMetrics.trayPrice}
          isLoading={loading}
        />
      )}
      
      <Navbar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />      <main className="container mx-auto px-4 w-full max-w-7xl">
        {/* Only render Breadcrumb when not loading to prevent React Helmet errors */}
        {!loading && <Breadcrumb isLoading={loading} />}
        
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
                </section>                {/* Price Trends Section */}
                <section aria-label="Price Trends Analysis">
                  <PriceTrends 
                    selectedCity={selectedCity} 
                    selectedState={selectedState} 
                    eggRates={eggRates} 
                    isLoading={loading}
                  />
                </section>

                {/* Web Stories Section */}
                <section aria-label="Featured Stories">                  <WebStoriesSection 
                    showWebStories={showWebStories}
                    setShowWebStories={setShowWebStories}
                    webStoriesLoading={webStoriesLoading}
                    allWebStories={allWebStories}
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
                )}                {/* State List Section */}
                {states?.length > 0 && (
                  <section aria-label="States and Cities">
                    <StateList 
                      states={states} 
                      cities={cities} 
                      isLoading={loading}
                    />
                  </section>
                )}
                
                {/* Special Rates Section */}
                {specialRates?.length > 0 && (
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

                {/* Eggs in India Content Section - Enhanced SEO */}
                <section aria-label="Comprehensive Guide to Eggs in India">
                  <EggsIndiaContent 
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
                )}                {/* Blog Section */}
                {blogs?.length > 0 && (
                  <section aria-label="Related Blog Posts">
                    <BlogList 
                      blogs={blogs} 
                      selectedCity={selectedCity} 
                      selectedState={selectedState} 
                      loading={loading}
                    />
                  </section>
                )}{/* Related City Links Section - Universal SEO linking */}
                {selectedCity && cities?.length > 0 && (
                  <section aria-label="Compare Rates in Other Cities">
                    <RelatedCityLinks 
                      selectedCity={selectedCity}
                      selectedState={selectedState}
                      allCities={cities}
                    />
                  </section>
                )}

                {/* All Cities SEO Table - Always show complete city links for SEO */}
                {(selectedCity || selectedState) && eggRates?.length > 0 && (
                  <section aria-label="All Cities Egg Rates" className="mt-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                          Egg Rates Across All Indian Cities
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
                          Compare today's egg prices in major cities across India
                        </p>
                      </div>                      <RateTable
                        key="all-cities-seo-table"
                        rates={allRates}
                        showPriceColumns={true}
                        showChart={false}
                        showDate={false}
                        showState={true}
                        showAdmin={false}
                        showMarket={true}
                        itemsPerPage={20}
                        isLoading={allRatesLoading}
                        title="Complete City Coverage"
                        description="Comprehensive egg rate information for all major Indian cities and states"
                      />
                    </div>
                  </section>
                )}                {/* State Navigation Grid - For state pages to link to all states */}
                {selectedState && !selectedCity && (
                  <section aria-label="Explore Other States">
                    <StateNavigationGrid selectedState={selectedState} />
                  </section>
                )}

                {/* Comprehensive City Link Grid - Universal orphan page linking */}
                <section aria-label="Explore All Cities">
                  <CityLinkGrid 
                    title="Today's Egg Rates Across India"
                    showWebStories={true}
                    maxCities={selectedCity || selectedState ? 32 : 40}
                    className="mt-8"
                  />
                </section>
                
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