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
}) => (
  <div className="w-full md:w-64 mt-4 md:mt-0">
    <Select
      value={options.find(option => option.value === (selectedCity || selectedState))}
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
      placeholder={isLoading ? "Loading locations..." : "Select City, State"}
      noOptionsMessage={() => error ? "Error loading locations" : "No locations found"}
      isClearable
      components={{
        IndicatorSeparator: () => null
      }}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600" role="alert">
        {error}
      </p>
    )}
    <span id="location-select-help" className="sr-only">
      Select a city or state to view egg rates for that location
    </span>
  </div>
));

SearchBox.displayName = 'SearchBox';

export default SearchBox;
