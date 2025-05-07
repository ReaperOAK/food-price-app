import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that safely handles scrolling on route changes
 * Designed to prevent conflicts with React Router history
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const lastPathRef = useRef(pathname);

  // Prevent double-scrolling when rapidly navigating between pages
  useEffect(() => {
    // If pathname changed and there's no hash (anchor link)
    if (pathname !== lastPathRef.current && !hash) {
      // Use requestAnimationFrame to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        window.requestAnimationFrame(() => {
          try {
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          } catch (e) {
            // Fallback for older browsers
            window.scrollTo(0, 0);
          }
        });
      }, 10);
      
      lastPathRef.current = pathname;
      return () => clearTimeout(timeoutId);
    }
    
    // If there's a hash, scroll to the element with that ID
    if (hash) {
      const timeoutId = setTimeout(() => {
        try {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (e) {
          console.error("Error scrolling to hash:", e);
        }
      }, 10);
      
      return () => clearTimeout(timeoutId);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;