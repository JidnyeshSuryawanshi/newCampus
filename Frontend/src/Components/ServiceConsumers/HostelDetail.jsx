import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaRupeeSign, 
  FaBed, 
  FaWifi, 
  FaSnowflake, 
  FaTv, 
  FaParking, 
  FaShieldAlt, 
  FaUtensils, 
  FaBroom, 
  FaTint, 
  FaBoxOpen, 
  FaTshirt,
  FaTimes,
  FaUserFriends,
  FaCalendarAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaSpinner,
  FaCreditCard
} from 'react-icons/fa';
import { fetchOwnerDetails, fetchOwnerProfileById, checkServiceBookingStatus, getUserDetails } from '../../utils/api';
import { initiateRazorpayPayment } from '../../utils/razorpay';
import { toast } from 'react-toastify';
import OwnerProfileModal from './OwnerProfileModal';
import BookingModal from './BookingModal';
import Receipt from './Receipt';

export default function HostelDetail({ hostel, onClose, bookingStatus, onBookingSuccess, onPayment }) {
  if (!hostel) return null;
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOwnerProfile, setShowOwnerProfile] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Fetch owner details and user profile
  useEffect(() => {
    const getOwnerDetails = async () => {
      if (!hostel.owner) return;
      
      try {
        setLoading(true);
        // Get owner ID whether it's an object or string
        const ownerId = typeof hostel.owner === 'object' ? hostel.owner._id : hostel.owner;
        
        const data = await fetchOwnerDetails(ownerId);
        setOwnerDetails(data.data);
      } catch (err) {
        console.error('Error fetching owner details:', err);
        setError('Could not load owner information');
      } finally {
        setLoading(false);
      }
    };

    const loadUserProfile = async () => {
      try {
        const userData = await getUserDetails();
        if (userData && userData.data) {
          setUserProfile(userData.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    getOwnerDetails();
    loadUserProfile();
  }, [hostel]);
  
  // Function to display amenities icons
  const renderAmenityIcon = (key) => {
    const amenityIcons = {
      'wifi': <FaWifi size={18} className="text-green-500" />,
      'ac': <FaSnowflake size={18} className="text-green-500" />,
      'tv': <FaTv size={18} className="text-green-500" />,
      'fridge': <FaBoxOpen size={18} className="text-green-500" />,
      'washingMachine': <FaTshirt size={18} className="text-green-500" />,
      'hotWater': <FaTint size={18} className="text-green-500" />,
      'parking': <FaParking size={18} className="text-green-500" />,
      'security': <FaShieldAlt size={18} className="text-green-500" />,
      'meals': <FaUtensils size={18} className="text-green-500" />,
      'cleaning': <FaBroom size={18} className="text-green-500" />
    };
    
    return amenityIcons[key] || null;
  };
  
  // Map room type to a more user-friendly display
  const getRoomTypeLabel = (type) => {
    const types = {
      single: 'Single Room',
      double: 'Double Room',
      triple: 'Triple Room',
      dormitory: 'Dormitory',
      flat: 'Flat/Apartment'
    };
    return types[type] || type;
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
    if (!hostel.images || hostel.images.length <= 1) return;
    setActiveImageIndex((prevIndex) => 
      prevIndex === 0 ? hostel.images.length - 1 : prevIndex - 1
    );
  };
  
  // Navigate to next image
  const handleNextImage = () => {
    if (!hostel.images || hostel.images.length <= 1) return;
    setActiveImageIndex((prevIndex) => 
      prevIndex === hostel.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Get current image or placeholder
  const currentImage = hostel.images && hostel.images.length > 0 
    ? hostel.images[activeImageIndex]?.url 
    : null;

  // Get available amenities only
  const getAvailableAmenities = () => {
    if (!hostel.amenities) return [];
    
    return Object.entries(hostel.amenities)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
  };

  const availableAmenities = getAvailableAmenities();

  // Safe getters for owner details
  const getOwnerName = () => {
    if (!ownerDetails) return 'Not specified';
    return ownerDetails.name || ownerDetails.username || 'Not specified';
  };
  
  const getOwnerEmail = () => {
    if (!ownerDetails || !ownerDetails.email) return null;
    return typeof ownerDetails.email === 'string' ? ownerDetails.email : null;
  };

  const getOwnerPhone = () => {
    if (!ownerDetails || !ownerDetails.phone) return null;
    return typeof ownerDetails.phone === 'string' ? ownerDetails.phone : null;
  };

  // Function to get owner ID safely
  const getOwnerId = () => {
    if (!hostel.owner) return null;
    return typeof hostel.owner === 'object' ? hostel.owner._id : hostel.owner;
  };

  // Handle booking button click
  const handleBookNowClick = () => {
    setShowBookingModal(true);
  };

  // Handle booking success
  const handleBookingSuccess = (booking) => {
    if (onBookingSuccess) {
      onBookingSuccess(booking);
    }
    setShowBookingModal(false);
  };

  // Handle payment button click
  const handlePayNow = () => {
    if (onPayment && hostel._id) {
      onPayment(hostel._id);
    } else {
      toast.error('Unable to process payment at this time');
    }
  };

  // Get booking button status
  const getBookingButtonStatus = () => {
    if (!hostel.availability) {
      return {
        text: 'Not Available',
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed',
        onClick: () => {}
      };
    }
    
    if (bookingStatus?.hasBooking) {
      // If booking is accepted, show payment status
      if (bookingStatus.status === 'accepted') {
        const isPaid = bookingStatus.booking?.paymentStatus === 'paid';
        
        if (isPaid) {
          return {
            text: 'Paid',
            disabled: true,
            className: 'bg-green-600 cursor-not-allowed',
            icon: <FaCheckCircle className="mr-2" />,
            onClick: () => {}
          };
        } else {
          return {
            text: 'Pay Now',
            disabled: false,
            className: 'bg-indigo-600 hover:bg-indigo-700',
            icon: <FaCreditCard className="mr-2" />,
            onClick: handlePayNow
          };
        }
      }
      
      // If booking is pending, show Pending status
      if (bookingStatus.status === 'pending') {
        return {
          text: 'Booking Pending',
          disabled: true,
          className: 'bg-yellow-500 cursor-not-allowed',
          onClick: () => {}
        };
      }
    }
    
    // Default case: Available for booking
    return {
      text: 'Book Now',
      disabled: false,
      className: 'bg-green-600 hover:bg-green-700',
      onClick: handleBookNowClick
    };
  };

  // Get button status
  const bookingButton = getBookingButtonStatus();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
      <div className="bg-white rounded-xl overflow-hidden max-w-5xl w-full max-h-90vh relative animate-fadeIn">
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
                  alt={`${hostel.roomName} - view ${activeImageIndex + 1}`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-green-100">
                  <FaBed className="text-7xl text-green-300" />
                </div>
              )}
              
              {/* Image navigation arrows */}
              {hostel.images && hostel.images.length > 1 && (
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
                    {activeImageIndex + 1} / {hostel.images.length}
                  </div>
                </>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h2 className="text-2xl font-bold text-white">{hostel.roomName}</h2>
                <div className="flex items-center text-white mt-1">
                  <FaMapMarkerAlt className="mr-1 text-green-300" />
                  <span className="text-sm">{hostel.address || 'Location not specified'}</span>
                </div>
              </div>
              
              {/* Tags overlay */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                  {getRoomTypeLabel(hostel.roomType)}
                </div>
                {hostel.gender && hostel.gender !== 'any' && (
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    {hostel.gender === 'male' ? 'Male Only' : 'Female Only'}
                  </div>
                )}
                {hostel.availability ? (
                  <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    Available Now
                  </div>
                ) : (
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    Not Available
                  </div>
                )}

                {/* Show booking status if applicable */}
                {bookingStatus?.hasBooking && (
                  <div className={`${
                    bookingStatus.status === 'accepted' ? 'bg-green-600' : 
                    bookingStatus.status === 'pending' ? 'bg-yellow-500' : 
                    'bg-gray-600'
                  } text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md`}>
                    {bookingStatus.status === 'accepted' ? 'Booked' : 
                     bookingStatus.status === 'pending' ? 'Pending' : 
                     'Status: ' + bookingStatus.status}
                  </div>
                )}
              </div>
            </div>
            
            {/* Image gallery thumbnails */}
            {hostel.images && hostel.images.length > 1 && (
              <div className="p-4 bg-white">
                <h3 className="text-base font-semibold text-gray-800 mb-2">Photos</h3>
                <div className="grid grid-cols-5 gap-2">
                  {hostel.images.map((image, index) => (
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
                        alt={`Room view ${index + 1}`} 
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
              {/* Price and Capacity */}
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center text-green-700 font-bold text-xl">
                  <FaRupeeSign className="mr-1" />
                  <span>{hostel.price}</span>
                  <span className="text-gray-500 font-normal text-xs ml-1">/month</span>
                </div>
                <div className="flex items-center text-gray-700 text-sm">
                  <FaUserFriends className="mr-2 text-green-600" />
                  <span>Capacity: <span className="font-semibold">{hostel.capacity}</span></span>
                </div>
              </div>
              
              {/* Room Details - Type, Gender, etc. (without Room ID) */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FaIdCard className="mr-2 text-green-600" /> Room Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Room Type</p>
                    <p className="font-medium text-gray-700">{getRoomTypeLabel(hostel.roomType)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Gender Preference</p>
                    <p className="font-medium text-gray-700 capitalize">{hostel.gender || 'Any'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Listed On</p>
                    <p className="font-medium text-gray-700">{formatDate(hostel.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className={`font-medium ${hostel.availability ? 'text-green-600' : 'text-red-600'}`}>
                      {hostel.availability ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Booking status section - show only if there is a booking */}
              {bookingStatus?.hasBooking && (
                <div className={`rounded-lg p-4 border ${
                  bookingStatus.status === 'accepted' ? 'bg-green-50 border-green-200' : 
                  bookingStatus.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 
                  'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                    <FaCalendarAlt className={`mr-2 ${
                      bookingStatus.status === 'accepted' ? 'text-green-600' : 
                      bookingStatus.status === 'pending' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`} /> Booking Status
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Status: <span className={`${
                        bookingStatus.status === 'accepted' ? 'text-green-600' : 
                        bookingStatus.status === 'pending' ? 'text-yellow-600' : 
                        'text-gray-600'
                      } capitalize`}>{bookingStatus.status}</span>
                    </p>
                    {bookingStatus.booking?.bookingDetails?.checkInDate && (
                      <p className="text-sm">
                        <span className="font-medium">Check-in Date:</span> {formatDate(bookingStatus.booking.bookingDetails.checkInDate)}
                      </p>
                    )}
                    {bookingStatus.booking?.bookingDetails?.duration && (
                      <p className="text-sm">
                        <span className="font-medium">Duration:</span> {bookingStatus.booking.bookingDetails.duration}
                      </p>
                    )}
                    {bookingStatus.status === 'accepted' && (
                      <>
                        <p className="text-sm font-medium">
                          Payment Status: <span className={`${
                            bookingStatus.booking?.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          } capitalize`}>{bookingStatus.booking?.paymentStatus || 'unpaid'}</span>
                        </p>
                        {bookingStatus.booking?.paymentStatus !== 'paid' && (
                          <div className="mt-2">
                            <button
                              onClick={handlePayNow}
                              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm shadow-md"
                            >
                              <FaCreditCard className="mr-2" /> Proceed to Payment
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              
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
                  {hostel.description || 'No description available'}
                </p>
              </div>
              
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
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Rules */}
              {hostel.rules && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-1">
                    <FaInfoCircle className="mr-2 text-green-600" /> Rules & Policies
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-600 whitespace-pre-line text-sm">{hostel.rules}</p>
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 border border-green-600 text-green-600 text-sm font-medium rounded-md hover:bg-green-50 transition">
                  Contact Owner
                </button>
                <button 
                  className={`px-4 py-2 text-white text-sm font-medium rounded-md transition shadow-md flex items-center ${bookingButton.className}`}
                  disabled={bookingButton.disabled}
                  onClick={bookingButton.onClick}
                >
                  {bookingButton.icon} {bookingButton.text}
                </button>
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
        
        {/* Show Booking Modal when button is clicked */}
        {showBookingModal && (
          <BookingModal 
            service={hostel}
            serviceType="hostel"
            onClose={() => setShowBookingModal(false)}
            onSuccess={handleBookingSuccess}
          />
        )}

        {/* Receipt Modal */}
        {showReceiptModal && receiptData && (
          <Receipt 
            paymentData={receiptData}
            onClose={() => setShowReceiptModal(false)}
          />
        )}
      </div>
    </div>
  );
} 