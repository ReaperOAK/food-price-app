import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ setSelectedCity, setSelectedState, selectedCity, selectedState }) => {
  const [options, setOptions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/php/get_states_and_cities.php')
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
            const cityLabel = `${city}, ${state}`;
            if (!citySet.has(cityLabel)) {
              combinedOptions.push({
                value: city,
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
    const { type, label } = selectedOption;
    if (type === 'city') {
      const [city, state] = label.split(', ');
      setSelectedCity(city);
      setSelectedState(state);
      navigate(`/${city.toLowerCase()}-egg-rate`);
    } else if (type === 'state') {
      setSelectedCity('');
      setSelectedState(label);
      navigate(`/state/${label.toLowerCase()}-egg-rate`);
    }
  };

  const handleHomeClick = () => {
    setSelectedCity('');
    setSelectedState('');
    navigate('/');
  };

  const handleCityClick = (city) => {
    setSelectedCity('');
    setSelectedState('');
    setTimeout(() => {
      setSelectedCity(city);
      setSelectedState('');
      navigate(`/${city.toLowerCase()}-egg-rate`);
    }, 0);
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
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link to="/" onClick={handleHomeClick} className="mb-4 md:mb-0">
            <img src="/tee.png" alt="Today Egg Rates Logo" className="h-10" onError={handleLogoError} />
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
              onClick={() => handleCityClick('Mumbai')}
            >
              Mumbai
            </Link>
            <Link
              to="/kolkata-egg-rate"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
              onClick={() => handleCityClick('Kolkata')}
            >
              Kolkata
            </Link>
            <Link
              to="/luknow-egg-rate"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
              onClick={() => handleCityClick('luknow')}
            >
              lucknow
            </Link>
            <Link
              to="/barwala-egg-rate"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
              onClick={() => handleCityClick('Barwala')}
            >
              Barwala
            </Link>
            <Link
              to="/hyderabad-egg-rate"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
              onClick={() => handleCityClick('Hyderabad')}
            >
              Hyderabad
            </Link>
            <Link
              to="/chennai-egg-rate"
              className="text-gray-800 hover:text-gray-600 transition duration-300"
              onClick={() => handleCityClick('Chennai')}
            >
              Chennai
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