import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { debounce } from 'lodash';

// Create debounced function outside component to avoid recreation
const createDebouncedProgress = (contentId, setScrollProgress) => 
  debounce(() => {
    const contentElement = document.getElementById(contentId);
    if (!contentElement) return;
    
    const scrollPosition = window.scrollY;
    const totalHeight = contentElement.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollableHeight = totalHeight - windowHeight;
    
    const progress = Math.min((scrollPosition / scrollableHeight) * 100, 100);
    setScrollProgress(progress);
  }, 50);

const TableOfContents = memo(({ contentId, blogId, isSticky = false }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);
  const [scrollProgress, setScrollProgress] = useState(0);
  const observerRef = useRef(null);
  const mutationObserverRef = useRef(null);
  const tocRef = useRef(null);
  const debouncedProgressRef = useRef(null);

  // Initialize debounced scroll progress calculation
  useEffect(() => {
    debouncedProgressRef.current = createDebouncedProgress(contentId, setScrollProgress);
    return () => {
      if (debouncedProgressRef.current) {
        debouncedProgressRef.current.cancel();
      }
    };
  }, [contentId]);

  // Use the debounced function from ref
  const updateScrollProgress = useCallback(() => {
    if (debouncedProgressRef.current) {
      debouncedProgressRef.current();
    }
  }, []);

  useEffect(() => {
    const extractHeadings = () => {
      const contentElement = document.getElementById(contentId);
      if (!contentElement) return;
      
      const elements = contentElement.querySelectorAll('h2, h3');
      
      elements.forEach((element) => {
        if (!element.id) {
          const slugifiedText = (element.innerText
            .toLowerCase()||'')
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
          element.id = `${blogId}-heading-${slugifiedText}`;
        }

        // Add tabindex for keyboard navigation
        element.setAttribute('tabindex', '0');
      });
      
      const headingElements = Array.from(elements).map(element => ({
        id: element.id,
        text: element.innerText,
        level: element.tagName === 'H2' ? 2 : 3
      }));
      
      setHeadings(headingElements);

      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { 
          rootMargin: '0px 0px -80% 0px',
          threshold: [0, 0.25, 0.5, 0.75, 1] 
        }
      );
      
      elements.forEach(element => observerRef.current.observe(element));
    };

    extractHeadings();
    
    // Handle content changes
    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
    }
    
    const contentElement = document.getElementById(contentId);
    if (contentElement) {
      mutationObserverRef.current = new MutationObserver(
        debounce((mutations) => {
          const shouldUpdate = mutations.some(mutation => 
            mutation.type === 'childList' && 
            (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
          );
          
          if (shouldUpdate) {
            setTimeout(extractHeadings, 100);
          }
        }, 100)
      );
      
      mutationObserverRef.current.observe(contentElement, {
        childList: true,
        subtree: true
      });
    }

    // Add scroll event listener for progress
    window.addEventListener('scroll', updateScrollProgress);
    
    // Handle resize for responsiveness
    const handleResize = debounce(() => {
      setIsCollapsed(window.innerWidth < 768);
    }, 150);
    
    window.addEventListener('resize', handleResize);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', handleResize);
      handleResize.cancel();
    };
  }, [contentId, blogId, updateScrollProgress]);

  const scrollToHeading = useCallback((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleKeyDown = useCallback((e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToHeading(id);
    }
  }, [scrollToHeading]);

  if (headings.length === 0) return null;

  return (
    <nav
      ref={tocRef}
      className={`toc-container bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mb-6 transition-all duration-300 ease-in-out
        ${isSticky ? 'lg:sticky lg:top-24' : ''}
        ${isCollapsed ? 'max-h-16' : 'max-h-[80vh]'}
      `}
      aria-label="Table of contents"
    >
      <div
        className={`flex justify-between items-center cursor-pointer
          ${!isCollapsed && 'border-b border-gray-200 dark:border-gray-700 pb-3 mb-3'}`}
        onClick={toggleCollapse}
        onKeyDown={(e) => e.key === 'Enter' && toggleCollapse()}
        tabIndex={0}
        role="button"
        aria-expanded={!isCollapsed}
        aria-controls="toc-list"
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Table of Contents
        </h2>
        <button 
          aria-label={isCollapsed ? "Expand table of contents" : "Collapse table of contents"}
          className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div 
        className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 mb-3"
        role="progressbar"
        aria-valuenow={scrollProgress}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div 
          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      <div
        id="toc-list"
        className={`overflow-y-auto transition-all duration-300 ease-in-out ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[calc(80vh-8rem)] opacity-100'
        }`}
      >
        <ul className="space-y-2 mt-3">
          {headings.map((heading) => (
            <li 
              key={heading.id}
              className={`toc-item ${heading.level === 3 ? 'ml-4' : ''}`}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHeading(heading.id);
                }}
                onKeyDown={(e) => handleKeyDown(e, heading.id)}
                className={`block py-1 px-2 rounded-md text-${heading.level === 2 ? 'md' : 'sm'} 
                  ${activeId === heading.id
                    ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  } transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                aria-current={activeId === heading.id ? 'location' : undefined}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
});

TableOfContents.displayName = 'TableOfContents';

export default TableOfContents;