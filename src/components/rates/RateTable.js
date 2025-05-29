import React, { useState } from 'react';
import PriceChart from './PriceChart';
import { Helmet } from 'react-helmet';
import TableHeader from './TableHeader';
import RateSummary from './RateSummary';
import TableRow from './TableRow';
import Pagination from './Pagination';
import MarketInfo from './MarketInfo';

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

  // Constants for fixed dimensions to prevent CLS
  const TABLE_MIN_HEIGHT = '400px';
  const ROW_HEIGHT = '48px';
  const TABLE_WRAPPER_MIN_HEIGHT = '600px';
  const LOADING_ROWS = 5;

  const containerStyle = {
    minHeight: TABLE_WRAPPER_MIN_HEIGHT,
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease-in-out'
  };

  const tableStyle = {
    minHeight: TABLE_MIN_HEIGHT,
    width: '100%',
    backgroundColor: '#ffffff',
  };

  const headerStyle = {
    height: ROW_HEIGHT,
    backgroundColor: '#F9BE0C',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  };

  const cellStyle = {
    height: ROW_HEIGHT,
    padding: '12px 16px',
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  // Enhanced loading skeleton with fixed heights
  const renderLoadingSkeleton = () => (
    <div style={containerStyle} className="overflow-hidden rounded-lg shadow" role="status" aria-label="Loading egg rates">
      <div className="animate-pulse" style={{ minHeight: TABLE_MIN_HEIGHT }}>
        <div style={headerStyle} className="bg-gray-200 mb-2"></div>
        {[...Array(LOADING_ROWS)].map((_, index) => (
          <div 
            key={index} 
            style={{ ...cellStyle, height: ROW_HEIGHT }} 
            className="flex items-center border-t border-gray-100 space-x-4"
          >
            <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
            <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
            <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
            <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Show loading skeleton with fixed dimensions
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
      {/* Schema data handling */}
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

      {/* Main table container with fixed dimensions */}
      <div style={containerStyle} className="bg-gray-100 rounded-lg shadow-lg">
        {/* Special rates header */}
        {showSpecialRates && (
          <div className="p-6 bg-white rounded-t-lg">
            <h2 className="text-3xl font-bold text-center text-gray-800">Special Rates</h2>
            <p className="text-center text-gray-600 mt-2">Today's wholesale egg rates for special markets and bulk buyers</p>
          </div>
        )}

        {/* Rate Summary Section */}
        {!showSpecialRates && chartData.length > 0 && (
          <div className="bg-white rounded-t-lg">
            <RateSummary 
              latestRate={latestRate}
              latestRateDate={latestRateDate}
              rateChange={rateChange}
              percentageChange={percentageChange}
              trayPrice={trayPrice}
            />
          </div>
        )}

        {/* Table Section with fixed height */}
        <div className="overflow-x-auto bg-white rounded-lg" style={tableStyle}>
          <table className="min-w-full border border-gray-300" role="table" aria-label="Egg Rates Table">
            <thead className="sticky top-0 z-10" style={headerStyle}>
              <TableHeader 
                selectedCity={selectedCity}
                showMarket={showMarket}
                showState={showState}
                showDate={showDate}
                showPriceColumns={showPriceColumns}
                showSpecialRates={showSpecialRates}
                showAdmin={showAdmin}
                sortConfig={sortConfig}
                requestSort={requestSort}
                getSortIcon={getSortIcon}
              />
            </thead>
            <tbody>
              {currentItems.map((rate, index) => (
                <TableRow
                  key={`${rate.city}-${rate.date}-${index}`}
                  rate={rate}
                  index={index}
                  hoveredRow={hoveredRow}
                  selectedCity={selectedCity}
                  showMarket={showMarket}
                  showState={showState}
                  showDate={showDate}
                  showPriceColumns={showPriceColumns}
                  showSpecialRates={showSpecialRates}
                  showAdmin={showAdmin}
                  editingRate={editingRate}
                  editedRate={editedRate}
                  handleChange={handleChange}
                  handleEditClick={handleEditClick}
                  handleSaveClick={handleSaveClick}
                  handleCancelClick={handleCancelClick}
                  onDelete={onDelete}
                  setHoveredRow={setHoveredRow}
                  rowHeight={ROW_HEIGHT}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white rounded-b-lg">
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pages={pages}
          />
        </div>

        {/* Chart Section */}
        {showChart && (
          <div className="mt-6 bg-white rounded-lg p-4">            
            <PriceChart 
              data={currentItems}
              type={selectedCity ? 'line' : 'bar'}
              xKey={selectedCity ? 'date' : 'city'}
              yKey="rate"
              title={selectedCity ? `${selectedCity} Egg Price Trend` : 'Egg Rates by City'}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Market Info - Show for both specific city and general India view */}
        <div className="mt-6">
          <MarketInfo
            selectedCity={selectedCity}
            selectedState={selectedState || 'India'}
          />
        </div>
      </div>
    </>
  );
};

export default RateTable;