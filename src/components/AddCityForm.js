import React from 'react';
import Select from 'react-select';

const AddCityForm = ({
  states,
  newCity,
  setNewCity,
  newCityState,
  setNewCityState,
  handleAddCity,
}) => (
  <form onSubmit={handleAddCity} className="mb-6 grid grid-cols-1 gap-4">
    <Select
      options={states}
      value={newCityState}
      onChange={setNewCityState}
      className="w-full mb-4"
      placeholder="Select State for New City"
    />
    <input
      type="text"
      placeholder="New City"
      value={newCity}
      onChange={(e) => setNewCity(e.target.value)}
      className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      required
    />
    <button
      type="submit"
      className="bg-blue-600 text-white p-3 rounded w-full hover:bg-blue-700 transition"
    >
      Add City
    </button>
  </form>
);

export default AddCityForm;