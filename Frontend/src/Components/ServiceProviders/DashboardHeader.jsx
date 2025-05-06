import React from 'react';
import { FaBell, FaCalendarAlt, FaRegClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function DashboardHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const isOwner = user?.userType.includes('Owner');
  
  // Get current date in a nice format
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get current time
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('services')) return 'Service Management';
    if (path.includes('bookings')) return 'Bookings';
    if (path.includes('revenew')) return 'Revenue';
    if (path.includes('all-customers')) return 'Customers';
    if (path.includes('profile')) return 'Profile';
    return 'Dashboard';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-blue-600">{getPageTitle()}</h1>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <FaCalendarAlt className="mr-2" />
            <span>{currentDate}</span>
            <span className="mx-2">•</span>
            <FaRegClock className="mr-2" />
            <span>{currentTime}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600">
            <FaBell className="text-xl" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right mr-2">
              <p className="text-sm font-medium text-gray-700">Welcome back,</p>
              <p className="text-xs text-gray-500">{isOwner ? 'Service Provider' : 'Student'}</p>
            </div>
            <img
              src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=4F46E5&color=fff`}
              alt="Profile"
              className="h-10 w-10 rounded-full border-2 border-blue-500"
            />
            <span className="font-medium text-gray-700">{user?.username}</span>
          </div>
        </div>
      </div>
    </header>
  );
}