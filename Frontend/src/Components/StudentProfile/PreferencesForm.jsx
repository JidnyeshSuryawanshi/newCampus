import React, { useState, useEffect } from 'react';
import { FaBell, FaEnvelope, FaUtensils, FaHome, FaDumbbell } from 'react-icons/fa';

export default function PreferencesForm({ initialData, onSave, loading }) {
  const [formData, setFormData] = useState({
    bookingReminders: true,
    emailNotifications: true,
    dietaryPreferences: [],
    accommodationPreferences: [],
    gymPreferences: []
  });

  // Predefined options for selection
  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Gluten-Free', 
    'Lactose-Free', 'Nut Allergy', 'Low Calorie', 'High Protein'
  ];

  const accommodationOptions = [
    'Single Room', 'Shared Room', 'AC', 'Non-AC', 'Attached Bathroom',
    'Study Table', 'WiFi', 'Laundry', 'Food Included', 'Near Campus'
  ];

  const gymOptions = [
    'Cardio', 'Weight Training', 'Yoga', 'Zumba', 'CrossFit',
    'Personal Training', 'Morning Hours', 'Evening Hours', 'Weekend Access'
  ];

  useEffect(() => {
    if (initialData && initialData.preferences) {
      const prefs = initialData.preferences;
      setFormData({
        bookingReminders: prefs.bookingReminders !== undefined ? prefs.bookingReminders : true,
        emailNotifications: prefs.emailNotifications !== undefined ? prefs.emailNotifications : true,
        dietaryPreferences: prefs.servicePreferences?.dietaryPreferences || [],
        accommodationPreferences: prefs.servicePreferences?.accommodationPreferences || [],
        gymPreferences: prefs.servicePreferences?.gymPreferences || []
      });
    }
  }, [initialData]);

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePreferenceToggle = (category, preference) => {
    const categoryKey = `${category}Preferences`;
    
    setFormData(prev => {
      const currentPreferences = [...prev[categoryKey]];
      
      if (currentPreferences.includes(preference)) {
        // Remove if already selected
        return {
          ...prev,
          [categoryKey]: currentPreferences.filter(p => p !== preference)
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          [categoryKey]: [...currentPreferences, preference]
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderPreferenceChips = (options, category, icon) => {
    const selectedPreferences = formData[`${category}Preferences`];
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => handlePreferenceToggle(category, option)}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
              selectedPreferences.includes(option)
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {icon}
            <span className="ml-1">{option}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <FaBell className="text-green-600 mr-2" />
        Preferences
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Notification Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="bookingReminders"
                  checked={formData.bookingReminders}
                  onChange={handleToggleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Booking Reminders</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleToggleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Email Notifications</span>
              </label>
            </div>
          </div>
          
          {/* Dietary Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Dietary Preferences</h3>
            <p className="text-sm text-gray-600 mb-2">Select your dietary preferences for mess services.</p>
            {renderPreferenceChips(dietaryOptions, 'dietary', <FaUtensils className="text-green-600 text-xs" />)}
          </div>
          
          {/* Accommodation Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Accommodation Preferences</h3>
            <p className="text-sm text-gray-600 mb-2">Select your preferences for hostels and accommodations.</p>
            {renderPreferenceChips(accommodationOptions, 'accommodation', <FaHome className="text-green-600 text-xs" />)}
          </div>
          
          {/* Gym Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Gym Preferences</h3>
            <p className="text-sm text-gray-600 mb-2">Select your preferences for gym facilities.</p>
            {renderPreferenceChips(gymOptions, 'gym', <FaDumbbell className="text-green-600 text-xs" />)}
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
            ) : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
} 