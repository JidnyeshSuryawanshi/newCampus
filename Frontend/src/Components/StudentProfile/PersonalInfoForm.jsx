import React, { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaBirthdayCake, FaVenusMars } from 'react-icons/fa';

export default function PersonalInfoForm({ initialData, onSave, loading }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: ''
  });

  useEffect(() => {
    if (initialData && initialData.personalInfo) {
      setFormData({
        fullName: initialData.personalInfo.fullName || '',
        phoneNumber: initialData.personalInfo.phoneNumber || '',
        dateOfBirth: initialData.personalInfo.dateOfBirth ? new Date(initialData.personalInfo.dateOfBirth).toISOString().split('T')[0] : '',
        gender: initialData.personalInfo.gender || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a copy of the form data for submission
    const submissionData = {
      ...formData,
      // If date is empty string, set to null to avoid invalid date errors
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null
    };
    
    onSave(submissionData);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <FaUser className="text-green-600 mr-2" />
        Personal Information
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="fullName">
              Full Name*
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          {/* Phone Number */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phoneNumber">
              Phone Number*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaPhone className="text-gray-400" />
              </div>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your phone number"
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                required
              />
            </div>
          </div>
          
          {/* Date of Birth */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="dateOfBirth">
              Date of Birth
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaBirthdayCake className="text-gray-400" />
              </div>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          {/* Gender */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="gender">
              Gender
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaVenusMars className="text-gray-400" />
              </div>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Information'}
          </button>
        </div>
      </form>
    </div>
  );
} 