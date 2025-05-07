import React, { useState } from 'react';
import { FaCalendarAlt, FaHourglass, FaSpinner, FaRegStickyNote, FaTimes, FaUtensils } from 'react-icons/fa';
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
    }
    return service.title || 'Service';
  };

  // Get modal title
  const getModalTitle = () => {
    if (serviceType === 'hostel') {
      return `Book ${getServiceName()}`;
    } else if (serviceType === 'mess') {
      return `Subscribe to ${getServiceName()}`;
    }
    return `Book ${getServiceName()}`;
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
        
        <h2 className={`text-xl font-bold mb-4 ${serviceType === 'mess' ? 'text-green-600' : 'text-green-600'}`}>
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
              {serviceType === 'mess' ? (
                <FaUtensils className="mr-2 text-green-600" />
              ) : (
                <FaHourglass className="mr-2 text-green-600" />
              )}
              Subscription Duration
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
              {serviceType === 'mess' ? 'Special Diet Requirements (optional)' : 'Additional Requirements (optional)'}
            </label>
            <textarea
              name="additionalRequirements"
              value={formData.additionalRequirements}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={serviceType === 'mess' ? 'Any diet restrictions or preferences...' : 'Any special requests or requirements...'}
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
              className={`px-4 py-2 text-white rounded-md flex items-center ${serviceType === 'mess' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                serviceType === 'mess' ? 'Subscribe Now' : 'Send Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 