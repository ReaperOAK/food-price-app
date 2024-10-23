import React from 'react';

const BodyOne = ({ selectedCity, selectedState }) => {
  const displayName = selectedCity ? selectedCity : selectedState ? selectedState : 'India';
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-6 mt-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-center font-bold text-3xl text-gray-800">Today Egg Rate in {displayName} (Daily NECC Egg Price)</h1>
      <p className="text-center text-lg text-gray-600 mt-4">
        Egg rates in {displayName} change daily by the NECC. On this page, you can find out the daily egg price mandi rate of 1 tray egg and 1 peti egg across {selectedCity ? 'the city' : 'the state'} of {displayName}.
      </p>

      <div className="bg-gray-200 rounded-lg w-full p-6 mt-6">
        <h2 className="text-center text-2xl font-semibold text-gray-800">Egg Rate Today ({today})</h2>
        <p className="text-left text-gray-700 mt-4">
          Here is the live NECC egg rate today list across some of the popular {selectedCity ? 'areas of' : 'cities in'} {displayName}.
        </p>
      </div>
    </div>
  );
};

export default BodyOne;