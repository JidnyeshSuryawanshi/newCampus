import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaRupeeSign, 
  FaDumbbell, 
  FaTimes, 
  FaWifi, 
  FaParking, 
  FaUser,
  FaEnvelope,
  FaInfoCircle,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaIdCard,
  FaUsers,
  FaClock,
  FaRunning,
  FaBiking,
  FaSnowflake,
  FaShower,
  FaLock,
  FaAppleAlt,
  FaWeight,
  FaChair,
  FaSpinner,
  FaUserFriends
} from 'react-icons/fa';
import { fetchOwnerDetails } from '../../utils/api';
import OwnerProfileModal from './OwnerProfileModal';

// CSS classes for animation
const ANIMATION_CLASSES = "animate-fadeIn";

export default function GymDetail({ gym, onClose }) {
  if (!gym) return null;
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showOwnerProfile, setShowOwnerProfile] = useState(false);
  
  // Fetch owner details
  useEffect(() => {
    const getOwnerDetails = async () => {
      if (!gym.owner) return;
      
      try {
        setLoading(true);
        // Get owner ID whether it's an object or string
        const ownerId = typeof gym.owner === 'object' ? gym.owner._id : gym.owner;
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
  }, [gym.owner]);
  
  // Function to display equipment icons
  const renderEquipmentIcon = (key) => {
    const equipmentIcons = {
      'treadmill': <FaRunning size={18} className="text-green-500" />,
      'crossTrainer': <FaDumbbell size={18} className="text-green-500" />,
      'exerciseBike': <FaBiking size={18} className="text-green-500" />,
      'rowingMachine': <FaDumbbell size={18} className="text-green-500" />,
      'weights': <FaWeight size={18} className="text-green-500" />,
      'benchPress': <FaDumbbell size={18} className="text-green-500" />,
      'powerRack': <FaDumbbell size={18} className="text-green-500" />,
      'smithMachine': <FaDumbbell size={18} className="text-green-500" />,
      'cableMachine': <FaDumbbell size={18} className="text-green-500" />,
      'legPress': <FaDumbbell size={18} className="text-green-500" />
    };
    
    return equipmentIcons[key] || <FaDumbbell size={18} className="text-green-500" />;
  };
  
  // Function to display facility icons
  const renderFacilityIcon = (key) => {
    const facilityIcons = {
      'airConditioned': <FaSnowflake size={18} className="text-green-500" />,
      'parking': <FaParking size={18} className="text-green-500" />,
      'wifi': <FaWifi size={18} className="text-green-500" />,
      'changingRoom': <FaUsers size={18} className="text-green-500" />,
      'shower': <FaShower size={18} className="text-green-500" />,
      'locker': <FaLock size={18} className="text-green-500" />,
      'personalTrainer': <FaUser size={18} className="text-green-500" />,
      'nutritionCounseling': <FaAppleAlt size={18} className="text-green-500" />,
      'supplements': <FaAppleAlt size={18} className="text-green-500" />
    };
    
    return facilityIcons[key] || null;
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
  
  // Function to format gym type
  const formatGymType = (type) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Handle changing the active image
  const handleImageChange = (index) => {
    setActiveImageIndex(index);
  };
  
  // Navigate to previous image
  const handlePrevImage = () => {
    if (!gym.images || gym.images.length <= 1) return;
    setActiveImageIndex((prevIndex) => 
      prevIndex === 0 ? gym.images.length - 1 : prevIndex - 1
    );
  };
  
  // Navigate to next image
  const handleNextImage = () => {
    if (!gym.images || gym.images.length <= 1) return;
    setActiveImageIndex((prevIndex) => 
      prevIndex === gym.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Get current image or placeholder
  const currentImage = gym.images && gym.images.length > 0 
    ? gym.images[activeImageIndex]?.url 
    : null;

  // Get available equipment only
  const getAvailableEquipment = () => {
    if (!gym.equipment) return [];
    
    return Object.entries(gym.equipment)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
  };

  // Get available facilities only
  const getAvailableFacilities = () => {
    if (!gym.facilities) return [];
    
    return Object.entries(gym.facilities)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
  };

  const availableEquipment = getAvailableEquipment();
  const availableFacilities = getAvailableFacilities();

  // Format membership plan duration
  const formatDuration = (duration) => {
    switch(duration) {
      case 'daily': return 'Day';
      case 'weekly': return 'Week';
      case 'monthly': return 'Month';
      case 'quarterly': return '3 Months';
      case 'halfYearly': return '6 Months';
      case 'yearly': return 'Year';
      default: return duration;
    }
  };

  // Safe getters for owner details
  const getOwnerName = () => {
    if (!ownerDetails) return 'Not specified';
    return ownerDetails.username || 'Not specified';
  };
  
  const getOwnerEmail = () => {
    if (!ownerDetails || !ownerDetails.email) return null;
    return typeof ownerDetails.email === 'string' ? ownerDetails.email : null;
  };

  // Function to get owner ID safely
  const getOwnerId = () => {
    if (!gym.owner) return null;
    return typeof gym.owner === 'object' ? gym.owner._id : gym.owner;
  };

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
                  alt={`${gym.gymName} - view ${activeImageIndex + 1}`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-green-100">
                  <FaDumbbell className="text-7xl text-green-300" />
                </div>
              )}
              
              {/* Image navigation arrows */}
              {gym.images && gym.images.length > 1 && (
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
                    {activeImageIndex + 1} / {gym.images.length}
                  </div>
                </>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h2 className="text-2xl font-bold text-white">{gym.gymName}</h2>
                <div className="flex items-center text-white mt-1">
                  <FaMapMarkerAlt className="mr-1 text-green-300" />
                  <span className="text-sm">{gym.address || 'Location not specified'}</span>
                </div>
              </div>
              
              {/* Tags overlay */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center">
                  <FaDumbbell className="mr-1 text-white" />
                  <span className="ml-1 capitalize">{formatGymType(gym.gymType)}</span>
                </div>
                {gym.availability ? (
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
            {gym.images && gym.images.length > 1 && (
              <div className="p-4 bg-white">
                <h3 className="text-base font-semibold text-gray-800 mb-2">Photos</h3>
                <div className="grid grid-cols-5 gap-2">
                  {gym.images.map((image, index) => (
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
                        alt={`Gym view ${index + 1}`} 
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
              {/* Timings */}
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center text-green-700 font-bold text-xl">
                  <FaDumbbell className="mr-2" />
                  <span>{formatGymType(gym.gymType)} Gym</span>
                </div>
                <div className="flex items-center text-gray-700 text-sm">
                  <FaClock className="mr-2 text-green-600" />
                  <span>{gym.openingHours}</span>
                </div>
              </div>
              
              {/* Membership Plans */}
              {gym.membershipPlans && gym.membershipPlans.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                    <FaIdCard className="mr-2 text-green-600" /> Membership Plans
                  </h3>
                  
                  <div className="space-y-3">
                    {gym.membershipPlans.map((plan, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedPlan === index 
                            ? 'bg-green-100 border border-green-200 shadow-sm' 
                            : 'bg-white border border-gray-200 hover:bg-green-50'
                        }`}
                        onClick={() => setSelectedPlan(index === selectedPlan ? null : index)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-800">{plan.name}</h4>
                            <p className="text-sm text-gray-500">{formatDuration(plan.duration)}</p>
                          </div>
                          <div className="flex items-center text-green-600 font-bold">
                            <FaRupeeSign className="mr-1 text-sm" />
                            <span>{plan.price}</span>
                          </div>
                        </div>
                        
                        {selectedPlan === index && plan.description && (
                          <div className="mt-2 text-sm text-gray-600 border-t border-gray-200 pt-2">
                            {plan.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Gym Details */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FaIdCard className="mr-2 text-green-600" /> Gym Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Gym Type</p>
                    <p className="font-medium text-gray-700 flex items-center">
                      <FaDumbbell className="mr-1 text-green-600" size={14} />
                      <span className="capitalize">{formatGymType(gym.gymType)}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Capacity</p>
                    <p className="font-medium text-gray-700 flex items-center">
                      <FaUsers className="mr-1 text-green-600" size={14} />
                      <span>{gym.capacity} people</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Working Hours</p>
                    <p className="font-medium text-gray-700">{gym.openingHours}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Since</p>
                    <p className="font-medium text-gray-700">{formatDate(gym.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              {/* Owner Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
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
                        <p className="font-medium text-gray-700">{ownerDetails.name || ownerDetails.username || 'Not specified'}</p>
                      </div>
                    </div>
                    {ownerDetails.email && (
                      <div className="flex items-start">
                        <FaEnvelope className="text-gray-500 mr-2 mt-1" />
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium text-gray-700">{ownerDetails.email}</p>
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
                  {gym.description || 'No description available'}
                </p>
              </div>
              
              {/* Equipment */}
              {availableEquipment.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
                    <FaDumbbell className="mr-2 text-green-600" /> Available Equipment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableEquipment.map(key => (
                      <div 
                        key={key} 
                        className="flex items-center p-2 rounded-md border bg-green-50 border-green-100"
                      >
                        <div className="mr-2 flex-shrink-0">
                          {renderEquipmentIcon(key)}
                        </div>
                        <span className="text-sm text-gray-700 whitespace-normal">
                          {key === 'crossTrainer' ? 'Cross Trainer' : 
                           key === 'exerciseBike' ? 'Exercise Bike' :
                           key === 'rowingMachine' ? 'Rowing Machine' : 
                           key === 'benchPress' ? 'Bench Press' :
                           key === 'powerRack' ? 'Power Rack' :
                           key === 'smithMachine' ? 'Smith Machine' :
                           key === 'cableMachine' ? 'Cable Machine' :
                           key === 'legPress' ? 'Leg Press' :
                           key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Facilities */}
              {availableFacilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
                    <FaCheckCircle className="mr-2 text-green-600" /> Available Facilities
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableFacilities.map(key => (
                      <div 
                        key={key} 
                        className="flex items-center p-2 rounded-md border bg-green-50 border-green-100"
                      >
                        <div className="mr-2 flex-shrink-0">
                          {renderFacilityIcon(key)}
                        </div>
                        <span className="text-sm text-gray-700 whitespace-normal">
                          {key === 'airConditioned' ? 'Air Conditioned' : 
                           key === 'changingRoom' ? 'Changing Room' :
                           key === 'personalTrainer' ? 'Personal Trainer' : 
                           key === 'nutritionCounseling' ? 'Nutrition Counseling' :
                           key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Rules */}
              {gym.rules && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-1">
                    <FaInfoCircle className="mr-2 text-green-600" /> Rules & Policies
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-600 whitespace-pre-line text-sm">{gym.rules}</p>
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 border border-green-600 text-green-600 text-sm font-medium rounded-md hover:bg-green-50 transition">
                  Contact Owner
                </button>
                <button 
                  className={`px-4 py-2 text-white text-sm font-medium rounded-md transition shadow-md ${
                    gym.availability ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!gym.availability}
                >
                  {gym.availability ? 'Get Membership' : 'Not Available'}
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
    </div>
  );
} 