import React from 'react';
import Select from 'react-select';

const StateSelect = ({ states, selectedState, handleStateChange }) => (
  <Select
    options={states}
    value={selectedState}
    onChange={handleStateChange}
    className="w-full mb-4"
    placeholder="Select State"
  />
);

export default StateSelect;