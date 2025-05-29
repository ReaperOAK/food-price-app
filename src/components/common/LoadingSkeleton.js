import React, { memo } from 'react';

const LoadingSkeleton = memo(({ rows = 4, variant = 'default' }) => {
  const baseClasses = {
    wrapper: "max-w-4xl mx-auto mb-8 relative animate-pulse",
    container: "bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden",
    header: "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-6 min-h-[200px] flex flex-col justify-center relative",
    placeholder: "bg-white/20 dark:bg-gray-700/20 rounded animate-pulse",
    gridContainer: "p-6 grid grid-cols-2 md:grid-cols-4 gap-4",
  };

  const variants = {
    default: {
      title: "h-12 w-3/4",
      subtitle: "h-8 w-1/2",
      description: "h-12 w-2/3",
    },
    compact: {
      title: "h-8 w-2/3",
      subtitle: "h-6 w-1/2",
      description: "h-8 w-1/2",
    },
    expanded: {
      title: "h-16 w-5/6",
      subtitle: "h-10 w-2/3",
      description: "h-14 w-3/4",
    }
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <div 
      role="status" 
      aria-label="Loading content"
      className={baseClasses.wrapper}
    >
      <div className={baseClasses.container}>
        <div className={baseClasses.header}>
          {/* Title placeholder */}
          <div 
            className={`${baseClasses.placeholder} ${selectedVariant.title} mx-auto mb-4`}
            style={{ minHeight: variant === 'compact' ? '32px' : '48px' }}
            aria-hidden="true"
          />
          {/* Subtitle placeholder */}
          <div 
            className={`${baseClasses.placeholder} ${selectedVariant.subtitle} mx-auto mb-2`}
            style={{ minHeight: variant === 'compact' ? '24px' : '32px' }}
            aria-hidden="true"
          />
          {/* Description placeholder */}
          <div 
            className={`${baseClasses.placeholder} ${selectedVariant.description} mx-auto`}
            style={{ minHeight: variant === 'compact' ? '32px' : '48px' }}
            aria-hidden="true"
          />
        </div>

        <div className={baseClasses.gridContainer}>
          {[...Array(rows)].map((_, i) => (
            <div 
              key={i} 
              className="text-center py-4 transition-all duration-200"
              style={{ 
                minHeight: variant === 'compact' ? '64px' : '80px',
                height: variant === 'compact' ? '64px' : '80px'
              }}
            >
              <div 
                className={`${baseClasses.placeholder} bg-gray-200 dark:bg-gray-700 w-1/2 mx-auto mb-2`}
                style={{ 
                  minHeight: variant === 'compact' ? '12px' : '16px',
                  height: variant === 'compact' ? '12px' : '16px'
                }}
                aria-hidden="true"
              />
              <div 
                className={`${baseClasses.placeholder} bg-gray-200 dark:bg-gray-700 w-2/3 mx-auto`}
                style={{ 
                  height: variant === 'compact' ? '24px' : '32px'
                }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Accessibility announcement */}
      <span className="sr-only">Loading...</span>
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

export default LoadingSkeleton;
