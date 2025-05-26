import React, { useState } from 'react';
import RateChart from './RateChart';
import { Helmet } from 'react-helmet';

const RateTable = ({ 
  rates = [], 
  showChart = true, 
  itemsPerPage = 10, 
  showAdmin = false,
  showSpecialRates = false,
  chartType = 'bar',
  onDelete,
  onEdit,
  handleSort: externalHandleSort,
  showState = false,
  showDate = false,
  showPriceColumns = true,
  selectedCity = '',
  selectedState = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'city', direction: 'ascending' });
  const [editingRate, setEditingRate] = useState(null);
  const [editedRate, setEditedRate] = useState({});

  if (!rates || rates.length === 0) {
    return (
      <div className="p-6 mt-6 bg-gray-100 rounded-lg shadow-lg text-center">
        {showSpecialRates ? 'No special rates available' : 'No rates available at the moment.'}
      </div>
    );
  }

  // Sort rates by date (newest first)
  const sortedRates = externalHandleSort ? rates : [...rates].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRates.slice(indexOfFirstItem, indexOfLastItem);

  const handleClick = (event) => {
    setCurrentPage(Number(event.target.id));
  };

  const pages = [];
  for (let i = 1; i <= Math.ceil(rates.length / itemsPerPage); i++) {
    pages.push(i);
  }

  const handleLocalSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const requestSort = (key) => {
    if (externalHandleSort) {
      externalHandleSort(key);
    } else {
      handleLocalSort(key);
    }
  };

  const handleEditClick = (rate) => {
    setEditingRate(rate.id);
    setEditedRate(rate);
  };

  const handleSaveClick = () => {
    if (onEdit) {
      onEdit(editedRate);
    }
    setEditingRate(null);
  };

  const handleCancelClick = () => {
    setEditingRate(null);
    setEditedRate({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedRate((prevRate) => ({
      ...prevRate,
      [name]: value,
    }));
  };

  // Format dates for chart and calculate changes
  const latestRate = sortedRates[0]?.rate || 0;
  const previousRate = sortedRates[1]?.rate || latestRate;
  const rateChange = latestRate - previousRate;
  const percentageChange = previousRate ? (rateChange / previousRate) * 100 : 0;
  const trayPrice = latestRate * 30;
  const latestRateDate = sortedRates[0]?.date ? new Date(sortedRates[0].date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Schema data
  const localBusinessSchema = selectedCity ? {
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
  } : null;
  
  const productSchema = selectedCity ? {
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
  } : null;

  return (
    <>
      {selectedCity && (
        <Helmet>
          {localBusinessSchema && (
            <script type="application/ld+json">
              {JSON.stringify(localBusinessSchema)}
            </script>
          )}
          {productSchema && (
            <script type="application/ld+json">
              {JSON.stringify(productSchema)}
            </script>
          )}
        </Helmet>
      )}
      
      <div className={showSpecialRates ? "p-6 mt-6 bg-white rounded-lg shadow-lg" : "dynamic-body p-4"}>
        {showSpecialRates && <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Special Rates</h2>}
        {selectedCity && (
          <div className="p-6 bg-gray-50 rounded-lg shadow-md mb-6">
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
                    {rateChange !== 0 && (
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
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 mt-4">
            <thead>
              <tr style={{ backgroundColor: '#F9BE0C' }}>
                <th
                  className="border border-gray-300 p-2 cursor-pointer"
                  onClick={() => requestSort('city')}
                >
                  Market
                </th>
                {showState && (
                  <th
                    className="border border-gray-300 p-2 cursor-pointer"
                    onClick={() => requestSort('state')}
                  >
                    State
                  </th>
                )}
                {showDate && (
                  <th
                    className="border border-gray-300 p-2 cursor-pointer"
                    onClick={() => requestSort('date')}
                  >
                    Date
                  </th>
                )}
                <th
                  className="border border-gray-300 p-2 cursor-pointer"
                  onClick={() => requestSort('rate')}
                >
                  Piece
                </th>
                {showPriceColumns && (
                  <>
                    <th className="border border-gray-300 p-2">Tray</th>
                    <th className="border border-gray-300 p-2">100 Pcs</th>
                    <th className="border border-gray-300 p-2">Peti</th>
                  </>
                )}
                {showAdmin && (
                  <th className="border border-gray-300 p-2">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((rate, index) => (
                <tr
                  key={`${rate.city}-${rate.date}-${index}`}
                  className={`${index % 2 === 0 ? 'bg-[#fffcdf]' : 'bg-[#fff1c8]'} hover:bg-[#ddfafe]`}
                >
                  <td className="border border-gray-300 p-2">
                    {rate.city ? (
                      <a href={`/${rate.city.toLowerCase()}-egg-rate`}>{rate.city}</a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  {showState && (
                    <td className="border border-gray-300 p-2">{rate.state}</td>
                  )}
                  {showDate && (
                    <td className="border border-gray-300 p-2">
                      {editingRate === rate.id ? (
                        <input
                          type="date"
                          name="date"
                          value={editedRate.date}
                          onChange={handleChange}
                          className="border border-gray-300 p-2 rounded w-full"
                        />
                      ) : (
                        rate.date
                      )}
                    </td>
                  )}
                  <td className="border border-gray-300 p-2">
                    {editingRate === rate.id ? (
                      <input
                        type="number"
                        name="rate"
                        value={editedRate.rate}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                      />
                    ) : (
                      `₹${parseFloat(rate.rate).toFixed(2)}`
                    )}
                  </td>
                  {showPriceColumns && (
                    <>
                      <td className="border border-gray-300 p-2">₹{(rate.rate * 30).toFixed(2)}</td>
                      <td className="border border-gray-300 p-2">₹{(rate.rate * 100).toFixed(2)}</td>
                      <td className="border border-gray-300 p-2">₹{(rate.rate * 210).toFixed(2)}</td>
                    </>
                  )}
                  {showAdmin && (
                    <td className="border border-gray-300 p-2 space-x-2">
                      {editingRate === rate.id ? (
                        <>
                          <button
                            onClick={handleSaveClick}
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelClick}
                            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(rate)}
                            className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete && onDelete(rate)}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="pagination mt-4 flex flex-wrap justify-center">
          {pages.map(number => (
            <button
              key={number}
              id={number}
              onClick={handleClick}
              className={`px-4 py-2 mx-1 mb-2 border rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-100'}`}
            >
              {number}
            </button>
          ))}
        </div>

        {showChart && <RateChart data={currentItems} chartType={chartType} />}

        {selectedCity && (
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
        )}
      </div>
    </>
  );
};

export default RateTable;