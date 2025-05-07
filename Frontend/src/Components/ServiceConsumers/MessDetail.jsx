import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaRupeeSign, 
  FaUtensils, 
  FaLeaf, 
  FaDrumstickBite, 
  FaClock, 
  FaTimes, 
  FaWifi, 
  FaSnowflake, 
  FaParking, 
  FaTruck, 
  FaAppleAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaInfoCircle,
  FaCalendarAlt,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaIdCard,
  FaUsers,
  FaSpinner,
  FaUserFriends,
  FaCreditCard
} from 'react-icons/fa';
import { fetchOwnerDetails, checkServiceBookingStatus, updatePaymentStatus } from '../../utils/api';
import OwnerProfileModal from './OwnerProfileModal';
import BookingModal from './BookingModal';
import { toast } from 'react-hot-toast';

// CSS classes for animation
const ANIMATION_CLASSES = "animate-fadeIn";

export default function MessDetail({ mess, onClose, bookingStatus, onBookingSuccess }) {
  if (!mess) return null;
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState('monday');
  const [showOwnerProfile, setShowOwnerProfile] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [currentBookingStatus, setCurrentBookingStatus] = useState(bookingStatus);
  
  // Fetch booking status if not provided
  useEffect(() => {
    const getBookingStatus = async () => {
      if (bookingStatus) {
        setCurrentBookingStatus(bookingStatus);
        return;
      }
      
      try {
        const status = await checkServiceBookingStatus('mess', mess._id);
        setCurrentBookingStatus(status);
      } catch (err) {
        console.error('Error checking booking status:', err);
      }
    };
    
    getBookingStatus();
  }, [mess._id, bookingStatus]);
  
  // Fetch owner details
  useEffect(() => {
    const getOwnerDetails = async () => {
      if (!mess.owner) return;
      
      try {
        setLoading(true);
        // Get owner ID whether it's an object or string
        const ownerId = typeof mess.owner === 'object' ? mess.owner._id : mess.owner;
        console.log("Fetching owner with ID:", ownerId);
        
        const data = await fetchOwnerDetails(ownerId);
        console.log("Owner data received:", data);
        setOwnerDetails(data.data);
      } catch (err) {
        console.error('Error fetching owner details:', err);
        setError('Could not load owner information');
      } finally {
        setLoading(false);
      }
    };
    
    getOwnerDetails();
  }, [mess.owner]);
  
  // Function to display amenities icons
  const renderAmenityIcon = (key) => {
    const amenityIcons = {
      'acSeating': <FaSnowflake size={18} className="text-green-500" />,
      'wifi': <FaWifi size={18} className="text-green-500" />,
      'parking': <FaParking size={18} className="text-green-500" />,
      'homeDelivery': <FaTruck size={18} className="text-green-500" />,
      'specialDiet': <FaAppleAlt size={18} className="text-green-500" />
    };
    
    return amenityIcons[key] || null;
  };
  
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
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not Available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  
  // Handle changing the active image
  const handleImageChange = (index) => {
    setActiveImageIndex(index);
  };
  
  // Navigate to previous image
  const handlePrevImage = () => {
    if (!mess.images || mess.images.length <= 1) return;
    setActiveImageIndex((prevIndex) => 
      prevIndex === 0 ? mess.images.length - 1 : prevIndex - 1
    );
  };
  
  // Navigate to next image
  const handleNextImage = () => {
    if (!mess.images || mess.images.length <= 1) return;
    setActiveImageIndex((prevIndex) => 
      prevIndex === mess.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Get current image or placeholder
  const currentImage = mess.images && mess.images.length > 0 
    ? mess.images[activeImageIndex]?.url 
    : null;

  // Get available amenities only
  const getAvailableAmenities = () => {
    if (!mess.amenities) return [];
    
    return Object.entries(mess.amenities)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
  };

  const availableAmenities = getAvailableAmenities();

  // Days of the week for menu
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Format day name
  const formatDayName = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Check if weekly menu exists
  const hasWeeklyMenu = mess.weeklyMenu && 
    Object.values(mess.weeklyMenu).some(day => 
      day && (day.breakfast || day.lunch || day.dinner || day.snacks)
    );

  // Safe getters for owner details
  const getOwnerName = () => {
    if (!ownerDetails) return 'Not specified';
    return ownerDetails.name || ownerDetails.username || 'Not specified';
  };
  
  const getOwnerEmail = () => {
    if (!ownerDetails || !ownerDetails.email) return null;
    return typeof ownerDetails.email === 'string' ? ownerDetails.email : null;
  };

  // Function to get owner ID safely
  const getOwnerId = () => {
    if (!mess.owner) return null;
    return typeof mess.owner === 'object' ? mess.owner._id : mess.owner;
  };

  // Handle subscription button click
  const handleSubscribe = () => {
    setShowSubscriptionModal(true);
  };

  // Handle subscription success
  const handleSubscriptionSuccess = (booking) => {
    // Update the booking status
    setCurrentBookingStatus({
      hasBooking: true,
      status: 'pending',
      booking
    });
    
    setShowSubscriptionModal(false);
    
    // Call parent callback if provided
    if (onBookingSuccess) {
      onBookingSuccess(booking);
    }
  };

  // Handle payment click
  const handlePayment = () => {
    // Show notification about payment implementation coming soon
    toast.info('Payment functionality will be implemented in a future update.');
    
    // Don't update payment status - this will be implemented later
    console.log('Payment button clicked for mess subscription');
  };

  // Get subscription button properties based on availability and booking status
  const getSubscriptionButton = () => {
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
    
    // If there's an existing booking
    if (currentBookingStatus?.hasBooking) {
      // If booking is accepted, check payment status
      if (currentBookingStatus.status === 'accepted') {
        const isPaid = currentBookingStatus.booking?.paymentStatus === 'paid';
        
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
            onClick: handlePayment
          };
        }
      }
      
      // If booking is pending
      if (currentBookingStatus.status === 'pending') {
        return {
          text: 'Subscription Pending',
          disabled: true,
          className: 'bg-yellow-500 cursor-not-allowed',
          icon: null,
          onClick: () => {}
        };
      }
    }
    
    // Default: Available for subscription
    return {
      text: 'Subscribe Now',
      disabled: false,
      className: 'bg-green-600 hover:bg-green-700',
      icon: null,
      onClick: handleSubscribe
    };
  };

  const subscriptionButton = getSubscriptionButton();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4 overflow-y-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className={`bg-white rounded-xl overflow-hidden max-w-5xl w-full max-h-90vh relative ${ANIMATION_CLASSES}`}>
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 text-gray-700 transition-colors"
          aria-label="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
        
        <div className="flex flex-col lg:flex-row max-h-90vh">
          {/* Left side - Images */}
          <div className="lg:w-1/2 bg-gray-100">
            <div className="relative h-72 lg:h-96 bg-green-100">
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt={`${mess.messName} - view ${activeImageIndex + 1}`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-green-100">
                  <FaUtensils className="text-7xl text-green-300" />
                </div>
              )}
              
              {/* Image navigation arrows */}
              {mess.images && mess.images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all"
                    aria-label="Previous image"
                  >
                    <FaArrowLeft className="h-4 w-4 text-gray-700" />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all"
                    aria-label="Next image"
                  >
                    <FaArrowRight className="h-4 w-4 text-gray-700" />
                  </button>
                  
                  {/* Image counter */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded-md">
                    {activeImageIndex + 1} / {mess.images.length}
                  </div>
                </>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h2 className="text-2xl font-bold text-white">{mess.messName}</h2>
                <div className="flex items-center text-white mt-1">
                  <FaMapMarkerAlt className="mr-1 text-green-300" />
                  <span className="text-sm">{mess.address || 'Location not specified'}</span>
                </div>
              </div>
              
              {/* Tags overlay */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center">
                  {getMealTypeIcon(mess.messType)}
                  <span className="ml-1 capitalize">{mess.messType === 'nonVeg' ? 'Non-Veg' : mess.messType}</span>
                </div>
                {mess.availability ? (
                  <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    Available Now
                  </div>
                ) : (
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    Not Available
                  </div>
                )}
              </div>
            </div>
            
            {/* Image gallery thumbnails */}
            {mess.images && mess.images.length > 1 && (
              <div className="p-4 bg-white">
                <h3 className="text-base font-semibold text-gray-800 mb-2">Photos</h3>
                <div className="grid grid-cols-5 gap-2">
                  {mess.images.map((image, index) => (
                    <div 
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`
                        cursor-pointer relative overflow-hidden rounded-md h-14
                        ${activeImageIndex === index ? 'ring-2 ring-green-500' : 'opacity-70 hover:opacity-100'}
                      `}
                    >
                      <img 
                        src={image.url} 
                        alt={`Mess view ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right side - Details */}
          <div className="lg:w-1/2 p-6 overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <div className="space-y-4">
              {/* Price and Timings */}
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center text-green-700 font-bold text-xl">
                  <FaRupeeSign className="mr-1" />
                  <span>{mess.monthlyPrice}</span>
                  <span className="text-gray-500 font-normal text-xs ml-1">/month</span>
                </div>
                <div className="flex items-center text-gray-700 text-sm">
                  <FaClock className="mr-2 text-green-600" />
                  <span>{mess.openingHours}</span>
                </div>
              </div>
              
              {/* Alternative pricing */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">Daily Price:</div>
                  <div className="flex items-center text-green-700 font-semibold">
                    <FaRupeeSign className="mr-1 text-sm" />
                    <span>{mess.dailyPrice}</span>
                    <span className="text-gray-500 font-normal text-xs ml-1">/day</span>
                  </div>
                </div>
              </div>
              
              {/* Mess Details */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FaIdCard className="mr-2 text-green-600" /> Mess Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Mess Type</p>
                    <p className="font-medium text-gray-700 flex items-center">
                      {getMealTypeIcon(mess.messType)}
                      <span className="capitalize">{mess.messType === 'nonVeg' ? 'Non-Veg' : mess.messType}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Capacity</p>
                    <p className="font-medium text-gray-700 flex items-center">
                      <FaUsers className="mr-1 text-green-600" size={14} />
                      <span>{mess.capacity} people</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Working Hours</p>
                    <p className="font-medium text-gray-700">{mess.openingHours}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Since</p>
                    <p className="font-medium text-gray-700">{formatDate(mess.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              {/* Owner Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FaUser className="mr-2 text-green-600" /> Owner Information
                </h3>
                
                {loading ? (
                  <div className="flex justify-center py-4">
                    <FaSpinner className="animate-spin text-green-600 text-xl" />
                  </div>
                ) : error ? (
                  <p className="text-red-500 text-sm">{error}</p>
                ) : ownerDetails ? (
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FaUser className="text-gray-500 mr-2 mt-1" />
                      <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-medium text-gray-700">{getOwnerName()}</p>
                      </div>
                    </div>
                    {getOwnerEmail() && (
                      <div className="flex items-start">
                        <FaEnvelope className="text-gray-500 mr-2 mt-1" />
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium text-gray-700">{getOwnerEmail()}</p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => setShowOwnerProfile(true)}
                      className="mt-2 w-full bg-green-100 text-green-800 rounded-md py-2 flex items-center justify-center hover:bg-green-200 transition-colors"
                    >
                      <FaIdCard className="mr-2" /> View Owner Profile
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700">
                    <p>Owner information unavailable</p>
                    <p className="mt-2 text-gray-500">Please contact the administrator for details.</p>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-1">
                  <FaInfoCircle className="mr-2 text-green-600" /> Description
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {mess.description || 'No description available'}
                </p>
              </div>
              
              {/* Weekly Menu */}
              {hasWeeklyMenu && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center p-4 bg-green-50 border-b border-gray-200">
                    <FaUtensils className="mr-2 text-green-600" /> Weekly Menu
                  </h3>
                  
                  {/* Day selector */}
                  <div className="flex overflow-x-auto border-b border-gray-200">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        className={`px-4 py-2 text-sm font-medium ${
                          activeDay === day 
                            ? 'border-b-2 border-green-600 text-green-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveDay(day)}
                      >
                        {formatDayName(day)}
                      </button>
                    ))}
                  </div>
                  
                  {/* Menu for selected day */}
                  <div className="p-4">
                    {mess.weeklyMenu && mess.weeklyMenu[activeDay] ? (
                      <div className="space-y-3">
                        {mess.weeklyMenu[activeDay].breakfast && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Breakfast</h4>
                            <p className="text-sm text-gray-600">{mess.weeklyMenu[activeDay].breakfast}</p>
                          </div>
                        )}
                        
                        {mess.weeklyMenu[activeDay].lunch && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Lunch</h4>
                            <p className="text-sm text-gray-600">{mess.weeklyMenu[activeDay].lunch}</p>
                          </div>
                        )}
                        
                        {mess.weeklyMenu[activeDay].snacks && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Snacks</h4>
                            <p className="text-sm text-gray-600">{mess.weeklyMenu[activeDay].snacks}</p>
                          </div>
                        )}
                        
                        {mess.weeklyMenu[activeDay].dinner && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Dinner</h4>
                            <p className="text-sm text-gray-600">{mess.weeklyMenu[activeDay].dinner}</p>
                          </div>
                        )}
                        
                        {!mess.weeklyMenu[activeDay].breakfast && 
                         !mess.weeklyMenu[activeDay].lunch && 
                         !mess.weeklyMenu[activeDay].snacks && 
                         !mess.weeklyMenu[activeDay].dinner && (
                          <p className="text-sm text-gray-500 italic text-center py-4">
                            No menu available for {formatDayName(activeDay)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic text-center py-4">
                        No menu available for {formatDayName(activeDay)}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Amenities - Only show available amenities */}
              {availableAmenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
                    <FaCheckCircle className="mr-2 text-green-600" /> Available Amenities
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableAmenities.map(key => (
                      <div 
                        key={key} 
                        className="flex items-center p-2 rounded-md border bg-green-50 border-green-100"
                      >
                        <div className="mr-2 flex-shrink-0">
                          {renderAmenityIcon(key)}
                        </div>
                        <span className="text-sm text-gray-700 whitespace-normal">
                          {key === 'acSeating' ? 'AC Seating' : 
                           key === 'homeDelivery' ? 'Home Delivery' :
                           key === 'specialDiet' ? 'Special Diet' : 
                           key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Rules */}
              {mess.rules && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-1">
                    <FaInfoCircle className="mr-2 text-green-600" /> Rules & Policies
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-600 whitespace-pre-line text-sm">{mess.rules}</p>
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 border border-green-600 text-green-600 text-sm font-medium rounded-md hover:bg-green-50 transition">
                  Contact Owner
                </button>
                <button 
                  className={`px-4 py-2 text-white text-sm font-medium rounded-md transition shadow-md flex items-center ${subscriptionButton.className}`}
                  disabled={subscriptionButton.disabled}
                  onClick={subscriptionButton.onClick}
                >
                  {subscriptionButton.icon} {subscriptionButton.text}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Show Owner Profile Modal when button is clicked */}
      {showOwnerProfile && (
        <OwnerProfileModal 
          ownerId={getOwnerId()} 
          onClose={() => setShowOwnerProfile(false)} 
        />
      )}

      {/* Show Subscription Modal when button is clicked */}
      {showSubscriptionModal && (
        <BookingModal 
          service={mess}
          serviceType="mess"
          onClose={() => setShowSubscriptionModal(false)}
          onSuccess={handleSubscriptionSuccess}
        />
      )}
    </div>
  );
} 