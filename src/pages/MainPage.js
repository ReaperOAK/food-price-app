import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import RateTable from '../components/rates/RateTable';
import StateList from '../components/rates/StateList';
import BlogList from '../components/blog/BlogList';
import Footer from '../components/layout/Footer';
import FAQ, { generateFaqSchema } from '../components/common/FAQ';
import OptimizedImage from '../components/common/OptimizedImage';

// Add loading skeleton component at the top
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 min-h-[200px] flex flex-col justify-center">
          {/* Title placeholder with exact dimensions */}
          <div className="h-12 bg-white/20 rounded w-3/4 mx-auto mb-4 text-center" style={{ minHeight: '48px', height: '48px' }}></div>
          {/* Subtitle placeholder with exact dimensions */}
          <div className="h-8 bg-white/20 rounded w-1/2 mx-auto mb-2" style={{ minHeight: '32px', height: '32px' }}></div>
          {/* Description placeholder with exact dimensions */}
          <div className="h-12 bg-white/20 rounded w-2/3 mx-auto" style={{ minHeight: '48px', height: '48px' }}></div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center py-4" style={{ minHeight: '80px', height: '80px' }}>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2" style={{ minHeight: '16px', height: '16px' }}></div>
                <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto" style={{ height: '32px' }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Add the QuickInfo component at the top
const QuickInfo = ({ todayRate, trayPrice, weeklyChange, weeklyChangePercent }) => (
  <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs w-full transform transition-transform duration-300 hover:scale-105 z-50">
    <div className="flex justify-between items-center mb-2">
      <h4 className="text-sm font-semibold text-gray-700">Quick Price Info</h4>
      <span className="text-xs text-gray-500">Today</span>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Single Egg:</span>
        <span className="font-bold">₹{formatPrice(todayRate)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Tray (30):</span>
        <span className="font-bold">₹{formatPrice(trayPrice)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Weekly Change:</span>
        <span className={`font-bold ${weeklyChange > 0 ? 'text-green-500' : weeklyChange < 0 ? 'text-red-500' : 'text-gray-500'}`}>
          {weeklyChange !== 'N/A' && (weeklyChange > 0 ? '+' : '')}{weeklyChange}
          <span className="text-xs ml-1">({weeklyChangePercent}%)</span>
        </span>
      </div>
    </div>
  </div>
);

// Format price helper
const formatPrice = (price) => {
  if (price === 'N/A' || price === null || price === undefined) {
    return 'N/A';
  }
  return typeof price === 'number' ? price.toFixed(2) : price;
};

const MainPage = () => {
  // Original MainPage state
  const [eggRates, setEggRates] = useState([]);
  const [specialRates, setSpecialRates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ContentSection state
  const [featuredWebStories, setFeaturedWebStories] = useState([]);
  const [showWebStories, setShowWebStories] = useState(false);
  const [webStoriesLoading, setWebStoriesLoading] = useState(false); // New loading state

  // URL and location parameters
  const { state: stateParam, city: cityParam } = useParams();
  const location = useLocation();

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

  // Data fetching functions
  const handleFetchSpecialRates = useCallback(() => {
    return fetch('/php/api/rates/get_special_rates.php')
      .then(res => res.json())
      .then(data => {
        const convertedData = data.map(item => ({
          ...item,
          rate: parseFloat(item.rate),
        }));
        setSpecialRates(convertedData);
      })
      .catch(error => {
        console.error('Error fetching special rates:', error);
        setSpecialRates([]);
      });
  }, []);

  const handleFetchRates = useCallback(() => {
    const fetchPromise = selectedCity && selectedState
      ? fetch(`/php/api/rates/get_rates.php?city=${selectedCity}&state=${selectedState}`)
      : fetch(`/php/api/rates/get_latest_rates.php`);

    return fetchPromise
      .then(res => res.json())
      .then(data => {
        const convertedData = data.map(item => ({
          ...item,
          rate: parseFloat(item.rate),
        }));
        setEggRates(convertedData);
      })
      .catch(error => {
        console.error('Error fetching rates:', error);
        setEggRates([]);
      });
  }, [selectedCity, selectedState]);

  // Fetch web stories
  useEffect(() => {
    const handleFetchWebStories = async () => {
      if (!showWebStories) return; // Only fetch when stories are shown
      try {
        setWebStoriesLoading(true);
        const response = await fetch('/php/get_web_stories.php');
        if (!response.ok) {
          throw new Error('Failed to fetch web stories');
        }
        const data = await response.json();
        // Handle empty array response
        if (!Array.isArray(data) || data.length === 0) {
          setFeaturedWebStories([]);
          return;
        }
        // Use data directly without shuffling since PHP already orders by date DESC
        setFeaturedWebStories(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching web stories:', error);
        setFeaturedWebStories([]);
      } finally {
        setWebStoriesLoading(false);
      }
    };

    handleFetchWebStories();
  }, [showWebStories]); // Only re-run when showWebStories changes

  // Initial data loading
  useEffect(() => {
    setLoading(true);
    Promise.all([handleFetchRates(), handleFetchSpecialRates()])
      .finally(() => setLoading(false));
  }, [handleFetchRates, handleFetchSpecialRates, selectedState, selectedCity]);

  // Fetch states on mount
  useEffect(() => {
    fetch('/php/api/location/get_states.php')
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(error => console.error('Error fetching states:', error));
  }, []);

  // Fetch cities when a state is selected or when the URL changes
  useEffect(() => {
    if (selectedState) {
      fetch(`/php/api/location/get_cities.php?state=${selectedState}`)
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(error => console.error('Error fetching cities:', error));
    }
  }, [selectedState]);

  // Fetch state for the city from the URL
  useEffect(() => {
    if (cityParam) {
      // Normalize city name for display (e.g., convert 'bengaluru' to 'Bengaluru')
      const normalizedCity = cityParam.replace('-egg-rate', '');
      let displayCity = normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1);
      
      // Special handling for Bengaluru
      if (displayCity.toLowerCase() === 'bengaluru') {
        displayCity = 'Bengaluru';
      }
      
      setSelectedCity(displayCity);
      
      fetch(`/php/api/location/get_state_for_city.php?city=${displayCity}`)
        .then(res => res.json())
        .then(data => {
          if (data.state) {
            setSelectedState(data.state);
          }
        })
        .catch(error => console.error('Error fetching state for city:', error));
    }
  }, [cityParam]);

  // Update selectedState and selectedCity when URL parameters change
  useEffect(() => {
    if (stateParam) {
      const newState = stateParam.replace('-egg-rate', '');
      if (selectedState !== newState) {
        setSelectedState(newState);
        setSelectedCity('');
      }
    }
    if (cityParam) {
      const newCity = cityParam.replace('-egg-rate', '');
      if (selectedCity !== newCity) {
        setSelectedCity(newCity);
      }
    }
    if (!stateParam && !cityParam && (selectedState || selectedCity)) {
      setSelectedCity('');
      setSelectedState('');
    }
  }, [stateParam, cityParam, selectedState, selectedCity]);
  
  // SEO helpers
  const getUniqueH1 = () => {
    if (selectedCity) {
      return `Egg Rate in ${selectedCity}, ${selectedState} (${today})`;
    } else if (selectedState) {
      return `${selectedState} Egg Rate: Latest NECC Prices (${today})`;
    } else {
      return `Today's Egg Rate in India: NECC Price List (${today})`;
    }
  };

  // Create SEO title and description based on location  
  const getSeoTitle = () => {
    if (selectedCity) {
      return `${selectedCity} Egg Rate Today - ₹${todayRate} (${today}) | NECC Egg Price`;
    } else if (selectedState) {
      return `${selectedState} Egg Rates Today: State-wide NECC Price List (${today})`;
    } else {
      return `Today's Egg Rate: Check NECC Egg Prices Across India (${today})`;
    }
  };

  // Create SEO description based on location  
  const getSeoDescription = () => {
    if (selectedCity) {
      const trayPrice = todayRate !== 'N/A' ? (todayRate * 30).toFixed(2) : 'N/A';
      return `Current egg rate in ${selectedCity}, ${selectedState}: ₹${todayRate}/egg, ₹${trayPrice}/tray (30 eggs). Check latest NECC egg price in ${selectedCity} updated on ${today}. Live updates and market analysis.`;
    } else if (selectedState) {
      return `Today's egg rate in ${selectedState}: Get latest NECC egg prices and daily market updates from all major cities in ${selectedState}. Compare wholesale and retail egg rates updated on ${today}.`;
    } else {
      return `Check today's egg rates across India. Daily updated NECC egg prices from Mumbai, Chennai, Bangalore, Kolkata, Barwala & 100+ cities. Compare wholesale & retail egg prices (${today}).`;
    }
  };

  const getSeoKeywords = () => {
    if (selectedCity) {
      return `${selectedCity.toLowerCase()} egg rate today, ${selectedState.toLowerCase()} egg price, egg rate in ${selectedCity.toLowerCase()}, ${selectedCity.toLowerCase()} egg price today, necc egg rate in ${selectedCity.toLowerCase()}`;
    } else if (selectedState) {
      return `${selectedState.toLowerCase()} egg rate, egg price in ${selectedState.toLowerCase()}, today egg rate in ${selectedState.toLowerCase()}, ${selectedState.toLowerCase()} egg price today, necc egg rate in ${selectedState.toLowerCase()}`;
    } else {
      return 'egg rate today, necc egg rate today, today egg rate, egg rate, national egg rate, all india egg rate, today egg rate in mumbai, today egg rate in chennai, today egg rate kolkata, barwala egg rate today';
    }
  };

  // Add the DetailedEggInfo section
  const DetailedEggInfo = ({ selectedCity, selectedState, eggRates }) => {
    return (
      <div className="p-6 mt-6 bg-cover bg-center rounded-lg shadow-lg">
        <h1 className="text-center bg-gray-200 bg-opacity-75 rounded-lg w-full p-4 mt-4 text-2xl font-bold text-gray-800">
          Egg Daily and Monthly Prices
        </h1>
        <p className="text-left text-gray-700 mt-4 leading-relaxed bg-white bg-opacity-75 p-2 rounded">
          Our platform Today Egg rates provides the daily and monthly prices of egg throughout the different cities, states and areas of India. This Egg rate indicator is beneficial for both consumers and sellers in the Indian egg market. The daily or today's egg rate refers to the current price rates of the eggs. Users can scroll up to the previous day's price rates as well, limited to the current month. The egg rates depend on several factors such as production cost, transportation, egg quality, etc.
        </p>

        <h1 className="text-center bg-gray-200 bg-opacity-75 rounded-lg w-full p-4 mt-6 text-2xl font-bold text-gray-800">
          Wholesale Egg Prices Today
        </h1>
        <p className="text-left text-gray-700 mt-4 leading-relaxed bg-white bg-opacity-75 p-2 rounded">
          The wholesale egg prices represent the rates that retailers and distributors pay when purchasing eggs in bulk quantities. In India, these prices have been experiencing a notable upward trend in recent years, influenced by a variety of factors.
        </p>
        <p className="text-left text-gray-700 mt-4 leading-relaxed bg-white bg-opacity-75 p-2 rounded">
          One of the primary contributors to this increase is the rise in chicken feeding costs. Corn and soybeans, which are the main ingredients in chicken feed, have seen substantial price hikes. This surge in feed prices has a direct impact on the overall costs incurred by egg producers or poultry farms, as feed constitutes a significant portion of their operational expenses.
        </p>
        <p className="text-left text-gray-700 mt-4 leading-relaxed bg-white bg-opacity-75 p-2 rounded">
          Additionally, other factors such as fluctuations in demand and supply, changes in production levels, and economic conditions can also play a role in influencing wholesale egg prices. For instance, periods of high demand—such as during festivals or holidays—can lead to further increases in prices, while production challenges, such as disease outbreaks among poultry, can also restrict supply and drive prices higher.
        </p>
        <p className="text-left text-gray-700 mt-4 leading-relaxed bg-white bg-opacity-75 p-2 rounded">
          The egg market is a dynamic landscape that is ever-evolving, making it essential for consumers to remain well-informed about current egg prices and wholesale egg rates. This knowledge empowers them to make thoughtful and informed purchasing choices. For farmers and egg producers, staying attuned to daily and monthly fluctuations in egg prices is equally vital. By closely monitoring these trends, they can optimize their production strategies and pricing decisions, ensuring sustainability and profitability in their operations. In this intricate dance of supply and demand, awareness becomes a key advantage for all stakeholders involved.
        </p>
        <p className="text-left text-gray-700 mt-4 leading-relaxed bg-white bg-opacity-75 p-2 rounded">
          At TodayEggRates.com, we offer a comprehensive overview of daily and monthly NECC egg rates throughout the different areas/cities and states of India, allowing you to effortlessly compare rates and make informed decisions. Whether you're a farmer eager to sell your eggs or a consumer searching for the best prices, our platform serves as your trusted resource for the latest egg rate information. Discover today's price for a tray of eggs or explore the current cost of a peti of eggs. Stay updated with live NECC rates through our detailed pricing data, ensuring you always have access to the most accurate market insights.
        </p>

        <h1 className="text bg-green-200 bg-opacity-75 rounded-lg w-full p-4 mt-6 text-2xl font-bold text-gray-800">
          NECC-National Egg Coordination Committee
        </h1>
        <div className="grid lg:grid-cols-2 gap-5"> 
            <OptimizedImage src="/eggrate2.webp" className="col-span-1 object-contain shadow rounded border-none" alt="egg rate" width={600} height={400} />
            <div>
              <p className="text-left text-gray-700 leading-relaxed bg-white bg-opacity-75 p-4 rounded">
                Eggs are a fantastic addition to any meal, whether it's breakfast, lunch, or dinner! You can enjoy them scrambled or boiled, and they work wonderfully in dishes like Anda Bhurji or even Anda Ka Halwa. Just like us Indians, eggs can fit into a variety of recipes while keeping their special charm. If you're curious about egg prices in India, they change daily, as shared by the NECC (National Egg Coordination Committee). We make it easy for you to stay updated with the latest egg rates so you can continue enjoying your favorite egg dishes!
              </p> 
            </div>
        </div>

        <h2 className="text bg-green-200 bg-opacity-75 rounded-lg w-full p-4 mt-6 text-2xl font-bold text-gray-800">
          Today's NECC Egg Rate Analysis
        </h2>
        <div className="grid lg:grid-cols-2 gap-5"> 
          <div>
            <p className="text-left text-gray-700 leading-relaxed bg-white bg-opacity-75 p-4 rounded">
            The National Egg Coordination Committee (NECC) considers purchasing trends and the efforts of egg farmers when recommending current egg prices. This organization provides price suggestions for over 50 cities and states across the country. By disseminating today's egg prices, we ensure that users remain informed about NECC's recommendations, thereby enabling them to make more informed purchasing decisions.
            </p> 
          </div>
          <OptimizedImage src="/desiegg.webp" className="col-span-1 object-contain shadow rounded border-none" alt="egg rate in india" width={600} height={400} />
        </div>

        <h2 className="text bg-green-200 bg-opacity-75 rounded-lg w-full p-4 mt-6 text-2xl font-bold text-gray-800">
          Egg Consumption in India
        </h2>
        <div className="grid lg:grid-cols-2 gap-5"> 
            <OptimizedImage src="/eggrate3.webp" className="col-span-1 object-contain shadow rounded border-none" alt="egg rate in mumbai" width={600} height={400} />
            <div>
              <p className="text-left text-gray-700 leading-relaxed bg-white bg-opacity-75 p-4 rounded">
              India is a major player in the global egg production industry, generating approximately 129.6 billion eggs each year. This production figure is experiencing a steady growth rate of 7% annually, reflecting the increasing demand for eggs among the population. According to data published by Agrospectrum, the average egg consumption per person in India is estimated to be 95 eggs per year. This indicates not only a high level of consumption but also a cultural acceptance of eggs as a staple food source. Furthermore, India holds the position of third largest egg producer globally, trailing only behind China and the United States. This prominent ranking underscores the significant role eggs play in the Indian diet, as well as the growing awareness among consumers regarding the nutritional benefits of eggs, including their high protein content and essential vitamins.
              </p> 
            </div>
        </div>

        <h1 className="text bg-green-200 bg-opacity-75 rounded-lg w-full p-4 mt-6 text-2xl font-bold text-gray-800">
        Factors Affecting Egg Prices in India
        </h1>
        <div className="grid lg:grid-cols-2 gap-5"> 
          <div>
            <p className="text-left text-gray-700 leading-relaxed bg-white bg-opacity-75 p-4 rounded">
            Egg prices in India are influenced by a multitude of factors that can fluctuate over time. One of the primary determinants is the balance between demand and supply; when demand for eggs rises, prices tend to increase, whereas a surplus can lead to lower prices. The cost of production plays a crucial role as well, particularly the price of essential inputs such as bird feed, which can vary based on agricultural conditions and market trends.
Disease outbreaks, especially recurring incidents of bird flu, can have a profound effect on the egg market. Such outbreaks often lead to a decrease in egg production and concerns about food safety, causing prices to spike. Furthermore, the impact of seasonal changes should not be overlooked; egg production typically sees a slight increase during the warmer months of summer due to improved laying conditions, while it often diminishes in the colder winter months when laying can be less consistent. These dynamics create a complex landscape that shapes the pricing of eggs across the country.
            </p> 
          </div>
          <OptimizedImage src="/eggchicken.webp" className="col-span-1 object-contain shadow rounded border-none" alt="egg rate barwala" width={600} height={400} />
        </div>

        <h1 className="text bg-green-200 bg-opacity-75 rounded-lg w-full p-4 mt-6 text-2xl font-bold text-gray-800">
        How NECC Sets Egg Prices
        </h1>
        <div className="grid lg:grid-cols-2 gap-5"> 
            <OptimizedImage src="/eggrate3.webp" className="col-span-1 object-contain shadow rounded border-none" alt="egg rate namakkal" width={600} height={400} />
            <div>
              <p className="text-left text-gray-700 leading-relaxed bg-white bg-opacity-75 p-4 rounded">
              NECC (National Egg Coordination Committee) does not set egg prices directly. Instead, it provides a platform for stakeholders to work together and share information. Prices are determined daily by NECC after careful consideration and are updated every day at midnight. Key players in setting these prices include market forces, traders, distributors, and sometimes retailers.
              </p>
              <p className="text-left text-gray-700 leading-relaxed bg-white bg-opacity-75 p-4 rounded">
                <b>Market Forces: </b>
                Egg prices are influenced by several factors, including demand and supply, inflation, and weather. Seasonal events, like festivals, can also affect egg prices.
                </p>
              <p className="text-left text-gray-700 leading-relaxed bg-white bg-opacity-75 p-4 rounded">
              <b>Traders and Distributors: </b>
                Traders and distributors play a major role in deciding egg prices in India. They have control over pricing and can negotiate prices, which they then suggest to NECC. They act as middlemen between consumers and egg farmers.
                </p>
              <p className="text-left text-gray-700 leading-relaxed bg-white bg-opacity-75 p-4 rounded">
              <b>Consumers and Consumer Behavior: </b>
                Consumers do not directly affect prices, but their preferences can have a significant impact. Demand can change due to dietary choices, cultural habits, seasonal factors, and economic conditions. Tracking daily egg prices can be unpredictable, requiring careful attention to get the best results.
              </p> 
            </div>
        </div>
      </div>
    );
  };

  // Create price trends section
  const PriceTrends = ({ selectedCity, selectedState, eggRates }) => {
    const location = selectedCity || selectedState || 'your area';
    const todayRate = eggRates.length > 0 ? eggRates[0].rate : 'N/A';
    const rate7DaysAgo = eggRates.length > 7 ? eggRates[6].rate : 'N/A';
    const weeklyChange = eggRates.length > 7 ? (eggRates[0].rate - eggRates[6].rate).toFixed(2) : 'N/A';
    const weeklyChangePercent = eggRates.length > 7 ? ((eggRates[0].rate - eggRates[6].rate) / eggRates[6].rate * 100).toFixed(2) : 'N/A';
    const averagePrice = eggRates.length > 0 ? (eggRates.reduce((sum, rate) => sum + rate.rate, 0) / eggRates.length).toFixed(2) : 'N/A';

    return (
      <div className="p-6 mt-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Egg Price Trends in {location}</h2>
        
        <section className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">{location}</h3>
          <p className="text-lg text-gray-600 mb-4">
            As per the latest report, the egg rate in {location} has reached ₹{formatPrice(todayRate)} per piece. But this is not the highest price for eggs in the city in the last one year. The price of eggs has been on the rise in the city for the last few months. The rise in the price of eggs is due to the increase in the cost of chicken feed. The cost of chicken feed has gone up by 10% in the last few months. This has led to an increase in the price of eggs in {location}.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            Egg prices in {location} have been on the rise in recent months, due to a variety of factors. The cost of feed, transportation, and labor have all increased, leading to higher prices at the farm gate. Consumers are now paying more for eggs, with the average price of a tray of eggs now exceeding ₹{formatPrice(todayRate * 30)}. This is a significant increase from just a few years ago, when a tray of eggs could be purchased for as little as ₹{formatPrice(todayRate * 30 - 20)}. The higher prices are having an impact on egg consumption in {location}, as many families are cutting back on their consumption of this staple food. While the current situation is difficult for consumers, it is important to remember that egg prices are still relatively low compared to other staples such as rice and wheat.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            The current egg price situation in {location} is not likely to change in the near future, as the cost of production is still high. However, as the industry adjusts to the new reality of higher prices, egg production is likely to increase, which could help to bring prices down over time. In the meantime, consumers will need to continue to pay more for their eggs.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            Poultry farmers in {location} said they are incurring losses as the cost of chicken feed accounts for around 60 percent of the total cost of production.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            <b>Note:</b> This is not NECC official website. We collect the prices from the NECC site to present the prices in a simple and graphical manner for the convenience of the user. The suggested prices are published solely for the reference and information of the trade and industry. NECC and EggRate.in does not by itself or through any person enforce compliance or adherence with such suggested egg prices in any manner whatsoever.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Today's Egg Rate in {location}</h3>
          <p className="text-lg text-gray-600 mb-4">
            Today's date is {new Date().toDateString()} and we can see that the egg rate in {location} today is ₹{formatPrice(todayRate)}. But if we compare today's date with yesterday's date, we can see that yesterday the price of eggs in {location} was ₹{formatPrice(todayRate)}.
          </p>
          <table className="min-w-full bg-white divide-y divide-gray-200 mb-4">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Egg rate details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Today's Egg rate</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Egg rate 7 days ago</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(rate7DaysAgo)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Weekly Change in Egg rate (₹)</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatPrice(weeklyChange)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">% Weekly Change in Egg Rate</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatPrice(weeklyChangePercent)}%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">NECC Egg Price (₹)</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Wholesale Price (₹)</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Retail Price (₹)</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate + 0.35)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Supermarket Price (₹)</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(todayRate + 0.45)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Average Price till today</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatPrice(averagePrice)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Egg Rate of a Tray in {location}</h3>
          <p className="text-lg text-gray-600 mb-4">
            If you are looking to buy eggs in bulk then you can consider buying an egg tray. The egg tray which usually holds 30 eggs in a tray costs ₹{formatPrice(todayRate * 30)}. Looking at the graph above you can see how the egg rate has fluctuated on a daily basis. In the above graph you can also see the weekly change of egg prices. There has been a change in the price of eggs by {formatPrice(weeklyChange)} compared to last week. The weekly percentage change in the price of eggs is {formatPrice(weeklyChangePercent)}%.
          </p>
        </section>
      </div>
    );
  };

  // Structured data for search engines
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

  // Define handleFetchBlogs function
  useEffect(() => {
    // Import blogs from data file
    try {
      import('../data/blogs').then(module => {
        setBlogs(module.default);
      });
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    }
  }, []);

  // Render method
  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>{getSeoTitle()}</title>
        <meta name="description" content={getSeoDescription()} />
        <meta name="keywords" content={getSeoKeywords()} />
        
        {/* Canonical URL with proper handling */}
        <link 
          rel="canonical" 
          href={`https://todayeggrates.com${
            location.pathname === '/' 
              ? '' 
              : location.pathname.endsWith('/') 
                ? location.pathname.slice(0, -1) 
                : location.pathname
          }`} 
        />
        
        {/* Add structured data for rich snippets */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
          {/* Add FAQ structured data */}
        <script type="application/ld+json">
          {JSON.stringify(generateFaqSchema(selectedCity, selectedState, eggRates))}
        </script>
        
        {/* Add lastmod date for search engines */}
        <meta property="article:modified_time" content={new Date().toISOString()} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={getSeoTitle()} />
        <meta property="og:description" content={getSeoDescription()} />
        <meta property="og:url" content={`https://todayeggrates.com${location.pathname}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://todayeggrates.com/eggpic.webp" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getSeoTitle()} />
        <meta name="twitter:description" content={getSeoDescription()} />
        <meta name="twitter:image" content="https://todayeggrates.com/eggpic.webp" />
      </Helmet>
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
              <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 min-h-[200px] flex flex-col justify-center">
                    <h1 className="text-3xl font-bold text-white text-center mb-4" style={{ minHeight: '48px', height: '48px' }}>
                      {getUniqueH1()}
                    </h1>
                    <p className="text-center text-white text-xl font-semibold mb-2" style={{ minHeight: '32px', height: '32px' }}>
                      Current Rates for {displayName}
                    </p>
                    <p className="text-center text-blue-100" style={{ minHeight: '48px', height: '48px' }}>
                      {selectedCity 
                        ? `Get the latest egg rates for ${selectedCity}. Updated daily with wholesale and retail prices.`
                        : selectedState
                          ? `Check current egg prices across ${selectedState}. Compare rates from different cities.`
                          : 'Track egg prices across India with our daily updated NECC rates from major cities.'
                      }
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center py-4" style={{ minHeight: '80px', height: '80px' }}>
                        <h3 className="text-sm text-gray-600 mb-2" style={{ minHeight: '16px', height: '16px' }}>Today's Rate</h3>
                        <p className="text-xl font-semibold text-gray-900" style={{ height: '32px' }}>₹{formatPrice(todayRate)}</p>
                      </div>
                      <div className="text-center py-4" style={{ minHeight: '80px', height: '80px' }}>
                        <h3 className="text-sm text-gray-600 mb-2" style={{ minHeight: '16px', height: '16px' }}>Tray Price</h3>
                        <p className="text-xl font-semibold text-gray-900" style={{ height: '32px' }}>₹{formatPrice(trayPrice)}</p>
                      </div>
                      <div className="text-center py-4" style={{ minHeight: '80px', height: '80px' }}>
                        <h3 className="text-sm text-gray-600 mb-2" style={{ minHeight: '16px', height: '16px' }}>Weekly Change</h3>
                        <p className={`text-xl font-semibold ${weeklyChange > 0 ? 'text-green-500' : 'text-red-500'}`} style={{ height: '32px' }}>
                          {weeklyChange !== 'N/A' ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange}` : 'N/A'}
                        </p>
                      </div>
                      <div className="text-center py-4" style={{ minHeight: '80px', height: '80px' }}>
                        <h3 className="text-sm text-gray-600 mb-2" style={{ minHeight: '16px', height: '16px' }}>30-Day Avg</h3>
                        <p className="text-xl font-semibold text-gray-900" style={{ height: '32px' }}>₹{formatPrice(averagePrice)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Rest of the content */}
          {!loading && (
            <>
              {/* Rate Table and Chart */}
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

              {/* Add Detailed Egg Info Section */}
              <DetailedEggInfo selectedCity={selectedCity} selectedState={selectedState} />

              {/* Add Price Trends Section */}
              <PriceTrends selectedCity={selectedCity} selectedState={selectedState} eggRates={eggRates} />

              {/* Web Stories Section */}
              <div className="mt-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-700">Featured Web Stories</h2>
                  <button
                    onClick={() => setShowWebStories(!showWebStories)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={webStoriesLoading}
                  >
                    {webStoriesLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Loading Stories...</span>
                      </>
                    ) : (
                      <>
                        <span>{showWebStories ? 'Hide Stories' : 'Show Stories'}</span>
                        <svg className={`w-5 h-5 transform transition-transform duration-300 ${showWebStories ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                <div className={`transition-all duration-500 ease-in-out ${showWebStories ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                  {webStoriesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                          <div className="h-48 bg-gray-200"></div>
                          <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : featuredWebStories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredWebStories.map((story, index) => (
                        <Link 
                          key={story.slug}
                          to={`/webstory/${story.slug}`}
                          className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="relative">
                            <OptimizedImage 
                              src={story.thumbnail} 
                              alt={`Egg Rate in ${story.city}, ${story.state}`}
                              className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/eggpic.webp';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <p className="text-white text-sm font-medium">
                                {story.date}
                              </p>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                              {story.title}
                            </h3>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-red-600 font-bold">₹{story.rate} per egg</p>
                              <p className="text-sm text-gray-600">
                                {story.city}, {story.state}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-white rounded-lg shadow-md">
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-xl font-semibold text-gray-700 mb-2">No Stories Available</p>
                      <p className="text-gray-500">Check back later for updates on egg prices and market trends.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Trends Section */}
              <div className="p-6 mt-6 bg-white shadow-lg rounded-lg transform transition-all duration-300 hover:shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
                  <span className="mr-2">Price Trends</span>
                  <span className="text-sm font-normal text-gray-500">Last 30 days</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-semibold text-gray-800">Today's Rate</h3>
                      <span className="text-xs text-gray-500">{today}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">₹{formatPrice(todayRate)}</p>
                    <p className="text-sm text-gray-600 mt-1">Per egg</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-semibold text-gray-800">7 Days Ago</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">₹{formatPrice(rate7DaysAgo)}</p>
                    <p className="text-sm text-gray-600 mt-1">Per egg</p>
                  </div>
                </div>
              </div>

              {/* Add QuickInfo component only if we have rate data */}
              {todayRate !== 'N/A' && (
                <QuickInfo 
                  todayRate={todayRate}
                  trayPrice={trayPrice}
                  weeklyChange={weeklyChange}
                  weeklyChangePercent={weeklyChangePercent}
                />
              )}

              {/* Only render StateList if we have states data */}
              {states.length > 0 && (
                <StateList states={states} cities={cities} />
              )}
              
              {/* Special rates table */}
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

              {/* Only render BlogList if we have blogs data */}
              {blogs.length > 0 && (
                <BlogList blogs={blogs} selectedCity={selectedCity} selectedState={selectedState} />
              )}
              
              {/* FAQ Section */}
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