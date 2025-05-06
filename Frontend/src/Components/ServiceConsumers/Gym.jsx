import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaRupeeSign, FaDumbbell, FaClock, FaMale, FaFemale, FaUsers, FaSpinner } from 'react-icons/fa';
import GymDetail from './GymDetail';
import { fetchGyms } from '../../utils/api';

export default function Gym() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGym, setSelectedGym] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const loadGyms = async () => {
      try {
        setLoading(true);
        const data = await fetchGyms();
        if (data && Array.isArray(data)) {
          setGyms(data);
          setError(null);
          console.log('Gyms loaded successfully:', data.length);
        } else {
          console.error('Invalid gym data format:', data);
          setError('Invalid data format received from server');
          setGyms([]);
        }
      } catch (err) {
        console.error('Error fetching gyms:', err);
        setError('Failed to load gyms. Please try again later.');
        setGyms([]);
      } finally {
        setLoading(false);
      }
    };

    loadGyms();
  }, []);

  // Function to get gym type icon/badge
  const getGymTypeLabel = (gymType) => {
    switch(gymType?.toLowerCase()) {
      case 'weightlifting':
        return 'Weight Training';
      case 'cardio':
        return 'Cardio';
      case 'yoga':
        return 'Yoga';
      case 'crossfit':
        return 'CrossFit';
      case 'mixed':
        return 'Mixed';
      default:
        return gymType || 'General';
    }
  };

  // Function to get lowest price from membership plans
  const getLowestPrice = (membershipPlans) => {
    if (!membershipPlans || membershipPlans.length === 0) {
      return 0;
    }
    
    // Find the lowest price plan
    const lowestPricePlan = membershipPlans.reduce((lowest, current) => {
      return (current.price < lowest.price) ? current : lowest;
    }, membershipPlans[0]);
    
    return lowestPricePlan.price;
  };

  // Handle opening the detail modal
  const handleViewDetails = (gym) => {
    setSelectedGym(gym);
    setShowDetailModal(true);
  };

  // Handle closing the detail modal
  const handleCloseDetail = () => {
    setShowDetailModal(false);
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
   

      {gyms.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded">
          No gyms available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gyms.map((gym) => (
            <div key={gym._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
              <div className="relative h-48 bg-gray-200">
                {gym.images && gym.images.length > 0 ? (
                  <img 
                    src={gym.images[0].url} 
                    alt={gym.gymName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <FaDumbbell className="text-5xl text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded flex items-center">
                  <span>{getGymTypeLabel(gym.gymType)}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{gym.gymName}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <FaMapMarkerAlt className="mr-1 text-green-500" />
                  <span>{gym.address || 'Location not specified'}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {gym.description || 'No description available'}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center text-green-600 font-semibold">
                    <FaRupeeSign className="mr-1" />
                    <span>{getLowestPrice(gym.membershipPlans)}</span>
                    <span className="text-gray-500 font-normal text-xs ml-1">/month</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="mr-1" />
                    <span>{gym.openingHours || 'Hours not specified'}</span>
                  </div>
                </div>
                
                {(gym.equipment || gym.facilities) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Features</h4>
                    <div className="flex flex-wrap gap-1 text-xs">
                      {/* Display equipment items */}
                      {gym.equipment && Object.entries(gym.equipment).map(([key, value]) => 
                        value && <span key={key} className="bg-green-50 text-green-700 px-2 py-1 rounded">{key}</span>
                      )}
                      
                      {/* Display facilities */}
                      {gym.facilities && Object.entries(gym.facilities).map(([key, value]) => 
                        value && <span key={key} className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{key}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Display membership plans */}
                {gym.membershipPlans && gym.membershipPlans.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Membership Plans</h4>
                    <div className="flex flex-wrap gap-1 text-xs">
                      {gym.membershipPlans.slice(0, 2).map((plan, index) => (
                        <span key={index} className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                          {plan.name}: ₹{plan.price}
                        </span>
                      ))}
                      {gym.membershipPlans.length > 2 && (
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                          +{gym.membershipPlans.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <button 
                    className="bg-white text-green-600 border border-green-600 px-3 py-1 rounded hover:bg-green-50"
                    onClick={() => handleViewDetails(gym)}
                  >
                    View Details
                  </button>
                  <button 
                    className={`px-3 py-1 rounded ${
                      gym.availability 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                    disabled={!gym.availability}
                  >
                    {gym.availability ? 'Get Membership' : 'Not Available'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Detail Modal */}
      {showDetailModal && selectedGym && (
        <GymDetail 
          gym={selectedGym} 
          onClose={handleCloseDetail} 
        />
      )}
    </div>
  );
}
