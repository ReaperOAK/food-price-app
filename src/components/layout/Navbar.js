import React, { useState, useMemo, memo, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../hooks/useTheme';
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
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { options, isLoading, error } = useLocationData();

  // Track navigation lock to prevent redundant navigations
  const navigationLock = useRef(false);

  // Handle scroll effects with optimized performance
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = lastScrollY > 20;
          setIsScrolled(scrolled);
          ticking = false;
        });
        ticking = true;
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Improved click outside handler for mobile menu
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Enhanced keyboard navigation and focus trap
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }

      if (e.key === 'Tab') {
        if (!e.shiftKey && document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        } else if (e.shiftKey && document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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

  // Memoize select styles with enhanced contrast and theme support
  const selectStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? '#1F2937' : 'white',
      borderColor: state.isFocused ? '#3B82F6' : isDark ? '#374151' : '#E5E7EB',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
      '&:hover': {
        borderColor: '#3B82F6',
      },
      padding: '0.5rem',
      borderRadius: '0.5rem',
      minHeight: '3rem',
      transition: 'all 0.2s ease',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: isDark ? '#1F2937' : 'white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      borderRadius: '0.5rem',
      overflow: 'hidden',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#3B82F6' 
        : state.isFocused 
          ? isDark ? '#374151' : '#EFF6FF'
          : isDark ? '#1F2937' : 'white',
      color: state.isSelected 
        ? 'white' 
        : isDark 
          ? '#E5E7EB'
          : '#1F2937',
      padding: '0.75rem 1rem',
      '&:active': {
        backgroundColor: '#2563EB',
      },
      cursor: 'pointer',
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? '#9CA3AF' : '#6B7280',
    }),
    loadingMessage: (base) => ({
      ...base,
      color: isDark ? '#9CA3AF' : '#6B7280',
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: isDark ? '#9CA3AF' : '#6B7280',
    }),
  }), [isDark]);

  return (
    <nav 
      ref={menuRef}
      className={`
        sticky top-0 z-50 
        ${isScrolled 
          ? isDark 
            ? 'bg-gray-900/95 shadow-lg shadow-gray-900/20' 
            : 'bg-white/95 shadow-lg'
          : isDark 
            ? 'bg-gray-900' 
            : 'bg-white'
        }
        backdrop-blur-lg
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
              ref={firstFocusableRef}
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
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
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
          <div 
            className={`
              md:w-64 w-full order-last md:order-none mt-4 md:mt-0
              ${menuOpen ? 'block' : 'hidden md:block'}
              transition-all duration-300 ease-in-out
            `}
          >
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
              ref={lastFocusableRef}
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={`
            ${menuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100' : 'max-h-0 opacity-0'}
            md:hidden overflow-hidden transition-all duration-300 ease-in-out
          `}
          aria-hidden={!menuOpen}
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
          onFocus={() => firstFocusableRef.current?.focus()}
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