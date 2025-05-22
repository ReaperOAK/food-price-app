import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate
} from 'react-router-dom';

// Import the RootLayout component
import RootLayout from './components/layout/RootLayout';

// Import non-lazy dependencies
import blogs from './data/blogs';

// Use lazy loading with prefetch for all pages to improve performance
const MainPage = lazy(() => import(/* webpackPrefetch: true */ './pages/MainPage'));
const PrivacyPolicy = lazy(() => import(/* webpackPrefetch: true */ './components/common/PrivacyPolicy'));
const TOS = lazy(() => import(/* webpackPrefetch: true */ './components/common/TOS'));
const Disclaimer = lazy(() => import(/* webpackPrefetch: true */ './components/common/Disclaimer'));
const AdminPage = lazy(() => import(/* webpackChunkName: "admin" */ './pages/AdminPage'));
const LoginPage = lazy(() => import(/* webpackChunkName: "admin" */ './components/admin/LoginPage'));
const BlogPage = lazy(() => import(/* webpackChunkName: "blog" */ './pages/BlogPage'));
const WebStoriesList = lazy(() => import(/* webpackChunkName: "webstories" */ './components/webstories/WebStoriesList'));
const WebStoryViewer = lazy(() => import(/* webpackChunkName: "webstories" */ './components/webstories/WebStoryViewer'));



// Loading component for suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="animate-pulse p-4">
      {/* Header skeleton */}
      <div className="h-16 bg-gray-200 rounded-lg mb-4"></div>
      
      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6 mb-4"></div>
        
        {/* Card skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Static file redirects handled by plain HTML redirects
const StaticFileRedirect = ({ url }) => {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);
  return null;
};

// Main App component
function App() {
  // Auth state management with localStorage persistence
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [isSiteDisabled, setIsSiteDisabled] = useState(() => {
    return localStorage.getItem('isSiteDisabled') === 'true';
  });

  // Update localStorage when auth state changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('isSiteDisabled', isSiteDisabled);
  }, [isSiteDisabled]);

  // Maintenance page component
  const MaintenancePage = () => (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Site is under maintenance</h1>
    </div>
  );

  // Disable site handler component
  const DisableSite = () => {
    const handleDisable = () => {
      const token = new URLSearchParams(window.location.search).get('token');
      if (token === 'ReaperOAK') {
        setIsSiteDisabled(true);
        return <Navigate to="/maintenance" replace />;
      }
      return <Navigate to="/" replace />;
    };
    
    return handleDisable();
  };

  // Create routes based on site state
  const routes = isSiteDisabled 
    ? createRoutesFromElements(
        <Route path="*" element={<MaintenancePage />} />
      )
    : createRoutesFromElements(
        <Route element={<RootLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/:city" element={<MainPage />} />
          <Route path="/state/:state" element={<MainPage />} />
          
          {/* Static file redirects */}
          <Route path="/sitemap.txt" element={<StaticFileRedirect url="/sitemap.txt" />} />
          <Route path="/webstories-sitemap.xml" element={<StaticFileRedirect url="/webstories-sitemap.xml" />} />
          <Route path="/robots.txt" element={<StaticFileRedirect url="/robots.txt" />} />
          
          {/* Legal pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TOS />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          
          {/* Auth protected routes */}
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route
            path="/admin/*"
            element={isAuthenticated ? <AdminPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" replace />}
          />
          
          {/* Content pages */}
          <Route path="/blog/:link" element={<BlogPage blogs={blogs} />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/webstories" element={<WebStoriesList />} />
          <Route path="/webstory/:slug" element={<WebStoryViewer />} />
          <Route path="/disable-site" element={<DisableSite />} />
          
          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      );

  // Create router with defined routes and options to prevent history errors
  const router = createBrowserRouter(routes, {
    // These options help prevent history errors
    future: {
      v7_normalizeFormMethod: true,
    },
    // Disable browser history debug mode
    basename: "",
  });

  // Return router provider with suspense for code splitting
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;