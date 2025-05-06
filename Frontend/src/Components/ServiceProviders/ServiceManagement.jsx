import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBuilding, FaUtensils, FaDumbbell, FaPlus, FaEdit, FaTrash, FaUpload, FaCheck, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

export default function ServiceManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [showForm, setShowForm] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [listings, setListings] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const fileInputRef = useRef(null);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  // Form state for hostel room
  const [formData, setFormData] = useState({
    roomName: '',
    roomType: 'single',
    price: '',
    capacity: '1',
    gender: 'any',
    amenities: {
      wifi: false,
      ac: false,
      tv: false,
      fridge: false,
      washingMachine: false,
      hotWater: false,
      parking: false,
      security: false,
      meals: false,
      cleaning: false
    },
    description: '',
    address: '',
    rules: '',
    availability: true
  });

  // Form state for mess
  const [messFormData, setMessFormData] = useState({
    messName: '',
    messType: 'veg',
    monthlyPrice: '',
    dailyPrice: '',
    capacity: '10',
    openingHours: '',
    amenities: {
      acSeating: false,
      wifi: false,
      parking: false,
      homeDelivery: false,
      specialDiet: false
    },
    weeklyMenu: {
      monday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
      tuesday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
      wednesday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
      thursday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
      friday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
      saturday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
      sunday: { breakfast: '', lunch: '', dinner: '', snacks: '' }
    },
    description: '',
    address: '',
    rules: '',
    availability: true
  });

  // Form state for gym
  const [gymFormData, setGymFormData] = useState({
    gymName: '',
    gymType: 'fitness',
    capacity: '10',
    openingHours: '',
    equipment: {
      treadmill: false,
      crossTrainer: false,
      exerciseBike: false,
      rowingMachine: false,
      weights: false,
      benchPress: false,
      powerRack: false,
      smithMachine: false,
      cableMachine: false,
      legPress: false
    },
    facilities: {
      airConditioned: false,
      parking: false,
      wifi: false,
      changingRoom: false,
      shower: false,
      locker: false,
      personalTrainer: false,
      nutritionCounseling: false,
      supplements: false
    },
    membershipPlans: [
      {
        name: 'Basic',
        duration: 'monthly',
        price: '',
        description: ''
      }
    ],
    description: '',
    address: '',
    rules: '',
    availability: true
  });

  // API base URL
  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://campus-cove.onrender.com/api' 
    : 'http://localhost:5000/api';

  // Fetch listings based on account type
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      let endpoint;
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Set endpoint based on account type
      switch (accountType) {
        case 'hostel':
          endpoint = `${API_URL}/hostel-rooms/owner`;
          break;
        case 'mess':
          endpoint = `${API_URL}/mess/owner`;
          break;
        case 'gym':
          endpoint = `${API_URL}/gym/owner`;
          break;
        default:
          throw new Error('Invalid account type');
      }
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setListings(response.data.data);
      
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError(error.response?.data?.error || 'Failed to fetch listings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine account type
  const getAccountType = () => {
    if (!user || !user.userType) return null;
    if (user.userType.includes('hostelOwner')) return 'hostel';
    if (user.userType.includes('messOwner')) return 'mess';
    if (user.userType.includes('gymOwner')) return 'gym';
    return null;
  };

  const accountType = getAccountType();

  // Fetch listings when component mounts or account type changes
  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user, accountType]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox changes for amenities
  const handleAmenityChange = (amenity) => {
    setFormData({
      ...formData,
      amenities: {
        ...formData.amenities,
        [amenity]: !formData.amenities[amenity]
      }
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  // Remove an image
  const removeImage = (index) => {
    const newImages = [...selectedImages];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create form data for file upload
      const formDataToSend = new FormData();
      
      // Determine which form data to use and endpoint based on account type
      let endpoint = '';
      let method = editMode ? 'put' : 'post';
      let itemId = '';
      
      switch (accountType) {
        case 'hostel':
          // Add text fields for hostel
          formDataToSend.append('roomName', formData.roomName);
          formDataToSend.append('roomType', formData.roomType);
          formDataToSend.append('price', formData.price);
          formDataToSend.append('capacity', formData.capacity);
          formDataToSend.append('gender', formData.gender);
          formDataToSend.append('amenities', JSON.stringify(formData.amenities));
          formDataToSend.append('description', formData.description);
          formDataToSend.append('address', formData.address);
          formDataToSend.append('rules', formData.rules);
          formDataToSend.append('availability', formData.availability);
          
          // Set endpoint
          endpoint = editMode 
            ? `${API_URL}/hostel-rooms/${currentRoomId}` 
            : `${API_URL}/hostel-rooms`;
          
          itemId = currentRoomId;
          break;
          
        case 'mess':
          // Add text fields for mess
          formDataToSend.append('messName', messFormData.messName);
          formDataToSend.append('messType', messFormData.messType);
          formDataToSend.append('monthlyPrice', messFormData.monthlyPrice);
          formDataToSend.append('dailyPrice', messFormData.dailyPrice);
          formDataToSend.append('capacity', messFormData.capacity);
          formDataToSend.append('openingHours', messFormData.openingHours);
          formDataToSend.append('amenities', JSON.stringify(messFormData.amenities));
          formDataToSend.append('weeklyMenu', JSON.stringify(messFormData.weeklyMenu));
          formDataToSend.append('description', messFormData.description);
          formDataToSend.append('address', messFormData.address);
          formDataToSend.append('rules', messFormData.rules);
          formDataToSend.append('availability', messFormData.availability);
          
          // Set endpoint
          endpoint = editMode 
            ? `${API_URL}/mess/${currentRoomId}` 
            : `${API_URL}/mess`;
          
          itemId = currentRoomId;
          break;
          
        case 'gym':
          // Add text fields for gym
          formDataToSend.append('gymName', gymFormData.gymName);
          formDataToSend.append('gymType', gymFormData.gymType);
          formDataToSend.append('capacity', gymFormData.capacity);
          formDataToSend.append('openingHours', gymFormData.openingHours);
          formDataToSend.append('equipment', JSON.stringify(gymFormData.equipment));
          formDataToSend.append('facilities', JSON.stringify(gymFormData.facilities));
          formDataToSend.append('membershipPlans', JSON.stringify(gymFormData.membershipPlans));
          formDataToSend.append('description', gymFormData.description);
          formDataToSend.append('address', gymFormData.address);
          formDataToSend.append('rules', gymFormData.rules);
          formDataToSend.append('availability', gymFormData.availability);
          
          // Set endpoint
          endpoint = editMode 
            ? `${API_URL}/gym/${currentRoomId}` 
            : `${API_URL}/gym`;
          
          itemId = currentRoomId;
          break;
          
        default:
          throw new Error('Invalid account type');
      }
      
      // Add image files
      selectedImages.forEach((image) => {
        if (image.file) { // Only append if it's a new file (not from Cloudinary)
          formDataToSend.append('images', image.file);
        }
      });
      
      // If editing, include existing Cloudinary images
      if (editMode) {
        if (accountType === 'hostel' && formData.existingImages) {
          formDataToSend.append('existingImages', JSON.stringify(formData.existingImages));
        } else if (accountType === 'mess' && messFormData.existingImages) {
          formDataToSend.append('existingImages', JSON.stringify(messFormData.existingImages));
        } else if (accountType === 'gym' && gymFormData.existingImages) {
          formDataToSend.append('existingImages', JSON.stringify(gymFormData.existingImages));
        }
      }
      
      // Send request to API
      const response = await axios({
        method,
        url: endpoint,
        data: formDataToSend,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Reset form on success
      if (accountType === 'hostel') {
        setFormData({
          roomName: '',
          roomType: 'single',
          price: '',
          capacity: '1',
          gender: 'any',
          amenities: {
            wifi: false,
            ac: false,
            tv: false,
            fridge: false,
            washingMachine: false,
            hotWater: false,
            parking: false,
            security: false,
            meals: false,
            cleaning: false
          },
          description: '',
          address: '',
          rules: '',
          availability: true
        });
      } else if (accountType === 'mess') {
        setMessFormData({
          messName: '',
          messType: 'veg',
          monthlyPrice: '',
          dailyPrice: '',
          capacity: '10',
          openingHours: '',
          amenities: {
            acSeating: false,
            wifi: false,
            parking: false,
            homeDelivery: false,
            specialDiet: false
          },
          weeklyMenu: {
            monday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
            tuesday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
            wednesday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
            thursday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
            friday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
            saturday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
            sunday: { breakfast: '', lunch: '', dinner: '', snacks: '' }
          },
          description: '',
          address: '',
          rules: '',
          availability: true
        });
      } else if (accountType === 'gym') {
        setGymFormData({
          gymName: '',
          gymType: 'fitness',
          capacity: '10',
          openingHours: '',
          equipment: {
            treadmill: false,
            crossTrainer: false,
            exerciseBike: false,
            rowingMachine: false,
            weights: false,
            benchPress: false,
            powerRack: false,
            smithMachine: false,
            cableMachine: false,
            legPress: false
          },
          facilities: {
            airConditioned: false,
            parking: false,
            wifi: false,
            changingRoom: false,
            shower: false,
            locker: false,
            personalTrainer: false,
            nutritionCounseling: false,
            supplements: false
          },
          membershipPlans: [
            {
              name: 'Basic',
              duration: 'monthly',
              price: '',
              description: ''
            }
          ],
          description: '',
          address: '',
          rules: '',
          availability: true
        });
      }
      
      setSelectedImages([]);
      setSuccess(editMode ? `${accountType === 'hostel' ? 'Room' : accountType === 'mess' ? 'Mess' : 'Gym'} updated successfully!` : `${accountType === 'hostel' ? 'Room' : accountType === 'mess' ? 'Mess' : 'Gym'} added successfully!`);
      setShowForm(false);
      setEditMode(false);
      setCurrentRoomId(null);
      
      // Refresh listings
      fetchListings();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.error || `Failed to ${editMode ? 'update' : 'add'} ${accountType === 'hostel' ? 'room' : accountType === 'mess' ? 'mess' : 'gym'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit room
  const handleEditRoom = (room) => {
    // Set edit mode
    setEditMode(true);
    setCurrentRoomId(room._id);
    
    // Prepare images for display
    const images = room.images.map(img => ({
      preview: img.url,
      cloudinaryId: img.public_id
    }));
    
    // Set form data with room values
    if (accountType === 'hostel') {
      // Initialize default amenities structure
      const defaultAmenities = {
        wifi: false,
        ac: false,
        tv: false,
        fridge: false,
        washingMachine: false,
        hotWater: false,
        parking: false,
        security: false,
        meals: false,
        cleaning: false
      };
      
      // Ensure room.amenities exists and is an object
      const existingAmenities = room.amenities && typeof room.amenities === 'object' ? room.amenities : {};
      
      // Merge existing amenities with default structure, ensuring boolean values
      const mergedAmenities = Object.keys(defaultAmenities).reduce((acc, key) => {
        acc[key] = typeof existingAmenities[key] === 'boolean' ? existingAmenities[key] : defaultAmenities[key];
        return acc;
      }, {});
      
      setFormData({
        roomName: room.roomName || '',
        roomType: room.roomType || 'single',
        price: room.price || '',
        capacity: room.capacity || '1',
        gender: room.gender || 'any',
        amenities: mergedAmenities,
        description: room.description || '',
        address: room.address || '',
        rules: room.rules || '',
        availability: typeof room.availability === 'boolean' ? room.availability : true,
        existingImages: room.images || []
      });
    } else if (accountType === 'mess') {
      // Initialize default amenities structure
      const defaultAmenities = {
        acSeating: false,
        wifi: false,
        parking: false,
        homeDelivery: false,
        specialDiet: false
      };
      
      // Initialize default weeklyMenu structure
      const defaultMenuItem = { breakfast: '', lunch: '', dinner: '', snacks: '' };
      const defaultWeeklyMenu = {
        monday: { ...defaultMenuItem },
        tuesday: { ...defaultMenuItem },
        wednesday: { ...defaultMenuItem },
        thursday: { ...defaultMenuItem },
        friday: { ...defaultMenuItem },
        saturday: { ...defaultMenuItem },
        sunday: { ...defaultMenuItem }
      };
      
      // Ensure room.amenities exists and is an object
      const existingAmenities = room.amenities && typeof room.amenities === 'object' ? room.amenities : {};
      
      // Ensure room.weeklyMenu exists and is an object
      const existingWeeklyMenu = room.weeklyMenu && typeof room.weeklyMenu === 'object' ? room.weeklyMenu : {};
      
      // Merge existing amenities with default structure, ensuring boolean values
      const mergedAmenities = Object.keys(defaultAmenities).reduce((acc, key) => {
        acc[key] = typeof existingAmenities[key] === 'boolean' ? existingAmenities[key] : defaultAmenities[key];
        return acc;
      }, {});
      
      // Merge existing weeklyMenu with default structure
      const mergedWeeklyMenu = { ...defaultWeeklyMenu };
      Object.keys(mergedWeeklyMenu).forEach(day => {
        if (existingWeeklyMenu[day]) {
          mergedWeeklyMenu[day] = {
            ...mergedWeeklyMenu[day],
            ...existingWeeklyMenu[day]
          };
        }
      });
      
      setMessFormData({
        messName: room.messName || '',
        messType: room.messType || 'veg',
        monthlyPrice: room.monthlyPrice || '',
        dailyPrice: room.dailyPrice || '',
        capacity: room.capacity || '10',
        openingHours: room.openingHours || '',
        amenities: mergedAmenities,
        weeklyMenu: mergedWeeklyMenu,
        description: room.description || '',
        address: room.address || '',
        rules: room.rules || '',
        availability: typeof room.availability === 'boolean' ? room.availability : true,
        existingImages: room.images || []
      });
    } else if (accountType === 'gym') {
      // Initialize default equipment structure
      const defaultEquipment = {
        treadmill: false,
        crossTrainer: false,
        exerciseBike: false,
        rowingMachine: false,
        weights: false,
        benchPress: false,
        powerRack: false,
        smithMachine: false,
        cableMachine: false,
        legPress: false
      };
      
      // Initialize default facilities structure
      const defaultFacilities = {
        airConditioned: false,
        parking: false,
        wifi: false,
        changingRoom: false,
        shower: false,
        locker: false,
        personalTrainer: false,
        nutritionCounseling: false,
        supplements: false
      };
      
      // Initialize default membershipPlans structure
      const defaultMembershipPlans = [
        {
          name: 'Basic',
          duration: 'monthly',
          price: '',
          description: ''
        }
      ];
      
      // Ensure room.equipment exists and is an object
      const existingEquipment = room.equipment && typeof room.equipment === 'object' ? room.equipment : {};
      
      // Ensure room.facilities exists and is an object
      const existingFacilities = room.facilities && typeof room.facilities === 'object' ? room.facilities : {};
      
      // Merge existing equipment and facilities with default structure, ensuring boolean values
      const mergedEquipment = Object.keys(defaultEquipment).reduce((acc, key) => {
        acc[key] = typeof existingEquipment[key] === 'boolean' ? existingEquipment[key] : defaultEquipment[key];
        return acc;
      }, {});
      
      const mergedFacilities = Object.keys(defaultFacilities).reduce((acc, key) => {
        acc[key] = typeof existingFacilities[key] === 'boolean' ? existingFacilities[key] : defaultFacilities[key];
        return acc;
      }, {});
      
      // Use existing membershipPlans if available and valid, otherwise use default
      const membershipPlans = (room.membershipPlans && Array.isArray(room.membershipPlans) && room.membershipPlans.length > 0) 
        ? room.membershipPlans 
        : defaultMembershipPlans;
      
      setGymFormData({
        gymName: room.gymName || '',
        gymType: room.gymType || 'fitness',
        capacity: room.capacity || '10',
        openingHours: room.openingHours || '',
        equipment: mergedEquipment,
        facilities: mergedFacilities,
        membershipPlans: membershipPlans,
        description: room.description || '',
        address: room.address || '',
        rules: room.rules || '',
        availability: typeof room.availability === 'boolean' ? room.availability : true,
        existingImages: room.images || []
      });
    }
    
    // Set selected images
    setSelectedImages(images);
    
    // Show form
    setShowForm(true);
    
    // Scroll to top of page
    window.scrollTo(0, 0);
  };

  // Cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditMode(false);
    setCurrentRoomId(null);
    setSelectedImages([]);
    setFormData({
      roomName: '',
      roomType: 'single',
      price: '',
      capacity: '1',
      gender: 'any',
      amenities: {
        wifi: false,
        ac: false,
        tv: false,
        fridge: false,
        washingMachine: false,
        hotWater: false,
        parking: false,
        security: false,
        meals: false,
        cleaning: false
      },
      description: '',
      address: '',
      rules: '',
      availability: true
    });
    setMessFormData({
      messName: '',
      messType: 'veg',
      monthlyPrice: '',
      dailyPrice: '',
      capacity: '10',
      openingHours: '',
      amenities: {
        acSeating: false,
        wifi: false,
        parking: false,
        homeDelivery: false,
        specialDiet: false
      },
      weeklyMenu: {
        monday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
        tuesday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
        wednesday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
        thursday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
        friday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
        saturday: { breakfast: '', lunch: '', dinner: '', snacks: '' },
        sunday: { breakfast: '', lunch: '', dinner: '', snacks: '' }
      },
      description: '',
      address: '',
      rules: '',
      availability: true
    });
    setGymFormData({
      gymName: '',
      gymType: 'fitness',
      capacity: '10',
      openingHours: '',
      equipment: {
        treadmill: false,
        crossTrainer: false,
        exerciseBike: false,
        rowingMachine: false,
        weights: false,
        benchPress: false,
        powerRack: false,
        smithMachine: false,
        cableMachine: false,
        legPress: false
      },
      facilities: {
        airConditioned: false,
        parking: false,
        wifi: false,
        changingRoom: false,
        shower: false,
        locker: false,
        personalTrainer: false,
        nutritionCounseling: false,
        supplements: false
      },
      membershipPlans: [
        {
          name: 'Basic',
          duration: 'monthly',
          price: '',
          description: ''
        }
      ],
      description: '',
      address: '',
      rules: '',
      availability: true
    });
  };

  // Delete a listing
  const handleDeleteListing = async (id) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Determine endpoint based on account type
      let endpoint = '';
      switch (accountType) {
        case 'hostel':
          endpoint = `${API_URL}/hostel-rooms/${id}`;
          break;
        case 'mess':
          endpoint = `${API_URL}/mess/${id}`;
          break;
        case 'gym':
          endpoint = `${API_URL}/gym/${id}`;
          break;
        default:
          throw new Error('Invalid account type');
      }
      
      await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess(`${accountType === 'hostel' ? 'Room' : accountType === 'mess' ? 'Mess' : 'Gym'} deleted successfully`);
      
      // Refresh listings
      fetchListings();
      
      // Close the confirmation modal
      setShowDeleteConfirm(false);
      setRoomToDelete(null);
      
    } catch (error) {
      console.error('Error deleting listing:', error);
      setError(error.response?.data?.error || `Failed to delete ${accountType === 'hostel' ? 'room' : accountType === 'mess' ? 'mess' : 'gym'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render account type icon
  const renderAccountTypeIcon = () => {
    switch (accountType) {
      case 'hostel':
        return <FaBuilding className="text-blue-500 text-4xl" />;
      case 'mess':
        return <FaUtensils className="text-green-500 text-4xl" />;
      case 'gym':
        return <FaDumbbell className="text-red-500 text-4xl" />;
      default:
        return null;
    }
  };

  // Render account type title
  const renderAccountTypeTitle = () => {
    switch (accountType) {
      case 'hostel':
        return 'Hostel Management';
      case 'mess':
        return 'Mess Management';
      case 'gym':
        return 'Gym Management';
      default:
        return 'Service Management';
    }
  };

  // Render the form based on account type
  const renderForm = () => {
    if (!showForm) return null;

    switch (accountType) {
      case 'hostel':
        return renderHostelForm();
      case 'mess':
        return renderMessForm();
      case 'gym':
        return renderGymForm();
      default:
        return <div className="text-center py-10">Please select a valid account type</div>;
    }
  };

  // Render hostel form
  const renderHostelForm = () => {
    return (
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">{editMode ? 'Edit Hostel Room' : 'Add New Hostel Room'}</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        {/* Basic Information */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Room Name*
              </label>
              <input
                type="text"
                name="roomName"
                value={formData.roomName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Deluxe Single Room"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Room Type*
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="single">Single Room</option>
                <option value="double">Double Room</option>
                <option value="triple">Triple Room</option>
                <option value="dormitory">Dormitory</option>
                <option value="flat">Flat/Apartment</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Monthly Rent (₹)*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8000"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Capacity*
              </label>
              <select
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
                <option value="5+">5+ People</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Gender Preference
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="any">Any</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Availability
              </label>
              <div className="flex items-center mt-2">
                <label className="inline-flex items-center mr-4">
                  <input
                    type="radio"
                    name="availability"
                    checked={formData.availability === true}
                    onChange={() => setFormData({...formData, availability: true})}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Available</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="availability"
                    checked={formData.availability === false}
                    onChange={() => setFormData({...formData, availability: false})}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Not Available</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Amenities */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Amenities & Facilities</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.keys(formData.amenities).map((amenity) => (
              <div key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  id={amenity}
                  checked={formData.amenities[amenity]}
                  onChange={() => handleAmenityChange(amenity)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={amenity} className="ml-2 block text-sm text-gray-700 capitalize">
                  {amenity.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Photos */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Room Photos</h4>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => fileInputRef.current.click()}>
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500">Click to upload photos (max 5)</p>
            <p className="text-xs text-gray-400 mt-1">Supported formats: JPG, PNG</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
              disabled={selectedImages.length >= 5}
            />
          </div>
          
          {selectedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.preview}
                    alt={`Preview ${index}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Additional Information */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Additional Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your room, its features, and benefits..."
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Address*
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full address of the property..."
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Rules & Policies
              </label>
              <textarea
                name="rules"
                value={formData.rules}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any specific rules or policies for tenants..."
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancelForm}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Processing...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" /> {editMode ? 'Update Room' : 'Save Room'}
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

  // Render mess form
  const renderMessForm = () => {
    return (
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">{editMode ? 'Edit Mess' : 'Add New Mess'}</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        {/* Basic Information */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Mess Name*
              </label>
              <input
                type="text"
                name="messName"
                value={messFormData.messName}
                onChange={(e) => setMessFormData({...messFormData, messName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Deluxe Mess"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Mess Type*
              </label>
              <select
                name="messType"
                value={messFormData.messType}
                onChange={(e) => setMessFormData({...messFormData, messType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Monthly Price (₹)*
              </label>
              <input
                type="number"
                name="monthlyPrice"
                value={messFormData.monthlyPrice}
                onChange={(e) => setMessFormData({...messFormData, monthlyPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8000"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Daily Price (₹)*
              </label>
              <input
                type="number"
                name="dailyPrice"
                value={messFormData.dailyPrice}
                onChange={(e) => setMessFormData({...messFormData, dailyPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Capacity*
              </label>
              <select
                name="capacity"
                value={messFormData.capacity}
                onChange={(e) => setMessFormData({...messFormData, capacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="10">10 People</option>
                <option value="20">20 People</option>
                <option value="30">30 People</option>
                <option value="40">40 People</option>
                <option value="50+">50+ People</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Opening Hours
              </label>
              <input
                type="text"
                name="openingHours"
                value={messFormData.openingHours}
                onChange={(e) => setMessFormData({...messFormData, openingHours: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8am-10pm"
              />
            </div>
          </div>
        </div>
        
        {/* Amenities */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Amenities & Facilities</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.keys(messFormData.amenities).map((amenity) => (
              <div key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  id={amenity}
                  checked={messFormData.amenities[amenity]}
                  onChange={() => setMessFormData({...messFormData, amenities: {...messFormData.amenities, [amenity]: !messFormData.amenities[amenity]}})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={amenity} className="ml-2 block text-sm text-gray-700 capitalize">
                  {amenity.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Weekly Menu */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Weekly Menu</h4>
          <div className="space-y-4">
            {Object.keys(messFormData.weeklyMenu).map((day) => (
              <div key={day} className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">{day.charAt(0).toUpperCase() + day.slice(1)}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Breakfast
                    </label>
                    <input
                      type="text"
                      name={`weeklyMenu.${day}.breakfast`}
                      value={messFormData.weeklyMenu[day].breakfast}
                      onChange={(e) => setMessFormData({...messFormData, weeklyMenu: {...messFormData.weeklyMenu, [day]: {...messFormData.weeklyMenu[day], breakfast: e.target.value}}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Poha, Idli"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Lunch
                    </label>
                    <input
                      type="text"
                      name={`weeklyMenu.${day}.lunch`}
                      value={messFormData.weeklyMenu[day].lunch}
                      onChange={(e) => setMessFormData({...messFormData, weeklyMenu: {...messFormData.weeklyMenu, [day]: {...messFormData.weeklyMenu[day], lunch: e.target.value}}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Rice, Dal, Roti"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Dinner
                    </label>
                    <input
                      type="text"
                      name={`weeklyMenu.${day}.dinner`}
                      value={messFormData.weeklyMenu[day].dinner}
                      onChange={(e) => setMessFormData({...messFormData, weeklyMenu: {...messFormData.weeklyMenu, [day]: {...messFormData.weeklyMenu[day], dinner: e.target.value}}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Rice, Dal, Roti"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Snacks
                    </label>
                    <input
                      type="text"
                      name={`weeklyMenu.${day}.snacks`}
                      value={messFormData.weeklyMenu[day].snacks}
                      onChange={(e) => setMessFormData({...messFormData, weeklyMenu: {...messFormData.weeklyMenu, [day]: {...messFormData.weeklyMenu[day], snacks: e.target.value}}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Tea, Coffee"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Additional Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={messFormData.description}
                onChange={(e) => setMessFormData({...messFormData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your mess, its features, and benefits..."
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Address*
              </label>
              <textarea
                name="address"
                value={messFormData.address}
                onChange={(e) => setMessFormData({...messFormData, address: e.target.value})}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full address of the property..."
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Rules & Policies
              </label>
              <textarea
                name="rules"
                value={messFormData.rules}
                onChange={(e) => setMessFormData({...messFormData, rules: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any specific rules or policies for tenants..."
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancelForm}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Processing...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" /> {editMode ? 'Update Mess' : 'Save Mess'}
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

  // Render gym form
  const renderGymForm = () => {
    return (
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">{editMode ? 'Edit Gym' : 'Add New Gym'}</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        {/* Basic Information */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Gym Name*
              </label>
              <input
                type="text"
                name="gymName"
                value={gymFormData.gymName}
                onChange={(e) => setGymFormData({...gymFormData, gymName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Deluxe Gym"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Gym Type*
              </label>
              <select
                name="gymType"
                value={gymFormData.gymType}
                onChange={(e) => setGymFormData({...gymFormData, gymType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="fitness">Fitness</option>
                <option value="weightlifting">Weightlifting</option>
                <option value="yoga">Yoga</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Capacity*
              </label>
              <select
                name="capacity"
                value={gymFormData.capacity}
                onChange={(e) => setGymFormData({...gymFormData, capacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="10">10 People</option>
                <option value="20">20 People</option>
                <option value="30">30 People</option>
                <option value="40">40 People</option>
                <option value="50+">50+ People</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Opening Hours
              </label>
              <input
                type="text"
                name="openingHours"
                value={gymFormData.openingHours}
                onChange={(e) => setGymFormData({...gymFormData, openingHours: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8am-10pm"
              />
            </div>
          </div>
        </div>
        
        {/* Equipment */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Equipment & Facilities</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.keys(gymFormData.equipment).map((equipment) => (
              <div key={equipment} className="flex items-center">
                <input
                  type="checkbox"
                  id={equipment}
                  checked={gymFormData.equipment[equipment]}
                  onChange={() => setGymFormData({...gymFormData, equipment: {...gymFormData.equipment, [equipment]: !gymFormData.equipment[equipment]}})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={equipment} className="ml-2 block text-sm text-gray-700 capitalize">
                  {equipment.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Facilities */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Facilities</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.keys(gymFormData.facilities).map((facility) => (
              <div key={facility} className="flex items-center">
                <input
                  type="checkbox"
                  id={facility}
                  checked={gymFormData.facilities[facility]}
                  onChange={() => setGymFormData({...gymFormData, facilities: {...gymFormData.facilities, [facility]: !gymFormData.facilities[facility]}})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={facility} className="ml-2 block text-sm text-gray-700 capitalize">
                  {facility.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Membership Plans */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Membership Plans</h4>
          <div className="space-y-4">
            {gymFormData.membershipPlans.map((plan, index) => (
              <div key={index} className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Plan {index + 1}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      name={`membershipPlans.${index}.name`}
                      value={plan.name}
                      onChange={(e) => setGymFormData({...gymFormData, membershipPlans: [...gymFormData.membershipPlans.slice(0, index), {...plan, name: e.target.value}, ...gymFormData.membershipPlans.slice(index + 1)]})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Basic"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Duration
                    </label>
                    <select
                      name={`membershipPlans.${index}.duration`}
                      value={plan.duration}
                      onChange={(e) => setGymFormData({...gymFormData, membershipPlans: [...gymFormData.membershipPlans.slice(0, index), {...plan, duration: e.target.value}, ...gymFormData.membershipPlans.slice(index + 1)]})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="half-yearly">Half-Yearly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name={`membershipPlans.${index}.price`}
                      value={plan.price}
                      onChange={(e) => setGymFormData({...gymFormData, membershipPlans: [...gymFormData.membershipPlans.slice(0, index), {...plan, price: e.target.value}, ...gymFormData.membershipPlans.slice(index + 1)]})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 8000"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name={`membershipPlans.${index}.description`}
                      value={plan.description}
                      onChange={(e) => setGymFormData({...gymFormData, membershipPlans: [...gymFormData.membershipPlans.slice(0, index), {...plan, description: e.target.value}, ...gymFormData.membershipPlans.slice(index + 1)]})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the plan..."
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4 text-gray-700">Additional Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={gymFormData.description}
                onChange={(e) => setGymFormData({...gymFormData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your gym, its features, and benefits..."
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Address*
              </label>
              <textarea
                name="address"
                value={gymFormData.address}
                onChange={(e) => setGymFormData({...gymFormData, address: e.target.value})}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full address of the property..."
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Rules & Policies
              </label>
              <textarea
                name="rules"
                value={gymFormData.rules}
                onChange={(e) => setGymFormData({...gymFormData, rules: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any specific rules or policies for tenants..."
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancelForm}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Processing...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" /> {editMode ? 'Update Gym' : 'Save Gym'}
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

  // Render listings
  const renderListings = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Your {accountType === 'hostel' ? 'Room' : accountType === 'mess' ? 'Mess' : 'Gym'} Listings
          </h3>
          <button
            onClick={() => {
              setShowForm(true);
              setEditMode(false);
              resetForm();
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" /> Add New {accountType === 'hostel' ? 'Room' : accountType === 'mess' ? 'Mess' : 'Gym'}
          </button>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-10">
            <FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading your listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-5xl text-gray-300 mb-4">
              {accountType === 'hostel' ? (
                <FaBuilding className="mx-auto" />
              ) : accountType === 'mess' ? (
                <FaUtensils className="mx-auto" />
              ) : (
                <FaDumbbell className="mx-auto" />
              )}
            </div>
            <h4 className="text-xl font-medium text-gray-600 mb-2">No listings yet</h4>
            <p className="text-gray-500 mb-6">
              You haven't added any {accountType === 'hostel' ? 'rooms' : accountType === 'mess' ? 'mess' : 'gym'} listings yet. Click the button above to add your first listing.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {accountType === 'hostel' ? 'Room' : accountType === 'mess' ? 'Mess' : 'Gym'} Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {accountType === 'hostel' ? 'Type' : accountType === 'mess' ? 'Type' : 'Type'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {accountType === 'hostel' ? 'Price' : accountType === 'mess' ? 'Monthly Price' : 'Plans'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listings.map((room) => (
                    <tr key={room._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {room.images && room.images.length > 0 ? (
                              <img 
                                className="h-10 w-10 rounded-md object-cover" 
                                src={room.images[0].url} 
                                alt={accountType === 'hostel' ? room.roomName : accountType === 'mess' ? room.messName : room.gymName} 
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                {accountType === 'hostel' ? (
                                  <FaBuilding className="text-gray-400" />
                                ) : accountType === 'mess' ? (
                                  <FaUtensils className="text-gray-400" />
                                ) : (
                                  <FaDumbbell className="text-gray-400" />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {accountType === 'hostel' ? room.roomName : accountType === 'mess' ? room.messName : room.gymName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {room.address ? (
                                room.address.length > 30 
                                  ? `${room.address.substring(0, 30)}...` 
                                  : room.address
                              ) : 'No address provided'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {accountType === 'hostel' ? room.roomType : accountType === 'mess' ? room.messType : room.gymType}
                        </div>
                        <div className="text-sm text-gray-500">
                          {accountType === 'hostel' ? `${room.capacity} People` : accountType === 'mess' ? `${room.capacity} People` : `${room.capacity} People`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {accountType === 'hostel' ? (
                          <div className="text-sm text-gray-900">₹{room.price}/month</div>
                        ) : accountType === 'mess' ? (
                          <div>
                            <div className="text-sm text-gray-900">₹{room.monthlyPrice}/month</div>
                            <div className="text-sm text-gray-500">₹{room.dailyPrice}/day</div>
                          </div>
                        ) : (
                          <div>
                            {room.membershipPlans && room.membershipPlans.length > 0 ? (
                              <div className="text-sm text-gray-900">
                                {room.membershipPlans.length} plan{room.membershipPlans.length !== 1 ? 's' : ''}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">No plans</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${room.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {room.availability ? 'Available' : 'Not Available'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditRoom(room)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <FaEdit className="inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setRoomToDelete(room);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Delete confirmation modal
  const renderDeleteConfirmModal = () => {
    if (!showDeleteConfirm || !roomToDelete) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 md:w-1/2 max-w-md animate-fade-in-down">
          <div className="flex items-center mb-4 text-red-600">
            <FaTrash className="text-xl mr-2" />
            <h3 className="text-lg font-semibold">Delete {accountType === 'hostel' ? 'Room' : accountType === 'mess' ? 'Mess' : 'Gym'}</h3>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">Are you sure you want to delete this {accountType === 'hostel' ? 'room' : accountType === 'mess' ? 'mess' : 'gym'}? This action cannot be undone.</p>
            
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <div className="flex items-center">
                {roomToDelete.images && roomToDelete.images.length > 0 ? (
                  <img 
                    src={roomToDelete.images[0].url} 
                    alt={accountType === 'hostel' ? roomToDelete.roomName : roomToDelete.messName} 
                    className="h-16 w-16 object-cover rounded-md mr-3"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                    {accountType === 'hostel' ? (
                      <FaBuilding className="text-gray-400" />
                    ) : accountType === 'mess' ? (
                      <FaUtensils className="text-gray-400" />
                    ) : (
                      <FaDumbbell className="text-gray-400" />
                    )}
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-800">
                    {accountType === 'hostel' ? roomToDelete.roomName : accountType === 'mess' ? roomToDelete.messName : roomToDelete.name}
                  </h4>
                  <p className="text-sm text-gray-500 capitalize">
                    {accountType === 'hostel' 
                      ? `${roomToDelete.roomType} • ₹${roomToDelete.price}/month` 
                      : accountType === 'mess' 
                        ? `${roomToDelete.messType} • ₹${roomToDelete.monthlyPrice}/month` 
                        : `${roomToDelete.type} • ₹${roomToDelete.price}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirm(false);
                setRoomToDelete(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDeleteListing(roomToDelete._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="mr-2" /> Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        {renderAccountTypeIcon()}
        <h1 className="text-2xl font-bold text-blue-600 ml-3">{renderAccountTypeTitle()}</h1>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'listings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Your Listings
          </button>
        </nav>
      </div>
      
      {/* Content based on active tab */}
      <div>
        {activeTab === 'listings' && !showForm && renderListings()}
        {activeTab === 'listings' && showForm && renderForm()}
      </div>
      {renderDeleteConfirmModal()}
    </div>
  );
}