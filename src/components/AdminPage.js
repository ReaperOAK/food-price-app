import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';

const AdminPage = ({ setIsAuthenticated }) => {
  const [eggRate, setEggRate] = useState({ id: '', city: '', state: '', date: '', rate: '' });
  const [eggRates, setEggRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEggRates();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = eggRate.id ? 'https://todayeggrates.com/php/update_rate.php' : 'https://todayeggrates.com/php/add_rate.php';

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eggRate),
    })
      .then(res => res.json())
      .then(response => {
        fetchEggRates(); // Refresh the list of egg rates
        setEggRate({ id: '', city: '', state: '', date: '', rate: '' }); // Reset form
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  return (
    <>
    <AdminNavbar setIsAuthenticated={setIsAuthenticated} />
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Admin Egg Rate Management</h1>
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="City"
            value={eggRate.city}
            onChange={(e) => setEggRate({ ...eggRate, city: e.target.value })}
            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
          <input
            type="text"
            placeholder="State"
            value={eggRate.state}
            onChange={(e) => setEggRate({ ...eggRate, state: e.target.value })}
            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
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
          <button type="submit" className="bg-blue-600 text-white p-3 rounded w-full md:col-span-2 hover:bg-blue-700 transition">
            {eggRate.id ? 'Update Rate' : 'Add Rate'}
          </button>
        </form>
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Current Egg Rates</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-3 text-left">City</th>
                <th className="border border-gray-300 p-3 text-left">State</th>
                <th className="border border-gray-300 p-3 text-left">Date</th>
                <th className="border border-gray-300 p-3 text-left">Rate</th>
                <th className="border border-gray-300 p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {eggRates.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-100">
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
