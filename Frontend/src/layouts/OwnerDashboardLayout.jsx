import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { 
  FaHome, FaUsers, FaMoneyBillWave, FaClipboardList, 
  FaCog, FaSignOutAlt, FaBell, FaSearch, FaPlus, FaUser 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function OwnerDashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-5 border-b">
          <h2 className="text-2xl font-bold text-blue-600">CampusCove</h2>
          <p className="text-gray-500">Business Portal</p>
        </div>
        <nav className="mt-8">
          <Link to="/owner-dashboard" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            <FaHome className="mr-3" /> Overview
          </Link>
          <Link to="/owner-dashboard/customers" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            <FaUsers className="mr-3" /> Customers
          </Link>
          <Link to="/owner-dashboard/revenue" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            <FaMoneyBillWave className="mr-3" /> Revenue
          </Link>
          <Link to="/owner-dashboard/bookings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            <FaClipboardList className="mr-3" /> Bookings
          </Link>
          <Link to="/owner-dashboard/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            <FaCog className="mr-3" /> Settings
          </Link>
          <Link to="/owner-dashboard/profile" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
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
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <FaPlus className="mr-2" /> Add Listing
              </button>
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <FaBell className="text-xl" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.username || 'Owner'}`}
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