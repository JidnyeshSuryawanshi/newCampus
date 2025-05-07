import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaRupeeSign, FaUtensils, FaLeaf, FaDrumstickBite, FaClock, FaSpinner, FaCheckCircle, FaCreditCard } from 'react-icons/fa';
import MessDetail from './MessDetail';
import BookingModal from './BookingModal';
import { fetchMessServices, checkServiceBookingStatus, updatePaymentStatus } from '../../utils/api';
import { toast } from 'react-toastify';

export default function MessServices() {
  const [messServices, setMessServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMess, setSelectedMess] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMess, setBookingMess] = useState(null);
  const [bookingStatuses, setBookingStatuses] = useState({});

  useEffect(() => {
    const getMessServices = async () => {
      try {
        setLoading(true);
        const data = await fetchMessServices();
        setMessServices(data);
        
        // Check booking status for each mess
        const statuses = {};
        for (const mess of data) {
          try {
            const status = await checkServiceBookingStatus('mess', mess._id);
            statuses[mess._id] = status;
          } catch (err) {
            console.error(`Error checking status for mess ${mess._id}:`, err);
          }
        }
        
        setBookingStatuses(statuses);
        setError(null);
      } catch (err) {
        console.error('Error fetching mess services:', err);
        setError('Failed to load mess services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getMessServices();
  }, []);

  // Function to get meal type icon
  const getMealTypeIcon = (mealType) => {
    switch(mealType) {
      case 'veg':
        return <FaLeaf className="text-green-500 mr-1" title="Vegetarian" />;
      case 'nonVeg':
        return <FaDrumstickBite className="text-red-500 mr-1" title="Non-Vegetarian" />;
      case 'both':
        return (
          <>
            <FaLeaf className="text-green-500 mr-1" title="Vegetarian" />
            <FaDrumstickBite className="text-red-500 mr-1" title="Non-Vegetarian" />
          </>
        );
      default:
        return null;
    }
  };

  // Handle opening the detail modal
  const handleViewDetails = (mess) => {
    setSelectedMess(mess);
    setShowDetailModal(true);
  };

  // Handle closing the detail modal
  const handleCloseDetail = () => {
    setShowDetailModal(false);
  };

  // Handle subscription button click
  const handleSubscribe = (mess) => {
    setBookingMess(mess);
    setShowBookingModal(true);
  };

  // Handle payment button click
  const handlePayNow = (messId) => {
    // Show notification about payment implementation coming soon
    toast.info('Payment functionality will be implemented in a future update.');
    
    // Don't update payment status - this will be implemented later
    console.log('Pay Now button clicked for mess ID:', messId);
  };

  // Get subscription button text and class based on availability and booking status
  const getSubscriptionButton = (mess) => {
    // Default state for unavailable mess
    if (!mess.availability) {
      return {
        text: 'Not Available',
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed',
        icon: null,
        onClick: () => {}
      };
    }
    
    const bookingStatus = bookingStatuses[mess._id];
    
    // If we have a booking status for this mess
    if (bookingStatus?.hasBooking) {
      // If booking is accepted, check payment status
      if (bookingStatus.status === 'accepted') {
        const isPaid = bookingStatus.booking?.paymentStatus === 'paid';
        
        if (isPaid) {
          return {
            text: 'Subscribed',
            disabled: true,
            className: 'bg-green-600 cursor-not-allowed',
            icon: <FaCheckCircle className="mr-1" />,
            onClick: () => {}
          };
        } else {
          return {
            text: 'Pay Now',
            disabled: false,
            className: 'bg-indigo-600 hover:bg-indigo-700',
            icon: <FaCreditCard className="mr-1" />,
            onClick: () => handlePayNow(mess._id)
          };
        }
      }
      
      // If booking is pending, show Pending status
      if (bookingStatus.status === 'pending') {
        return {
          text: 'Subscription Pending',
          disabled: true,
          className: 'bg-yellow-500 cursor-not-allowed',
          onClick: () => {}
        };
      }
    }
    
    // Default case: Available for subscription
    return {
      text: 'Subscribe',
      disabled: false,
      className: 'bg-green-600 hover:bg-green-700',
      onClick: () => handleSubscribe(mess)
    };
  };

  // Handle subscription success
  const handleSubscriptionSuccess = (booking) => {
    // Update the booking status for this mess
    setBookingStatuses(prev => ({
      ...prev,
      [booking.serviceId]: {
        hasBooking: true,
        status: 'pending',
        booking
      }
    }));
    
    setShowBookingModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-green-600 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
    
      {messServices.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded">
          No mess services available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messServices.map((mess) => {
            const subscriptionBtn = getSubscriptionButton(mess);
            
            return (
              <div key={mess._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
                <div className="relative h-48 bg-gray-200">
                  {mess.images && mess.images.length > 0 ? (
                    <img 
                      src={mess.images[0].url} 
                      alt={mess.messName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400">
                      <FaUtensils className="text-5xl" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded flex items-center">
                    {getMealTypeIcon(mess.messType)}
                    <span className="ml-1">{mess.messType === 'nonVeg' ? 'Non-Veg' : mess.messType}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{mess.messName}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FaMapMarkerAlt className="mr-1 text-green-500" />
                    <span>{mess.address || 'Location not specified'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {mess.description || 'No description available'}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-green-600 font-semibold">
                      <FaRupeeSign className="mr-1" />
                      <span>{mess.monthlyPrice}</span>
                      <span className="text-gray-500 font-normal text-xs ml-1">/month</span>
                    </div>
                    {mess.openingHours && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FaClock className="mr-1" />
                        <span>{mess.openingHours}</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Services</h4>
                    <div className="flex flex-wrap gap-1 text-xs">
                      {mess.weeklyMenu && mess.weeklyMenu.monday && mess.weeklyMenu.monday.breakfast && (
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Breakfast</span>
                      )}
                      {mess.weeklyMenu && mess.weeklyMenu.monday && mess.weeklyMenu.monday.lunch && (
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Lunch</span>
                      )}
                      {mess.weeklyMenu && mess.weeklyMenu.monday && mess.weeklyMenu.monday.dinner && (
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Dinner</span>
                      )}
                      {mess.weeklyMenu && mess.weeklyMenu.monday && mess.weeklyMenu.monday.snacks && (
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Snacks</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button 
                      className="bg-white text-green-600 border border-green-600 px-3 py-1 rounded hover:bg-green-50"
                      onClick={() => handleViewDetails(mess)}
                    >
                      View Details
                    </button>
                    <button 
                      onClick={subscriptionBtn.onClick}
                      disabled={subscriptionBtn.disabled}
                      className={`text-white px-3 py-1 rounded transition flex items-center ${subscriptionBtn.className}`}
                    >
                      {subscriptionBtn.icon} {subscriptionBtn.text}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Detail Modal */}
      {showDetailModal && selectedMess && (
        <MessDetail 
          mess={selectedMess} 
          onClose={handleCloseDetail}
          bookingStatus={bookingStatuses[selectedMess._id]}
          onBookingSuccess={handleSubscriptionSuccess}
        />
      )}

      {/* Booking Modal */}
      {showBookingModal && bookingMess && (
        <BookingModal
          service={bookingMess}
          serviceType="mess"
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleSubscriptionSuccess}
        />
      )}
    </div>
  );
}
