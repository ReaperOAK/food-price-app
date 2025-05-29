import React, { memo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavLink = memo(({ to, onClick, children }) => {
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
        group relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg
        transition-all duration-200 ease-in-out will-change-transform
        ${isActive 
          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        active:scale-95
        md:text-base md:px-4
        transform-gpu hover:scale-102
      `}
      aria-current={isActive ? 'page' : undefined}
      role="menuitem"
    >
      <span className="relative z-10">
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
    className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-1 md:space-y-0" 
    role="navigation"
    aria-label="Main menu"
  >
    <div 
      role="menubar" 
      className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-1 md:space-y-0"
    >
      <NavLink to="/" onClick={handleHomeClick}>
        Home
      </NavLink>
      <NavLink to="/mumbai-egg-rate" onClick={(e) => handleCityClick('Mumbai', e)}>
        Mumbai
      </NavLink>
      <NavLink to="/kolkata-egg-rate" onClick={(e) => handleCityClick('Kolkata', e)}>
        Kolkata
      </NavLink>
      <NavLink to="/lucknow-egg-rate" onClick={(e) => handleCityClick('Lucknow', e)}>
        Lucknow
      </NavLink>
      <NavLink to="/barwala-egg-rate" onClick={(e) => handleCityClick('Barwala', e)}>
        Barwala
      </NavLink>
      <NavLink to="/hyderabad-egg-rate" onClick={(e) => handleCityClick('Hyderabad', e)}>
        Hyderabad
      </NavLink>
      <NavLink to="/chennai-egg-rate" onClick={(e) => handleCityClick('Chennai', e)}>
        Chennai
      </NavLink>
      <NavLink to="/webstories">
        Web Stories
      </NavLink>
    </div>
  </nav>
));

NavLink.displayName = 'NavLink';
NavigationLinks.displayName = 'NavigationLinks';

export default NavigationLinks;
