import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSpinner, FaUser, FaEnvelope, FaClock, FaUserTag } from 'react-icons/fa';
import ProfileCompletion from './StudentProfile/ProfileCompletion';
import PersonalInfoForm from './StudentProfile/PersonalInfoForm';
import AcademicInfoForm from './StudentProfile/AcademicInfoForm';
import PreferencesForm from './StudentProfile/PreferencesForm';
import DocumentsForm from './StudentProfile/DocumentsForm';
import { toast } from 'react-toastify';
import api, { getUserDetails, updatePersonalInfo } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [completedSections, setCompletedSections] = useState({
    profile: false,
    academic: false,
    preferences: false,
    documents: false
  });

  // Determine if user is an owner for theming
  const isOwner = user?.userType.includes('owner');
  const themeColor = isOwner ? 'blue' : 'green';

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await getUserDetails();

      if (response.success && response.data) {
        // The new API returns both user account and profile data
        const { account, profile } = response.data;
        
        // Set profile data if it exists, otherwise set an empty object
        setProfileData(profile || {});
        console.log('User details successfully loaded:', response.data);
        
        // Only update completed sections if profile exists
        if (profile) {
          // Update completed sections based on correct data structure
          const updatedCompletedSections = {
            profile: Boolean(
              profile.personalInfo && 
              profile.personalInfo.fullName && 
              profile.personalInfo.phoneNumber
            ),
            academic: Boolean(
              profile.academicInfo && 
              profile.academicInfo.institution && 
              profile.academicInfo.studentId && 
              profile.academicInfo.course
            ),
            preferences: Boolean(
              profile.preferences && 
              (profile.preferences.bookingReminders !== undefined || 
               profile.preferences.emailNotifications !== undefined)
            ),
            documents: Boolean(
              profile.documents && 
              profile.documents.length > 0
            )
          };
          
          console.log('Profile completion status:', updatedCompletedSections);
          setCompletedSections(updatedCompletedSections);
          
          // Calculate and log overall completion percentage
          const completedCount = Object.values(updatedCompletedSections).filter(Boolean).length;
          const totalSections = Object.keys(updatedCompletedSections).length;
          const completionPercentage = Math.round((completedCount / totalSections) * 100);
          console.log(`Overall profile completion: ${completionPercentage}%`);
        }
      } else {
        console.error('Invalid user data format:', response);
        toast.error('Invalid user data received from server');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error(error.response?.data?.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfileInfo = async (data) => {
    try {
      setSaving(true);
      
      // Use the API utility function instead of direct axios call
      const response = await updatePersonalInfo(data);
      
      if (response.success) {
        toast.success('Profile information updated successfully');
        
        // Refresh profile data to ensure consistency with server data
        await fetchProfileData();
      }
    } catch (error) {
      console.error('Error saving profile info:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAcademicInfo = async (data) => {
    try {
      setSaving(true);
      const response = await api.put('/student/profile/academic', data);
      
      if (response.data.success) {
        toast.success('Academic information updated successfully');
        // Update the profile data with the new values
        setProfileData(prev => ({
          ...prev,
          academicInfo: {
            ...prev.academicInfo,
            institution: data.institution,
            studentId: data.studentId,
            course: data.course,
            year: data.year,
            graduationYear: data.graduationYear
          }
        }));
        setCompletedSections(prev => ({ ...prev, academic: true }));
      }
    } catch (error) {
      console.error('Error saving academic info:', error);
      toast.error(error.response?.data?.message || 'Failed to update academic information');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (data) => {
    try {
      setSaving(true);
      const response = await api.put('/student/profile/preferences', data);
      
      if (response.data.success) {
        toast.success('Preferences updated successfully');
        // Update profile data with new preferences
        setProfileData(prev => ({
          ...prev,
          preferences: {
            bookingReminders: data.bookingReminders,
            emailNotifications: data.emailNotifications,
            servicePreferences: {
              dietaryPreferences: data.dietaryPreferences,
              accommodationPreferences: data.accommodationPreferences,
              gymPreferences: data.gymPreferences
            }
          }
        }));
        setCompletedSections(prev => ({ ...prev, preferences: true }));
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  // Refresh profile data after document upload/deletion
  const refreshProfileData = async () => {
    try {
      const response = await getUserDetails();
      
      if (response.success && response.data) {
        const { profile } = response.data;
        
        if (profile) {
          setProfileData(profile);
          console.log('Profile data refreshed successfully');
          
          // Update all completion statuses
          const updatedCompletedSections = {
            profile: Boolean(
              profile.personalInfo && 
              profile.personalInfo.fullName && 
              profile.personalInfo.phoneNumber
            ),
            academic: Boolean(
              profile.academicInfo && 
              profile.academicInfo.institution && 
              profile.academicInfo.studentId && 
              profile.academicInfo.course
            ),
            preferences: Boolean(
              profile.preferences && 
              (profile.preferences.bookingReminders !== undefined || 
               profile.preferences.emailNotifications !== undefined)
            ),
            documents: Boolean(
              profile.documents && 
              profile.documents.length > 0
            )
          };
          
          setCompletedSections(updatedCompletedSections);
          
          // Calculate and log overall completion percentage
          const completedCount = Object.values(updatedCompletedSections).filter(Boolean).length;
          const totalSections = Object.keys(updatedCompletedSections).length;
          const completionPercentage = Math.round((completedCount / totalSections) * 100);
          console.log(`Overall profile completion: ${completionPercentage}%`);
          
          return profile;
        } else {
          console.log('No profile data found during refresh');
          setProfileData({});
        }
      } else {
        console.error('Invalid user data format during refresh:', response);
      }
    } catch (error) {
      console.error('Error refreshing profile data:', error);
      // Don't show toast to avoid confusion, as this is a background refresh
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className={`animate-spin text-${themeColor}-600 text-4xl`} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex-shrink-0">
          {profileData?.personalInfo?.profilePicture?.url ? (
            <img 
              src={profileData.personalInfo.profilePicture.url} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
            />
          ) : (
            <FaUserCircle className={`w-24 h-24 text-${themeColor}-400`} />
          )}
        </div>
        <div>
          <h1 className={`text-2xl font-bold text-${themeColor}-800`}>
            {profileData?.personalInfo?.fullName || user?.username || 'Complete Your Profile'}
          </h1>
          <p className="text-gray-600">
            {user?.email || 'Update your information to enhance your experience'}
          </p>
        </div>
      </div>
      
      {/* Basic Account Information */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-6">
        <h2 className={`text-xl font-semibold text-${themeColor}-800 mb-4`}>Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <FaUser className={`text-xl text-${themeColor}-600`} />
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium">{user?.username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <FaEnvelope className={`text-xl text-${themeColor}-600`} />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <FaUserTag className={`text-xl text-${themeColor}-600`} />
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-medium capitalize">{user?.userType}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <FaClock className={`text-xl text-${themeColor}-600`} />
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ProfileCompletion completedSections={completedSections} />
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">Profile Sections</h3>
            </div>
            <ul>
              <li>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 flex items-center ${
                    activeTab === 'profile' ? `bg-${themeColor}-50 text-${themeColor}-700` : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mr-3 ${
                    completedSections.profile ? `bg-${themeColor}-500` : 'bg-gray-300'
                  }`}></span>
                  Personal Information
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('academic')}
                  className={`w-full text-left px-4 py-3 flex items-center ${
                    activeTab === 'academic' ? `bg-${themeColor}-50 text-${themeColor}-700` : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mr-3 ${
                    completedSections.academic ? `bg-${themeColor}-500` : 'bg-gray-300'
                  }`}></span>
                  Academic Information
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full text-left px-4 py-3 flex items-center ${
                    activeTab === 'preferences' ? `bg-${themeColor}-50 text-${themeColor}-700` : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mr-3 ${
                    completedSections.preferences ? `bg-${themeColor}-500` : 'bg-gray-300'
                  }`}></span>
                  Preferences
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`w-full text-left px-4 py-3 flex items-center ${
                    activeTab === 'documents' ? `bg-${themeColor}-50 text-${themeColor}-700` : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mr-3 ${
                    completedSections.documents ? `bg-${themeColor}-500` : 'bg-gray-300'
                  }`}></span>
                  Documents & Verification
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="md:col-span-2">
          {activeTab === 'profile' && (
            <PersonalInfoForm 
              initialData={profileData} 
              onSave={handleSaveProfileInfo}
              loading={saving}
            />
          )}
          
          {activeTab === 'academic' && (
            <AcademicInfoForm 
              initialData={profileData} 
              onSave={handleSaveAcademicInfo}
              loading={saving}
            />
          )}
          
          {activeTab === 'preferences' && (
            <PreferencesForm
              initialData={profileData}
              onSave={handleSavePreferences}
              loading={saving}
            />
          )}
          
          {activeTab === 'documents' && (
            <DocumentsForm
              initialData={profileData}
              onRefresh={refreshProfileData}
            />
          )}
        </div>
      </div>
    </div>
  );
}