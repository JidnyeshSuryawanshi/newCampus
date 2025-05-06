import React, { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

export default function PersonalInfoForm({ initialData, onSave, loading, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    alternatePhone: ''
  });

  useEffect(() => {
    // Only update form if we have real data
    if (initialData && initialData.personalInfo) {
      setFormData({
        fullName: initialData.personalInfo.fullName || '',
        phoneNumber: initialData.personalInfo.phoneNumber || '',
        alternatePhone: initialData.personalInfo.alternatePhone || ''
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
    onSave(formData);
  };

  // Check if required fields are filled to determine completion status
  const isPersonalInfoComplete = 
    initialData?.personalInfo?.fullName && 
    initialData?.personalInfo?.phoneNumber;

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={onCancel}
            className="mr-4 p-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            title="Go back"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaUser className="text-blue-600 mr-2" />
            Personal Information
          </h2>
        </div>
        {isPersonalInfoComplete && (
          <div className="flex items-center text-green-600">
            <FaCheckCircle className="mr-1" />
            <span className="text-sm">Completed</span>
          </div>
        )}
      </div>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                required
              />
            </div>
          </div>

          {/* Alternate Phone */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="alternatePhone">
              Alternate Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaPhone className="text-gray-400" />
              </div>
              <input
                type="tel"
                id="alternatePhone"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter alternate phone (optional)"
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {isPersonalInfoComplete ?
              <span className="text-green-600">Your personal information is saved</span> :
              <span>Please fill in your personal information</span>
            }
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-300"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 flex items-center"
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
              ) : (
                'Save Information'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
