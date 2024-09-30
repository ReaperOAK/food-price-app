import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const StateList = () => {
  const [states, setStates] = useState([]);

  useEffect(() => {
    fetch('https://blueviolet-gerbil-672303.hostingersite.com/php/get_states.php')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data); // Log the entire response
        if (Array.isArray(data)) {
          setStates(data); // Directly set the states array
        } else {
          console.error('Unexpected response format:', data);
        }
      })
      .catch(error => console.error('Error fetching states:', error));
  }, []);

  const renderTableRows = () => {
    const rows = [];
    for (let i = 0; i < states.length; i += 3) {
      rows.push(
        <tr key={i} className="bg-white border-b hover:bg-gray-50">
          {states.slice(i, i + 3).map(state => (
            <td key={state} className="px-6 py-4 text-center">
              <Link to={`/state/${state}`} className="text-blue-500 hover:underline">{state}</Link>
            </td>
          ))}
        </tr>
      );
    }
    return rows;
  };

  return (
    <div className="p-6 mt-6 bg-gray-100 rounded shadow">
        <h1 className="text-center bg-gray-200 rounded w-full p-4 mt-4 text-xl">Daily Egg Price in Mandi, National Wholesale Market Rate</h1>
      <h2 className="text-2xl font-bold mb-4">Select a State</h2>
      <figure className="wp-block-table is-style-stripes link-table">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {states.length > 0 ? renderTableRows() : (
              <tr>
                <td className="px-6 py-4 text-center" colSpan="3">Loading...</td>
              </tr>
            )}
          </tbody>
        </table>
      </figure>
    </div>
  );
};

export default StateList;