import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';

const Navbar = ({ setSelectedCity, setSelectedState, selectedCity }) => {
  const [options, setOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://todayeggrates.com/php/get_states_and_cities.php')
      .then(response => response.json())
      .then(data => {
        const combinedOptions = [];
        for (const state in data) {
          data[state].forEach(city => {
            combinedOptions.push({
              value: city,
              label: `${city}, ${state}`,
            });
          });
        }
        setOptions(combinedOptions);
      })
      .catch(error => console.error('Error fetching states and cities:', error));
  }, []);

  const handleChange = (selectedOption) => {
    const [city, state] = selectedOption.label.split(', ');
    setSelectedCity(city);
    setSelectedState(state);
    navigate(`/${city}`);
  };

  const handleHomeClick = () => {
    setSelectedCity('');
    setSelectedState('');
    navigate('/');
  };

  return (
    <nav className="bg-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <Link to="/" onClick={handleHomeClick} className="mb-4 md:mb-0">
          <img src="tee.avif" alt="Today Egg Rates Logo" className="h-10" />
        </Link>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
          <Link to="/" className="text-gray-800 hover:text-gray-600 transition duration-300" onClick={handleHomeClick}>Home</Link>
          <Link to="/Mumbai" className="text-gray-800 hover:text-gray-600 transition duration-300">Mumbai</Link>
          <Link to="/Kolkata" className="text-gray-800 hover:text-gray-600 transition duration-300">Kolkata</Link>
          <Link to="/Lucknow" className="text-gray-800 hover:text-gray-600 transition duration-300">Lucknow</Link>
          <Link to="/Chennai" className="text-gray-800 hover:text-gray-600 transition duration-300">Chennai</Link>
        </div>
        <div className="w-full md:w-64">
          <Select
            value={options.find(option => option.value === selectedCity)}
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
