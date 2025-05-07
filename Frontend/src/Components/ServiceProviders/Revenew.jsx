import React, { useState, useEffect } from 'react';
import { 
  FaSpinner, FaRupeeSign, FaChartLine, FaCalendarAlt, 
  FaBuilding, FaUserFriends, FaUtensils,
  FaMoneyBillWave, FaExclamationCircle
} from 'react-icons/fa';
import { getRevenueStats, fetchUserProfile } from '../../utils/api';

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
  const [userType, setUserType] = useState('');
  const [chartsAvailable, setChartsAvailable] = useState(true);

  useEffect(() => {
    const fetchUserAndRevenueData = async () => {
      try {
        setLoading(true);
        
        // First get the user profile to determine owner type
        const userProfile = await fetchUserProfile();
        const userTypeFromProfile = userProfile?.userType || [];
        setUserType(userTypeFromProfile);
        
        const isMessOwner = userTypeFromProfile.includes('messOwner');
        const serviceType = isMessOwner ? 'mess' : 'hostel';
        
        // Now fetch revenue data
        const data = await getRevenueStats();
        
        // Filter bookings based on owner type
        const relevantBookings = data.allBookings ? 
          data.allBookings.filter(booking => booking.serviceType === serviceType) : 
          [];
        
        setFilteredBookings(relevantBookings);
        
        // Filter data to include only relevant service type revenue
        const filteredData = {
          ...data,
          totalRevenue: data.serviceTypeRevenue[serviceType] || 0,
          paidBookingsCount: data.recentTransactions.filter(t => t.serviceType === serviceType).length,
          recentTransactions: data.recentTransactions.filter(t => t.serviceType === serviceType)
        };
        
        setRevenueData(filteredData);
        setError(null);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError('Failed to load revenue data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Verify that recharts is available
    try {
      if (typeof BarChart === 'undefined') {
        setChartsAvailable(false);
        console.warn('Recharts components not available.');
      }
    } catch (error) {
      setChartsAvailable(false);
      console.error('Error checking for recharts:', error);
    }

    fetchUserAndRevenueData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Determine service type for display
  const isMessOwner = userType.includes('messOwner');
  const serviceTypeLabel = isMessOwner ? 'mess' : 'hostel';
  const serviceTypeDisplayName = isMessOwner ? 'Mess' : 'Hostel';
  const subscriptionLabel = isMessOwner ? 'Subscription' : 'Booking';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        <FaExclamationCircle className="inline mr-2" />
        <span>No revenue data available. You may not have any paid {serviceTypeLabel} {subscriptionLabel.toLowerCase()}s yet.</span>
      </div>
    );
  }

  // Filter monthly data to only include relevant service type revenue
  const serviceMonthlyData = revenueData.monthlyData.map(item => {
    // For demonstration, we'll use a simplified approach - in a real app,
    // you'd want to filter the raw data to get actual monthly revenue by service
    return {
      ...item,
      revenue: item.revenue * (revenueData.serviceTypeRevenue[serviceTypeLabel] / revenueData.totalRevenue || 0)
    };
  });

  // Add a fallback table component when charts aren't available
  const RevenueTableFallback = ({ data, formatCurrency, serviceTypeDisplayName }) => {
    return (
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
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                  {formatCurrency(item.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Revenue Management</h2>
        
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 flex items-center">
                <FaRupeeSign className="text-lg text-blue-500 mr-1" />
                {formatCurrency(revenueData.serviceTypeRevenue[serviceTypeLabel] || 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              {isMessOwner ? 
                <FaUtensils className="text-blue-500 text-2xl" /> : 
                <FaMoneyBillWave className="text-blue-500 text-2xl" />
              }
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Based on all paid {serviceTypeLabel} {subscriptionLabel.toLowerCase()}s</p>
          </div>
        </div>

        {/* Total Bookings Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Paid {subscriptionLabel}s</p>
              <p className="text-2xl font-bold text-gray-800">
                {revenueData.paidBookingsCount}
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Average Revenue</p>
              <p className="text-2xl font-bold text-gray-800 flex items-center">
                <FaRupeeSign className="text-lg text-purple-500 mr-1" />
                {revenueData.paidBookingsCount > 0 
                  ? formatCurrency((revenueData.serviceTypeRevenue[serviceTypeLabel] || 0) / revenueData.paidBookingsCount) 
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
            Displays total revenue calculated as monthly price × duration for each {subscriptionLabel.toLowerCase()}
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
                    {isMessOwner ? 'Mess Details' : 'Room Details'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Price
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{booking.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                          {booking.student?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.student?.username || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.student?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.serviceName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{booking.monthlyPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {booking.originalDuration || `${booking.duration} ${booking.duration === 1 ? 'month' : 'months'}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">
                      ₹{booking.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              {isMessOwner ? <FaUtensils size={20} /> : <FaBuilding size={20} />}
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
        </div>
        
        {serviceMonthlyData && serviceMonthlyData.some(d => d.revenue > 0) ? (
          // Check if charts are available, show chart if available, otherwise show table fallback
          chartsAvailable ? (
            <div className="p-6" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={serviceMonthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    name={`${serviceTypeDisplayName} Revenue`} 
                    fill={isMessOwner ? "#22c55e" : "#4F46E5"} 
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-4 bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
                <FaExclamationCircle className="inline mr-2" />
                Chart visualization is not available. Displaying data in table format.
              </div>
              <RevenueTableFallback 
                data={serviceMonthlyData} 
                formatCurrency={formatCurrency} 
                serviceTypeDisplayName={serviceTypeDisplayName} 
              />
            </div>
          )
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <FaChartLine size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No monthly revenue data available</h3>
            <p className="mt-2 text-sm text-gray-500">
              Monthly revenue data will be displayed here once you have payments in different months.
            </p>
          </div>
        )}
      </div>

      {/* Monthly Detailed Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Monthly {serviceTypeDisplayName} Revenue</h3>
        </div>
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
              {serviceMonthlyData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ₹{data.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
