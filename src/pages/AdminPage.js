import React, { useState, useCallback, useEffect, useMemo } from 'react';
import AdminNavbar from '../components/layout/AdminNavbar';
import StateSelect from '../components/admin/StateSelect';
import CitySelect from '../components/admin/CitySelect';
import RateForm from '../components/admin/RateForm';
import AddStateForm from '../components/admin/AddStateForm';
import AddCityForm from '../components/admin/AddCityForm';
import RateTable from '../components/rates/RateTable';
import Select from 'react-select';
import { 
  fetchAllRates, 
  fetchStatesAndCities, 
  updateMultipleRates, 
  deleteRate,
  addStateOrCity,
  removeStateOrCity,
  updateRate as updateSingleRate,
  fetchRates
} from '../services/api';

const AdminPage = ({ setIsAuthenticated }) => {
  const today = new Date().toISOString().split('T')[0];
  const [eggRate, setEggRate] = useState({ date: today, rate: '' });
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [options, setOptions] = useState([]);
  const [eggRates, setEggRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'city', direction: 'ascending' });
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [newState, setNewState] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newCityState, setNewCityState] = useState(null);
  const [removeState, setRemoveState] = useState('');
  const [removeCity, setRemoveCity] = useState(null);
  const [removeCityState, setRemoveCityState] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today);
  
  // Define fetchEggRates function to get egg rates data
  const fetchEggRates = useCallback(() => {
    setLoading(true);
    fetchAllRates(selectedDate)
      .then(data => {
        setEggRates(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching egg rates:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [selectedDate]);
  
  // Define fetchCitiesAndStates function to get location data
  const fetchCitiesAndStates = useCallback(() => {
    fetchStatesAndCities()
      .then(data => {
        // Process the data as before
        const stateOptions = Object.keys(data)
          .filter(state => state !== 'Unknown' && state !== 'special')
          .map(state => ({ value: state, label: state }));
        setStates(stateOptions);

        const cityOptions = [];
        Object.entries(data).forEach(([state, cities]) => {
          if (state !== 'Unknown' && state !== 'special') {
            cities.forEach(city => {
              cityOptions.push({
                value: city,
                label: `${city}, ${state}`,
                type: 'city',
                state: state
              });
            });
          }
        });
        setOptions(cityOptions);
      })
      .catch(error => console.error('Error fetching states and cities:', error));
  }, []);

  // Use fetchEggRates in useEffect instead of duplicate code
  useEffect(() => {
    fetchEggRates();
  }, [fetchEggRates]);

  // Use fetchCitiesAndStates in useEffect
  useEffect(() => {
    fetchCitiesAndStates();
  }, [fetchCitiesAndStates]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = selectedOptions.map(option => ({
      city: option.value,
      state: option.state,
      rate: parseFloat(eggRate.rate),
      date: eggRate.date
    }));

    updateMultipleRates(payload)
      .then(response => {
        if (response.success) {
          alert('Rates updated successfully!');
          fetchEggRates();
          resetForm();
        } else {
          alert('Failed to update rates: ' + response.message);
        }
      })
      .catch(error => console.error("Error submitting data:", error));
  };

  const handleDelete = (rate) => {
    deleteRate(rate.id)
      .then(response => {
        if (response.success) {
          alert('Rate deleted successfully!');
          fetchEggRates();
        } else {
          alert('Failed to delete rate: ' + response.message);
        }
      })
      .catch(error => console.error("Error deleting item:", error));
  };

  const handleAddState = (e) => {
    e.preventDefault();
    addStateOrCity('state', newState)
      .then(response => {
        if (response.success) {
          alert('State added successfully!');
          setNewState('');
          fetchCitiesAndStates();
        } else {
          alert('Failed to add state: ' + response.message);
        }
      })
      .catch(error => console.error("Error adding state:", error));
  };

  const handleAddCity = (e) => {
    e.preventDefault();
    addStateOrCity('city', newCity, newCityState.value)
      .then(response => {
        if (response.success) {
          alert('City added successfully!');
          setNewCity('');
          setNewCityState(null);
          fetchCitiesAndStates();
        } else {
          alert('Failed to add city: ' + response.message);
        }
      })
      .catch(error => console.error("Error adding city:", error));
  };

  const handleRemoveState = (e) => {
    e.preventDefault();
    removeStateOrCity('state', removeState)
      .then(response => {
        if (response.success) {
          alert('State removed successfully!');
          setRemoveState('');
          fetchCitiesAndStates();
        } else {
          alert('Failed to remove state: ' + response.message);
        }
      })
      .catch(error => console.error("Error removing state:", error));
  };

  const handleRemoveCity = (e) => {
    e.preventDefault();
    const cityName = removeCity.label.split(', ')[0];
    removeStateOrCity('city', cityName, removeCityState.value)
      .then(response => {
        if (response.success) {
          alert('City removed successfully!');
          setRemoveCity(null);
          setRemoveCityState(null);
          fetchCitiesAndStates();
        } else {
          alert('Failed to remove city: ' + response.message);
        }
      })
      .catch(error => console.error("Error removing city:", error));
  };

  const handleEditRate = (rate) => {
    const updatedRates = eggRates.map(r => r.id === rate.id ? rate : r);
    setEggRates(updatedRates);
  
    updateSingleRate(rate)
      .then(response => {
        if (!response.success) {
          alert('Failed to update rate: ' + response.message);
          fetchEggRates(); // Refresh the data if update failed
        }
      })
      .catch(error => {
        console.error("Error updating rate:", error);
        fetchEggRates(); // Refresh the data if there was an error
      });
  };

  const handleStateChange = (selectedState) => {
    setSelectedState(selectedState);
    setSelectedOptions([]);
    const stateOptions = options.filter(option => 
      option.type === 'city' && 
      option.state === selectedState.value
    );
    setSelectedOptions(stateOptions);
  };

  const handleSelectAll = () => {
    const allCities = options.filter(option => 
      option.type === 'city' && 
      (!selectedState || option.state === selectedState.value)
    );
    setSelectedOptions(allCities);
  };

  const handleCopyPreviousRates = async () => {
    if (selectedOptions?.length === 0) {
      alert('Please select at least one city');
      return;
    }
    
    try {
      const cities = selectedOptions.map(option => ({
        city: option.value,
        state: option.state
      }));
      
      const rates = await fetchRates(null, null);
      const previousRates = {};
      
      rates.forEach(rate => {
        previousRates[`${rate.city}-${rate.state}`] = rate.rate;
      });
      
      const newPayload = cities.map(city => ({
        city: city.city,
        state: city.state,
        rate: previousRates[`${city.city}-${city.state}`] || '',
        date: today
      })).filter(item => item.rate !== '');

      if (newPayload?.length === 0) {
        alert('No previous rates found for selected cities');
        return;
      }

      await updateMultipleRates(newPayload);
      alert('Rates copied successfully!');
      fetchEggRates();
      resetForm();
    } catch (error) {
      console.error('Error copying previous rates:', error);
      alert('Failed to copy previous rates');
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedEggRates = useMemo(() => {
    let sortableRates = [...eggRates];
    sortableRates?.sort((a, b) => {
      if (sortConfig.key === 'rate') {
        return sortConfig.direction === 'ascending' 
          ? parseFloat(a.rate) - parseFloat(b.rate)
          : parseFloat(b.rate) - parseFloat(a.rate);
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableRates;
  }, [eggRates, sortConfig]);

  const resetForm = () => {
    setEggRate({ date: today, rate: '' });
    setSelectedOptions([]);
    setSelectedState(null);
    setRemoveState('');
    setRemoveCity(null);
    setRemoveCityState(null);
    setNewState('');
    setNewCity('');
    setNewCityState(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  return (
    <>
      <AdminNavbar setIsAuthenticated={setIsAuthenticated} />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Admin Egg Rate Management</h1>
          <div className="mb-6">
            <StateSelect
              states={states}
              selectedState={selectedState}
              handleStateChange={handleStateChange}
            />
            <CitySelect
              options={options}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
            />
            <RateForm
              eggRate={eggRate}
              setEggRate={setEggRate}
              handleSubmit={handleSubmit}
              handleSelectAll={handleSelectAll}
              handleCopyPreviousRates={handleCopyPreviousRates}
            />
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Add New State</h2>
            <AddStateForm
              newState={newState}
              setNewState={setNewState}
              handleAddState={handleAddState}
            />
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Add New City</h2>
            <AddCityForm
              states={states}
              newCity={newCity}
              setNewCity={setNewCity}
              newCityState={newCityState}
              setNewCityState={setNewCityState}
              handleAddCity={handleAddCity}
            />
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Remove State</h2>
            <form onSubmit={handleRemoveState} className="mb-6 grid grid-cols-1 gap-4">
              <Select
                options={states}
                value={states.find(state => state.value === removeState)}
                onChange={(selectedOption) => setRemoveState(selectedOption.value)}
                className="w-full mb-4"
                placeholder="Select State to Remove"
              />
              <button type="submit" className="bg-red-600 text-white p-3 rounded w-full hover:bg-red-700 transition">
                Remove State
              </button>
            </form>
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Remove City</h2>
            <form onSubmit={handleRemoveCity} className="mb-6 grid grid-cols-1 gap-4">
              <Select
                options={states}
                value={states.find(state => state.value === removeCityState?.value)}
                onChange={setRemoveCityState}
                className="w-full mb-4"
                placeholder="Select State for City to Remove"
              />
              <Select
                options={options.filter(option => option.type === 'city' && option.label.includes(removeCityState?.value))}
                value={removeCity}
                onChange={setRemoveCity}
                className="w-full mb-4"
                placeholder="Select City to Remove"
              />
              <button type="submit" className="bg-red-600 text-white p-3 rounded w-full hover:bg-red-700 transition">
                Remove City
              </button>
            </form>
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Current Egg Rates</h2>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>          <RateTable 
            rates={sortedEggRates}
            showAdmin={true}
            showState={true}
            showDate={true}
            showChart={false}
            showPriceColumns={false}
            handleSort={handleSort}
            onEdit={handleEditRate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </>
  );
};

export default AdminPage;