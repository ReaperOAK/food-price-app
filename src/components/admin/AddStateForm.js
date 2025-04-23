import React from 'react';

const AddStateForm = ({ newState, setNewState, handleAddState }) => (
  <form onSubmit={handleAddState} className="mb-6 grid grid-cols-1 gap-4">
    <input
      type="text"
      placeholder="New State"
      value={newState}
      onChange={(e) => setNewState(e.target.value)}
      className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      required
    />
    <button
      type="submit"
      className="bg-blue-600 text-white p-3 rounded w-full hover:bg-blue-700 transition"
    >
      Add State
    </button>
  </form>
);

export default AddStateForm;