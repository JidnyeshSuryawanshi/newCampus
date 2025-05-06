import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Create context
const StudentProfileContext = createContext();

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
        isProfileComplete: action.payload !== null
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
export const StudentProfileProvider = ({ children }) => {
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

  useEffect(() => {
    // If user is authenticated and is a student, fetch their profile
    if (isAuthenticated && user && user.userType === 'student') {
      getProfile();
      getCompletionSteps();
    } else {
      dispatch({ type: 'CLEAR_PROFILE' });
    }
  }, [isAuthenticated, user]);

  // Get user profile
  const getProfile = async () => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });
      
      const response = await axios.get('/api/student/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      dispatch({
        type: 'PROFILE_SUCCESS',
        payload: response.data.data
      });
    } catch (error) {
      dispatch({
        type: 'PROFILE_ERROR',
        payload: error.response?.data?.error || 'Failed to fetch profile'
      });
      toast.error(error.response?.data?.error || 'Failed to fetch profile');
    }
  };

  // Get profile completion steps
  const getCompletionSteps = async () => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });
      
      const response = await axios.get('/api/student/profile/completion-steps', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      dispatch({
        type: 'COMPLETION_STEPS_SUCCESS',
        payload: {
          completionSteps: response.data.completionSteps,
          completionPercentage: response.data.completionPercentage
        }
      });
    } catch (error) {
      dispatch({
        type: 'PROFILE_ERROR',
        payload: error.response?.data?.error || 'Failed to fetch completion steps'
      });
    }
  };

  // Create or update profile
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });
      
      let response;
      if (state.profile) {
        // Update existing profile
        response = await axios.put('/api/student/profile', profileData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        toast.success('Profile updated successfully');
      } else {
        // Create new profile
        response = await axios.post('/api/student/profile', profileData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        toast.success('Profile created successfully');
      }
      
      dispatch({
        type: 'PROFILE_SUCCESS',
        payload: response.data.data
      });
      
      // Refresh completion steps
      getCompletionSteps();
      
      return response.data.data;
    } catch (error) {
      dispatch({
        type: 'PROFILE_ERROR',
        payload: error.response?.data?.error || 'Failed to update profile'
      });
      toast.error(error.response?.data?.error || 'Failed to update profile');
      throw error;
    }
  };

  // Update profile picture
  const updateProfilePicture = async (formData) => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });
      
      const response = await axios.put('/api/student/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      dispatch({
        type: 'PROFILE_SUCCESS',
        payload: response.data.data
      });
      
      toast.success('Profile picture updated');
      return response.data.data;
    } catch (error) {
      dispatch({
        type: 'PROFILE_ERROR',
        payload: error.response?.data?.error || 'Failed to update profile picture'
      });
      toast.error(error.response?.data?.error || 'Failed to update profile picture');
      throw error;
    }
  };

  return (
    <StudentProfileContext.Provider
      value={{
        ...state,
        getProfile,
        updateProfile,
        updateProfilePicture,
        getCompletionSteps
      }}
    >
      {children}
    </StudentProfileContext.Provider>
  );
};

// Export hook for easy context use
export const useStudentProfile = () => useContext(StudentProfileContext);

export default StudentProfileContext; 