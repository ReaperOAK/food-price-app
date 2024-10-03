import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import StateList from './components/StateList';
import StatePage from './components/StatePage';
// @df8cZ5v db password
// https://todayeggrates.com/php

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
        <Route path="/:city" element={<MainPage />} />
        <Route path="/state/:state" element={<MainPage />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/admin"
          element={isAuthenticated ? <AdminPage setIsAuthenticated={setIsAuthenticated} /> : <LoginPage setIsAuthenticated={setIsAuthenticated} />}
        />
      </Routes>
    </Router>
  );
}

export default App;