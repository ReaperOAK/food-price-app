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
  selectedState = '',
  showMarket = true,
  isLoading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: selectedCity ? 'date' : 'city', direction: 'ascending' });
  const [editingRate, setEditingRate] = useState(null);
  const [editedRate, setEditedRate] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);

  const tableStyle = {
    minHeight: '400px',
    width: '100%',
    backgroundColor: '#ffffff',
  };

  const headerStyle = {
    height: '48px',
    backgroundColor: '#f3f4f6',
  };

  const cellStyle = {
    height: '48px',
    padding: '12px 16px',
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const renderLoadingSkeleton = () => (
    <div style={tableStyle} className="overflow-hidden rounded-lg shadow">
      <div className="animate-pulse">
        <div style={headerStyle} className="bg-gray-200"></div>
        {[...Array(5)].map((_, index) => (
          <div key={index} style={cellStyle} className="flex items-center border-t border-gray-200">
            <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
            <div className="w-1/4 h-4 ml-4 bg-gray-200 rounded"></div>
            <div className="w-1/4 h-4 ml-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Show loading skeleton
  if (isLoading) {
    return renderLoadingSkeleton();
  }

  // Handle empty data
  if (!rates || rates.length === 0) {
    return (
      <div style={tableStyle} className="flex items-center justify-center text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  // Sort rates
  const sortedRates = externalHandleSort ? rates : [...rates].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRates.slice(indexOfFirstItem, indexOfLastItem);
  const pages = Array.from({ length: Math.ceil(rates.length / itemsPerPage) }, (_, i) => i + 1);
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
  // Prepare chart data
  const chartData = selectedCity ? 
    // For city view, use all data sorted by date
    [...sortedRates].sort((a, b) => new Date(b.date) - new Date(a.date)) :
    // For overview, use the latest rate for each city
    Object.values(sortedRates.reduce((acc, curr) => {
      if (!acc[curr.city] || new Date(curr.date) > new Date(acc[curr.city].date)) {
        acc[curr.city] = curr;
      }
      return acc;
    }, {}));

  // Calculate metrics for the header
  const latestRate = sortedRates[0]?.rate || 0;
  const previousRate = sortedRates[1]?.rate || latestRate;
  const rateChange = latestRate - previousRate;
  const percentageChange = previousRate ? (rateChange / previousRate) * 100 : 0;
  const trayPrice = latestRate * 30;
  const latestRateDate = sortedRates[0]?.date ? 
    new Date(sortedRates[0].date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 
    new Date().toLocaleDateString('en-US', {
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
      
      
      {/* Table section */}
      <div className={showSpecialRates ? "bg-white rounded-lg shadow-lg overflow-x-auto" : "bg-gray-100 rounded-lg shadow-lg overflow-x-auto"}>
        {showSpecialRates && (
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Special Rates</h2>
            <p className="text-center text-gray-600 mb-6">Today's wholesale egg rates for special markets and bulk buyers</p>
          </div>
        )}

        {/* Rate Summary Section */}
        {!showSpecialRates && chartData.length > 0 && (
          <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600 mb-2">Last Updated: {latestRateDate}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-gray-600">Current Rate</div>
                <div className="text-xl font-semibold">₹{latestRate.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-600">Price Change</div>
                <div className={`text-xl font-semibold ${rateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {rateChange >= 0 ? '+' : ''}{rateChange.toFixed(2)} ({percentageChange.toFixed(1)}%)
                </div>
              </div>
              <div>
                <div className="text-gray-600">Tray Price (30 eggs)</div>
                <div className="text-xl font-semibold">₹{trayPrice.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 mt-4" role="table" aria-label="Egg Rates Table">
            <thead className="sticky top-0 z-10">
              <tr style={{ backgroundColor: '#F9BE0C' }}>
                {(!selectedCity && showMarket) && (
                  <th
                    className="border border-gray-300 p-2 cursor-pointer hover:bg-yellow-500 transition-colors duration-200"
                    onClick={() => requestSort('city')}
                    role="columnheader"
                    aria-sort={sortConfig.key === 'city' ? sortConfig.direction : 'none'}
                  >
                    <div className="flex items-center justify-between">
                      <span>{showSpecialRates ? 'Market Location' : 'Market'}</span>
                      <span className="text-xs ml-1">{getSortIcon('city')}</span>
                    </div>
                  </th>
                )}
                {showState && (
                  <th
                    className="border border-gray-300 p-2 cursor-pointer hover:bg-yellow-500 transition-colors duration-200"
                    onClick={() => requestSort('state')}
                    role="columnheader"
                    aria-sort={sortConfig.key === 'state' ? sortConfig.direction : 'none'}
                  >
                    <div className="flex items-center justify-between">
                      <span>State</span>
                      <span className="text-xs ml-1">{getSortIcon('state')}</span>
                    </div>
                  </th>
                )}
                {showDate && (
                  <th
                    className="border border-gray-300 p-2 cursor-pointer hover:bg-yellow-500 transition-colors duration-200"
                    onClick={() => requestSort('date')}
                    role="columnheader"
                    aria-sort={sortConfig.key === 'date' ? sortConfig.direction : 'none'}
                  >
                    <div className="flex items-center justify-between">
                      <span>Date</span>
                      <span className="text-xs ml-1">{getSortIcon('date')}</span>
                    </div>
                  </th>
                )}
                <th
                  className="border border-gray-300 p-2 cursor-pointer hover:bg-yellow-500 transition-colors duration-200"
                  onClick={() => requestSort('rate')}
                  role="columnheader"
                  aria-sort={sortConfig.key === 'rate' ? sortConfig.direction : 'none'}
                >
                  <div className="flex items-center justify-between">
                    <span>Rate Per Piece</span>
                    <span className="text-xs ml-1">{getSortIcon('rate')}</span>
                  </div>
                </th>
                {showPriceColumns && (
                  <>
                    <th 
                      className="border border-gray-300 p-2"
                      role="columnheader"
                    >
                      <div className="flex items-center justify-between">
                        <span>Tray Price (30)</span>
                        <span className="text-xs text-gray-500 ml-1" title="Calculated value">📊</span>
                      </div>
                    </th>
                    {!showSpecialRates && (
                      <>
                        <th 
                          className="border border-gray-300 p-2"
                          role="columnheader"
                        >
                          <div className="flex items-center justify-between">
                            <span>Price (100 Pcs)</span>
                            <span className="text-xs text-gray-500 ml-1" title="Calculated value">📊</span>
                          </div>
                        </th>
                        <th 
                          className="border border-gray-300 p-2"
                          role="columnheader"
                        >
                          <div className="flex items-center justify-between">
                            <span>Peti (210)</span>
                            <span className="text-xs text-gray-500 ml-1" title="Calculated value">📊</span>
                          </div>
                        </th>
                      </>
                    )}
                  </>
                )}
                {showAdmin && (
                  <th 
                    className="border border-gray-300 p-2"
                    role="columnheader"
                  >Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((rate, index) => (
                <tr
                  key={`${rate.city}-${rate.date}-${index}`}
                  className={`
                    ${index % 2 === 0 ? 'bg-[#fffcdf]' : 'bg-[#fff1c8]'}
                    hover:bg-[#ddfafe]
                    ${hoveredRow === index ? 'bg-[#ddfafe]' : ''}
                  `}
                  style={{ minHeight: '48px', height: '48px' }}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                  role="row"
                >
                  {(!selectedCity && showMarket) && (
                    <td className="border border-gray-300 p-2 w-1/4" style={{ minHeight: '48px' }} role="cell">
                      {rate.city ? (
                        <a 
                          href={`/${rate.city.toLowerCase()}-egg-rate`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {rate.city}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  )}
                  {showState && (
                    <td className="border border-gray-300 p-2 w-1/4" style={{ minHeight: '48px' }} role="cell">
                      {rate.state}
                    </td>
                  )}
                  {showDate && (
                    <td className="border border-gray-300 p-2 w-1/4" style={{ minHeight: '48px' }} role="cell">
                      {editingRate === rate.id ? (
                        <input
                          type="date"
                          name="date"
                          value={editedRate.date}
                          onChange={handleChange}
                          className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          aria-label="Edit date"
                        />
                      ) : (
                        <span title={`Last updated: ${rate.date}`}>{rate.date}</span>
                      )}
                    </td>
                  )}
                  <td className="border border-gray-300 p-2 w-1/4" style={{ minHeight: '48px' }} role="cell">
                    {editingRate === rate.id ? (
                      <input
                        type="number"
                        name="rate"
                        value={editedRate.rate}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Edit rate"
                        step="0.01"
                      />
                    ) : (
                      <span className="font-medium">₹{parseFloat(rate.rate).toFixed(2)}</span>
                    )}
                  </td>
                  {showPriceColumns && (
                    <>
                      <td className="border border-gray-300 p-2 w-1/4" style={{ minHeight: '48px' }} role="cell">
                        <span title="Price for 30 eggs">₹{(rate.rate * 30).toFixed(2)}</span>
                      </td>
                      {!showSpecialRates && (
                        <>
                          <td className="border border-gray-300 p-2 w-1/4" style={{ minHeight: '48px' }} role="cell">
                            <span title="Price for 100 eggs">₹{(rate.rate * 100).toFixed(2)}</span>
                          </td>
                          <td className="border border-gray-300 p-2 w-1/4" style={{ minHeight: '48px' }} role="cell">
                            <span title="Price for 210 eggs">₹{(rate.rate * 210).toFixed(2)}</span>
                          </td>
                        </>
                      )}
                    </>
                  )}
                  {showAdmin && (
                    <td className="border border-gray-300 p-2 space-x-2" role="cell">
                      {editingRate === rate.id ? (
                        <>
                          <button
                            onClick={handleSaveClick}
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                            aria-label="Save changes"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelClick}
                            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                            aria-label="Cancel editing"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(rate)}
                            className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                            aria-label={`Edit ${rate.city} rate`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete && onDelete(rate)}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                            aria-label={`Delete ${rate.city} rate`}
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
          <div className="pagination mt-6 flex flex-wrap justify-center items-center gap-2" role="navigation" aria-label="Pagination">
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-4 py-2 border rounded bg-white text-blue-500 hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                aria-label="Previous page"
              >
                ← Previous
              </button>
            )}
            
            {pages.map(number => {
              const isCurrentPage = currentPage === number;
              const isNearCurrentPage = Math.abs(currentPage - number) <= 2;
              
              if (!isNearCurrentPage && number !== 1 && number !== pages.length) {
                if (number === 2 || number === pages.length - 1) {
                  return <span key={number} className="px-4 py-2">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`px-4 py-2 border rounded transition-all duration-200
                    ${isCurrentPage 
                      ? 'bg-blue-500 text-white font-medium scale-110' 
                      : 'bg-white text-blue-500 hover:bg-blue-50'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`
                  }
                  aria-label={`Page ${number}`}
                  aria-current={isCurrentPage ? 'page' : undefined}
                >
                  {number}
                </button>
              );
            })}

            {currentPage < pages.length && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-4 py-2 border rounded bg-white text-blue-500 hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                aria-label="Next page"
              >
                Next →
              </button>
            )}
          </div>

        {showChart && (
          <RateChart 
            data={currentItems} 
            chartType={selectedCity ? 'line' : 'bar'} 
            xAxisKey={selectedCity ? 'date' : 'city'}
            title={selectedCity ? `${selectedCity} Egg Price Trend` : 'Egg Rates by City'}
            showLine={selectedCity}
          />
        )}

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