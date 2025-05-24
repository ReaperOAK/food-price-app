import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { FaBars, FaTimes } from 'react-icons/fa';
import OptimizedImage from '../common/OptimizedImage';

const Navbar = ({ setSelectedCity, setSelectedState, selectedCity, selectedState }) => {
  const [options, setOptions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogoError = (e) => {
    console.error('Error loading logo:', e.nativeEvent);
    console.error('Error target:', e.target);
    e.target.src = '/tee.avif'; // Fallback image
  };

  return (
    <nav className="bg-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex justify-between items-center w-full md:w-auto">          <Link to="/" onClick={handleHomeClick} className="mb-4 md:mb-0">
            <OptimizedImage
              src="/tee.webp"
              alt="Today Egg Rates Logo"
              className="h-10"
              width={200}
              height={40}
              onError={handleLogoError}
            />
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