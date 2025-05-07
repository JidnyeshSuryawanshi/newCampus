import React, { useState, useEffect } from 'react';
import { 
  FaSpinner, FaRupeeSign, FaChartLine, FaCalendarAlt, 
  FaBuilding, FaUserFriends, FaUtensils, FaDumbbell,
  FaMoneyBillWave, FaExclamationCircle, FaTable
} from 'react-icons/fa';
import { getRevenueStats, fetchUserProfile } from '../../utils/api';
import { toast } from 'react-toastify';

// Direct import of recharts components
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Revenew() {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [userType, setUserType] = useState([]);
  const [chartsAvailable, setChartsAvailable] = useState(true);
  const [serviceType, setServiceType] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    const fetchUserAndRevenueData = async () => {
      try {
        setLoading(true);
        
        // First get the user profile to determine owner type
        const userProfile = await fetchUserProfile();
        const userTypeFromProfile = userProfile?.userType || [];
        setUserType(userTypeFromProfile);
        
        // Determine the service type based on user type
        const isMessOwner = userTypeFromProfile.includes('messOwner');
        const isGymOwner = userTypeFromProfile.includes('gymOwner');
        const ownerServiceType = isMessOwner ? 'mess' : isGymOwner ? 'gym' : 'hostel';
        setServiceType(ownerServiceType);
        
        // Now fetch revenue data
        const data = await getRevenueStats();
        console.log("Raw revenue data:", data);
        
        if (!data) {
          throw new Error('No revenue data received from server');
        }
        
        // Filter bookings based on owner type
        const relevantBookings = data.allBookings ? 
          data.allBookings.filter(booking => booking.serviceType === ownerServiceType) : 
          [];
        
        console.log(`Filtered ${ownerServiceType} bookings:`, relevantBookings);
        setFilteredBookings(relevantBookings);
        
        // Filter data to include only relevant service type revenue
        const filteredData = {
          ...data,
          totalRevenue: data.serviceTypeRevenue[ownerServiceType] || 0,
          paidBookingsCount: relevantBookings.length,
          recentTransactions: data.recentTransactions.filter(t => t.serviceType === ownerServiceType)
        };
        
        setRevenueData(filteredData);
        console.log(`${ownerServiceType} revenue data:`, filteredData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError('Failed to load revenue data. Please try again later.');
        
        // Auto-retry up to 3 times if there's an error
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000); // Retry after 3 seconds
        }
      } finally {
        setLoading(false);
      }
    };

    console.log(revenueData);

    // Verify that recharts is available
    try {
      if (typeof BarChart !== 'undefined') {
        setChartsAvailable(true);
      }
    } catch (error) {
      setChartsAvailable(false);
      console.error('Error checking for recharts:', error);
    }

    fetchUserAndRevenueData();
  }, [retryCount]); // Add retryCount as a dependency to trigger retries

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Determine service type for display
  const isMessOwner = userType.includes('messOwner');
  const isGymOwner = userType.includes('gymOwner');
  
  // Set the service type label and display names
  const serviceTypeLabel = isMessOwner ? 'mess' : isGymOwner ? 'gym' : 'hostel';
  const serviceTypeDisplayName = isMessOwner ? 'Mess' : isGymOwner ? 'Gym' : 'Hostel';
  
  // Set the booking type label
  const subscriptionLabel = isMessOwner ? 'Subscription' : isGymOwner ? 'Membership' : 'Booking';
  
  // Generate monthly revenue data for the service type
  const getMonthlyRevenueData = () => {
    if (!revenueData || !revenueData.monthlyData) {
      return [];
    }
    
    // If we have filtered bookings, calculate service-specific monthly revenue
    if (filteredBookings.length > 0) {
      // Create a map of month-year to revenue
      const monthMap = {};
      
      // Initialize monthly data for the last 6 months
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      for (let i = 0; i < 6; i++) {
        const month = new Date(currentYear, currentMonth - i, 1);
        const monthYear = `${month.getFullYear()}-${month.getMonth() + 1}`;
        const monthName = month.toLocaleString('default', { month: 'short' });
        const formattedMonth = `${monthName} ${month.getFullYear()}`;
        monthMap[monthYear] = {
          month: formattedMonth,
          revenue: 0
        };
      }
      
      // Sum up revenue by month from filtered bookings
      filteredBookings.forEach(booking => {
        if (!booking.date) return;
        
        const bookingDate = new Date(booking.date);
        const monthYear = `${bookingDate.getFullYear()}-${bookingDate.getMonth() + 1}`;
        
        if (monthMap[monthYear]) {
          monthMap[monthYear].revenue += booking.amount || 0;
        }
      });
      
      // Convert the map to an array and sort by date
      return Object.values(monthMap).sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA - dateB;
      });
    }
    
    // Apply date filter to monthly data if needed
    if (dateFilter !== 'all' && revenueData.monthlyData) {
      const filtered = [...revenueData.monthlyData];
      
      if (dateFilter === 'month') {
        // Only show the current month
        return filtered.slice(-1);
      } else if (dateFilter === 'quarter') {
        // Only show the last 3 months
        return filtered.slice(-3);
      } else if (dateFilter === 'halfyear') {
        // Show last 6 months
        return filtered;
      }
    }
    
    return revenueData.monthlyData;
  };

  // Function to handle manual price update for a booking
  const handlePriceUpdate = (bookingId) => {
    if (!editPrice || isNaN(parseFloat(editPrice)) || parseFloat(editPrice) <= 0) {
      toast.error('Please enter a valid price greater than 0');
      return;
    }

    const price = parseFloat(editPrice);
    
    // Find the booking to update
    const bookingToUpdate = filteredBookings.find(b => b.id === bookingId);
    if (!bookingToUpdate) {
      toast.error('Booking not found');
      return;
    }
    
    // Calculate new amount based on duration
    const newAmount = price * bookingToUpdate.duration;
    
    // Update the booking in the local state
    const updatedBookings = filteredBookings.map(booking => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          monthlyPrice: price,
          amount: newAmount
        };
      }
      return booking;
    });
    
    setFilteredBookings(updatedBookings);
    
    // Recalculate totals
    const totalRevenue = updatedBookings.reduce((total, booking) => total + (booking.amount || 0), 0);
    
    // Update the revenue data
    setRevenueData({
      ...revenueData,
      totalRevenue,
      serviceTypeRevenue: {
        ...revenueData.serviceTypeRevenue,
        [serviceTypeLabel]: totalRevenue
      }
    });
    
    // Reset editing state
    setEditingBookingId(null);
    setEditPrice('');
    
    toast.success('Price updated successfully');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow p-8">
        <FaSpinner className="animate-spin text-green-600 text-4xl mb-4" />
        <p className="text-gray-700 font-medium">Loading revenue data...</p>
        <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
        
        <button 
          onClick={() => setRetryCount(prev => prev + 1)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Retry Loading
        </button>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Possible reasons for this error:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Network connection issues</li>
            <li>Server may be temporarily unavailable</li>
            <li>You may not have any booking data yet</li>
          </ul>
        </div>
      </div>
    );
  }

  // If no revenue data, show empty state with sample cards
  if (!revenueData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Revenue Management</h2>
          
          <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-200">
            <FaCalendarAlt className="ml-3 text-gray-500" />
            <select
              className="py-2 px-4 rounded-md focus:outline-none text-gray-700 bg-transparent"
            >
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaRupeeSign className="text-lg text-blue-500 mr-1" />0
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                {isGymOwner ? <FaDumbbell className="text-blue-500 text-2xl" /> : 
                 isMessOwner ? <FaUtensils className="text-blue-500 text-2xl" /> :
                 <FaBuilding className="text-blue-500 text-2xl" />}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Based on all paid {serviceTypeLabel} {subscriptionLabel.toLowerCase()}s</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Paid {subscriptionLabel}s</p>
                <p className="text-2xl font-bold text-gray-800">0</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaUserFriends className="text-green-500 text-2xl" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Total number of paid {serviceTypeLabel} {subscriptionLabel.toLowerCase()}s</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Average Revenue</p>
                <p className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaRupeeSign className="text-lg text-purple-500 mr-1" />0
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaChartLine className="text-purple-500 text-2xl" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Average revenue per {serviceTypeLabel} {subscriptionLabel.toLowerCase()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <FaExclamationCircle className="inline mr-2" />
          <span>No revenue data available. You may not have any paid {serviceTypeLabel} {subscriptionLabel.toLowerCase()}s yet.</span>
        </div>
      </div>
    );
  }

  // Get the monthly revenue data
  const monthlyRevenueData = getMonthlyRevenueData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">{serviceTypeDisplayName} Revenue Management</h2>
        
        {/* Date filter */}
        <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-200">
          <FaCalendarAlt className="ml-3 text-gray-500" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="py-2 px-4 rounded-md focus:outline-none text-gray-700 bg-transparent"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="halfyear">Last 6 Months</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 flex items-center">
                <FaRupeeSign className="text-lg text-blue-500 mr-1" />
                {formatCurrency(revenueData.serviceTypeRevenue[serviceTypeLabel] || 0).replace('₹', '')}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              {isGymOwner ? <FaDumbbell className="text-blue-500 text-2xl" /> : 
               isMessOwner ? <FaUtensils className="text-blue-500 text-2xl" /> :
               <FaBuilding className="text-blue-500 text-2xl" />}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Based on all paid {serviceTypeLabel} {subscriptionLabel.toLowerCase()}s</p>
          </div>
        </div>

        {/* Total Bookings Card */}
        <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Paid {subscriptionLabel}s</p>
              <p className="text-2xl font-bold text-gray-800">
                {filteredBookings.length || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaUserFriends className="text-green-500 text-2xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Total number of paid {serviceTypeLabel} {subscriptionLabel.toLowerCase()}s</p>
          </div>
        </div>

        {/* Average Revenue */}
        <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Average Revenue</p>
              <p className="text-2xl font-bold text-gray-800 flex items-center">
                <FaRupeeSign className="text-lg text-purple-500 mr-1" />
                {filteredBookings.length > 0 
                  ? formatCurrency((revenueData.serviceTypeRevenue[serviceTypeLabel] || 0) / filteredBookings.length).replace('₹', '')
                  : '0'}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaChartLine className="text-purple-500 text-2xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Average revenue per {serviceTypeLabel} {subscriptionLabel.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Overall Booking Revenue Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Overall Revenue per {subscriptionLabel}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {isGymOwner 
              ? 'Displays total revenue calculated as monthly price × number of months' 
              : `Displays total revenue calculated as monthly price × duration for each ${subscriptionLabel.toLowerCase()}`}
          </p>
        </div>
        
        {filteredBookings && filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {subscriptionLabel} ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isMessOwner ? 'Mess Details' : isGymOwner ? 'Gym Details' : 'Room Details'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isGymOwner ? 'Plan Price' : 'Monthly Price'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isGymOwner ? 'Plan Duration' : 'Duration'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {booking.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                          {booking.student?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.student?.username || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.student?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.serviceName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{booking.monthlyPrice?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {booking.originalDuration || `${booking.duration} ${booking.duration === 1 ? 'month' : 'months'}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">
                      {editingBookingId === booking.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                            placeholder="Price"
                            min="1"
                          />
                          <button
                            onClick={() => handlePriceUpdate(booking.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingBookingId(null);
                              setEditPrice('');
                            }}
                            className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center justify-end space-x-2">
                            ₹{booking.amount?.toLocaleString('en-IN') || 0}
                            {booking.amount === 0 && (
                              <button
                                onClick={() => {
                                  setEditingBookingId(booking.id);
                                  setEditPrice('');
                                }}
                                className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                              >
                                Set Price
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {booking.monthlyPrice} × {booking.duration} {booking.duration === 1 ? 'month' : 'months'}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              {isGymOwner ? <FaDumbbell size={20} /> : isMessOwner ? <FaUtensils size={20} /> : <FaBuilding size={20} />}
            </div>
            <h3 className="text-lg font-medium text-gray-900">No {serviceTypeLabel} {subscriptionLabel.toLowerCase()}s data available</h3>
            <p className="mt-2 text-sm text-gray-500">
              When you receive payments for your {serviceTypeLabel} {subscriptionLabel.toLowerCase()}s, they will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Monthly Revenue Trend */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Monthly {serviceTypeDisplayName} Revenue Trend</h3>
          <p className="text-sm text-gray-500 mt-1">
            Visualizing the revenue patterns over the past months
          </p>
        </div>
        
        {chartsAvailable && monthlyRevenueData && monthlyRevenueData.length > 0 ? (
          <div className="p-6" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={monthlyRevenueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#4B5563' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fill: '#4B5563' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    border: '1px solid #E5E7EB'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                <Bar 
                  dataKey="revenue" 
                  name={`${serviceTypeDisplayName} Revenue`} 
                  fill={isGymOwner ? "#4F46E5" : isMessOwner ? "#22c55e" : "#f59e0b"} 
                  animationDuration={1500}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <FaChartLine size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No monthly revenue data available</h3>
            <p className="mt-2 text-sm text-gray-500">
              Monthly revenue data will appear here once payments are recorded.
            </p>
          </div>
        )}
      </div>
      
      {/* Monthly Revenue Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Monthly {serviceTypeDisplayName} Revenue</h3>
        </div>
        {monthlyRevenueData && monthlyRevenueData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {serviceTypeDisplayName} Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyRevenueData.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ₹{data.revenue?.toLocaleString('en-IN') || 0}
                    </td>
                  </tr>
                ))}
                {/* Add a total row */}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">
                    ₹{monthlyRevenueData.reduce((total, data) => total + (data.revenue || 0), 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <FaTable size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No monthly revenue data available</h3>
            <p className="mt-2 text-sm text-gray-500">
              Monthly revenue data will appear here once payments are recorded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
