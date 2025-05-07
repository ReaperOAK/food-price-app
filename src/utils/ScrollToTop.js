import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollRestoration component that safely handles scrolling with createBrowserRouter
 * Compatible with React Router v6.4+ using RouterProvider
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Only scroll to top for PUSH navigation types (not REPLACE or POP)
    // and when there's no hash fragment
    if (!hash && navigationType === 'PUSH') {
      window.scrollTo(0, 0);
    }
    
    // If there's a hash in the URL, scroll to the element with that ID
    if (hash) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 10);
    }
  }, [pathname, hash, navigationType]);

  return null;
};

export default ScrollToTop;