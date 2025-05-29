import React, { useState, useMemo, memo, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

import Logo from './navbar/Logo';
import NavigationLinks from './navbar/NavigationLinks';
import SearchBox from './navbar/SearchBox';
import useLocationData from './navbar/useLocationData';

const Navbar = memo(({ 
  setSelectedCity, 
  setSelectedState, 
  selectedCity, 
  selectedState 
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { options, isLoading, error } = useLocationData();

  // Track navigation lock to prevent redundant navigations
  const navigationLock = useRef(false);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside for mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [menuOpen]);

  // Standardize city names
  const standardizeCityName = useCallback((cityName) => {
    const lowerCityName = cityName.toLowerCase();
    if (lowerCityName === 'bangalore' || 
        lowerCityName === 'bangalore (cc)' || 
        lowerCityName === 'bengaluru (cc)' ||
        lowerCityName === 'bengaluru') {
      return 'Bengaluru';
    }
    return cityName;
  }, []);

  const handleChange = useCallback((selectedOption) => {
    if (!selectedOption || navigationLock.current) return;
    
    navigationLock.current = true;
    const { value, state } = selectedOption;
    
    const selectedCityName = standardizeCityName(value);
    setSelectedCity(selectedCityName);
    setSelectedState(state || '');
    
    requestAnimationFrame(() => {
      const path = `/${selectedCityName.toLowerCase()}-egg-rate`;
      if (location.pathname !== path) {
        navigate(path, { replace: true });
      }
      navigationLock.current = false;
    });
  }, [navigate, location.pathname, setSelectedCity, setSelectedState, standardizeCityName]);

  const handleHomeClick = useCallback((e) => {
    if (navigationLock.current) {
      e.preventDefault();
      return;
    }
    
    navigationLock.current = true;
    setSelectedCity('');
    setSelectedState('');
    
    if (location.pathname !== '/') {
      navigate('/');
    }
    
    requestAnimationFrame(() => {
      navigationLock.current = false;
    });
  }, [navigate, location.pathname, setSelectedCity, setSelectedState]);

  const handleCityClick = useCallback((city, e) => {
    if (navigationLock.current) {
      e?.preventDefault();
      return;
    }
    
    navigationLock.current = true;
    setSelectedCity(city);
    setSelectedState('');
    
    requestAnimationFrame(() => {
      const path = `/${city.toLowerCase()}-egg-rate`;
      if (location.pathname !== path) {
        navigate(path, { replace: true });
      }
      navigationLock.current = false;
    });
  }, [navigate, location.pathname, setSelectedCity, setSelectedState]);

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  // Memoize select styles with improved contrast
  const selectStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      backgroundColor: 'white',
      borderColor: state.isFocused ? '#2563EB' : '#E5E7EB',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#2563EB',
      },
      padding: '0.5rem',
      borderRadius: '0.5rem',
      minHeight: '3rem',
      transition: 'all 0.2s ease',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      borderRadius: '0.5rem',
      overflow: 'hidden',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#EFF6FF' : 'white',
      color: state.isSelected ? 'white' : '#1F2937',
      padding: '0.75rem 1rem',
      '&:active': {
        backgroundColor: '#1D4ED8',
      },
      cursor: 'pointer',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6B7280',
    }),
    loadingMessage: (base) => ({
      ...base,
      color: '#6B7280',
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: '#6B7280',
    }),
  }), []);

  return (
    <nav 
      ref={menuRef}
      className={`
        sticky top-0 z-50 
        ${isScrolled ? 'bg-white/95 dark:bg-gray-900/95' : 'bg-white dark:bg-gray-900'}
        shadow-lg backdrop-blur-lg
        transition-all duration-200
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 w-full max-w-7xl">
        <div className="flex flex-wrap justify-between items-center py-3 md:py-4">
          {/* Logo and mobile menu button */}
          <div className="flex justify-between items-center flex-1 md:flex-none">
            <Link 
              to="/" 
              onClick={handleHomeClick} 
              className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              aria-label="Go to homepage"
            >
              <Logo />
            </Link>
            <button
              className="md:hidden inline-flex items-center justify-center p-2
                         rounded-lg text-gray-700 hover:text-blue-600 
                         hover:bg-gray-100 dark:text-gray-300 dark:hover:text-blue-400
                         dark:hover:bg-gray-800 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 transition-colors duration-200"
              onClick={toggleMenu}
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavigationLinks 
              handleHomeClick={handleHomeClick} 
              handleCityClick={handleCityClick} 
            />
          </div>

          {/* Search Box */}
          <div className={`
            md:w-64 w-full order-last md:order-none mt-4 md:mt-0
            ${menuOpen ? 'block' : 'hidden md:block'}
          `}>
            <SearchBox
              options={options}
              selectedCity={selectedCity}
              selectedState={selectedState}
              handleChange={handleChange}
              isLoading={isLoading}
              error={error}
              selectStyles={selectStyles}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              isSearchFocused={isSearchFocused}
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={`
            ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
            md:hidden overflow-hidden transition-all duration-300 ease-in-out
          `}
        >
          <div className="flex flex-col space-y-2 pb-4">
            <NavigationLinks 
              handleHomeClick={handleHomeClick} 
              handleCityClick={handleCityClick} 
            />
          </div>
        </div>
      </div>

      {/* Focus trap for accessibility */}
      {menuOpen && (
        <div 
          tabIndex={0} 
          onFocus={() => setMenuOpen(false)}
          className="sr-only"
        >
          End of menu
        </div>
      )}
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;