import React, { useEffect } from 'react';
import { FaCheckCircle, FaRegCircle, FaSpinner } from 'react-icons/fa';

export default function ProfileCompletion({ completedSections, completionPercentage: contextPercentage }) {
  // Define the sections of the profile
  const sections = [
    { id: 'personal', name: 'Personal Information' },
    { id: 'business', name: 'Business Information' },
    { id: 'preferences', name: 'Preferences' },
    { id: 'documents', name: 'Documents' }
  ];

  // Calculate completion percentage - use context value if available, otherwise calculate locally
  const completedCount = completedSections ? Object.values(completedSections).filter(Boolean).length : 0;
  const totalSections = sections.length;
  const completionPercentage = contextPercentage !== undefined ? contextPercentage : Math.round((completedCount / totalSections) * 100);

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Profile Completion</h2>
        <div className="flex items-center">
          {completedSections === null ? (
            <FaSpinner className="animate-spin text-blue-600 mr-2" />
          ) : (
            <span className="text-lg font-bold text-blue-600">{completionPercentage}%</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <span>Not Started</span>
        <span>In Progress</span>
        <span>Complete</span>
      </div>

      {/* Sections list */}
      <div className="space-y-3">
        {sections.map((section) => {
          // Default to false if completedSections is null or section status is undefined
          const isCompleted = completedSections ? Boolean(completedSections[section.id]) : false;

          return (
            <div key={section.id} className="flex items-center">
              {isCompleted ? (
                <FaCheckCircle className="text-blue-600 mr-2" />
              ) : (
                <FaRegCircle className="text-gray-400 mr-2" />
              )}
              <span className={`${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                {section.name}
              </span>
            </div>
          );
        })}
      </div>

      {completionPercentage < 100 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
          Complete your profile to improve visibility and gain customer trust.
        </div>
      )}

      {completionPercentage === 100 && (
        <div className="mt-4 p-3 bg-green-50 rounded-md text-sm text-green-700">
          Great job! Your profile is complete and ready for customers.
        </div>
      )}
    </div>
  );
}
