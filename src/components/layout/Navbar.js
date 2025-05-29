import React, { useState, useMemo, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

import Logo from './navbar/Logo';
import NavigationLinks from './navbar/NavigationLinks';
import SearchBox from './navbar/SearchBox';
import useLocationData from './navbar/useLocationData';

const Navbar = ({ setSelectedCity, setSelectedState, selectedCity, selectedState }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { options, isLoading, error } = useLocationData();

  // Track navigation lock to prevent redundant navigations
  const navigationLock = React.useRef(false);

  // Standardize city names
  const standardizeCityName = useMemo(() => (cityName) => {
    const lowerCityName = cityName.toLowerCase();
    if (lowerCityName === 'bangalore' || 
        lowerCityName === 'bangalore (cc)' || 
        lowerCityName === 'bengaluru (cc)' ||
        lowerCityName === 'bengaluru') {
      return 'Bengaluru';
    }
    return cityName;
  }, []);

  const handleChange = useMemo(() => (selectedOption) => {
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

  const handleHomeClick = useMemo(() => (e) => {
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

  const handleCityClick = useMemo(() => (city, e) => {
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

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Memoize select styles
  const selectStyles = useMemo(() => ({
    control: (base) => ({
      ...base,
      backgroundColor: 'white',
      borderColor: '#E5E7EB',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#3B82F6',
      },
      padding: '0.5rem',
      borderRadius: '0.5rem',
      minHeight: '3rem',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#EFF6FF' : 'white',
      color: state.isSelected ? 'white' : '#1F2937',
      '&:active': {
        backgroundColor: '#2563EB',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6B7280',
    }),
  }), []);

  return (
    <nav 
      className="sticky top-0 z-50 bg-white shadow-lg"
      style={{ backdropFilter: 'blur(8px)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 w-full max-w-7xl">
        <div className="flex flex-wrap justify-between items-center py-4">
          {/* Logo and mobile menu button */}
          <div className="flex justify-between items-center flex-1 md:flex-none">
            <Link 
              to="/" 
              onClick={handleHomeClick} 
              className="flex-shrink-0"
              aria-label="Go to homepage"
            >
              <Logo />
            </Link>
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <NavigationLinks handleHomeClick={handleHomeClick} handleCityClick={handleCityClick} />
          </div>

          {/* Search Box */}
          <SearchBox
            options={options}
            selectedCity={selectedCity}
            selectedState={selectedState}
            handleChange={handleChange}
            isLoading={isLoading}
            error={error}
            selectStyles={selectStyles}
          />
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={`${
            menuOpen ? 'block' : 'hidden'
          } md:hidden pb-4`}
        >
          <div className="flex flex-col space-y-2">
            <NavigationLinks handleHomeClick={handleHomeClick} handleCityClick={handleCityClick} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default memo(Navbar);