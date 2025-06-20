import React, { memo, useState, useEffect } from 'react';
import { formatPrice } from '../../utils/formatters';

const QuickInfo = memo(({ 
  todayRate, 
  trayPrice, 
  weeklyChange, 
  weeklyChangePercent,
  position = 'bottom-right', // Customizable position
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle responsive behavior using matchMedia for better performance
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateMobileState = (e) => setIsMobile(e.matches);
    
    // Set initial state
    setIsMobile(mediaQuery.matches);
    
    // Add listener for changes
    mediaQuery.addListener(updateMobileState);
    
    // Cleanup
    return () => mediaQuery.removeListener(updateMobileState);
  }, []);

  // Handle close
  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  // Position classes based on prop
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }[position];

  // Don't render if not visible or no data
  if (!isVisible || (!todayRate && !trayPrice)) return null;

  return (
    <div
      role="complementary"
      aria-label="Quick price information"
      className={`
        fixed ${positionClasses}
        ${isMobile ? 'w-[calc(100%-2rem)] mx-4' : 'max-w-xs w-full'}
        bg-white dark:bg-gray-800
        rounded-xl shadow-lg
        transform transition-all duration-300
        hover:scale-102 hover:shadow-xl
        focus-within:ring-2 focus-within:ring-blue-500
        border border-gray-200 dark:border-gray-700
        backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95
        z-50
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md
                   hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none
                   focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Close price information"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4 pb-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Quick Price Info
        </h2>
        <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
          Today
        </span>
      </div>

      {/* Content */}
      <div className="p-4 pt-3 space-y-3">
        <div className="flex justify-between items-center group">          <span className="text-sm text-gray-700 dark:text-gray-300">Single Egg:</span>
          <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
            ₹{formatPrice(todayRate)}
          </span>
        </div>

        <div className="flex justify-between items-center group">
          <span className="text-sm text-gray-700 dark:text-gray-300">Tray (30):</span>
          <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
            ₹{formatPrice(trayPrice)}
          </span></div>

        <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-700 dark:text-gray-300">Weekly Change:</span>
          <div className="flex items-center">
            <span className={`
              font-bold text-base
              ${weeklyChange > 0                ? 'text-green-700 dark:text-green-400' 
                : weeklyChange < 0 
                  ? 'text-red-700 dark:text-red-400' 
                  : 'text-gray-700 dark:text-gray-400'}
            `}>
              {weeklyChange !== 'N/A' && (weeklyChange > 0 ? '+' : '')}{weeklyChange}
              <span className="text-xs ml-1 opacity-75">
                ({weeklyChangePercent}%)
              </span>
            </span>
            {weeklyChange !== 0 && weeklyChange !== 'N/A' && (
              <span className="ml-2" aria-hidden="true">
                {weeklyChange > 0 ? '↑' : '↓'}
              </span>
            )}
          </div>
        </div>
        
        {/* Mini FAQ with semantic keywords */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">          <details className="text-xs text-gray-700 dark:text-gray-400">
            <summary className="cursor-pointer font-medium hover:text-gray-900 dark:hover:text-gray-200">
              Fresh Eggs in India Info ℹ️
            </summary>
            <div className="mt-1 space-y-1">
              <p>• Farm fresh eggs with protein rich content</p>
              <p>• Brown egg varieties and organic eggs available</p>
              <p>• Cage free eggs with omega 3 fatty acids</p>
              <p>• Daily fresh produce from local farms</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
});

QuickInfo.displayName = 'QuickInfo';

export default QuickInfo;
