import React, { useCallback, useMemo, memo } from 'react';

const PageButton = memo(({ number, isCurrentPage, onClick, ariaLabel, children }) => (
  <button
    onClick={onClick}
    className={`min-w-[2.5rem] h-10 px-3 sm:px-4 border rounded transition-all duration-200 select-none
      ${isCurrentPage 
        ? 'bg-blue-700 text-white font-medium transform hover:bg-blue-800' 
        : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'}
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      disabled:opacity-50 disabled:cursor-not-allowed
      text-sm sm:text-base`}
    aria-label={ariaLabel}
    aria-current={isCurrentPage ? 'page' : undefined}
    disabled={isCurrentPage}
  >
    {children}
  </button>
));

PageButton.displayName = 'PageButton';

const Pagination = ({ currentPage, setCurrentPage, pages, isLoading = false }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (e.key === 'ArrowRight' && currentPage < pages?.length) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, pages?.length, setCurrentPage]);

  const paginationInfo = useMemo(() => {
    const totalPages = pages?.length;
    const startItem = ((currentPage - 1) * 10) + 1;
    const endItem = Math.min(currentPage * 10, totalPages * 10);
    return `Page ${currentPage} of ${totalPages} (Items ${startItem}-${endItem})`;
  }, [currentPage, pages?.length]);

  if (isLoading) {
    return (
      <div className="mt-6 flex justify-center items-center" aria-label="Loading pagination">
        <div className="animate-pulse flex gap-2">
          {[1, 2, 3].map(n => (
            <div key={n} className="w-10 h-10 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav 
      className="pagination mt-6 flex flex-col sm:flex-row flex-wrap justify-between items-center gap-4 px-2 sm:px-4" 
      role="navigation" 
      aria-label="Pagination navigation"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-2">
        {currentPage > 1 && (
          <PageButton
            onClick={() => setCurrentPage(currentPage - 1)}
            ariaLabel="Go to previous page"
            isCurrentPage={false}
          >
            <span aria-hidden="true">←</span>
            <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
          </PageButton>
        )}
        
        {pages.map(number => {
          const isCurrentPage = currentPage === number;
          const isNearCurrentPage = Math.abs(currentPage - number) <= 2;
          
          if (!isNearCurrentPage && number !== 1 && number !== pages?.length) {
            if (number === 2 || number === pages?.length - 1) {
              return (
                <span 
                  key={number} 
                  className="px-3 select-none text-gray-500"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }
            return null;
          }

          return (
            <PageButton
              key={number}
              number={number}
              onClick={() => setCurrentPage(number)}
              isCurrentPage={isCurrentPage}
              ariaLabel={`Go to page ${number}`}
            >
              {number}
            </PageButton>
          );
        })}

        {currentPage < pages?.length && (
          <PageButton
            onClick={() => setCurrentPage(currentPage + 1)}
            ariaLabel="Go to next page"
            isCurrentPage={false}
          >
            <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
            <span aria-hidden="true">→</span>
          </PageButton>
        )}
      </div>

      <div 
        className="text-sm text-gray-600 select-none hidden sm:block"
        aria-live="polite"
        aria-atomic="true"
      >
        {paginationInfo}
      </div>
    </nav>
  );
};

export default memo(Pagination);
