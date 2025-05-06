import React, { useState, useEffect } from 'react';
import { 
  FaSpinner, FaRupeeSign, FaChartLine, FaCalendarAlt, 
  FaBuilding, FaUserFriends, 
  FaMoneyBillWave, FaExclamationCircle
} from 'react-icons/fa';
import { getRevenueStats } from '../../utils/api';

// Try to import recharts components, but provide fallbacks if not available
let BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer;
try {
  const recharts = require('recharts');
  BarChart = recharts.BarChart;
  Bar = recharts.Bar;
  XAxis = recharts.XAxis;
  YAxis = recharts.YAxis;
  CartesianGrid = recharts.CartesianGrid;
  Tooltip = recharts.Tooltip;
  Legend = recharts.Legend;
  ResponsiveContainer = recharts.ResponsiveContainer;
} catch (error) {
  console.warn('Recharts not available. Charts will be disabled.');
}

export default function Revenew() {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const data = await getRevenueStats();
        
        // Filter data to include only hostel revenue
        const filteredData = {
          ...data,
          totalRevenue: data.serviceTypeRevenue.hostel || 0,
          paidBookingsCount: data.recentTransactions.filter(t => t.serviceType === 'hostel').length,
          recentTransactions: data.recentTransactions.filter(t => t.serviceType === 'hostel')
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

    fetchRevenueData();
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

  // Determine if charts are available
  const chartsAvailable = typeof BarChart !== 'undefined';

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
        <span>No revenue data available. You may not have any paid hostel bookings yet.</span>
      </div>
    );
  }

  // Filter monthly data to only include hostel revenue
  const hostelMonthlyData = revenueData.monthlyData.map(item => {
    // For demonstration, we'll use a simplified approach - in a real app,
    // you'd want to filter the raw data to get actual hostel monthly revenue
    return {
      ...item,
      revenue: item.revenue * (revenueData.serviceTypeRevenue.hostel / revenueData.totalRevenue || 0)
    };
  });

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
                {formatCurrency(revenueData.serviceTypeRevenue.hostel || 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaMoneyBillWave className="text-blue-500 text-2xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Based on all paid hostel bookings</p>
          </div>
        </div>

        {/* Total Bookings Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Paid Bookings</p>
              <p className="text-2xl font-bold text-gray-800">
                {revenueData.paidBookingsCount}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaUserFriends className="text-green-500 text-2xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Total number of paid hostel bookings</p>
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
                  ? formatCurrency((revenueData.serviceTypeRevenue.hostel || 0) / revenueData.paidBookingsCount) 
                  : '0'}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaChartLine className="text-purple-500 text-2xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Average revenue per hostel booking</p>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Hostel Revenue Trend</h3>
        
        {chartsAvailable ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hostelMonthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${formatCurrency(value)}`, 'Revenue']} />
                <Legend />
                <Bar 
                  dataKey="revenue" 
                  name="Hostel Revenue" 
                  fill="#0088FE" 
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hostel Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hostelMonthlyData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Hostel Transactions</h3>
        </div>
        
        {revenueData.recentTransactions && revenueData.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hostel Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{transaction.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                          {transaction.student?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.student?.username || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.student?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2">
                          <FaBuilding className="text-blue-500" />
                        </div>
                        <div className="text-sm text-gray-900">
                          {transaction.serviceName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <FaExclamationCircle className="mx-auto text-gray-400 text-3xl mb-2" />
            <p>No hostel transaction data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
