import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FaHome, FaBook, FaUtensils, FaDumbbell, FaUser, FaSignOutAlt, FaBell, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-5 border-b">
          <h2 className="text-2xl font-bold text-green-600">CampusCove</h2>
          <p className="text-gray-500">Student Portal</p>
        </div>
        <nav className="mt-8">
          <Link to="/student-dashboard" className="flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600">
            <FaHome className="mr-3" /> Dashboard
          </Link>
          <Link to="/student-dashboard/hostels" className="flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600">
            <FaBook className="mr-3" /> Hostels
          </Link>
          <Link to="/student-dashboard/mess" className="flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600">
            <FaUtensils className="mr-3" /> Mess Services
          </Link>
          <Link to="/student-dashboard/gym" className="flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600">
            <FaDumbbell className="mr-3" /> Gym
          </Link>
          <Link to="/student-dashboard/profile" className="flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600">
            <FaUser className="mr-3" /> Profile
          </Link>
          <button 
            onClick={logout}
            className="flex items-center px-6 py-3 text-red-600 hover:bg-red-50 w-full mt-auto"
          >
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <FaBell className="text-xl" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}`}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <span className="font-medium text-gray-700">{user?.username}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
} 