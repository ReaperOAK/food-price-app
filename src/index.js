import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './utils/ScrollToTop';

// Lazy load the App component for better performance
const App = lazy(() => import('./App'));

// Loading component for suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-blue-600 mb-2">Loading Today's Egg Rates...</h2>
      <p className="text-gray-600">Please wait while we fetch the latest egg prices</p>
    </div>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);

// Performance measurement for optimization
reportWebVitals(metric => {
  // Send metrics to analytics
  if (metric.name === 'FCP') {
    console.log('First Contentful Paint (FCP):', metric.value);
  }
  if (metric.name === 'LCP') {
    console.log('Largest Contentful Paint (LCP):', metric.value);
  }
  // You can send this data to your analytics service
});

// Register service worker for PWA support
// Improved implementation to avoid conflicts with React Router
if ('serviceWorker' in navigator) {
  // Delay registration until after the page has loaded to avoid
  // interfering with the initial page navigation
  window.addEventListener('load', () => {
    // Use unregister first to clean up any problematic service workers
    navigator.serviceWorker.getRegistrations().then(registrations => {
      // Unregister all existing service workers first
      return Promise.all(
        registrations.map(registration => registration.unregister())
      );
    }).then(() => {
      // After unregistering old service workers, register the new one
      return navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
    }).then(registration => {
      console.log('SW registered successfully: ', registration);
    }).catch(error => {
      console.error('SW registration failed: ', error);
    });
  });
}
