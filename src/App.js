import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  useNavigate, 
  Navigate
} from 'react-router-dom';
import MainPage from './pages/MainPage';
import PrivacyPolicy from './components/common/PrivacyPolicy';
import TOS from './components/common/TOS';
import Disclaimer from './components/common/Disclaimer';
import AdminPage from './pages/AdminPage';
import LoginPage from './components/admin/LoginPage';
import BlogPage from './pages/BlogPage';
import blogs from './data/blogs'; // Import the blogs list
import ScrollToTop from './utils/ScrollToTop'; // Import ScrollToTop
import RedirectInterceptor from './components/common/RedirectInterceptor'; // Import RedirectInterceptor
import WebStoriesList from './components/webstories/WebStoriesList'; // Import WebStoriesList
import WebStoryViewer from './components/webstories/WebStoryViewer'; // Import WebStoryViewer

// Configure React Router future flags
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

// Special file handler components
const SitemapHandler = () => {
  useEffect(() => {
    // Redirect to the actual sitemap.txt file
    window.location.href = '/sitemap.txt';
  }, []);
  return null;
};

const WebstoriesSitemapHandler = () => {
  useEffect(() => {
    // Redirect to the actual webstories-sitemap.xml file
    window.location.href = '/webstories-sitemap.xml';
  }, []);
  return null;
};

const RobotsHandler = () => {
  useEffect(() => {
    // Redirect to the actual robots.txt file
    window.location.href = '/robots.txt';
  }, []);
  return null;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Get the authentication state from local storage
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [isSiteDisabled, setIsSiteDisabled] = useState(() => {
    // Get the site disabled state from local storage
    return localStorage.getItem('isSiteDisabled') === 'true';
  });

  useEffect(() => {
    // Update local storage when authentication state changes
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    // Update local storage when site disabled state changes
    localStorage.setItem('isSiteDisabled', isSiteDisabled);
  }, [isSiteDisabled]);

  const MaintenancePage = () => {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Site is under maintenance</h1>
      </div>
    );
  };

  const DisableSite = () => {
    const navigate = useNavigate();
    useEffect(() => {
      const token = new URLSearchParams(window.location.search).get('token');
      const validToken = 'ReaperOAK'; // Replace with your actual secret token

      if (token === validToken) {
        setIsSiteDisabled(true);
        navigate('/maintenance');
      } else {
        navigate('/');
      }
    }, [navigate]);

    return null;
  };

  if (isSiteDisabled) {
    return (
      <Router future={routerOptions.future}>
        <ScrollToTop /> {/* Include ScrollToTop */}
        <Routes>
          <Route path="*" element={<MaintenancePage />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router future={routerOptions.future}>
      <ScrollToTop /> {/* Include ScrollToTop */}
      <RedirectInterceptor /> {/* Include RedirectInterceptor to occasionally redirect navigation */}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/sitemap.txt" element={<SitemapHandler />} />
        <Route path="/webstories-sitemap.xml" element={<WebstoriesSitemapHandler />} />
        <Route path="/robots.txt" element={<RobotsHandler />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TOS />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/:city" element={<MainPage />} />
        <Route path="/state/:state" element={<MainPage />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/admin"
          element={isAuthenticated ? <AdminPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />}
        />
        <Route path="/blog/:link" element={<BlogPage blogs={blogs} />} />
        <Route path="/disable-site" element={<DisableSite />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/webstories" element={<WebStoriesList />} />
        <Route path="/webstory/:slug" element={<WebStoryViewer />} />
      </Routes>
    </Router>
  );
}

export default App;