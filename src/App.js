import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TOS from './components/TOS';
import Disclaimer from './components/Disclaimer';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import BlogPage from './components/BlogPage';
import blogs from './data/blogs'; // Import the blogs list

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Get the authentication state from local storage
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    // Update local storage when authentication state changes
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  return (
    <Router>
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
      </Routes>
    </Router>
  );
}

export default App;