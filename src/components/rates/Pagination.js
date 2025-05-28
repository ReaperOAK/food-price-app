import React from 'react';

const Pagination = ({ currentPage, setCurrentPage, pages }) => {
  return (
    <div className="pagination mt-6 flex flex-wrap justify-center items-center gap-2" role="navigation" aria-label="Pagination">
      {currentPage > 1 && (
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-4 py-2 border rounded bg-white text-blue-700 hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
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
                ? 'bg-blue-600 text-white font-medium scale-110' 
                : 'bg-white text-blue-700 hover:bg-blue-50'}
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
          className="px-4 py-2 border rounded bg-white text-blue-700 hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Next page"
        >
          Next →
        </button>
      )}
    </div>
  );
};

export default Pagination;
