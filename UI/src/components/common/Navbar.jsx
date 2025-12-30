import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaVideo, FaUserPlus, FaSignInAlt, FaUser, FaDoorOpen } from 'react-icons/fa';
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
    <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - NexusMeet Branding */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center mr-2 shadow-lg">
                <FaVideo className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-emerald-700 bg-clip-text text-transparent">
                NexusMeet
              </span>
            </Link>
          </div>

          {/* Modern Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1 font-medium text-sm"
            >
              <span>Home</span>
            </Link>
            <Link
              to="/create-meeting"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1 font-medium text-sm"
            >
              <FaVideo className="text-blue-500" />
              <span>Create</span>
            </Link>
            <Link
              to="/join-meeting"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1 font-medium text-sm"
            >
              <FaDoorOpen className="text-emerald-500" />
              <span>Join</span>
            </Link>
          </div>

          {/* Auth Buttons - Modern Style */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 bg-gray-50 font-medium text-sm">
                  <FaUser className="text-blue-500" />
                  <span>{userName || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 font-medium text-sm cursor-pointer"
                >
                  <FaSignInAlt className="text-red-500 transform rotate-180" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200 font-medium text-sm cursor-pointer"
                >
                  <FaSignInAlt className="text-blue-500" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/register"
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-100 to-emerald-100 text-blue-600 hover:from-blue-200 hover:to-emerald-200 transition-colors duration-200 font-medium text-sm shadow-sm cursor-pointer"
                >
                  <FaUser className="text-blue-500" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition cursor-pointer">
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