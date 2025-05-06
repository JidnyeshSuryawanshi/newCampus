import React, { useState } from 'react';
import { FaCalendarAlt, FaHourglass, FaSpinner, FaRegStickyNote, FaTimes } from 'react-icons/fa';
import { createBookingRequest } from '../../utils/api';
import { toast } from 'react-toastify';

export default function BookingModal({ service, serviceType, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    checkInDate: '',
    duration: '1 month',
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
    if (!formData.checkInDate) {
      setError('Please select a check-in date');
      return;
    }

    // Format the booking data
    const bookingData = {
      serviceType,
      serviceId: service._id,
      bookingDetails: {
        checkInDate: formData.checkInDate,
        duration: formData.duration,
        additionalRequirements: formData.additionalRequirements
      }
    };

    try {
      setLoading(true);
      setError(null);
      
      // Send request to backend
      const response = await createBookingRequest(bookingData);
      
      // Show success notification
      toast.success('Booking request sent successfully!');
      
      // Close modal and refresh data
      if (onSuccess) {
        onSuccess(response.data);
      }
      onClose();
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.response?.data?.error || 'Failed to create booking request');
    } finally {
      setLoading(false);
    }
  };

  // Function to get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
        
        <h2 className="text-xl font-bold text-green-600 mb-4">Book {service.roomName || service.title}</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Check-in Date */}
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
          
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaHourglass className="mr-2 text-green-600" />
              Duration
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
              Additional Requirements (optional)
            </label>
            <textarea
              name="additionalRequirements"
              value={formData.additionalRequirements}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Any special requests or requirements..."
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 