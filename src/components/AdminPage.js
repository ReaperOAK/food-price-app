import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import Select from 'react-select';

const AdminPage = ({ setIsAuthenticated }) => {
  const [eggRate, setEggRate] = useState({ date: '', rate: '' });
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [options, setOptions] = useState([]);
  const [eggRates, setEggRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'city', direction: 'ascending' });
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    fetchEggRates();
    fetchCitiesAndStates();
  }, []);

  const fetchEggRates = () => {
    fetch('https://todayeggrates.com/php/get_all_rates.php')
      .then((response) => response.json())
      .then((data) => {
        setEggRates(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      });
  };

  const fetchCitiesAndStates = () => {
    fetch('https://todayeggrates.com/php/get_states_and_cities.php')
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

    fetch('https://todayeggrates.com/php/update_multiple_rates.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(response => {
        fetchEggRates(); // Refresh the list of egg rates
        setEggRate({ date: '', rate: '' }); // Reset form
        setSelectedOptions([]); // Reset selected options
      })
      .catch(error => console.error("Error submitting data:", error));
  };

  const handleDelete = (rate) => {
    fetch('https://todayeggrates.com/php/delete_rate.php', {
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

    const previousDate = new Date(eggRate.date);
    previousDate.setDate(previousDate.getDate() - 1);
    const formattedPreviousDate = previousDate.toISOString().split('T')[0];

    const payload = selectedOptions.map(option => {
      const [cityName, state] = option.label.split(', ');
      const previousRate = eggRates.find(rate => rate.city === cityName && rate.state === state && rate.date === formattedPreviousDate);
      return {
        city: cityName,
        state: state || '',
        date: eggRate.date,
        rate: previousRate ? previousRate.rate : eggRate.rate,
        type: option.type,
      };
    });

    fetch('https://todayeggrates.com/php/update_multiple_rates.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(response => {
        fetchEggRates(); // Refresh the list of egg rates
        setEggRate({ date: '', rate: '' }); // Reset form
        setSelectedOptions([]); // Reset selected options
      })
      .catch(error => console.error("Error submitting data:", error));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  return (
    <>
      <AdminNavbar setIsAuthenticated={setIsAuthenticated} />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Admin Egg Rate Management</h1>
          <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-4">
            <Select
              options={states}
              value={selectedState}
              onChange={handleStateChange}
              className="w-full mb-4"
              placeholder="Select State"
            />
            <Select
              isMulti
              options={options}
              value={selectedOptions}
              onChange={setSelectedOptions}
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
              placeholder="Select Cities, States"
            />
            <button type="button" onClick={handleSelectAll} className="bg-green-600 text-white p-3 rounded w-full hover:bg-green-700 transition">
              Select All Cities
            </button>
            <input
              type="date"
              value={eggRate.date}
              onChange={(e) => setEggRate({ ...eggRate, date: e.target.value })}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
            <input
              type="number"
              placeholder="Rate"
              value={eggRate.rate}
              onChange={(e) => setEggRate({ ...eggRate, rate: e.target.value })}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
            <button type="submit" className="bg-blue-600 text-white p-3 rounded w-full hover:bg-blue-700 transition">
              Update Rates
            </button>
            <button type="button" onClick={handleCopyPreviousRates} className="bg-yellow-600 text-white p-3 rounded w-full hover:bg-yellow-700 transition">
              Copy Previous Rates
            </button>
          </form>
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Current Egg Rates</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-3 text-left cursor-pointer" onClick={() => handleSort('city')}>City</th>
                  <th className="border border-gray-300 p-3 text-left cursor-pointer" onClick={() => handleSort('state')}>State</th>
                  <th className="border border-gray-300 p-3 text-left cursor-pointer" onClick={() => handleSort('date')}>Date</th>
                  <th className="border border-gray-300 p-3 text-left cursor-pointer" onClick={() => handleSort('rate')}>Rate</th>
                  <th className="border border-gray-300 p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEggRates.map((rate) => (
                  <tr key={`${rate.city}-${rate.state}-${rate.date}`} className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-3">{rate.city}</td>
                    <td className="border border-gray-300 p-3">{rate.state}</td>
                    <td className="border border-gray-300 p-3">{rate.date}</td>
                    <td className="border border-gray-300 p-3">${rate.rate}</td>
                    <td className="border border-gray-300 p-3 flex space-x-2">
                      <button onClick={() => setEggRate(rate)} className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition">Edit</button>
                      <button onClick={() => handleDelete(rate)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;