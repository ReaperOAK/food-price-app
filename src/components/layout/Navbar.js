import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ setSelectedCity, setSelectedState, selectedCity, selectedState }) => {
  const [options, setOptions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const logoPaths = [
    '/logo.webp',
  ];

  // Track navigation lock to prevent redundant navigations
  const navigationLock = React.useRef(false);
  
  useEffect(() => {
    fetch('/php/api/location/get_states_and_cities.php')
      .then(response => response.json())
      .then(data => {
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
            // Standardize city names
            let cityName = city;
            // Case-insensitive check for bengaluru/bangalore variants
            if (cityName.toLowerCase() === 'bangalore' || 
                cityName.toLowerCase() === 'bangalore (cc)' || 
                cityName.toLowerCase() === 'bengaluru (cc)' ||
                cityName.toLowerCase() === 'bengaluru') {
              cityName = 'Bengaluru'; // Always use this capitalization
            }
            
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
        setOptions(combinedOptions);
      })
      .catch(error => console.error('Error fetching states and cities:', error));
  }, []);

  const handleChange = (selectedOption) => {
    if (!selectedOption || navigationLock.current) return;
    
    navigationLock.current = true;
    const { type, label } = selectedOption;
    
    if (type === 'city') {
      const [city, state] = label.split(', ');
      let selectedCityName = city;
      
      // Case-insensitive check for bengaluru/bangalore variants
      if (selectedCityName.toLowerCase() === 'bangalore' || 
          selectedCityName.toLowerCase() === 'bangalore (cc)' || 
          selectedCityName.toLowerCase() === 'bengaluru (cc)' ||
          selectedCityName.toLowerCase() === 'bengaluru') {
        selectedCityName = 'Bengaluru'; // Always use this capitalization
      }
      
      // Update states first
      setSelectedCity(selectedCityName);
      setSelectedState(state);
      
      // Then navigate with a slight delay
      setTimeout(() => {
        const path = `/${selectedCityName.toLowerCase()}-egg-rate`;
        
        // Only navigate if we're not already on this path
        if (location.pathname !== path) {
          navigate(path, { replace: true });
        }
        
        navigationLock.current = false;
      }, 5);
      
    } else if (type === 'state') {
      // Update states first
      setSelectedCity('');
      setSelectedState(label);
      
      // Then navigate with a slight delay
      setTimeout(() => {
        const path = `/state/${label.toLowerCase()}-egg-rate`;
        
        // Only navigate if we're not already on this path
        if (location.pathname !== path) {
          navigate(path, { replace: true });
        }
        
        navigationLock.current = false;
      }, 5);
    }
  };

  const handleHomeClick = (e) => {
    if (navigationLock.current) {
      e.preventDefault();
      return;
    }
    
    navigationLock.current = true;
    setSelectedCity('');
    setSelectedState('');
    
    // Only navigate if we're not already on home
    if (location.pathname !== '/') {
      navigate('/');
    }
    
    // Release lock after a short delay
    setTimeout(() => {
      navigationLock.current = false;
    }, 5);
  };

  const handleCityClick = (city, e) => {
    if (navigationLock.current) {
      e?.preventDefault();
      return;
    }
    
    navigationLock.current = true;
    // Update state first
    setSelectedCity(city);
    setSelectedState('');
    
    // Then navigate with a slight delay
    setTimeout(() => {
      const path = `/${city.toLowerCase()}-egg-rate`;
      
      // Only navigate if we're not already on this path
      if (location.pathname !== path) {
        navigate(path, { replace: true });
      }
      
      navigationLock.current = false;
    }, 5);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Logo component with loading and fallback handling
  const Logo = () => {
    const handleLogoError = () => {
      setLogoLoading(false);
      setLogoError(true);
      if (currentLogoIndex < logoPaths.length - 1) {
        setCurrentLogoIndex(prev => prev + 1);
      }
    };

    const handleLogoLoad = () => {
      setLogoLoading(false);
      setLogoError(false);
    };

    return (
      <div className="logo-container" style={{ width: '40px', height: '40px', position: 'relative' }}>
        {logoLoading && (
          <div className="logo-loading-skeleton" 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              animation: 'pulse 1.5s infinite'
            }} 
          />
        )}
        <img
          src={logoPaths[currentLogoIndex]}
          alt="Food Price App Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: logoLoading ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
          onError={handleLogoError}
          onLoad={handleLogoLoad}
        />
        {logoError && currentLogoIndex === logoPaths.length - 1 && (
          <div 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              fontSize: '20px'
            }}
          >
            🥚
          </div>
        )}
      </div>
    );
  };
  // Memoize the animation style element creation
  const animationStyle = useMemo(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `;
    return styleElement;
  }, []);

  useEffect(() => {
    document.head.appendChild(animationStyle);
    return () => {
      if (document.head.contains(animationStyle)) {
        document.head.removeChild(animationStyle);
      }
    };
  }, [animationStyle]);

  return (
    <nav className="bg-white p-4 shadow-lg" style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div className="container mx-auto px-4 w-full max-w-7xl flex flex-col md:flex-row justify-between items-center transition-none">
        <div className="flex justify-between items-center w-full md:w-auto">          <Link to="/" onClick={handleHomeClick} className="mb-4 md:mb-0">
            <Logo />
          </Link>
          <button
            className="md:hidden text-gray-800 focus:outline-none"
            onClick={toggleMenu}
          >
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        <div
          className={`${
            menuOpen ? 'block' : 'hidden'
          } md:flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0 w-full md:w-auto`}
        >
          <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-4">
            <Link
              to="/"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
              onClick={handleHomeClick}
            >
              Home
            </Link>
            <Link
              to="/mumbai-egg-rate"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
              onClick={(e) => handleCityClick('Mumbai', e)}
            >
              Mumbai
            </Link>
            <Link
              to="/kolkata-egg-rate"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
              onClick={(e) => handleCityClick('Kolkata', e)}
            >
              Kolkata
            </Link>
            <Link
              to="/lucknow-egg-rate"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
              onClick={(e) => handleCityClick('Lucknow', e)}
            >
              Lucknow
            </Link>
            <Link
              to="/barwala-egg-rate"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
              onClick={(e) => handleCityClick('Barwala', e)}
            >
              Barwala
            </Link>
            <Link
              to="/hyderabad-egg-rate"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
              onClick={(e) => handleCityClick('Hyderabad', e)}
            >
              Hyderabad
            </Link>
            <Link
              to="/chennai-egg-rate"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
              onClick={(e) => handleCityClick('Chennai', e)}
            >
              Chennai
            </Link>
            <Link
              to="/webstories"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
            >
              Web Stories
            </Link>
          </div>
        </div>
        <div className="w-full md:w-64">
          <Select
            value={options.find(option => option.value === (selectedCity || selectedState))}
            onChange={handleChange}
            options={options}
            className="w-full"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: 'white',
                borderColor: 'transparent',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: 'transparent',
                },
                padding: '0.5rem', // Add padding for better touch target
                borderRadius: '0.375rem', // Tailwind rounded
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              placeholder: (base) => ({
                ...base,
                color: '#A0AEC0', // Placeholder color for better contrast
              }),
            }}
            placeholder="Select City, State"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;