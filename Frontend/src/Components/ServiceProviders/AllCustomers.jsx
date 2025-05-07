import React, { useState, useEffect } from 'react';
import { FaSpinner, FaUserCircle, FaEnvelope, FaCalendarAlt, FaInfoCircle, FaMapMarkerAlt, FaRupeeSign, FaSearch, FaBed, FaTimes, FaPhoneAlt, FaIdCard, FaGraduationCap, FaUser, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { getAcceptedBookings, removeCustomer } from '../../utils/api';
import { toast } from 'react-toastify';

export default function AllCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToRemove, setCustomerToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Function to fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const bookings = await getAcceptedBookings();
      
      // Filter out any terminated bookings
      const activeBookings = bookings.filter(booking => booking.status === 'accepted');
      
      setCustomers(activeBookings);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
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
  
  // Handle opening and closing details modal
  const openDetailsModal = (booking) => {
    setSelectedCustomer(booking);
  };
  
  const closeDetailsModal = () => {
    setSelectedCustomer(null);
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const searchString = searchTerm.toLowerCase();
    return (
      (customer.student?.username || '').toLowerCase().includes(searchString) ||
      (customer.student?.email || '').toLowerCase().includes(searchString) ||
      (customer.serviceType || '').toLowerCase().includes(searchString) ||
      (customer.serviceDetails?.roomName || '').toLowerCase().includes(searchString)
    );
  });

  // Function to initiate customer removal process
  const initiateRemoveCustomer = (booking) => {
    setCustomerToRemove(booking);
  };

  // Function to cancel customer removal
  const cancelRemoveCustomer = () => {
    setCustomerToRemove(null);
  };

  // Function to confirm and execute customer removal
  const confirmRemoveCustomer = async () => {
    if (!customerToRemove) return;
    
    try {
      setIsRemoving(true);
      
      // Call API to remove customer
      const result = await removeCustomer(customerToRemove._id);
      
      // If successful, update the customers list
      if (result && result.success) {
        // Update local state - remove the customer from the list
        setCustomers(prevCustomers => 
          prevCustomers.filter(customer => customer._id !== customerToRemove._id)
        );
        
        // If a customer details modal is open, close it
        if (selectedCustomer && selectedCustomer._id === customerToRemove._id) {
          setSelectedCustomer(null);
        }
        
        const studentName = customerToRemove.student?.username || 'Customer';
        toast.success(`${studentName} has been removed successfully`);
      } else {
        // If the API call was successful but didn't return success: true
        toast.error('Failed to remove customer due to server error');
        // Refresh the customer list
        await fetchCustomers();
      }
    } catch (err) {
      console.error('Error removing customer:', err);
      
      // Show specific error message for schema validation errors
      if (err.message && err.message.includes('valid enum value')) {
        toast.error('System error: The status value is not valid. Please contact the administrator.');
      } else {
        toast.error(err.response?.data?.error || 'Failed to remove customer. Please try again.');
      }
      
      // Always refresh the customer list after an error to ensure UI is in sync
      await fetchCustomers();
    } finally {
      setIsRemoving(false);
      setCustomerToRemove(null);
    }
  };

  // Customer Removal Confirmation Modal component
  const RemoveCustomerModal = () => {
    if (!customerToRemove) return null;
    
    const studentName = customerToRemove.student?.username || 'this customer';
    const serviceName = customerToRemove.serviceDetails?.roomName || 
                      customerToRemove.serviceDetails?.messName || 
                      customerToRemove.serviceDetails?.gymName || 
                      getServiceTypeDisplay(customerToRemove.serviceType);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={cancelRemoveCustomer}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fadeIn" onClick={e => e.stopPropagation()}>
          <div className="p-5 border-b border-gray-200 flex items-center text-red-600">
            <FaExclamationTriangle className="text-xl mr-2" />
            <h3 className="text-xl font-semibold">Remove Customer</h3>
          </div>
          
          <div className="p-5">
            <p className="text-gray-700 mb-4">Are you sure you want to remove <span className="font-semibold">{studentName}</span>?</p>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
              <p className="text-gray-600 text-sm mb-2">This will:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Terminate their active booking for <span className="font-medium">{serviceName}</span></li>
                <li>Remove them from your customers list</li>
                <li>Require them to make a new booking if they want to use your services again</li>
              </ul>
              <p className="text-sm text-red-600 mt-3 font-medium">This action cannot be undone.</p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={cancelRemoveCustomer}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
              disabled={isRemoving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmRemoveCustomer}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                <>
                  <FaTrash className="mr-2" />
                  Remove Customer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">All Customers</h2>
        
        {/* Search bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-64 p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {loading && customers.length > 0 && (
        <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded flex items-center">
          <FaSpinner className="animate-spin mr-2" />
          <span>Refreshing customer list...</span>
        </div>
      )}
      
      {filteredCustomers.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <FaUserCircle className="mx-auto text-gray-400 text-4xl mb-3" />
          <h3 className="text-gray-700 font-medium text-lg">No customers found</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm ? 'No customers match your search criteria.' : 'You don\'t have any customers yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCustomers.map(booking => (
            <div key={booking._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-grow">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                      <FaUserCircle size={32} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {booking.student?.username || 'Student'}
                    </h3>
                    {booking.student?.email && (
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <FaEnvelope className="mr-2" />
                        {booking.student.email}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {getServiceTypeDisplay(booking.serviceType)}
                      </span>
                      {booking.serviceDetails?.roomName && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {booking.serviceDetails.roomName}
                        </span>
                      )}
                      <div className="flex items-center text-gray-500 text-xs">
                        <FaCalendarAlt className="mr-1" />
                        Since {formatDate(booking.createdAt)}
                      </div>
                    </div>
                  </div>
                  </div>
                  {/* Remove Customer button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      initiateRemoveCustomer(booking);
                    }}
                    className="text-red-500 hover:text-red-700 p-2 ml-2 flex-shrink-0"
                    title="Remove Customer"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-600">
                      <FaInfoCircle className="mr-2" />
                    <span className="text-sm font-medium">Customer since {formatDate(booking.createdAt)}</span>
                    </div>
                    <button
                      className="px-4 py-2 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 text-sm"
                      onClick={() => openDetailsModal(booking)}
                    >
                      View Details
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Student Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Student Details</h3>
              <div className="flex items-center">
                {/* Add Remove Customer button to modal */}
                <button
                  onClick={() => initiateRemoveCustomer(selectedCustomer)}
                  className="mr-4 text-red-500 hover:text-red-700 flex items-center"
                  title="Remove Customer"
                >
                  <FaTrash className="mr-1" /> Remove
                </button>
              <button 
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Student Profile Header */}
              <div className="flex items-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-5">
                  <FaUserCircle size={48} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedCustomer.student?.username || 'Student'}
                  </h2>
                  <div className="flex items-center text-gray-600 mt-1">
                    <FaEnvelope className="mr-2" />
                    {selectedCustomer.student?.email || 'No email provided'}
                  </div>
                  <div className="flex items-center text-gray-600 mt-1">
                    <FaIdCard className="mr-2" />
                    ID: {selectedCustomer.student?._id || 'Not available'}
                  </div>
                </div>
              </div>
              
              {/* Student & Booking Details Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Personal Details */}
                <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaUser className="mr-2 text-blue-500" />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Full Name</span>
                      <span className="font-medium">{selectedCustomer.student?.username || 'Not provided'}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Email Address</span>
                      <span className="font-medium">{selectedCustomer.student?.email || 'Not provided'}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">User Type</span>
                      <span className="font-medium">{selectedCustomer.student?.userType || 'Student'}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Registration Date</span>
                      <span className="font-medium">{formatDate(selectedCustomer.student?.createdAt)}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Location</span>
                      <span className="font-medium">{selectedCustomer.serviceDetails?.address || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Academic Details */}
                <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaGraduationCap className="mr-2 text-blue-500" />
                    Academic Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Student ID</span>
                      <span className="font-medium">{selectedCustomer.student?._id || 'Not available'}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Contact</span>
                      <span className="font-medium">
                        {selectedCustomer.student?.phoneNumber || selectedCustomer.student?.contactNumber || 'Not provided'}
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Gender</span>
                      <span className="font-medium">
                        {selectedCustomer.serviceDetails?.gender ? 
                          (selectedCustomer.serviceDetails.gender.charAt(0).toUpperCase() + selectedCustomer.serviceDetails.gender.slice(1)) : 
                          'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Current Booking */}
                <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaBed className="mr-2 text-blue-500" />
                    Current Booking
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Service Type</span>
                      <span className="font-medium">{getServiceTypeDisplay(selectedCustomer.serviceType)}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Room Name</span>
                      <span className="font-medium">{selectedCustomer.serviceDetails?.roomName || 'Not specified'}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Room Type</span>
                      <span className="font-medium">{getRoomTypeLabel(selectedCustomer.serviceDetails?.roomType)}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Check-in Date</span>
                      <span className="font-medium">{formatDate(selectedCustomer.bookingDetails?.checkInDate)}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Duration</span>
                      <span className="font-medium">{selectedCustomer.bookingDetails?.duration || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Details */}
                <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaRupeeSign className="mr-2 text-blue-500" />
                    Payment Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Payment Status</span>
                      <span className={`font-medium ${selectedCustomer.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedCustomer.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Price</span>
                      <span className="font-medium flex items-center">
                        <FaRupeeSign className="mr-1 text-xs" />
                        {selectedCustomer.serviceDetails?.price || 0}/month
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Booking Date</span>
                      <span className="font-medium">{formatDate(selectedCustomer.createdAt)}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Last Updated</span>
                      <span className="font-medium">{formatDate(selectedCustomer.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Requirements Section */}
              {selectedCustomer.bookingDetails?.additionalRequirements && (
                <div className="mt-6 bg-gray-50 p-5 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Additional Requirements
                  </h3>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <p className="text-gray-700">{selectedCustomer.bookingDetails.additionalRequirements}</p>
                  </div>
                </div>
              )}
              
              {/* Room Photo Section - if available */}
              {selectedCustomer.serviceDetails?.images && selectedCustomer.serviceDetails.images.length > 0 && (
                <div className="mt-6 bg-gray-50 p-5 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Room Photos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedCustomer.serviceDetails.images.map((image, index) => (
                      <div key={index} className="h-48 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={image.url} 
                          alt={`Room ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Customer Confirmation Modal */}
      {customerToRemove && <RemoveCustomerModal />}
    </div>
  );
}
