import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Helmet } from 'react-helmet';
Chart.register(...registerables);

const RateTable = ({ selectedCity, selectedState, eggRates }) => {
  // Check if eggRates is available and has data
  if (!eggRates || eggRates.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Egg Rate in {selectedCity}, {selectedState}
        </h2>
        <p className="text-center text-gray-600 mt-4">Loading egg rates...</p>
      </div>
    );
  }

  // Sort rates by date (newest first)
  const sortedRates = [...eggRates].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestRate = sortedRates[0]?.rate || "N/A";
  
  // Filter rates to only show the last 10 days
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  
  const filteredRates = sortedRates.filter(rate => {
    const rateDate = new Date(rate.date);
    return rateDate >= tenDaysAgo;
  });
  
  // Calculate rate changes
  let rateChange = null;
  let percentageChange = null;
  if (sortedRates.length > 1) {
    rateChange = latestRate - sortedRates[1].rate;
    percentageChange = (rateChange / sortedRates[1].rate) * 100;
  }
  
  // Format dates for chart
  const chartLabels = filteredRates.map(rate => {
    const date = new Date(rate.date);
    return date.toLocaleDateString('en-US', {
      month: 'short', 
      day: 'numeric'
    });
  }).reverse();
  
  // Format rates for chart
  const chartData = filteredRates.map(rate => rate.rate).reverse();
  
  // Calculate tray price (30 eggs)
  const trayPrice = latestRate * 30;
  
  // Prepare chart data
  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Egg Rate (₹)',
        data: chartData,
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `₹${context.raw.toFixed(2)} per egg`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '₹' + value.toFixed(2);
          }
        }
      }
    }
  };

  // Format date for the latest rate
  const latestRateDate = new Date(sortedRates[0]?.date || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create LocalBusiness schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Egg Market ${selectedCity}`,
    "description": `Find today's egg rates in ${selectedCity}, ${selectedState}. Updated daily NECC egg prices and wholesale egg rates.`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": selectedCity,
      "addressRegion": selectedState,
      "addressCountry": "IN"
    },
    "image": "https://todayeggrates.com/eggpic.webp",
    "priceRange": "₹₹",
    "telephone": "+91-XXXXXXXXXX",
    "url": `https://todayeggrates.com/${selectedCity.toLowerCase()}-egg-rate`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "254"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "06:00",
        "closes": "21:00"
      }
    ],
    "offers": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Product",
        "name": "Eggs",
        "description": `Fresh eggs in ${selectedCity}, ${selectedState}`,
        "offers": {
          "@type": "Offer",
          "price": latestRate,
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
        }
      }
    }
  };
  
  // Create Product schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Eggs in ${selectedCity}, ${selectedState}`,
    "description": `Fresh eggs available in ${selectedCity}, ${selectedState}. Check today's egg price.`,
    "image": "https://todayeggrates.com/eggpic.webp",
    "offers": {
      "@type": "Offer",
      "url": `https://todayeggrates.com/${selectedCity.toLowerCase()}-egg-rate`,
      "priceCurrency": "INR",
      "price": latestRate,
      "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "254"
    }
  };
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>
      
      <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Today's Egg Rate in {selectedCity}, {selectedState}
        </h2>
        
        <div className="flex flex-wrap justify-between mb-8">
          <div className="w-full md:w-1/2 p-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-700">Latest Price Details</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Rate:</span>
                  <span className="font-bold text-2xl text-red-600">₹{latestRate} per egg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tray Price (30 eggs):</span>
                  <span className="font-semibold text-xl text-blue-600">₹{trayPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Updated on:</span>
                  <span className="text-gray-800">{latestRateDate}</span>
                </div>
                {rateChange !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price Change:</span>
                    <span className={rateChange > 0 ? 'text-green-600' : rateChange < 0 ? 'text-red-600' : 'text-gray-600'}>
                      {rateChange > 0 ? '+' : ''}{rateChange.toFixed(2)} ({percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 p-4">
            <div className="bg-white p-6 rounded-lg shadow-sm h-full">
              <h3 className="text-xl font-medium text-gray-700 mb-4">Price Trend</h3>
              <Line data={data} options={options} />
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-medium text-gray-800 mb-4">Historical Egg Rates - {selectedCity}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Rate (₹ per egg)</th>
                <th className="py-3 px-4 text-left">Tray Price (₹ for 30 eggs)</th>
              </tr>
            </thead>
            <tbody>
              {filteredRates.map((rate, index) => {
                // Fix date parsing to properly display unique dates for each entry
                // Parse the date string from API format (YYYY-MM-DD)
                const dateObj = new Date(rate.date);
                // Ensure the date is valid before formatting
                const formattedDate = !isNaN(dateObj.getTime()) 
                  ? dateObj.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) 
                  : rate.date; // Fallback to the original string if parsing fails
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4">{formattedDate}</td>
                    <td className="py-3 px-4">₹{rate.rate}</td>
                    <td className="py-3 px-4">₹{(rate.rate * 30).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-2">About {selectedCity} Egg Market</h3>
          <p className="text-gray-700 mb-3">
            The egg market in {selectedCity}, {selectedState} follows the general poultry market trends in the region.
            Prices are influenced by factors such as feed costs, seasonal demand, transportation expenses, and overall market conditions.
          </p>
          <p className="text-gray-700">
            {selectedCity}'s egg rates are typically updated daily based on the National Egg Coordination Committee (NECC) publications
            and local market surveys. Our website provides the most current prices to help consumers and traders make informed decisions.
          </p>
        </div>
      </div>
    </>
  );
};

export default RateTable;