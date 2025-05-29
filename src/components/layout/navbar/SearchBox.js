import React, { memo, useMemo, forwardRef } from 'react';
import Select from 'react-select';

const SearchBox = memo(forwardRef(({
  options,
  selectedCity,
  selectedState,
  handleChange,
  isLoading,
  error,
  selectStyles,
  onFocus,
  onBlur,
  isSearchFocused
}, ref) => {
  // Find the selected option with memoization
  const selectedOption = useMemo(() => {
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
  }, [selectedCity, selectedState, options]);

  // Custom components for better accessibility and performance
  const customComponents = useMemo(() => ({
    IndicatorSeparator: () => null,
    LoadingMessage: () => (
      <div className="p-2 text-center text-gray-600 dark:text-gray-400">
        <span className="inline-block animate-spin mr-2">⟳</span>
        Loading locations...
      </div>
    ),
    NoOptionsMessage: ({ selectProps }) => (
      <div className="p-2 text-center text-gray-600 dark:text-gray-400">
        {error ? "Error loading locations" : "No locations found"}
      </div>
    ),
    Group: ({ children, ...props }) => (
      <div className="py-1">
        <div className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {props.data.label}
        </div>
        {children}
      </div>
    ),
    Option: ({ children, ...props }) => (
      <div
        {...props.innerProps}
        className={`
          px-3 py-2 cursor-pointer text-gray-700 dark:text-gray-300
          ${props.isFocused ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
          ${props.isSelected ? 'bg-blue-100 dark:bg-blue-800' : ''}
        `}
      >
        {children}
      </div>
    ),
  }), [error]);

  return (
    <div 
      className="relative w-full focus-within:z-10"
      role="search"
    >
      <Select
        ref={ref}
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isLoading={isLoading}
        isDisabled={isLoading || error}
        className={`
          react-select-container
          ${isSearchFocused ? 'react-select-focused' : ''}
        `}
        classNamePrefix="react-select"
        styles={selectStyles}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label="Search for city or state"
        inputId="location-select"
        aria-describedby="location-select-help"
        placeholder={isLoading ? "Loading locations..." : "Select City"}
        noOptionsMessage={() => error ? "Error loading locations" : "No locations found"}
        isClearable
        isSearchable
        components={customComponents}
        // Performance optimizations
        filterOption={(option, inputValue) => {
          if (!inputValue) return true;
          const searchValue = inputValue.toLowerCase();
          return (
            option.label.toLowerCase().includes(searchValue) ||
            (option.data?.state || '').toLowerCase().includes(searchValue)
          );
        }}
        // Accessibility enhancements
        aria-invalid={error ? "true" : "false"}
        aria-busy={isLoading}
      />
      {error && (
        <p 
          className="mt-1 text-sm text-red-600 dark:text-red-400 absolute" 
          role="alert"
          id="location-select-error"
        >
          {error}
        </p>
      )}
      <div className="sr-only" id="location-select-help">
        Type to search for a city or state, use arrow keys to navigate results, Enter to select
      </div>
    </div>
  );
}));

SearchBox.displayName = 'SearchBox';

export default SearchBox;
