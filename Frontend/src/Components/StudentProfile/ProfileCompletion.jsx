import React, { useEffect } from 'react';
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa';

export default function ProfileCompletion({ completedSections }) {
  // Define the sections of the profile
  const sections = [
    { id: 'profile', name: 'Personal Information' },
    { id: 'academic', name: 'Academic Information' },
    { id: 'preferences', name: 'Preferences' },
    { id: 'documents', name: 'Documents' }
  ];

  // For debugging
  useEffect(() => {
    console.log('ProfileCompletion received:', completedSections);
  }, [completedSections]);

  // Calculate completion percentage
  const completedCount = completedSections ? Object.values(completedSections).filter(Boolean).length : 0;
  const totalSections = sections.length;
  const completionPercentage = Math.round((completedCount / totalSections) * 100);

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Profile Completion</h2>
        <span className="text-lg font-bold text-green-600">{completionPercentage}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      {/* Sections list */}
      <div className="space-y-3">
        {sections.map((section) => {
          const isCompleted = completedSections && completedSections[section.id];
          
          return (
            <div key={section.id} className="flex items-center">
              {isCompleted ? (
                <FaCheckCircle className="text-green-600 mr-2" />
              ) : (
                <FaRegCircle className="text-gray-400 mr-2" />
              )}
              <span className={`${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                {section.name}
              </span>
              {isCompleted && (
                <span className="ml-auto text-sm text-green-600 font-medium">Completed</span>
              )}
            </div>
          );
        })}
      </div>
      
      {completionPercentage < 100 && (
        <div className="mt-6 p-3 bg-green-50 border border-green-100 rounded-md">
          <p className="text-sm text-green-800">
            Complete your profile to access all features and get personalized recommendations!
          </p>
        </div>
      )}
      
      {completionPercentage === 100 && (
        <div className="mt-6 p-3 bg-green-50 border border-green-100 rounded-md">
          <p className="text-sm text-green-800 font-medium flex items-center">
            <FaCheckCircle className="mr-2" />
            Your profile is complete! You now have access to all features.
          </p>
        </div>
      )}
    </div>
  );
}