import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaBook, FaUtensils, FaDumbbell, FaUser, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function StudentSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout(() => navigate('/login'));
  };

  const navLinks = [
    { to: "/dashboard", icon: FaHome, label: "Dashboard" },
    { to: "/dashboard/hostels", icon: FaBook, label: "Hostels" },
    { to: "/dashboard/mess", icon: FaUtensils, label: "Mess Services" },
    { to: "/dashboard/gym", icon: FaDumbbell, label: "Gym" },
    { to: "/dashboard/profile", icon: FaUser, label: "Profile" },
  ];

  return (
    <>
      <aside className="w-64 bg-white shadow-md fixed h-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-green-600 mb-6">CampusCove</h2>
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center space-x-3 text-red-600 hover:text-red-700 transition-colors w-full px-4 py-3 rounded-lg hover:bg-gray-100"
          >
            <FaSignOutAlt className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Confirm Logout</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowLogoutModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">Are you sure you want to logout from your account?</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}