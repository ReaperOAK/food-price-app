import React from 'react';
import { useNavigate } from 'react-router-dom';

const StateList = ({ states, cities }) => {
  const navigate = useNavigate();

  const handleStateClick = (state) => {
    navigate(`/state/${state.toLowerCase()}-egg-rate`);
  };

  const handleCityClick = (city) => {
    navigate(`/${city.toLowerCase()}-egg-rate`);
  };

  const renderStateTableRows = () => {
    const rows = [];
    for (let i = 0; i < states.length; i += 3) {
      rows.push(
        <tr key={i} className="bg-white border-b hover:bg-gray-50">
          {states.slice(i, i + 3).map(state => (
            <td key={state} className="px-6 py-4 text-center">
              <button
                onClick={() => handleStateClick(state)}
                className="text-green-600 font-bold hover:underline transition duration-200"
              >
                {state}
              </button>
            </td>
          ))}
        </tr>
      );
    }
    return rows;
  };

  const renderCityTableRows = () => {
    const rows = [];
    for (let i = 0; i < cities.length; i += 3) {
      rows.push(
        <tr key={i} className="bg-white border-b hover:bg-gray-50">
          {cities.slice(i, i + 3).map(city => (
            <td key={city} className="px-6 py-4 text-center">
              <button
                onClick={() => handleCityClick(city)}
                className="text-blue-600 font-bold hover:underline transition duration-200"
              >
                {city}
              </button>
            </td>
          ))}
        </tr>
      );
    }
    return rows;
  };

  return (
    <div className="p-6 mt-6 bg-gray-100 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h1 className="text-center bg-gray-200 rounded-lg w-full p-4 mt-4 text-xl font-semibold">
        Daily Egg Price in Mandi, National Wholesale Market Rate
      </h1>
      <h2 className="text-2xl font-bold mb-4 text-center">Select a State</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {states.length > 0 ? renderStateTableRows() : (
              <tr>
                <td className="px-6 py-4 text-center" colSpan="3">Loading...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {cities.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-8 mb-4 text-center">Select a City</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                {renderCityTableRows()}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default StateList;