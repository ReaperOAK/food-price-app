import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import MainPage from './components/MainPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TOS from './components/TOS';
import Disclaimer from './components/Disclaimer';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import BlogPage from './components/BlogPage';
import blogs from './data/blogs'; // Import the blogs list
import ScrollToTop from './ScrollToTop'; // Import ScrollToTop
import WebStoriesList from './components/WebStoriesList'; // Import WebStoriesList
import WebStoryViewer from './components/WebStoryViewer'; // Import WebStoryViewer

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
      <Router>
        <ScrollToTop /> {/* Include ScrollToTop */}
        <Routes>
          <Route path="*" element={<MaintenancePage />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <ScrollToTop /> {/* Include ScrollToTop */}
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