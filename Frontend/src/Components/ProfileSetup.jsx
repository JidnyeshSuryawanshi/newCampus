import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');
  const [formData, setFormData] = useState({
    phoneNumber: '',
    address: '',
    // Add more fields based on user type
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://campus-cove.onrender.com/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Redirect based on user type
        if (userType === 'student') {
          navigate('/student-dashboard');
        } else {
          navigate('/business-dashboard');
        }
      }
    } catch (error) {
      console.error('Profile setup error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
} 