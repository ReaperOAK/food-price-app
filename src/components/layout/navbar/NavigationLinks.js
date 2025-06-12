import React, { memo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavLink = memo(({ to, onClick, children, className = '', role = 'menuitem' }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e);
    }
  }, [onClick]);

  return (
    <Link
      to={to}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`
        group relative inline-flex items-center px-2 xl:px-3 py-2 text-sm font-medium rounded-lg
        transition-all duration-200 ease-in-out will-change-transform
        ${isActive 
          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        active:scale-95
        md:text-base
        transform-gpu hover:scale-102
        whitespace-nowrap overflow-hidden text-ellipsis
        ${className}
      `}      aria-current={isActive ? 'page' : undefined}
      role={role}
    >
      <span className="relative z-10 truncate">
        {children}
      </span>
      <span className={`
        absolute inset-0 rounded-lg transition-opacity duration-200
        ${isActive ? 'bg-blue-100 dark:bg-blue-900/40 opacity-50' : 'opacity-0'}
        group-hover:opacity-10
      `} 
      aria-hidden="true" />
    </Link>
  );
});

const NavigationLinks = memo(({ handleHomeClick, handleCityClick }) => (
  <nav 
    className="flex flex-col lg:flex-row lg:items-center w-full max-w-none" 
    role="navigation"
    aria-label="Main menu"
  >
    <div 
      role="menubar" 
      className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-1 xl:space-x-2 
                 overflow-hidden max-w-full flex-wrap lg:flex-nowrap"
    >
      <NavLink to="/" onClick={handleHomeClick} className="lg:block flex-shrink-0">
        Home
      </NavLink>
      
      {/* Popular Cities - responsive visibility */}
      <NavLink to="/mumbai-egg-rate-today" onClick={(e) => handleCityClick('Mumbai', e)} 
               className="lg:block xl:block flex-shrink-0">
        Mumbai
      </NavLink>
      <NavLink to="/kolkata-egg-rate-today" onClick={(e) => handleCityClick('Kolkata', e)} 
               className="lg:block xl:block flex-shrink-0">
        Kolkata
      </NavLink>
      <NavLink to="/lucknow-egg-rate-today" onClick={(e) => handleCityClick('Lucknow', e)} 
               className="hidden xl:block flex-shrink-0">
        Lucknow
      </NavLink>
      <NavLink to="/barwala-egg-rate-today" onClick={(e) => handleCityClick('Barwala', e)} 
               className="hidden xl:block flex-shrink-0">
        Barwala
      </NavLink>
      <NavLink to="/hyderabad-egg-rate-today" onClick={(e) => handleCityClick('Hyderabad', e)} 
               className="hidden xl:block flex-shrink-0">
        Hyderabad
      </NavLink>
      <NavLink to="/chennai-egg-rate-today" onClick={(e) => handleCityClick('Chennai', e)} 
               className="hidden 2xl:block flex-shrink-0">
        Chennai
      </NavLink>
      
      {/* Add orphan city links - hidden on smaller screens */}
      <NavLink to="/delhi-egg-rate-today" onClick={(e) => handleCityClick('Delhi', e)} 
               className="hidden 2xl:block flex-shrink-0">
        Delhi
      </NavLink>
      <NavLink to="/bengaluru-egg-rate-today" onClick={(e) => handleCityClick('Bengaluru', e)} 
               className="hidden 2xl:block flex-shrink-0">
        Bengaluru
      </NavLink>      {/* State Links Dropdown for orphan states */}
      <div className="relative group hidden lg:block flex-shrink-0">        <button 
          className="group relative inline-flex items-center px-2 xl:px-3 py-2 text-sm font-medium rounded-lg
                     text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 
                     hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 whitespace-nowrap"
          role="menuitem"
          aria-haspopup="true"
          aria-expanded="false"
          id="states-menu-button">
          States
          <svg className="ml-1 w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" role="menu" aria-labelledby="states-menu-button">          <div className="p-2 grid grid-cols-2 gap-1">
            <NavLink to="/state/maharashtra-egg-rate-today" className="text-xs px-2 py-1" role="menuitem">Maharashtra</NavLink>
            <NavLink to="/state/uttar-pradesh-egg-rate-today" className="text-xs px-2 py-1" role="menuitem">Uttar Pradesh</NavLink>
            <NavLink to="/state/west-bengal-egg-rate-today" className="text-xs px-2 py-1" role="menuitem">West Bengal</NavLink>
            <NavLink to="/state/tamil-nadu-egg-rate-today" className="text-xs px-2 py-1" role="menuitem">Tamil Nadu</NavLink>
            <NavLink to="/state/karnataka-egg-rate-today" className="text-xs px-2 py-1" role="menuitem">Karnataka</NavLink>
            <NavLink to="/state/telangana-egg-rate-today" className="text-xs px-2 py-1" role="menuitem">Telangana</NavLink>
            <NavLink to="/state/gujarat-egg-rate-today" className="text-xs px-2 py-1" role="menuitem">Gujarat</NavLink>
            <NavLink to="/state/rajasthan-egg-rate-today" className="text-xs px-2 py-1" role="menuitem">Rajasthan</NavLink>
            <NavLink to="/state/andhra-pradesh-egg-rate-today" className="text-xs px-2 py-1" role="menuitem">Andhra Pradesh</NavLink>
            <NavLink to="/state/madhya-pradesh-egg-rate-today" className="text-xs px-2 py-1" role="menuitem">Madhya Pradesh</NavLink>
            <NavLink to="/state/haryana-egg-rate-today" className="text-xs px-2 py-1" role="menuitem">Haryana</NavLink>
            <NavLink to="/state/punjab-egg-rate-today" className="text-xs px-2 py-1" role="menuitem">Punjab</NavLink>
          </div>
        </div>
      </div>
      
      <NavLink to="/webstories" className="lg:block flex-shrink-0">
        Web Stories
      </NavLink>
    </div>
  </nav>
));

NavLink.displayName = 'NavLink';
NavigationLinks.displayName = 'NavigationLinks';

export default NavigationLinks;
