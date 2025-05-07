import axios from 'axios';

// Configure API URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add a request interceptor to include auth token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling
    if (error.response) {
      // Server responded with an error status code
      console.error('API Error Response:', error.response.data);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // You might want to redirect to login or refresh token
        console.warn('Authentication error. Redirecting to login...');
        // Uncomment to redirect to login on auth errors
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No Response:', error.request);
    } else {
      // Something else caused the error
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API request utilities
export const fetchHostels = async () => {
  try {
    const response = await api.get('/hostel-rooms');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const fetchMessServices = async () => {
  try {
    const response = await api.get('/mess');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const fetchGyms = async () => {
  try {
    const response = await api.get('/gym');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching gyms:', error);
    throw error;
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const createStudentProfile = async (profileData) => {
  try {
    const response = await api.post('/student/profile', profileData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateStudentProfile = async (profileData) => {
  try {
    const response = await api.put('/student/profile', profileData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentProfileStatus = async () => {
  try {
    const response = await api.get('/student/profile/status');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfileCompletionSteps = async () => {
  try {
    const response = await api.get('/student/profile/completion-steps');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Student Profile API methods
export const getUserDetails = async () => {
  try {
    const response = await api.get('/student/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

export const getStudentProfile = async () => {
  try {
    const response = await api.get('/student/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePersonalInfo = async (data) => {
  try {
    // Ensure date is properly formatted before sending to backend
    const formattedData = {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null
    };
    
    const response = await api.put('/student/profile/personal', formattedData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAcademicInfo = async (data) => {
  try {
    const response = await api.put('/student/profile/academic', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePaymentInfo = async (data) => {
  try {
    const response = await api.put('/student/profile/payment', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePreferences = async (data) => {
  try {
    const response = await api.put('/student/profile/preferences', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadDocument = async (formData, onUploadProgress) => {
  try {
    const response = await api.post('/student/profile/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDocument = async (documentId) => {
  try {
    const response = await api.delete(`/student/profile/documents/${documentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// All owner profile related functions have been removed

// Function to fetch owner details by ID
export const fetchOwnerDetails = async (ownerId) => {
  try {
    const response = await api.get(`/users/${ownerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching owner details:', error);
    throw error;
  }
};

// Function to fetch owner profile by user ID
export const fetchOwnerProfileById = async (userId) => {
  try {
    const response = await api.get(`/owner/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching owner profile:', error);
    throw error;
  }
};

// Booking related API functions
export const createBookingRequest = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getBookings = async (status) => {
  try {
    const url = status ? `/bookings?status=${status}` : '/bookings';
    const response = await api.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.put(`/bookings/${bookingId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (bookingId, paymentStatus) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/payment`, { paymentStatus });
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Function to fetch accepted bookings (customers for owners)
export const getAcceptedBookings = async () => {
  try {
    const response = await api.get('/bookings?status=accepted');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching accepted bookings:', error);
    throw error;
  }
};

// Function to check booking status for a specific service
export const checkServiceBookingStatus = async (serviceType, serviceId) => {
  try {
    const allBookings = await getBookings();
    
    // Find the relevant booking for this service
    const bookings = allBookings.filter(
      booking => booking.serviceType === serviceType && booking.serviceId === serviceId
    );
    
    if (bookings.length === 0) {
      return { hasBooking: false };
    }
    
    // Check for the most relevant booking (prioritize accepted over pending)
    const acceptedBooking = bookings.find(b => b.status === 'accepted');
    const pendingBooking = bookings.find(b => b.status === 'pending');
    
    if (acceptedBooking) {
      return { 
        hasBooking: true, 
        status: 'accepted', 
        booking: acceptedBooking,
        isPaid: acceptedBooking.paymentStatus === 'paid'
      };
    } else if (pendingBooking) {
      return { 
        hasBooking: true, 
        status: 'pending', 
        booking: pendingBooking 
      };
    }
    
    return { hasBooking: false };
  } catch (error) {
    console.error('Error checking service booking status:', error);
    throw error;
  }
};

// Function to get revenue statistics
export const getRevenueStats = async () => {
  try {
    // We'll use the accepted bookings with paid status to calculate revenue
    const bookings = await getAcceptedBookings();
    
    // Filter to only paid bookings
    const paidBookings = bookings.filter(booking => booking.paymentStatus === 'paid');
    
    // Calculate total revenue
    let totalRevenue = 0;
    const monthlyRevenue = {};
    const serviceTypeRevenue = {
      hostel: 0,
      mess: 0,
      gym: 0
    };
    
    // Current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Initialize monthly data for the last 6 months
    for (let i = 0; i < 6; i++) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthYear = `${month.getFullYear()}-${month.getMonth() + 1}`;
      monthlyRevenue[monthYear] = 0;
    }
    
    // Process each paid booking
    paidBookings.forEach(booking => {
      // Get price based on service type
      let monthlyPrice = 0;
      
      if (booking.serviceType === 'hostel') {
        monthlyPrice = booking.serviceDetails?.price || 0;
      } else if (booking.serviceType === 'mess') {
        monthlyPrice = booking.serviceDetails?.monthlyPrice || 0;
      } else {
        // Default fallback
        monthlyPrice = booking.serviceDetails?.price || 0;
      }
      
      // Calculate total amount based on duration
      let totalPrice = monthlyPrice;
      let durationInMonths = 1; // Default to 1 month
      
      if (booking.bookingDetails?.duration) {
        // Convert duration to months if specified in years
        const durationStr = booking.bookingDetails.duration.toString().toLowerCase();
        
        if (durationStr.includes('year') || durationStr.includes('yr')) {
          // Extract the number from the string
          const yearMatch = durationStr.match(/(\d+)/);
          const years = yearMatch ? parseInt(yearMatch[1]) : 1;
          durationInMonths = years * 12;
        } else if (durationStr.includes('month') || durationStr.includes('mo')) {
          // Extract the number from the string
          const monthMatch = durationStr.match(/(\d+)/);
          durationInMonths = monthMatch ? parseInt(monthMatch[1]) : 1;
        } else {
          // Try to parse as a simple number (default to months)
          durationInMonths = parseInt(durationStr) || 1;
        }
        
        totalPrice = monthlyPrice * durationInMonths;
      }
      
      totalRevenue += totalPrice;
      
      // Add to service type revenue
      if (booking.serviceType && serviceTypeRevenue[booking.serviceType] !== undefined) {
        serviceTypeRevenue[booking.serviceType] += totalPrice;
      }
      
      // Add to monthly revenue
      const bookingDate = new Date(booking.updatedAt);
      const monthYear = `${bookingDate.getFullYear()}-${bookingDate.getMonth() + 1}`;
      
      if (monthlyRevenue[monthYear] !== undefined) {
        monthlyRevenue[monthYear] += totalPrice;
      }
    });
    
    // Format monthly data for charts
    const monthlyData = Object.entries(monthlyRevenue).map(([key, value]) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      return {
        month: `${monthName} ${year}`,
        revenue: value
      };
    }).reverse();
    
    // Map all paid bookings to a consistent format for displaying in tables
    const formattedBookings = paidBookings.map(booking => {
      // Extract and convert duration
      let durationInMonths = 1; // Default to 1 month
      
      if (booking.bookingDetails?.duration) {
        const durationStr = booking.bookingDetails.duration.toString().toLowerCase();
        
        if (durationStr.includes('year') || durationStr.includes('yr')) {
          // Extract the number from the string
          const yearMatch = durationStr.match(/(\d+)/);
          const years = yearMatch ? parseInt(yearMatch[1]) : 1;
          durationInMonths = years * 12;
        } else if (durationStr.includes('month') || durationStr.includes('mo')) {
          // Extract the number from the string
          const monthMatch = durationStr.match(/(\d+)/);
          durationInMonths = monthMatch ? parseInt(monthMatch[1]) : 1;
        } else {
          // Try to parse as a simple number (default to months)
          durationInMonths = parseInt(durationStr) || 1;
        }
      }
      
      // Get price based on service type
      let monthlyPrice = 0;
      let serviceName = 'Service';
      
      if (booking.serviceType === 'hostel') {
        monthlyPrice = booking.serviceDetails?.price || 0;
        serviceName = booking.serviceDetails?.roomName || 'Room';
      } else if (booking.serviceType === 'mess') {
        monthlyPrice = booking.serviceDetails?.monthlyPrice || 0;
        serviceName = booking.serviceDetails?.messName || 'Mess';
      } else {
        // Default fallback
        monthlyPrice = booking.serviceDetails?.price || 0;
      }
      
      // Calculate total amount
      const totalAmount = monthlyPrice * durationInMonths;
        
      return {
        id: booking._id,
        date: booking.updatedAt,
        amount: totalAmount,
        monthlyPrice: monthlyPrice,
        student: booking.student,
        serviceType: booking.serviceType,
        serviceName: serviceName,
        duration: durationInMonths,
        originalDuration: booking.bookingDetails?.duration || null
      };
    });
    
    return {
      totalRevenue,
      paidBookingsCount: paidBookings.length,
      monthlyData,
      serviceTypeRevenue,
      allBookings: formattedBookings,
      recentTransactions: formattedBookings.slice(0, 5)
    };
  } catch (error) {
    console.error('Error calculating revenue stats:', error);
    throw error;
  }
};

export default api;