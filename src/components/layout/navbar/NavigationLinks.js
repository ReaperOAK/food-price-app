import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const NavigationLinks = memo(({ handleHomeClick, handleCityClick }) => (
  <>
    <Link
      to="/"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={handleHomeClick}
    >
      Home
    </Link>
    <Link
      to="/mumbai-egg-rate"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={(e) => handleCityClick('Mumbai', e)}
    >
      Mumbai
    </Link>
    <Link
      to="/kolkata-egg-rate"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={(e) => handleCityClick('Kolkata', e)}
    >
      Kolkata
    </Link>
    <Link
      to="/lucknow-egg-rate"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={(e) => handleCityClick('Lucknow', e)}
    >
      Lucknow
    </Link>
    <Link
      to="/barwala-egg-rate"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={(e) => handleCityClick('Barwala', e)}
    >
      Barwala
    </Link>
    <Link
      to="/hyderabad-egg-rate"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={(e) => handleCityClick('Hyderabad', e)}
    >
      Hyderabad
    </Link>
    <Link
      to="/chennai-egg-rate"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={(e) => handleCityClick('Chennai', e)}
    >
      Chennai
    </Link>
    <Link
      to="/webstories"
      className="text-gray-800 hover:text-blue-600 font-medium transition duration-300 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Web Stories
    </Link>
  </>
));

NavigationLinks.displayName = 'NavigationLinks';

export default NavigationLinks;
