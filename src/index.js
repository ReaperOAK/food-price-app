import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import OptimizedImage from './components/common/OptimizedImage';

// Enhanced loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center animate-fade-in">
      <div className="w-16 h-16 mb-4 mx-auto">        <OptimizedImage 
          src="/logo.webp"
          alt="Loading..."
          className="w-full h-full object-contain"
          width={64}
          height={64}
          fetchpriority="high"
        />
      </div>
      <h2 className="text-xl font-semibold text-blue-600 mb-2 animate-slide-up">
        Loading Today's Egg Rates...
      </h2>
      <p className="text-gray-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
        Please wait while we fetch the latest egg prices
      </p>
    </div>
  </div>
);

// Progressive enhancement setup
const setupProgressiveEnhancement = async () => {
  // Detect browser capabilities
  const hasIntersectionObserver = 'IntersectionObserver' in window;
  const hasIdleCallback = 'requestIdleCallback' in window;
  
  // Load polyfills if needed
  if (!hasIntersectionObserver) {
    await import('intersection-observer');
  }
  if (!hasIdleCallback) {
    await import('requestidlecallback-polyfill');
  }

  // Preload critical assets
  const preloadAssets = () => {
    const criticalImages = ['/eggpic.webp', '/logo.webp'];
    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  };

  // Initialize after preloading
  const initializeApp = () => {
    // Setup performance monitoring
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'web-vital') {
            reportWebVitals({
              name: entry.name,
              value: entry.value,
              delta: entry.delta
            });
          }
        });
      });
      observer.observe({ entryTypes: ['web-vital', 'layout-shift', 'largest-contentful-paint'] });
    }
  };

  // Execute initialization
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadAssets();
      initializeApp();
    });
  } else {
    setTimeout(() => {
      preloadAssets();
      initializeApp();
    }, 1);
  }
};

// Load App with optimizations
const App = lazy(() => import('./App').then(module => {
  setupProgressiveEnhancement();
  return module;
}));

// Create root and render
ReactDOM.createRoot(document.getElementById('root')).render(
  <Suspense fallback={<LoadingFallback />}>
    <App />
  </Suspense>
);

// Monitor and report vitals
reportWebVitals(metric => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`${metric.name}:`, metric.value);
  }
  
  // Report to analytics in production
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('event', 'web_vitals', {
      metric_name: metric.name,
      metric_value: Math.round(metric.value),
      metric_delta: Math.round(metric.delta || 0),
      metric_rating: metric.rating
    });
  }
});

// Suppress console errors in production
if (process.env.NODE_ENV === 'production') {
  console.error = () => {};
  console.warn = () => {};
  // Preserve console.log for critical messages
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('[CRITICAL]')) {
      originalConsoleLog.apply(console, args);
    }
  };
}
