import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaFilter, FaBed, FaRupeeSign, FaMapMarkerAlt } from 'react-icons/fa';
import { getBookings, updateBookingStatus } from '../../utils/api';
import { toast } from 'react-toastify';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  // Fetch bookings on component mount and when status filter changes
  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        const data = await getBookings(statusFilter);
        setBookings(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load booking requests');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [statusFilter]);

  // Handle updating booking status (accept/reject)
  const handleUpdateStatus = async (bookingId, status) => {
    try {
      setLoading(true);
      await updateBookingStatus(bookingId, status);
      
      // Update local state
      setBookings(prev => prev.filter(booking => booking._id !== bookingId));
      
      // Show success notification
      toast.success(`Booking ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`);
    } catch (err) {
      console.error(`Error ${status} booking:`, err);
      toast.error(`Failed to ${status} booking`);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get service type for display
  const getServiceTypeDisplay = (type) => {
    switch (type) {
      case 'hostel': return 'Hostel Room';
      case 'mess': return 'Mess Subscription';
      case 'gym': return 'Gym Membership';
      default: return type;
    }
  };

  // Get room type display
  const getRoomTypeLabel = (type) => {
    if (!type) return 'Not specified';
    const types = {
      single: 'Single Room',
      double: 'Double Room',
      triple: 'Triple Room',
      dormitory: 'Dormitory',
      flat: 'Flat/Apartment'
    };
    return types[type] || type;
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Booking Requests</h2>
        
        {/* Status filter */}
        <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-200">
          <FaFilter className="ml-3 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-4 rounded-md focus:outline-none text-gray-700 bg-transparent"
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {bookings.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <FaCalendarAlt className="mx-auto text-gray-400 text-4xl mb-3" />
          <h3 className="text-gray-700 font-medium text-lg">No {statusFilter} bookings</h3>
          <p className="text-gray-500 mt-1">
            {statusFilter === 'pending' 
              ? 'You don\'t have any pending booking requests at the moment.'
              : `You don't have any ${statusFilter} bookings to display.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mb-2 inline-block">
                      {getServiceTypeDisplay(booking.serviceType)}
                    </span>
                    {booking.serviceDetails?.roomName && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mb-2 ml-1 inline-block">
                        {booking.serviceDetails.roomName}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-800">
                      Request from {booking.student?.username || 'Student'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Requested on:</span> {formatDate(booking.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium 
                      ${statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        statusFilter === 'accepted' ? 'bg-green-100 text-green-800' : 
                        statusFilter === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-5 bg-gray-50">
                {/* Room details section */}
                {booking.serviceType === 'hostel' && booking.serviceDetails && (
                  <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaBed className="mr-2 text-blue-600" /> Room Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Room Name:</span> {booking.serviceDetails.roomName || 'Not specified'}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Room Type:</span> {getRoomTypeLabel(booking.serviceDetails.roomType)}
                        </p>
                        {booking.serviceDetails.gender && (
                          <p className="text-sm">
                            <span className="font-medium">Gender:</span> {booking.serviceDetails.gender.charAt(0).toUpperCase() + booking.serviceDetails.gender.slice(1)}
                          </p>
                        )}
                      </div>
                      <div>
                        {booking.serviceDetails.price && (
                          <p className="text-sm flex items-center">
                            <span className="font-medium mr-1">Price:</span> 
                            <FaRupeeSign className="text-xs mr-1" /> 
                            {booking.serviceDetails.price}/month
                          </p>
                        )}
                        {booking.serviceDetails.capacity && (
                          <p className="text-sm">
                            <span className="font-medium">Capacity:</span> {booking.serviceDetails.capacity}
                          </p>
                        )}
                        {booking.serviceDetails.address && (
                          <p className="text-sm flex items-start">
                            <span className="font-medium mr-1">Address:</span>
                            <span className="flex items-center">
                              <FaMapMarkerAlt className="text-xs mr-1 mt-1 text-blue-500" /> 
                              {booking.serviceDetails.address}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    {booking.serviceDetails.images && booking.serviceDetails.images.length > 0 && (
                      <div className="mt-2">
                        <div className="h-32 rounded-md overflow-hidden">
                          <img 
                            src={booking.serviceDetails.images[0].url} 
                            alt={booking.serviceDetails.roomName || 'Room'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Booking Details</h4>
                    <p className="text-sm">
                      <span className="font-medium">Check-in Date:</span> {formatDate(booking.bookingDetails?.checkInDate)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Duration:</span> {booking.bookingDetails?.duration}
                    </p>
                    {booking.bookingDetails?.additionalRequirements && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500">Additional Requirements:</p>
                        <p className="text-sm bg-white p-2 rounded border border-gray-200 mt-1">
                          {booking.bookingDetails.additionalRequirements}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Student Information</h4>
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {booking.student?.username || 'Not available'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {booking.student?.email || 'Not available'}
                    </p>
                  </div>
                </div>
                
                {statusFilter === 'pending' && (
                  <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
                    <button
                      onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                      className="px-4 py-2 bg-white border border-red-500 text-red-600 rounded-md hover:bg-red-50 flex items-center"
                    >
                      <FaTimesCircle className="mr-2" /> Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(booking._id, 'accepted')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    >
                      <FaCheckCircle className="mr-2" /> Accept
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
