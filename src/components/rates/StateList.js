import React from 'react';
import { Link } from 'react-router-dom';

const StateList = ({ states, cities }) => {
  // Define popular city and state lists for SEO enhancements
  const popularCities = ['Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Barwala', 'Siliguri', 'Hyderabad', 'Durgapur'];
  const popularStates = ['Maharashtra', 'Tamil Nadu', 'Karnataka', 'West Bengal', 'Haryana', 'Kerala', 'Punjab', 'Telangana'];
  
  const renderStateTableRows = () => {
    const rows = [];
    for (let i = 0; i < states.length; i += 3) {
      rows.push(
        <tr key={i} className="bg-white border-b hover:bg-gray-50">
          {states.slice(i, i + 3).map(state => (
            <td key={state} className="px-6 py-4 text-center">
              <Link
                to={`/state/${state.toLowerCase()}-egg-rate`}
                className="text-green-600 font-bold hover:underline transition duration-200"
                title={`Today's Egg Rate in ${state} - NECC Egg Price`}
              >
                {state} Egg Rate
              </Link>
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
              <Link
                to={`/${city.toLowerCase()}-egg-rate`}
                className="text-blue-600 font-bold hover:underline transition duration-200"
                title={`Today's Egg Rate in ${city} - Latest NECC Egg Price`}
              >
                {city} Egg Rate
              </Link>
            </td>
          ))}
        </tr>
      );
    }
    return rows;
  };

  // Render popular cities section for SEO benefit
  const renderPopularCities = () => {
    return (
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Popular City Egg Rates</h3>
        <div className="flex flex-wrap gap-2">
          {popularCities.map(city => (
            <Link 
              key={city}
              to={`/${city.toLowerCase()}-egg-rate`}
              className="px-3 py-1 bg-white border border-blue-200 rounded-full text-sm text-blue-600 hover:bg-blue-100 transition duration-200"
              title={`Check today's egg rate in ${city}`}
            >
              {city} Egg Rate Today
            </Link>
          ))}
        </div>
      </div>
    );
  };

  // Render popular states section for SEO benefit
  const renderPopularStates = () => {
    return (
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Popular State Egg Rates</h3>
        <div className="flex flex-wrap gap-2">
          {popularStates.map(state => (
            <Link 
              key={state}
              to={`/state/${state.toLowerCase()}-egg-rate`}
              className="px-3 py-1 bg-white border border-green-200 rounded-full text-sm text-green-600 hover:bg-green-100 transition duration-200"
              title={`Check today's egg rates in ${state}`}
            >
              {state} Egg Rate
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 mt-6 bg-gray-100 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-center bg-gray-200 rounded-lg w-full p-4 mt-4 text-xl font-semibold">
        Daily Egg Price in Mandi, National Wholesale Market Rate
      </h2>
      
      {/* Popular Cities Section */}
      {renderPopularCities()}
      
      {/* Popular States Section */}
      {renderPopularStates()}
      
      <h2 className="text-2xl font-bold mb-4 mt-6 text-center">State-wise Egg Rates</h2>
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
          <h2 className="text-2xl font-bold mt-8 mb-4 text-center">City-wise Egg Rates</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                {renderCityTableRows()}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p>Egg rates updated daily. Last updated: {new Date().toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
      </div>
    </div>
  );
};

export default StateList;