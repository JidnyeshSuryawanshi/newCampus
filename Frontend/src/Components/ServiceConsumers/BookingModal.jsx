import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaHourglass, FaSpinner, FaRegStickyNote, FaTimes, FaUtensils, FaDumbbell } from 'react-icons/fa';
import { createBookingRequest } from '../../utils/api';
import { toast } from 'react-toastify';

export default function BookingModal({ service, serviceType, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    checkInDate: '',
    duration: serviceType === 'hostel' ? '1 month' : '1 month',
    additionalRequirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug log for gym membership plans
  useEffect(() => {
    if (serviceType === 'gym') {
      console.log("BookingModal - Gym service details:", {
        plans: service.membershipPlans,
        selectedPlan: service.selectedPlan,
        hasPlanPrice: service.membershipPlans && 
          service.selectedPlan !== undefined && 
          service.membershipPlans[service.selectedPlan] && 
          service.membershipPlans[service.selectedPlan].price
      });
    }
  }, [service, serviceType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (serviceType === 'hostel' && !formData.checkInDate) {
      setError('Please select a check-in date');
      return;
    }

    // Format the booking data
    const bookingData = {
      serviceType,
      serviceId: service._id,
      bookingDetails: {
        additionalRequirements: formData.additionalRequirements
      }
    };

    // Add specific details based on service type
    if (serviceType === 'hostel') {
      bookingData.bookingDetails.checkInDate = formData.checkInDate;
      bookingData.bookingDetails.duration = formData.duration;
    } else if (serviceType === 'mess') {
      bookingData.bookingDetails.startDate = new Date().toISOString();
      bookingData.bookingDetails.duration = formData.duration;
    } else if (serviceType === 'gym') {
      bookingData.bookingDetails.startDate = new Date().toISOString();
      bookingData.bookingDetails.duration = formData.duration;
      
      // If a membership plan was selected, add it
      if (service.membershipPlans && service.membershipPlans.length > 0) {
        // If a plan is selected, use that
        if (service.selectedPlan !== undefined && service.membershipPlans[service.selectedPlan]) {
          const selectedPlan = service.membershipPlans[service.selectedPlan];
          bookingData.bookingDetails.planName = selectedPlan.name;
          bookingData.bookingDetails.planPrice = selectedPlan.price || 600; // Use default 600 if price not set
          bookingData.bookingDetails.selectedPlan = service.selectedPlan;
          
          console.log(`Using gym plan price: ${selectedPlan.price || 600} for plan: ${selectedPlan.name}`);
        } else if (service.planName && service.planPrice) {
          // Use the plan details passed directly (from GymDetail)
          bookingData.bookingDetails.planName = service.planName;
          bookingData.bookingDetails.planPrice = service.planPrice || 600;
          bookingData.bookingDetails.selectedPlan = service.selectedPlan;
          
          console.log(`Using explicit plan price: ${service.planPrice || 600} for plan: ${service.planName}`);
        } else {
          // Default to first plan
          const defaultPlan = service.membershipPlans[0];
          bookingData.bookingDetails.planName = defaultPlan.name;
          bookingData.bookingDetails.planPrice = defaultPlan.price || 600;
          bookingData.bookingDetails.selectedPlan = 0;
          
          console.log(`Using default plan price: ${defaultPlan.price || 600} for plan: ${defaultPlan.name}`);
        }
      } else {
        // If no plans are available, use a default
        bookingData.bookingDetails.planName = "Basic Plan";
        bookingData.bookingDetails.planPrice = 600; // Default price from provided document
        console.log("Using default plan price of 600 from documentation");
      }
    }

    try {
      setLoading(true);
      setError(null);
      
      // Send request to backend
      const response = await createBookingRequest(bookingData);
      
      // Show success notification
      if (serviceType === 'hostel') {
        toast.success('Booking request sent successfully!');
      } else if (serviceType === 'mess') {
        toast.success('Subscription request sent successfully!');
      } else if (serviceType === 'gym') {
        toast.success('Gym membership request sent successfully!');
      }
      
      // Close modal and refresh data
      if (onSuccess) {
        onSuccess(response.data);
      }
      onClose();
      
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage = serviceType === 'mess' 
        ? 'Failed to create subscription request' 
        : serviceType === 'gym'
        ? 'Failed to create gym membership request'
        : 'Failed to create booking request';
      setError(error.response?.data?.error || errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get service name
  const getServiceName = () => {
    if (serviceType === 'hostel') {
      return service.roomName || 'Room';
    } else if (serviceType === 'mess') {
      return service.messName || 'Mess';
    } else if (serviceType === 'gym') {
      return service.gymName || 'Gym';
    }
    return service.title || 'Service';
  };

  // Get modal title
  const getModalTitle = () => {
    if (serviceType === 'hostel') {
      return `Book ${getServiceName()}`;
    } else if (serviceType === 'mess') {
      return `Subscribe to ${getServiceName()}`;
    } else if (serviceType === 'gym') {
      return `${getServiceName()} Membership`;
    }
    return `Book ${getServiceName()}`;
  };

  // Get appropriate icon based on service type
  const getServiceIcon = () => {
    switch (serviceType) {
      case 'mess':
        return <FaUtensils className="mr-2 text-green-600" />;
      case 'gym':
        return <FaDumbbell className="mr-2 text-green-600" />;
      default:
        return <FaHourglass className="mr-2 text-green-600" />;
    }
  };

  // Get form field configurations based on service type
  const getFormConfig = () => {
    // Common form fields for all services
    const commonFields = [];
    
    // Additional fields by service type
    if (serviceType === 'hostel') {
      return [
        ...commonFields,
        {
          id: 'checkInDate',
          label: 'Check-in Date',
          type: 'date',
          placeholder: 'Select your check-in date',
          required: true,
          className: 'w-full',
          value: formData.checkInDate,
          min: getMinDate()
        },
        {
          id: 'duration',
          label: 'Duration (months)',
          type: 'number',
          placeholder: 'How many months?',
          required: true,
          className: 'w-full',
          value: formData.duration,
          min: 1,
          max: 12
        }
      ];
    } else if (serviceType === 'mess') {
      return [
        ...commonFields,
        {
          id: 'duration',
          label: 'Duration (months)',
          type: 'number',
          placeholder: 'How many months?',
          required: true,
          className: 'w-full',
          value: formData.duration,
          min: 1,
          max: 12
        }
      ];
    } else if (serviceType === 'gym') {
      // For gym, use the selected plan's duration type
      let selectedPlan = null;
      let planPrice = 600; // Default price from the provided document
      
      if (service.selectedPlan !== undefined && service.membershipPlans && service.membershipPlans.length > 0) {
        selectedPlan = service.membershipPlans[service.selectedPlan];
        if (selectedPlan && selectedPlan.price) {
          planPrice = selectedPlan.price;
        }
      }
      
      return [
        ...commonFields,
        {
          id: 'planName',
          label: 'Membership Plan',
          type: 'text',
          readOnly: true,
          value: selectedPlan ? selectedPlan.name : 'Basic Plan',
          className: 'w-full bg-gray-100'
        },
        {
          id: 'planPrice',
          label: 'Price',
          type: 'text',
          readOnly: true,
          value: `₹${planPrice}`,
          className: 'w-full bg-gray-100'
        },
        {
          id: 'duration',
          label: 'Duration',
          type: 'text',
          readOnly: true,
          value: selectedPlan ? formatDuration(selectedPlan.duration) : 'Monthly',
          className: 'w-full bg-gray-100'
        }
      ];
    }
    
    // Default fields
    return [
      ...commonFields,
      {
        id: 'duration',
        label: 'Duration (months)',
        type: 'number',
        placeholder: 'How many months?',
        required: true,
        className: 'w-full',
        value: formData.duration,
        min: 1,
        max: 12
      }
    ];
  };
  
  // Format duration for display
  const formatDuration = (duration) => {
    if (!duration) return '1 Month';
    
    switch(duration) {
      case 'daily': return '1 Day';
      case 'weekly': return '1 Week';
      case 'monthly': return '1 Month';
      case 'quarterly': return '3 Months';
      case 'halfYearly': return '6 Months';
      case 'yearly': return '1 Year';
      default: 
        // If it's already a formatted string, return as is
        if (typeof duration === 'string' && duration.includes(' ')) {
          return duration;
        }
        return `${duration} Month${duration > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {/* Close button */}
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        
        <h2 className={`text-xl font-bold mb-4 ${serviceType === 'mess' || serviceType === 'gym' ? 'text-green-600' : 'text-green-600'}`}>
          {getModalTitle()}
        </h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Check-in Date - only for hostel */}
          {serviceType === 'hostel' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaCalendarAlt className="mr-2 text-green-600" />
                Check-in Date
              </label>
              <input
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleChange}
                min={getMinDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          )}
          
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {getServiceIcon()}
              {serviceType === 'gym' ? 'Membership Duration' : 
               serviceType === 'mess' ? 'Subscription Duration' : 
               'Duration'}
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="1 month">1 month</option>
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
            </select>
          </div>
          
          {/* Additional Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaRegStickyNote className="mr-2 text-green-600" />
              {serviceType === 'mess' ? 'Special Diet Requirements (optional)' : 
               serviceType === 'gym' ? 'Fitness Goals (optional)' : 
               'Additional Requirements (optional)'}
            </label>
            <textarea
              name="additionalRequirements"
              value={formData.additionalRequirements}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={
                serviceType === 'mess' ? 'Any diet restrictions or preferences...' : 
                serviceType === 'gym' ? 'Your fitness goals or specific requirements...' :
                'Any special requests or requirements...'
              }
            ></textarea>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white rounded-md flex items-center bg-green-600 hover:bg-green-700`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                serviceType === 'mess' ? 'Subscribe Now' : 
                serviceType === 'gym' ? 'Send Request' : 
                'Send Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 