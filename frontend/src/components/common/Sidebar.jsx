// src/components/common/Sidebar.jsx
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

function Sidebar() {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <>
      {/* Mobile Header - Always visible on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-800 dark:bg-gray-900 shadow-md">
        <div className="flex justify-between items-center px-4 py-2">
          <div className="font-bold text-white">
            {currentUser?.role === 'admin' ? `Admin ${currentUser.username}` : currentUser?.username}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-white focus:outline-none"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - always visible on lg screens, conditional on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-30 
        w-64 bg-gray-800 dark:bg-gray-900 text-white
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Desktop Header - Only visible on desktop */}
        <div className="hidden lg:flex justify-between items-center p-4 border-b border-gray-700 dark:border-gray-800">
          <div className="font-bold text-white text-xl">
            {currentUser?.role === 'admin' ? `Admin ${currentUser.username}` : currentUser?.username}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-700 dark:bg-gray-800 text-white hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 lg:mt-6 px-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive 
                ? "block py-3 px-4 bg-blue-600 text-white rounded-md" 
                : "block py-3 px-4 hover:bg-gray-700 dark:hover:bg-gray-800 text-gray-300 rounded-md"
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink 
            to="/projects" 
            className={({ isActive }) => 
              isActive 
                ? "block py-3 px-4 bg-blue-600 text-white rounded-md mt-1" 
                : "block py-3 px-4 hover:bg-gray-700 dark:hover:bg-gray-800 text-gray-300 rounded-md mt-1"
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Projects
          </NavLink>
          <NavLink 
            to="/tasks" 
            className={({ isActive }) => 
              isActive 
                ? "block py-3 px-4 bg-blue-600 text-white rounded-md mt-1" 
                : "block py-3 px-4 hover:bg-gray-700 dark:hover:bg-gray-800 text-gray-300 rounded-md mt-1"
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Tasks
          </NavLink>
          <NavLink 
            to="/chat" 
            className={({ isActive }) => 
              isActive 
                ? "block py-3 px-4 bg-blue-600 text-white rounded-md mt-1" 
                : "block py-3 px-4 hover:bg-gray-700 dark:hover:bg-gray-800 text-gray-300 rounded-md mt-1"
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Chat
          </NavLink>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;