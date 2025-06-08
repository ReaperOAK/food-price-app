import React, { useState, useMemo, useCallback } from 'react';
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
  // State management with memoization
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: selectedCity ? 'date' : 'city', direction: 'ascending' });
  const [editingRate, setEditingRate] = useState(null);
  const [editedRate, setEditedRate] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);

  // Constants for fixed dimensions to prevent CLS (Cumulative Layout Shift)
  const TABLE_MIN_HEIGHT = '400px';
  const ROW_HEIGHT = '48px';
  const TABLE_WRAPPER_MIN_HEIGHT = '600px';
  const LOADING_ROWS = 5;

  const containerClasses = useMemo(() => `
    min-h-[${TABLE_WRAPPER_MIN_HEIGHT}]
    bg-white dark:bg-gray-900
    rounded-lg shadow-lg
    border border-gray-200 dark:border-gray-700
    transition-all duration-300
    hover:shadow-xl
  `, [TABLE_WRAPPER_MIN_HEIGHT]);

  const tableClasses = useMemo(() => `
    min-h-[${TABLE_MIN_HEIGHT}]
    w-full
    bg-white dark:bg-gray-900
    border-collapse
    border-spacing-0
  `, [TABLE_MIN_HEIGHT]);

  const headerClasses = useMemo(() => `
    h-[${ROW_HEIGHT}]
    bg-amber-500 dark:bg-amber-600
    sticky top-0
    z-10
    border-b border-amber-600 dark:border-amber-700
  `, [ROW_HEIGHT]);
  // Enhanced loading skeleton
  const renderLoadingSkeleton = useCallback(() => (
    <div className={`${containerClasses} animate-pulse`} role="status" aria-label="Loading egg rates">
      <div style={{ minHeight: TABLE_MIN_HEIGHT }}>
        <div className={headerClasses}></div>
        {[...Array(LOADING_ROWS)].map((_, index) => (
          <div 
            key={index} 
            style={{ height: ROW_HEIGHT }}
            className="p-4 flex items-center border-t border-gray-100 dark:border-gray-800 space-x-4"
          >
            <div className="w-1/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-1/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-1/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-1/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  ), [containerClasses, headerClasses]);

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
  const requestSort = useCallback((key) => {
    if (externalHandleSort) {
      externalHandleSort(key);
    } else {
      // Local sort logic moved inside useCallback
      let direction = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setSortConfig({ key, direction });
    }
  }, [externalHandleSort, sortConfig]);

  const handleEditClick = useCallback((rate) => {
    setEditingRate(rate.id);
    setEditedRate(rate);
  }, []);

  const handleSaveClick = useCallback(() => {
    if (onEdit) {
      onEdit(editedRate);
    }
    setEditingRate(null);
  }, [onEdit, editedRate]);
  const handleCancelClick = useCallback(() => {
    setEditingRate(null);
    setEditedRate({});
  }, []);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditedRate((prevRate) => ({
      ...prevRate,
      [name]: value,
    }));
  }, []);

  // Sort icon helper function
  const getSortIcon = useCallback((columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-amber-800 dark:text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d={sortConfig.direction === 'ascending' 
            ? "M8 7l4-4m0 0l4 4m-4-4v18" 
            : "M16 17l-4 4m0 0l-4-4m4 4V3"} />
      </svg>
    );
  }, [sortConfig]);

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
  const trayPrice = latestRate * 30;  const latestRateDate = sortedRates[0]?.date ? 
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
  // Safe string conversion function to prevent toLowerCase errors
  const safeToLowerCase = (value) => {
    if (!value) return '';
    return String(value).toLowerCase();
  };
  // Safe stringify function to prevent React Helmet errors
  // eslint-disable-next-line no-unused-vars
  const safeStringify = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value.map(item => safeStringify(item)).join(', ');
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    }
    return String(value);
  };  // Schema data - memoized local business schema
  const localBusinessSchema = useMemo(() => selectedCity ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Egg Market ${selectedCity}`,
    "description": `Find today's egg rates in ${selectedCity}, ${selectedState}. Updated daily NECC egg prices and wholesale egg rates.`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": String(selectedCity),
      "addressRegion": String(selectedState),
      "addressCountry": "IN"
    },
    "image": "https://todayeggrates.com/eggpic.webp",    "priceRange": "₹₹",
    "telephone": "+91-XXXXXXXXXX",
    "url": `https://todayeggrates.com/${safeToLowerCase(selectedCity)}-egg-rate`,
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
          "price": String(latestRate || 0),
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
        }
      }
    }
  } : null, [selectedCity, selectedState, latestRate]);    const productSchema = useMemo(() => selectedCity ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Eggs in ${selectedCity}, ${selectedState}`,
    "description": `Fresh eggs available in ${selectedCity}, ${selectedState}. Check today's egg price.`,
    "image": "https://todayeggrates.com/eggpic.webp",    "offers": {
      "@type": "Offer",
      "url": `https://todayeggrates.com/${safeToLowerCase(selectedCity)}-egg-rate`,
      "priceCurrency": "INR",
      "price": String(latestRate || 0),
      "priceValidUntil": new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "254"
    }
  } : null, [selectedCity, selectedState, latestRate]);

  // Memoize the rendered content for better performance
  const content = useMemo(() => {
    if (isLoading) {
      return renderLoadingSkeleton();
    }

    if (!rates || rates.length === 0) {
      return (
        <div className={`${tableClasses} flex items-center justify-center p-8`}>
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      );
    }

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

        <div className={containerClasses}>
          {showSpecialRates && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
                Special Rates
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                Today's wholesale egg rates for special markets and bulk buyers
              </p>
            </div>
          )}

          {!showSpecialRates && chartData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-t-lg">
              <RateSummary 
                latestRate={latestRate}
                latestRateDate={latestRateDate}
                rateChange={rateChange}
                percentageChange={percentageChange}
                trayPrice={trayPrice}
              />
            </div>
          )}

          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg">
            <table 
              className="min-w-full border-collapse" 
              role="table" 
              aria-label="Egg Rates Table"
            >
              <thead className={headerClasses}>
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
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
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

          <div className="bg-white dark:bg-gray-800 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pages={pages}
              isLoading={isLoading}
            />
          </div>

          {showChart && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">            
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

          <div className="mt-6">
            <MarketInfo
              selectedCity={selectedCity}
              selectedState={selectedState || 'India'}
            />
          </div>
        </div>
      </>
    );  }, [
    // Data and loading states
    isLoading, rates, selectedCity, selectedState, showSpecialRates, chartData,
    latestRate, latestRateDate, rateChange, percentageChange, trayPrice,
    
    // UI states and editing
    currentItems, currentPage, editedRate, editingRate, hoveredRow,
    
    // Schema data
    localBusinessSchema, productSchema,
      // Event handlers and callbacks
    handleSaveClick, onDelete, renderLoadingSkeleton, requestSort,
    handleCancelClick, handleChange, handleEditClick,
    
    // Configuration and styling
    containerClasses, headerClasses, tableClasses, getSortIcon,
    
    // Show/hide flags
    showAdmin, showChart, showDate, showMarket, showPriceColumns, showState,
    
    // Sorting configuration
    sortConfig,
    
    // Pagination
    pages
  ]);

  return content;
};

export default React.memo(RateTable);