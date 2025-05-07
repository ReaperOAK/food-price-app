import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

// Import lazy-loaded App
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

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Suspense fallback={<LoadingFallback />}>
    <App />
  </Suspense>
);

// Performance measurement for optimization
reportWebVitals(metric => {
  // Send metrics to analytics if needed
  if (metric.name === 'FCP') {
    console.log('First Contentful Paint (FCP):', metric.value);
  }
  if (metric.name === 'LCP') {
    console.log('Largest Contentful Paint (LCP):', metric.value);
  }
});
