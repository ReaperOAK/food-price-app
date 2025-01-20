import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import MainPage from './components/MainPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TOS from './components/TOS';
import Disclaimer from './components/Disclaimer';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import BlogPage from './components/BlogPage';
import blogs from './data/blogs'; // Import the blogs list
import ScrollToTop from './ScrollToTop'; // Import ScrollToTop

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
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TOS />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/:city" element={<MainPage />} />
        <Route path="/state/:state" element={<MainPage />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/admin"
          element={isAuthenticated ? <AdminPage setIsAuthenticated={setIsAuthenticated} /> : <LoginPage setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/blog/:link" element={<BlogPage blogs={blogs} />} />
        <Route path="/disable-site" element={<DisableSite />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
      </Routes>
    </Router>
  );
}

export default App;