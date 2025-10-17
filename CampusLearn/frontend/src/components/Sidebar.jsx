import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  FiHome, 
  FiBookOpen, 
  FiUsers, 
  FiSettings, 
  FiSun, 
  FiMoon, 
  FiLogOut, 
  FiX 
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { path: '/admin/create-course', label: 'Create Course', icon: <FiBookOpen className="w-5 h-5" /> },
    { path: '/admin/students', label: 'Students', icon: <FiUsers className="w-5 h-5" /> },
    { path: '/admin/settings', label: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  return (
    <div 
      className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white dark:bg-gray-800 
      shadow-lg z-50 flex flex-col`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with logo and close button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">CampusLearn</h2>
        <button 
          onClick={onClose}
          className="md:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          aria-label="Close menu"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={onClose}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer with theme toggle and logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center">
            {theme === 'dark' ? (
              <>
                <FiMoon className="mr-3 w-5 h-5" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <FiSun className="mr-3 w-5 h-5" />
                <span>Light Mode</span>
              </>
            )}
          </div>
          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
            {theme === 'dark' ? 'ON' : 'OFF'}
          </span>
        </button>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
        >
          <FiLogOut className="mr-3 w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;