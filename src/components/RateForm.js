import React from 'react';

const RateForm = ({
  eggRate,
  setEggRate,
  handleSubmit,
  handleSelectAll,
  handleCopyPreviousRates,
}) => {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  return (
    <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-4">
      <button
        type="button"
        onClick={handleSelectAll}
        className="bg-green-600 text-white p-3 rounded w-full hover:bg-green-700 transition"
      >
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
      <button
        type="submit"
        className="bg-blue-600 text-white p-3 rounded w-full hover:bg-blue-700 transition"
      >
        Update Rates
      </button>
      <button
        type="button"
        onClick={handleCopyPreviousRates}
        className="bg-yellow-600 text-white p-3 rounded w-full hover:bg-yellow-700 transition"
      >
        Copy Previous Rates
      </button>
    </form>
  );
};

export default RateForm;