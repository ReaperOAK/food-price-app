import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import AdminNavbar from './AdminNavbar';
import StateSelect from './StateSelect';
import CitySelect from './CitySelect';
import RateForm from './RateForm';
import AddStateForm from './AddStateForm';
import AddCityForm from './AddCityForm';
import EggRatesTable from './EggRatesTable';

const AdminPage = ({ setIsAuthenticated }) => {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
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

  useEffect(() => {
    fetchEggRates();
    fetchCitiesAndStates();
  }, [selectedDate]);

  const fetchEggRates = () => {
    fetch(`/php/get_all_rates.php?date=${selectedDate}`)
      .then((response) => response.json())
      .then((data) => {
        const latestRates = data.reduce((acc, rate) => {
          if (!acc[rate.city] || new Date(rate.date) > new Date(acc[rate.city].date)) {
            acc[rate.city] = rate;
          }
          return acc;
        }, {});
        setEggRates(Object.values(latestRates));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      });
  };

  const fetchCitiesAndStates = () => {
    fetch('/php/get_states_and_cities.php')
      .then(response => response.json())
      .then(data => {
        const combinedOptions = [];
        const stateOptions = [];
        for (const state in data) {
          stateOptions.push({ value: state, label: state });
          combinedOptions.push({
            value: state,
            label: state,
            type: 'state',
          });
          data[state].forEach(city => {
            combinedOptions.push({
              value: `${city}-${state}`, // Ensure unique value
              label: `${city}, ${state}`,
              type: 'city',
            });
          });
        }
        setOptions(combinedOptions);
        setStates(stateOptions);
      })
      .catch(error => console.error('Error fetching states and cities:', error));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = selectedOptions.map(option => {
      const [cityName, state] = option.type === 'city' ? option.label.split(', ') : [null, option.value];
      return {
        city: cityName,
        state: state || '', // Ensure state is not null
        date: eggRate.date,
        rate: eggRate.rate,
        type: option.type,
      };
    });

    fetch('/php/update_multiple_rates.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(response => {
        fetchEggRates(); // Refresh the list of egg rates
        resetForm(); // Reset form
      })
      .catch(error => console.error("Error submitting data:", error));
  };

  const handleDelete = (rate) => {
    fetch('/php/delete_rate.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: rate.id }), // Send ID for deletion
    })
      .then(res => res.json())
      .then(response => {
        fetchEggRates(); // Refresh the list of egg rates
      })
      .catch(error => console.error("Error deleting item:", error));
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedEggRates = React.useMemo(() => {
    let sortableRates = [...eggRates];
    sortableRates.sort((a, b) => {
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

  const handleStateChange = (selectedState) => {
    setSelectedState(selectedState);
    setSelectedOptions([]); // Reset selected options
    const stateOptions = options.filter(option => option.type === 'city' && option.label.includes(selectedState.value));
    setSelectedOptions(stateOptions);
  };

  const handleSelectAll = () => {
    const allCities = options.filter(option => option.type === 'city');
    setSelectedOptions(allCities);
  };

  const handleCopyPreviousRates = () => {
    if (selectedOptions.length === 0) {
      alert('Please select at least one city.');
      return;
    }
  
    const fetchLatestRates = async (cities) => {
      console.log('Fetching latest rates for cities:', cities);
      const response = await fetch('/php/get_latest_rates.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cities),
      });
      const data = await response.json();
      console.log('Fetched latest rates:', data);
      return data;
    };
  
    const updateRates = async () => {
      const cities = selectedOptions
        .filter(option => option.type === 'city') // Ensure only cities are selected
        .map(option => {
          const [cityName, state] = option.label.split(', ');
          return { city: cityName, state: state };
        });
  
      console.log('Selected cities for updating rates:', cities);
  
      const latestRates = await fetchLatestRates(cities);
  
      const payload = latestRates.map(rate => ({
        city: rate.city,
        state: rate.state,
        date: eggRate.date,
        rate: rate.rate || eggRate.rate,
        type: 'city',
      }));
  
      console.log('Payload for updating rates:', payload);
  
      fetch('/php/update_multiple_rates.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(response => {
          console.log('Response from updating rates:', response);
          fetchEggRates(); // Refresh the list of egg rates
          resetForm(); // Reset form
        })
        .catch(error => console.error("Error submitting data:", error));
    };
  
    updateRates();
  };

  const handleAddState = (e) => {
    e.preventDefault();
    fetch('/php/add_state_city.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'state', name: newState }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          fetchCitiesAndStates(); // Refresh the list of states and cities
          setNewState(''); // Reset form
        } else {
          alert(response.error);
        }
      })
      .catch(error => console.error("Error adding state:", error));
  };

  const handleAddCity = (e) => {
    e.preventDefault();
    fetch('/php/add_state_city.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'city', name: newCity, state: newCityState.value }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          fetchCitiesAndStates(); // Refresh the list of states and cities
          setNewCity(''); // Reset form
          setNewCityState(null); // Reset form
        } else {
          alert(response.error);
        }
      })
      .catch(error => console.error("Error adding city:", error));
  };

  const handleRemoveState = (e) => {
    e.preventDefault();
    fetch('/php/remove_state_city.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'state', name: removeState }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          fetchCitiesAndStates(); // Refresh the list of states and cities
          setRemoveState(''); // Reset form
        } else {
          alert(response.error);
        }
      })
      .catch(error => console.error("Error removing state:", error));
  };

  const handleRemoveCity = (e) => {
    e.preventDefault();
    fetch('/php/remove_state_city.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'city', name: removeCity.label.split(', ')[0], state: removeCityState.value }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          fetchCitiesAndStates(); // Refresh the list of states and cities
          setRemoveCity(null); // Reset form
          setRemoveCityState(null); // Reset form
        } else {
          alert(response.error);
        }
      })
      .catch(error => console.error("Error removing city:", error));
  };

  const handleEditRate = (rate) => {
    const updatedRates = eggRates.map(r => r.id === rate.id ? rate : r);
    setEggRates(updatedRates);
  };

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
          </div>
          <EggRatesTable
            sortedEggRates={sortedEggRates}
            handleSort={handleSort}
            setEggRate={setEggRate}
            handleDelete={handleDelete}
            handleEditRate={handleEditRate}
          />
        </div>
      </div>
    </>
  );
};

export default AdminPage;