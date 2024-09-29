import React from "react";

const BodyOne = ({ selectedCity, selectedState }) => {
  return (
    <div className="p-6 mt-6 bg-gray-100 rounded shadow">
      <h1 className="text-center font-bold text-2xl">Today Egg Rate (Daily NECC Egg Price)</h1>
      <p className="text-center text-lg text-gray-600 mt-2">
        Egg rates in India change on a daily basis by the NECC. On this page, you can find out the daily egg price mandi rate of 1 tray egg and 1 peti egg across major cities and markets in India.
      </p>

      <h1 className="text-center bg-gray-200 rounded w-full p-4 mt-4 text-xl">Egg Rate Today (29th September 2024)</h1>
      <p className="text-left text-gray-700 mt-2">
        Here is the live NECC egg rate today list across some of the popular cities in India.
      </p>
    </div>
  );
};

export default BodyOne;