import React, { useState, useEffect } from 'react';
import { FaSpinner, FaHome, FaUtensils, FaDumbbell, FaCalendarAlt, FaCreditCard, FaCheckCircle, FaTimesCircle, FaFilter } from 'react-icons/fa';
import { getBookings, cancelBooking } from '../../utils/api';
import { toast } from 'react-toastify';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('accepted');

  // Fetch bookings when component mounts or filter changes
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const allBookings = await getBookings(statusFilter);
        setBookings(allBookings);
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter]);

  // Get service icon based on type
  const getServiceIcon = (type) => {
    switch (type) {
      case 'hostel':
        return <FaHome className="text-blue-500" />;
      case 'mess':
        return <FaUtensils className="text-green-500" />;
      case 'gym':
        return <FaDumbbell className="text-purple-500" />;
      default:
        return null;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get service type display name
  const getServiceTypeDisplay = (type) => {
    switch (type) {
      case 'hostel':
        return 'Hostel Room';
      case 'mess':
        return 'Mess Subscription';
      case 'gym':
        return 'Gym Membership';
      default:
        return type;
    }
  };

  // Calculate end date based on start date and duration
  const calculateEndDate = (startDate, duration) => {
    if (!startDate) return 'Not available';
    
    const start = new Date(startDate);
    let months = 1; // Default duration in months
    
    if (duration) {
      if (typeof duration === 'string') {
        // Parse duration string like "3 months" or "1 year"
        if (duration.includes('month')) {
          const match = duration.match(/(\d+)/);
          months = match ? parseInt(match[1]) : 1;
        } else if (duration.includes('year')) {
          const match = duration.match(/(\d+)/);
          const years = match ? parseInt(match[1]) : 1;
          months = years * 12;
        } else {
          // Try to parse as a number
          months = parseInt(duration) || 1;
        }
      } else if (typeof duration === 'number') {
        months = duration;
      }
    }
    
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + months);
    
    return formatDate(endDate);
  };

  // Get status badge style
  const getStatusBadge = (status, paymentStatus) => {
    if (status === 'pending') {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
          <FaSpinner className="mr-1 animate-spin" /> Pending
        </span>
      );
    } else if (status === 'accepted') {
      if (paymentStatus === 'paid') {
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
            <FaCheckCircle className="mr-1" /> Active
          </span>
        );
      } else {
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
            <FaCreditCard className="mr-1" /> Payment Pending
          </span>
        );
      }
    } else if (status === 'rejected') {
      return (
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
          <FaTimesCircle className="mr-1" /> Rejected
        </span>
      );
    } else if (status === 'cancelled') {
      return (
        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
          <FaTimesCircle className="mr-1" /> Cancelled
        </span>
      );
    }
    
    return null;
  };

  // Handle cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        setLoading(true);
        await cancelBooking(bookingId);
        
        // Update local state
        setBookings(prevBookings => 
          prevBookings.filter(booking => booking._id !== bookingId)
        );
        
        toast.success('Booking cancelled successfully');
      } catch (err) {
        console.error('Error cancelling booking:', err);
        toast.error('Failed to cancel booking');
      } finally {
        setLoading(false);
      }
    }
  };

  // Get service-specific details
  const getServiceDetails = (booking) => {
    const { serviceType, serviceDetails, bookingDetails } = booking;
    
    if (serviceType === 'hostel') {
      return (
        <>
          <p className="text-sm">
            <span className="font-medium">Room:</span> {serviceDetails?.roomName || 'Not specified'}
          </p>
          <p className="text-sm">
            <span className="font-medium">Check-in:</span> {formatDate(bookingDetails?.checkInDate)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Price:</span> ₹{serviceDetails?.price || 0}/month
          </p>
        </>
      );
    } else if (serviceType === 'mess') {
      return (
        <>
          <p className="text-sm">
            <span className="font-medium">Mess:</span> {serviceDetails?.messName || 'Not specified'}
          </p>
          <p className="text-sm">
            <span className="font-medium">Start Date:</span> {formatDate(bookingDetails?.startDate)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Price:</span> ₹{serviceDetails?.monthlyPrice || 0}/month
          </p>
        </>
      );
    } else if (serviceType === 'gym') {
      // For gym, check if there's a plan selected
      const planName = bookingDetails?.planName || 'Basic Plan';
      const planPrice = bookingDetails?.planPrice || 
                      (serviceDetails?.membershipPlans && serviceDetails.membershipPlans.length > 0 ? 
                        serviceDetails.membershipPlans[0].price : 0);
      
      return (
        <>
          <p className="text-sm">
            <span className="font-medium">Gym:</span> {serviceDetails?.gymName || 'Not specified'}
          </p>
          <p className="text-sm">
            <span className="font-medium">Plan:</span> {planName}
          </p>
          <p className="text-sm">
            <span className="font-medium">Start Date:</span> {formatDate(bookingDetails?.startDate)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Price:</span> ₹{planPrice || 0}
          </p>
        </>
      );
    }
    
    return null;
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>
      
      {/* Filter */}
      <div className="mb-6 flex flex-wrap items-center">
        <div className="mr-4 mb-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <FaFilter className="mr-2 text-gray-500" /> Filter by status:
          </label>
        </div>
        <div className="flex space-x-2 mb-2">
          <button
            onClick={() => setStatusFilter('accepted')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              statusFilter === 'accepted' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              statusFilter === 'pending' 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              statusFilter === 'cancelled' 
                ? 'bg-gray-500 text-white border border-gray-600' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            Cancelled
          </button>
          <button
            onClick={() => setStatusFilter(null)} // null to get all bookings
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              statusFilter === null 
                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            All
          </button>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <FaSpinner className="animate-spin text-green-500 text-2xl mr-2" />
          <span>Loading your bookings...</span>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* No Bookings State */}
      {!loading && !error && bookings.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-5xl mb-4">
            {statusFilter === 'accepted' ? <FaCheckCircle /> : 
             statusFilter === 'pending' ? <FaSpinner /> : 
             statusFilter === 'cancelled' ? <FaTimesCircle /> : <FaCalendarAlt />}
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No {statusFilter || ''} bookings found</h3>
          <p className="text-gray-500">
            {statusFilter === 'accepted' ? 'You don\'t have any active bookings right now.' : 
             statusFilter === 'pending' ? 'You don\'t have any pending booking requests.' : 
             statusFilter === 'cancelled' ? 'You haven\'t cancelled any bookings.' : 
             'You haven\'t made any bookings yet.'}
          </p>
        </div>
      )}
      
      {/* Bookings List */}
      {!loading && !error && bookings.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-gray-100 mr-3">
                      {getServiceIcon(booking.serviceType)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {getServiceTypeDisplay(booking.serviceType)}
                      </h3>
                      <div className="mt-1">
                        {getStatusBadge(booking.status, booking.paymentStatus)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-4">
                <div className="space-y-2">
                  {getServiceDetails(booking)}
                  
                  <p className="text-sm mt-2">
                    <span className="font-medium">Duration:</span> {booking.bookingDetails?.duration || '1 month'}
                  </p>
                  
                  <p className="text-sm">
                    <span className="font-medium">Valid Until:</span> {calculateEndDate(
                      booking.serviceType === 'hostel' ? booking.bookingDetails?.checkInDate : booking.bookingDetails?.startDate,
                      booking.bookingDetails?.duration
                    )}
                  </p>
                  
                  {booking.bookingDetails?.additionalRequirements && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-600">Additional Requirements:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                        {booking.bookingDetails.additionalRequirements}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Booked on {formatDate(booking.createdAt)}
                  </div>
                  
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Cancel Request
                    </button>
                  )}
                  
                  {booking.status === 'accepted' && booking.paymentStatus !== 'paid' && (
                    <button
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 