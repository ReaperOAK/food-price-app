import React, { useState, useMemo, useCallback } from 'react';
import PriceChart from './PriceChart';
import { Helmet } from 'react-helmet';
import TableHeader from './TableHeader';
import RateSummary from './RateSummary';
import TableRow from './TableRow';
import Pagination from './Pagination';
import MarketInfo from './MarketInfo';
import { clearApiCache } from '../../services/enhancedApi';

const EnhancedRateTable = ({ 
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
  isLoading = false,
  error = null,
  onRetry = null,
  canRetry = false
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

  // Enhanced error display component
  const ErrorDisplay = useCallback(() => (
    <div className={`${containerClasses} flex items-center justify-center p-8`}>
      <div className="text-center max-w-md">
        <div className="mb-4">
          <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Data Loading Failed
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error?.message || 'Unable to load egg rate data. This might be due to a temporary server issue.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          )}
          <button
            onClick={() => {
              clearApiCache();
              window.location.reload();
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Force Refresh
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          If the problem persists, please try refreshing the page or contact support.
        </p>
      </div>
    </div>
  ), [containerClasses, error, canRetry, onRetry]);

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
      <div className="p-4 text-center">
        <div className="inline-flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading latest egg rates...</span>
        </div>
      </div>
    </div>
  ), [containerClasses, headerClasses, TABLE_MIN_HEIGHT, ROW_HEIGHT]);

  // No data display component
  const NoDataDisplay = useCallback(() => (
    <div className={`${tableClasses} flex items-center justify-center p-8`}>
      <div className="text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Data Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {selectedCity || selectedState 
            ? `No egg rate data found for ${selectedCity || selectedState}.`
            : 'No egg rate data is currently available.'
          }
        </p>
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        )}
      </div>
    </div>
  ), [tableClasses, selectedCity, selectedState, canRetry, onRetry]);

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
  const pages = Array.from({ length: Math.ceil(rates?.length / itemsPerPage) }, (_, i) => i + 1);

  const requestSort = useCallback((key) => {
    if (externalHandleSort) {
      externalHandleSort(key);
    } else {
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
    [...sortedRates].sort((a, b) => new Date(b.date) - new Date(a.date)) :
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

  // Safe string conversion function
  const safeToLowerCase = (value) => {
    if (!value) return '';
    return String(value).toLowerCase();
  };

  // Schema data - memoized
  const localBusinessSchema = useMemo(() => selectedCity ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Egg Market ${selectedCity}`,
    "description": `Find today's egg rates in ${selectedCity}, ${selectedState}. Updated daily NECC egg prices.`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": String(selectedCity),
      "addressRegion": String(selectedState),
      "addressCountry": "IN"
    },
    "offers": {
      "@type": "Offer",
      "price": String(latestRate || 0),
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock"
    }
  } : null, [selectedCity, selectedState, latestRate]);

  const productSchema = useMemo(() => selectedCity ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Eggs in ${selectedCity}, ${selectedState}`,
    "description": `Fresh eggs available in ${selectedCity}, ${selectedState}. Check today's egg price.`,
    "offers": {
      "@type": "Offer",
      "url": `https://todayeggrates.com/${safeToLowerCase(selectedCity)}-egg-rate-today`,
      "priceCurrency": "INR",
      "price": String(latestRate || 0),
      "availability": "https://schema.org/InStock"
    }
  } : null, [selectedCity, selectedState, latestRate]);

  // Memoize the rendered content for better performance
  const content = useMemo(() => {
    if (isLoading) {
      return renderLoadingSkeleton();
    }

    if (error) {
      return <ErrorDisplay />;
    }

    if (!rates || rates?.length === 0) {
      return <NoDataDisplay />;
    }

    return (
      <>
        {selectedCity && !isLoading && (
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

          {!showSpecialRates && chartData?.length > 0 && (
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
              isLoading={isLoading}
            />
          </div>
        </div>
      </>
    );  }, [
    isLoading, error, rates, selectedCity, selectedState, showSpecialRates, chartData,
    latestRate, latestRateDate, rateChange, percentageChange, trayPrice,
    currentItems, currentPage, editedRate, editingRate, hoveredRow,
    localBusinessSchema, productSchema, renderLoadingSkeleton,
    containerClasses, headerClasses, showAdmin, showChart, showDate, showMarket, 
    showPriceColumns, showState, sortConfig, pages, getSortIcon, handleCancelClick, 
    handleChange, handleEditClick, handleSaveClick, onDelete, requestSort
  ]);

  return content;
};

export default React.memo(EnhancedRateTable);
