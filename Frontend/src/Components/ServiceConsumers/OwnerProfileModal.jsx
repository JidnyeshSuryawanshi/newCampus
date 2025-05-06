import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaPhone, 
  FaBuilding, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaSpinner, 
  FaIdCard 
} from 'react-icons/fa';
import { fetchOwnerProfileById } from '../../utils/api';

const OwnerProfileModal = ({ ownerId, onClose }) => {
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOwnerProfile = async () => {
      if (!ownerId) return;
      
      try {
        setLoading(true);
        const response = await fetchOwnerProfileById(ownerId);
        setOwnerProfile(response.profile);
        setError(null);
      } catch (err) {
        console.error('Error fetching owner profile:', err);
        setError('Could not load owner profile information');
      } finally {
        setLoading(false);
      }
    };
    
    getOwnerProfile();
  }, [ownerId]);

  // Handler for clicking the backdrop (to close the modal)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1001] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-md animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaIdCard className="text-green-600 mr-2" />
            Owner Profile
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-green-600 text-3xl" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">{error}</p>
            <p className="text-gray-600 text-sm">Please try again later.</p>
          </div>
        ) : ownerProfile ? (
          <div className="space-y-4">
            {/* Personal Info Section */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-3 flex items-center">
                <FaUser className="mr-2" />
                Personal Information
              </h4>
              
              <div className="space-y-3">
                {/* Profile Image */}
                {ownerProfile.personalInfo.profileImage?.url && (
                  <div className="flex justify-center mb-3">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                      <img 
                        src={ownerProfile.personalInfo.profileImage.url} 
                        alt={ownerProfile.personalInfo.fullName || "Owner"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">
                    {ownerProfile.personalInfo.fullName || "Not provided"}
                  </p>
                </div>
                
                {/* Contact Information */}
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="font-medium flex items-center">
                    <FaPhone className="text-green-600 mr-2 text-sm" />
                    {ownerProfile.personalInfo.phoneNumber || "Not provided"}
                  </p>
                </div>
                
                {ownerProfile.personalInfo.alternatePhone && (
                  <div>
                    <p className="text-sm text-gray-500">Alternate Number</p>
                    <p className="font-medium flex items-center">
                      <FaPhone className="text-green-600 mr-2 text-sm" />
                      {ownerProfile.personalInfo.alternatePhone}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Business Info Section */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                <FaBuilding className="mr-2" />
                Business Information
              </h4>
              
              <div className="space-y-3">
                {/* Business Name */}
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="font-medium">
                    {ownerProfile.businessInfo.businessName || "Not provided"}
                  </p>
                </div>
                
                {/* Business Type */}
                {ownerProfile.businessInfo.businessType && (
                  <div>
                    <p className="text-sm text-gray-500">Business Type</p>
                    <p className="font-medium capitalize">
                      {ownerProfile.businessInfo.businessType}
                    </p>
                  </div>
                )}
                
                {/* Establishment Year */}
                {ownerProfile.businessInfo.establishmentYear && (
                  <div>
                    <p className="text-sm text-gray-500">Established</p>
                    <p className="font-medium flex items-center">
                      <FaCalendarAlt className="text-blue-600 mr-2 text-sm" />
                      {ownerProfile.businessInfo.establishmentYear}
                    </p>
                  </div>
                )}
                
                {/* Business Address */}
                {ownerProfile.businessInfo.businessAddress && (
                  <div>
                    <p className="text-sm text-gray-500">Business Address</p>
                    <p className="font-medium flex items-start">
                      <FaMapMarkerAlt className="text-blue-600 mr-2 text-sm mt-1" />
                      <span>{ownerProfile.businessInfo.businessAddress}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Verification Status */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Profile Status</span>
                {ownerProfile.isProfileComplete ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Verified
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Basic Profile
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No profile information available.</p>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfileModal; 