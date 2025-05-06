import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';

// Create context
const OwnerProfileContext = createContext();

// Profile reducer
const profileReducer = (state, action) => {
  switch (action.type) {
    case 'PROFILE_REQUEST':
      return { ...state, loading: true };
    case 'PROFILE_SUCCESS':
      return {
        ...state,
        profile: action.payload,
        loading: false,
        error: null,
        isProfileComplete: action.payload !== null && action.payload.isProfileComplete !== undefined 
          ? action.payload.isProfileComplete 
          : state.isProfileComplete
      };
    case 'PROFILE_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'COMPLETION_STEPS_SUCCESS':
      return {
        ...state,
        completionSteps: action.payload.completionSteps,
        completionPercentage: action.payload.completionPercentage,
        loading: false
      };
    case 'CLEAR_PROFILE':
      return {
        profile: null,
        loading: false,
        error: null,
        isProfileComplete: false,
        completionSteps: null,
        completionPercentage: 0
      };
    default:
      return state;
  }
};

// Provider component
export const OwnerProfileProvider = ({ children }) => {
  const initialState = {
    profile: null,
    loading: true,
    error: null,
    isProfileComplete: false,
    completionSteps: null,
    completionPercentage: 0
  };

  const [state, dispatch] = useReducer(profileReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load profile data on mount and when auth state changes
  useEffect(() => {
    // If user is authenticated and is an owner, fetch their profile
    if (isAuthenticated && user && user.userType && user.userType.includes('Owner')) {
      getProfile();
    } else {
      dispatch({ type: 'CLEAR_PROFILE' });
    }
  }, [isAuthenticated, user]);

  // This effect updates the completion steps whenever the profile changes
  useEffect(() => {
    if (state.profile && !state.completionSteps) {
      getCompletionSteps();
    }
  }, [state.profile]);

  // Get owner profile
  const getProfile = async () => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });

      const response = await api.get('/owner/profile');

      if (response.data.success) {
        // Ensure we have complete profile data with default values for empty sections
        let profileData = response.data.profile;
        
        if (profileData) {
          // Ensure all sections exist with default values
          profileData = {
            ...profileData,
            personalInfo: profileData.personalInfo || {},
            businessInfo: profileData.businessInfo || {},
            preferences: {
              bookingPreferences: {
                autoAcceptBookings: false,
                minimumStayDuration: '1',
                advanceBookingDays: '7',
                instantPaymentRequired: false,
                ...(profileData.preferences?.bookingPreferences || {})
              },
              notificationSettings: {
                emailNotifications: true,
                smsNotifications: false,
                bookingAlerts: true,
                paymentAlerts: true,
                marketingUpdates: false,
                ...(profileData.preferences?.notificationSettings || {})
              },
              displaySettings: {
                showContactInfo: true,
                showPricing: true,
                featuredListing: false,
                ...(profileData.preferences?.displaySettings || {})
              },
              ...(profileData.preferences || {})
            },
            documents: profileData.documents || []
          };
        }

        dispatch({
          type: 'PROFILE_SUCCESS',
          payload: profileData
        });
        
        // Get completion steps right after profile load
        getCompletionSteps();
      } else {
        dispatch({
          type: 'PROFILE_ERROR',
          payload: 'Invalid profile data received from server'
        });
      }
    } catch (error) {
      console.error('Error fetching owner profile:', error);
      dispatch({
        type: 'PROFILE_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch profile'
      });
      toast.error(error.response?.data?.message || 'Failed to fetch profile');
    }
  };

  // Get profile completion steps
  const getCompletionSteps = async () => {
    try {
      const response = await api.get('/owner/profile/completion-steps');

      if (response.data.success) {
        dispatch({
          type: 'COMPLETION_STEPS_SUCCESS',
          payload: {
            completionSteps: response.data.completionSteps,
            completionPercentage: response.data.completionPercentage
          }
        });

        // Return the completion data for immediate use if needed
        return {
          completionSteps: response.data.completionSteps,
          completionPercentage: response.data.completionPercentage
        };
      }
    } catch (error) {
      console.error('Error fetching completion steps:', error);
      return null;
    }
  };

  // Update personal information
  const updatePersonalInfo = async (data) => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });

      const response = await api.put('/owner/profile/personal', data);

      if (response.data.success) {
        // Get the full updated profile instead of patching it
        await getProfile();
        
        // Also refresh completion steps to ensure UI reflects current state
        await getCompletionSteps();
        
        return response.data.data;
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      dispatch({
        type: 'PROFILE_ERROR',
        payload: error.response?.data?.message || 'Failed to update personal information'
      });
      throw error;
    }
  };

  // Update business information
  const updateBusinessInfo = async (data) => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });

      const response = await api.put('/owner/profile/business', data);

      if (response.data.success) {
        // Get the full updated profile instead of patching it
        await getProfile();
        
        // Also refresh completion steps to ensure UI reflects current state
        await getCompletionSteps();
        
        return response.data.data;
      }
    } catch (error) {
      console.error('Error updating business info:', error);
      dispatch({
        type: 'PROFILE_ERROR',
        payload: error.response?.data?.message || 'Failed to update business information'
      });
      throw error;
    }
  };

  // Update payment settings
  const updatePaymentSettings = async (data) => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });

      const response = await api.put('/owner/profile/payment', data);

      if (response.data.success) {
        // Get the full updated profile instead of patching it
        await getProfile();
        
        // Also refresh completion steps to ensure UI reflects current state
        await getCompletionSteps();
        
        return response.data.data;
      }
    } catch (error) {
      console.error('Error updating payment settings:', error);
      dispatch({
        type: 'PROFILE_ERROR',
        payload: error.response?.data?.message || 'Failed to update payment settings'
      });
      throw error;
    }
  };

  // Update preferences
  const updatePreferences = async (data) => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });

      // Ensure preferences has default values before sending to backend
      const preferences = {
        bookingPreferences: {
          autoAcceptBookings: false,
          minimumStayDuration: '1',
          advanceBookingDays: '7',
          instantPaymentRequired: false,
          ...(state.profile?.preferences?.bookingPreferences || {}),
          ...(data.bookingPreferences || {})
        },
        notificationSettings: {
          emailNotifications: true,
          smsNotifications: false,
          bookingAlerts: true,
          paymentAlerts: true,
          marketingUpdates: false,
          ...(state.profile?.preferences?.notificationSettings || {}),
          ...(data.notificationSettings || {})
        },
        displaySettings: {
          showContactInfo: true,
          showPricing: true,
          featuredListing: false,
          ...(state.profile?.preferences?.displaySettings || {}),
          ...(data.displaySettings || {})
        }
      };

      const response = await api.put('/owner/profile/preferences', preferences);

      if (response.data.success) {
        // Get the full updated profile instead of patching it
        await getProfile();
        
        // Also refresh completion steps to ensure UI reflects current state
        await getCompletionSteps();
        
        return response.data.data;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      dispatch({
        type: 'PROFILE_ERROR',
        payload: error.response?.data?.message || 'Failed to update preferences'
      });
      throw error;
    }
  };

  // Upload document
  const uploadDocument = async (formData) => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });

      const response = await api.post('/owner/profile/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // After document upload, refresh the entire profile
        await getProfile();
        
        // Also refresh completion steps to ensure UI reflects current state
        await getCompletionSteps();
        
        return response.data;
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      dispatch({
        type: 'PROFILE_ERROR',
        payload: error.response?.data?.message || 'Failed to upload document'
      });
      throw error;
    }
  };

  // Delete document
  const deleteDocument = async (documentId) => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });

      const response = await api.delete(`/owner/profile/documents/${documentId}`);

      if (response.data.success) {
        // After document deletion, refresh the entire profile
        await getProfile();
        
        // Also refresh completion steps to ensure UI reflects current state
        await getCompletionSteps();
        
        return response.data;
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      dispatch({
        type: 'PROFILE_ERROR',
        payload: error.response?.data?.message || 'Failed to delete document'
      });
      throw error;
    }
  };

  // Update profile picture
  const updateProfilePicture = async (formData) => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });

      const response = await api.post('/owner/profile/profileImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // After profile picture update, refresh the entire profile
        await getProfile();
        
        return response.data;
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      dispatch({
        type: 'PROFILE_ERROR',
        payload: error.response?.data?.message || 'Failed to update profile picture'
      });
      throw error;
    }
  };

  return (
    <OwnerProfileContext.Provider
      value={{
        ...state,
        getProfile,
        updatePersonalInfo,
        updateBusinessInfo,
        updatePaymentSettings,
        updatePreferences,
        uploadDocument,
        deleteDocument,
        updateProfilePicture,
        getCompletionSteps
      }}
    >
      {children}
    </OwnerProfileContext.Provider>
  );
};

// Export hook for easy context use
export const useOwnerProfile = () => useContext(OwnerProfileContext);

export default OwnerProfileContext;
