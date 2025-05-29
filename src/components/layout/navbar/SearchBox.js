import React, { memo } from 'react';
import Select from 'react-select';

const SearchBox = memo(({
  options,
  selectedCity,
  selectedState,
  handleChange,
  isLoading,
  error,
  selectStyles
}) => {
  // Find the selected option
  const findSelectedOption = () => {
    if (!selectedCity && !selectedState) return null;
    
    for (const group of options) {
      // If it's a group (has options property)
      if (group.options) {
        const found = group.options.find(option => 
          option.value.toLowerCase() === (selectedCity || '').toLowerCase()
        );
        if (found) return found;
      }
      // If it's a direct option (from Unknown category)
      else if (group.value?.toLowerCase() === (selectedCity || '').toLowerCase()) {
        return group;
      }
    }
    return null;
  };

  return (
    <div className="w-full md:w-64 mt-4 md:mt-0">
      <Select
        value={findSelectedOption()}
        onChange={handleChange}
        options={options}
        isLoading={isLoading}
        isDisabled={isLoading || error}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={selectStyles}
        aria-label="Search for city or state"
        inputId="location-select"
        aria-describedby="location-select-help"
        placeholder={isLoading ? "Loading locations..." : "Select City"}
        noOptionsMessage={() => error ? "Error loading locations" : "No locations found"}
        isClearable
        components={{
          IndicatorSeparator: () => null,
          Group: ({ children, ...props }) => (
            <div style={{ fontWeight: 'bold', color: '#4B5563' }}>
              <div style={{ padding: '8px 12px' }}>{props.data.label}</div>
              {children}
            </div>
          )
        }}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <span id="location-select-help" className="sr-only">
        Select a city to view egg rates for that location
      </span>
    </div>
  );
});

SearchBox.displayName = 'SearchBox';

export default SearchBox;
