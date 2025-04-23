import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminNavbar = ({setIsAuthenticated}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <Link to="/admin" className="text-white text-2xl font-bold">Admin Dashboard</Link>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={handleLogout} 
            className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
