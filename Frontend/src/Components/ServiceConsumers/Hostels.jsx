import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaRupeeSign, FaBed, FaWifi, FaSnowflake, FaTv, FaParking, FaShieldAlt, FaUtensils, FaBroom, FaTint, FaBoxOpen, FaTshirt, FaSpinner, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import HostelDetail from './HostelDetail';
import BookingModal from './BookingModal';
import { fetchHostels, checkServiceBookingStatus } from '../../utils/api';
import { toast } from 'react-toastify';

export default function Hostels() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingHostel, setBookingHostel] = useState(null);
  const [bookingStatuses, setBookingStatuses] = useState({}); // To store booking statuses for each hostel

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch hostels
        const data = await fetchHostels();
        setHostels(data);

        // Check booking status for each hostel
        const statuses = {};
        for (const hostel of data) {
          const status = await checkServiceBookingStatus('hostel', hostel._id);
          statuses[hostel._id] = status;
        }
        setBookingStatuses(statuses);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load hostels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to display amenities icons
  const renderAmenities = (amenities) => {
    if (!amenities) return [];
    
    const amenityIcons = [
      { key: 'wifi', icon: <FaWifi key="wifi" className="text-green-500 mr-2" title="WiFi" /> },
      { key: 'ac', icon: <FaSnowflake key="ac" className="text-green-500 mr-2" title="AC" /> },
      { key: 'tv', icon: <FaTv key="tv" className="text-green-500 mr-2" title="TV" /> },
      { key: 'fridge', icon: <FaBoxOpen key="fridge" className="text-green-500 mr-2" title="Fridge" /> },
      { key: 'washingMachine', icon: <FaTshirt key="washing" className="text-green-500 mr-2" title="Washing Machine" /> },
      { key: 'hotWater', icon: <FaTint key="hotwater" className="text-green-500 mr-2" title="Hot Water" /> },
      { key: 'parking', icon: <FaParking key="parking" className="text-green-500 mr-2" title="Parking" /> },
      { key: 'security', icon: <FaShieldAlt key="security" className="text-green-500 mr-2" title="Security" /> },
      { key: 'meals', icon: <FaUtensils key="meals" className="text-green-500 mr-2" title="Meals" /> },
      { key: 'cleaning', icon: <FaBroom key="cleaning" className="text-green-500 mr-2" title="Cleaning" /> }
    ];
    
    return amenityIcons
      .filter(item => amenities[item.key])
      .map(item => item.icon);
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

  // Handle opening the details modal
  const handleViewDetails = (hostel) => {
    setSelectedHostel(hostel);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Handle closing the details modal
  const handleCloseDetails = () => {
    setSelectedHostel(null);
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
  };

  // Handle booking button click
  const handleBookNow = (hostel) => {
    setBookingHostel(hostel);
    setShowBookingModal(true);
  };

  // Handle payment button click
  const handlePayNow = (hostelId) => {
    // For now, just show a toast message
    toast.info('Payment functionality will be implemented in a future update. Your booking is confirmed!');
  };

  // Get booking button text and class based on availability and booking status
  const getBookingButton = (hostel) => {
    // Default state for unavailable hostel
    if (!hostel.availability) {
      return {
        text: 'Not Available',
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed',
        onClick: () => {}
      };
    }
    
    const bookingStatus = bookingStatuses[hostel._id];
    
    // If we have a booking status for this hostel
    if (bookingStatus?.hasBooking) {
      // If booking is accepted, check payment status
      if (bookingStatus.status === 'accepted') {
        const isPaid = bookingStatus.booking?.paymentStatus === 'paid';
        
        if (isPaid) {
          return {
            text: 'Paid',
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
            onClick: () => handlePayNow(hostel._id)
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
      onClick: () => handleBookNow(hostel)
    };
  };

  // Handle booking success
  const handleBookingSuccess = (booking) => {
    // Update the booking status for this hostel
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
    
      {hostels.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded">
          No hostels available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map((hostel) => {
            const bookingBtn = getBookingButton(hostel);
            
            return (
              <div key={hostel._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white relative z-0">
                <div className="relative h-48 bg-gray-200">
                  {hostel.images && hostel.images.length > 0 ? (
                    <img 
                      src={hostel.images[0].url} 
                      alt={hostel.roomName} 
                      className="w-full h-full object-cover"
                      style={{ zIndex: 0 }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <FaBed className="text-5xl text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                    {getRoomTypeLabel(hostel.roomType)}
                  </div>
                  {hostel.gender && hostel.gender !== 'any' && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs rounded">
                      {hostel.gender === 'male' ? 'Male Only' : 'Female Only'}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{hostel.roomName}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FaMapMarkerAlt className="mr-1 text-green-500" />
                    <span>{hostel.address || 'Location not specified'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {hostel.description || 'No description available'}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-green-600 font-semibold">
                      <FaRupeeSign className="mr-1" />
                      <span>{hostel.price}</span>
                      <span className="text-gray-500 font-normal text-xs ml-1">/month</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaBed className="mr-1" />
                      <span>Capacity: {hostel.capacity}</span>
                    </div>
                  </div>
                  
                  {/* Amenities section */}
                  {hostel.amenities && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Amenities</h4>
                      <div className="flex items-center mb-2 flex-wrap">
                        {renderAmenities(hostel.amenities)}
                      </div>
                      <div className="flex flex-wrap gap-1 text-xs">
                        {Object.entries(hostel.amenities)
                          .filter(([_, value]) => value === true)
                          .map(([key]) => (
                            <span key={key} className="bg-green-50 text-green-700 px-2 py-1 rounded capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  )}
                  
                  {/* Rules summary if available */}
                  {hostel.rules && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Rules</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{hostel.rules}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <button 
                      onClick={() => handleViewDetails(hostel)}
                      className="bg-white text-green-600 border border-green-600 px-3 py-1 rounded hover:bg-green-50 transition">
                      View Details
                    </button>
                    <button 
                      onClick={bookingBtn.onClick}
                      disabled={bookingBtn.disabled}
                      className={`text-white px-3 py-1 rounded transition ${bookingBtn.className} flex items-center`}>
                      {bookingBtn.icon} {bookingBtn.text}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Render the hostel detail modal when a hostel is selected */}
      {selectedHostel && (
        <HostelDetail 
          hostel={selectedHostel} 
          onClose={handleCloseDetails} 
          bookingStatus={bookingStatuses[selectedHostel._id]}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Booking Modal */}
      {showBookingModal && bookingHostel && (
        <BookingModal
          service={bookingHostel}
          serviceType="hostel"
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
