import React, { useState, useEffect } from 'react';

const AdminPage = ({ setIsAuthenticated }) => {
  const [eggRate, setEggRate] = useState({ id: '', city: '', state: '', date: '', rate: '' });
  const [eggRates, setEggRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEggRates();
  }, []);

  const fetchEggRates = () => {
    fetch('https://blueviolet-gerbil-672303.hostingersite.com/php/get_all_rates.php')
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = eggRate.id ? 'https://blueviolet-gerbil-672303.hostingersite.com/php/update_rate.php' : 'https://blueviolet-gerbil-672303.hostingersite.com/php/add_rate.php';

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eggRate),
    })
      .then(res => res.json())
      .then(response => {
        console.log(response);
        fetchEggRates(); // Refresh the list of egg rates
        setEggRate({ id: '', city: '', state: '', date: '', rate: '' }); // Reset form
      })
      .catch(error => console.error("Error submitting data:", error));
  };

  const handleDelete = (rate) => {
    fetch('https://blueviolet-gerbil-672303.hostingersite.com/php/delete_rate.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: rate.id }), // Send ID for deletion
    })
      .then(res => res.json())
      .then(response => {
        console.log(response);
        fetchEggRates(); // Refresh the list of egg rates
      })
      .catch(error => console.error("Error deleting item:", error));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Egg Rate Management</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="City"
          value={eggRate.city}
          onChange={(e) => setEggRate({ ...eggRate, city: e.target.value })}
          className="border border-gray-300 p-2 rounded mr-2"
          required
        />
        <input
          type="text"
          placeholder="State"
          value={eggRate.state}
          onChange={(e) => setEggRate({ ...eggRate, state: e.target.value })}
          className="border border-gray-300 p-2 rounded mr-2"
          required
        />
        <input
          type="date"
          value={eggRate.date}
          onChange={(e) => setEggRate({ ...eggRate, date: e.target.value })}
          className="border border-gray-300 p-2 rounded mr-2"
          required
        />
        <input
          type="number"
          placeholder="Rate"
          value={eggRate.rate}
          onChange={(e) => setEggRate({ ...eggRate, rate: e.target.value })}
          className="border border-gray-300 p-2 rounded mr-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {eggRate.id ? 'Update Rate' : 'Add Rate'}
        </button>
      </form>
      <h2 className="text-xl font-semibold mb-2">Current Egg Rates</h2>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">City</th>
            <th className="border border-gray-300 p-2">State</th>
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Rate</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {eggRates.map((rate) => (
            <tr key={rate.id}>
              <td className="border border-gray-300 p-2">{rate.city}</td>
              <td className="border border-gray-300 p-2">{rate.state}</td>
              <td className="border border-gray-300 p-2">{rate.date}</td>
              <td className="border border-gray-300 p-2">${rate.rate}</td>
              <td className="border border-gray-300 p-2">
                <button onClick={() => setEggRate(rate)} className="bg-yellow-500 text-white p-1 rounded mr-1">Edit</button>
                <button onClick={() => handleDelete(rate)} className="bg-red-500 text-white p-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
