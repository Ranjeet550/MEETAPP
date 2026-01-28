import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaVideo, FaSignInAlt, FaUser, FaDoorOpen } from 'react-icons/fa';
import { useNotifications } from '../../hooks/useNotifications';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  
  const { notifyLogoutSuccess } = useNotifications();

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const name = localStorage.getItem('userName');
      
      setIsLoggedIn(!!token);
      setUserName(name || '');
    };

    // Initial check
    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'userName') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event listener for same-tab login/logout
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUserName('');
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
    
    // Show logout notification
    notifyLogoutSuccess();
    
    // Redirect after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };
  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - NexusMeet Branding */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                <FaVideo className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                NexusMeet
              </span>
            </Link>
          </div>

          {/* Modern Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-white hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-1 font-medium text-sm"
            >
              <span>Home</span>
            </Link>
            <Link
              to="/create-meeting"
              className="text-white hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-1 font-medium text-sm"
            >
              <FaVideo className="text-cyan-400" />
              <span>Create</span>
            </Link>
            <Link
              to="/join-meeting"
              className="text-white hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-1 font-medium text-sm"
            >
              <FaDoorOpen className="text-cyan-400" />
              <span>Join</span>
            </Link>
          </div>

          {/* Auth Buttons - Modern Style */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg text-white bg-gray-700 font-medium text-sm">
                  <FaUser className="text-cyan-400" />
                  <span>{userName || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-900 text-red-400 hover:bg-red-800 transition-colors duration-200 font-medium text-sm cursor-pointer"
                >
                  <FaSignInAlt className="text-red-400 transform rotate-180" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg text-cyan-400 hover:bg-gray-800 transition-colors duration-200 font-medium text-sm cursor-pointer"
                >
                  <FaSignInAlt className="text-cyan-400" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/register"
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600 transition-colors duration-200 font-medium text-sm shadow-sm cursor-pointer"
                >
                  <FaUser className="text-white" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg bg-gray-700 text-cyan-400 hover:bg-gray-600 transition cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;