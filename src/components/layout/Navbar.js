import React, { useEffect, useState, useMemo, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { FaBars, FaTimes } from 'react-icons/fa';
import OptimizedImage from '../common/OptimizedImage';

// Memoize navigation links to prevent unnecessary re-renders
const NavigationLinks = memo(({ handleHomeClick, handleCityClick }) => (
  <>
    <Link
      to="/"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={handleHomeClick}
    >
      Home
    </Link>
    <Link
      to="/mumbai-egg-rate"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={(e) => handleCityClick('Mumbai', e)}
    >
      Mumbai
    </Link>
    <Link
      to="/kolkata-egg-rate"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={(e) => handleCityClick('Kolkata', e)}
    >
      Kolkata
    </Link>
    <Link
      to="/lucknow-egg-rate"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={(e) => handleCityClick('Lucknow', e)}
    >
      Lucknow
    </Link>
    <Link
      to="/barwala-egg-rate"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={(e) => handleCityClick('Barwala', e)}
    >
      Barwala
    </Link>
    <Link
      to="/hyderabad-egg-rate"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={(e) => handleCityClick('Hyderabad', e)}
    >
      Hyderabad
    </Link>
    <Link
      to="/chennai-egg-rate"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={(e) => handleCityClick('Chennai', e)}
    >
      Chennai
    </Link>
    <Link
      to="/webstories"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Web Stories
    </Link>
  </>
));

NavigationLinks.displayName = 'NavigationLinks';

// Memoized Logo component
const Logo = memo(() => (
  <div 
    className="logo-container relative w-48 h-16"
    style={{ maxWidth: '192px' }}
  >
    <OptimizedImage
      src="/logo.webp"
      alt="Food Price App Logo"
      className="w-full h-full object-contain"
      width={192}
      height={64}
      loading="eager"
      priority={true}
      sizes="(max-width: 768px) 150px, 192px"
    />
  </div>
));

Logo.displayName = 'Logo';

const Navbar = ({ setSelectedCity, setSelectedState, selectedCity, selectedState }) => {
  const [options, setOptions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Track navigation lock to prevent redundant navigations
  const navigationLock = React.useRef(false);

  // Fetch locations with error handling and loading state
  useEffect(() => {
    const abortController = new AbortController();

    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/php/api/location/get_states_and_cities.php', {
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }

        const data = await response.json();
        const { combinedOptions } = processLocationData(data);
        setOptions(combinedOptions);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching locations:', err);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();

    return () => abortController.abort();
  }, []);

  // Process location data
  const processLocationData = (data) => {
    const combinedOptions = [];
    const stateSet = new Set();
    const citySet = new Set();

    for (const state in data) {
      if (!stateSet.has(state)) {
        combinedOptions.push({
          value: state,
          label: state,
          type: 'state',
        });
        stateSet.add(state);
      }

      data[state].forEach(city => {
        let cityName = standardizeCityName(city);
        const cityLabel = `${cityName}, ${state}`;
        
        if (!citySet.has(cityLabel)) {
          combinedOptions.push({
            value: cityName,
            label: cityLabel,
            type: 'city',
          });
          citySet.add(cityLabel);
        }
      });
    }

    return { combinedOptions };
  };

  // Standardize city names
  const standardizeCityName = (cityName) => {
    const lowerCityName = cityName.toLowerCase();
    if (lowerCityName === 'bangalore' || 
        lowerCityName === 'bangalore (cc)' || 
        lowerCityName === 'bengaluru (cc)' ||
        lowerCityName === 'bengaluru') {
      return 'Bengaluru';
    }
    return cityName;
  };

  // Memoize handlers
  const handleChange = useMemo(() => {
    return (selectedOption) => {
      if (!selectedOption || navigationLock.current) return;
      
      navigationLock.current = true;
      const { type, label } = selectedOption;
      
      if (type === 'city') {
        const [city, state] = label.split(', ');
        let selectedCityName = standardizeCityName(city);
        
        setSelectedCity(selectedCityName);
        setSelectedState(state);
        
        requestAnimationFrame(() => {
          const path = `/${selectedCityName.toLowerCase()}-egg-rate`;
          if (location.pathname !== path) {
            navigate(path, { replace: true });
          }
          navigationLock.current = false;
        });
      } else if (type === 'state') {
        setSelectedCity('');
        setSelectedState(label);
        
        requestAnimationFrame(() => {
          const path = `/state/${label.toLowerCase()}-egg-rate`;
          if (location.pathname !== path) {
            navigate(path, { replace: true });
          }
          navigationLock.current = false;
        });
      }
    };
  }, [navigate, location.pathname, setSelectedCity, setSelectedState]);

  const handleHomeClick = useMemo(() => {
    return (e) => {
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
    };
  }, [navigate, location.pathname, setSelectedCity, setSelectedState]);

  const handleCityClick = useMemo(() => {
    return (city, e) => {
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
    };
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
          <div className="w-full md:w-64 mt-4 md:mt-0">
            <Select
              value={options.find(option => option.value === (selectedCity || selectedState))}
              onChange={handleChange}
              options={options}
              isLoading={isLoading}
              isDisabled={isLoading || error}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={selectStyles}
              aria-label="Search for city or state"
              inputId="location-select"
              aria-describedby="location-select-help"
              placeholder={isLoading ? "Loading locations..." : "Select City, State"}
              noOptionsMessage={() => error ? "Error loading locations" : "No locations found"}
              isClearable
              components={{
                IndicatorSeparator: () => null
              }}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <span id="location-select-help" className="sr-only">
              Select a city or state to view egg rates for that location
            </span>
          </div>
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