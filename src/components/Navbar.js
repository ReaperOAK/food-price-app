import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ selectedState, setSelectedState, setSelectedCity, selectedCity }) => {
  const [options, setOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://blueviolet-gerbil-672303.hostingersite.com/php/get_states_and_cities.php')
      .then(res => res.json())
      .then(data => {
        const combinedOptions = [];

        for (const state in data) {
          data[state].forEach(city => {
            combinedOptions.push({
              value: city,
              label: `${city}, ${state}`
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
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" onClick={handleHomeClick}>
          <h1 className="text-white text-2xl">Home</h1>
        </Link>
        <div className="flex space-x-4">
          <Link to="/" className="text-white" onClick={handleHomeClick}>Today Egg Rates</Link>
          <Link to="/Mumbai" className="text-white">Mumbai</Link>
          <Link to="/Kolkata" className="text-white">Kolkata</Link>
          <Link to="/Lucknow" className="text-white">Lucknow</Link>
          <Link to="/Chennai" className="text-white">Chennai</Link>
        </div>
        <Select
          value={options.find(option => option.value === selectedCity)}
          onChange={handleChange}
          options={options}
          className="bg-white text-black p-2 rounded"
          placeholder="Select City, State"
        />
      </div>
    </nav>
  );
};

export default Navbar;