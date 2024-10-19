import React from 'react';
import Select from 'react-select';

const CitySelect = ({ options, selectedOptions, setSelectedOptions }) => (
  <Select
    isMulti
    options={options}
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

export default CitySelect;