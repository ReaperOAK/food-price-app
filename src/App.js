import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  useNavigate, 
  Navigate,
  useLocation
} from 'react-router-dom';

// Import non-lazy loading dependencies
import blogs from './data/blogs';
import ScrollToTop from './utils/ScrollToTop';

// Use React.lazy for code splitting and improved performance
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

// Static file handlers wrapped in a component that avoids navigation hooks
const StaticFileRedirect = ({ url }) => {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);
  return null;
};

// Wrapper component that contains all app routes and functionality
function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Auth state management
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [isSiteDisabled, setIsSiteDisabled] = useState(() => {
    return localStorage.getItem('isSiteDisabled') === 'true';
  });

  // Store auth state in localStorage
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('isSiteDisabled', isSiteDisabled);
  }, [isSiteDisabled]);

  // Disable site handler - extracted into a callback to avoid route conflicts
  const handleDisableSite = useCallback((token) => {
    if (token === 'ReaperOAK') {
      setIsSiteDisabled(true);
      navigate('/maintenance');
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Check for disable token in URL
  useEffect(() => {
    if (location.pathname === '/disable-site') {
      const token = new URLSearchParams(location.search).get('token');
      handleDisableSite(token);
    }
  }, [location.pathname, location.search, handleDisableSite]);

  const MaintenancePage = () => (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Site is under maintenance</h1>
    </div>
  );

  if (isSiteDisabled) {
    return <Route path="*" element={<MaintenancePage />} />;
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Main routes */}
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
          
          {/* Admin pages with auth protection */}
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route
            path="/admin"
            element={isAuthenticated ? <AdminPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" replace />}
          />
          
          {/* Content pages */}
          <Route path="/blog/:link" element={<BlogPage blogs={blogs} />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/webstories" element={<WebStoriesList />} />
          <Route path="/webstory/:slug" element={<WebStoryViewer />} />
          
          {/* Replace the separate disable-site route with a check in useEffect */}
          <Route path="/disable-site" element={<MainPage />} />
          
          {/* Catch all for 404s */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;