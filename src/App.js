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

// Use lazy loading for all pages to improve performance
const MainPage = lazy(() => import('./pages/MainPage'));
const PrivacyPolicy = lazy(() => import('./components/common/PrivacyPolicy'));
const TOS = lazy(() => import('./components/common/TOS'));
const Disclaimer = lazy(() => import('./components/common/Disclaimer'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LoginPage = lazy(() => import('./components/admin/LoginPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const WebStoriesList = lazy(() => import('./components/webstories/WebStoriesList'));
const WebStoryViewer = lazy(() => import('./components/webstories/WebStoryViewer'));



// Loading component for suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-blue-600 mb-2">Loading...</h2>
      <p className="text-gray-600">Please wait while we fetch the content</p>
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