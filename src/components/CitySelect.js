import React from 'react';
import Select from 'react-select';

const CitySelect = ({ options, selectedOptions, setSelectedOptions }) => {
  // Remove duplicate cities from options
  const uniqueOptions = Array.from(new Set(options.map(option => option.value)))
    .map(value => options.find(option => option.value === value));

  return (
    <Select
      isMulti
      options={uniqueOptions}
      value={selectedOptions}
      onChange={setSelectedOptions}
      className="w-full"
      styles={{
        control: (base) => ({
          ...base,
          backgroundColor: 'white',
          borderColor: 'transparent',
          boxShadow: 'none',
          '&:hover': {
            borderColor: 'transparent',
          },
          padding: '0.5rem', // Add padding for better touch target
          borderRadius: '0.375rem', // Tailwind rounded
        }),
        menu: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        placeholder: (base) => ({
          ...base,
          color: '#A0AEC0', // Placeholder color for better contrast
        }),
      }}
      placeholder="Select Cities, States"
    />
  );
};

export default CitySelect;