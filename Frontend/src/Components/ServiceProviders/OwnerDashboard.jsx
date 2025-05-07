import React, { useState, useEffect } from 'react';
import Stats from '../dashboard/Stats';
import ActivityList from '../dashboard/ActivityList';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaUtensils, FaBuilding } from 'react-icons/fa';
import { getRevenueStats, getBookings, fetchUserProfile } from '../../utils/api';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [userType, setUserType] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get user profile to determine owner type
        const userProfile = await fetchUserProfile();
        const userTypeFromProfile = userProfile?.userType || [];
        setUserType(userTypeFromProfile);
        
        const isMessOwner = userTypeFromProfile.includes('messOwner');
        const serviceType = isMessOwner ? 'mess' : 'hostel';
        const serviceLabel = isMessOwner ? 'Mess' : 'Hostel';
        const subscriptionLabel = isMessOwner ? 'Subscribers' : 'Customers';
        
        // Fetch revenue data
        const revenueData = await getRevenueStats();
        
        // Fetch pending bookings
        const pendingBookings = await getBookings('pending');
        
        // Filter pending bookings by service type
        const relevantPendingBookings = pendingBookings.filter(
          booking => booking.serviceType === serviceType
        );
        
        // Get service-specific revenue
        const totalServiceRevenue = revenueData.serviceTypeRevenue[serviceType] || 0;
        const relevantTransactions = revenueData.recentTransactions.filter(
          t => t.serviceType === serviceType
        );
        
        // Set stats data
        setStatsData([
          {
            title: "Total Revenue",
            value: totalServiceRevenue.toLocaleString('en-IN'),
            prefix: "₹",
            colorClass: "text-blue-600",
            icon: isMessOwner ? <FaUtensils /> : <FaBuilding />
          },
          {
            title: `Active ${subscriptionLabel}`,
            value: relevantTransactions.length.toString(),
            colorClass: "text-blue-600"
          },
          {
            title: `Pending ${isMessOwner ? 'Subscriptions' : 'Bookings'}`,
            value: relevantPendingBookings.length.toString(),
            colorClass: "text-blue-600"
          }
        ]);
        
        // Format recent bookings from recent transactions
        const formattedBookings = relevantTransactions.map(transaction => {
          // Format date in a more readable way
          const bookingDate = new Date(transaction.date);
          const formattedDate = bookingDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          
          // Generate description with service name and duration
          let description = transaction.serviceName;
          if (transaction.duration) {
            const durationText = transaction.originalDuration && 
                                transaction.originalDuration.toString().toLowerCase().includes('year') 
                                ? transaction.originalDuration 
                                : `${transaction.duration} ${transaction.duration === 1 ? 'month' : 'months'}`;
            description += ` · ${durationText}`;
          }
          
          return {
            title: transaction.student?.username || 'Unknown User',
            subtitle: transaction.student?.email || '',
            time: `Booked on ${formattedDate}`,
            status: "Active",
            statusColor: "bg-green-100 text-green-800",
            description: description,
            value: `₹${transaction.amount.toLocaleString('en-IN')}`,
            valueCaption: `${transaction.monthlyPrice.toLocaleString('en-IN')}/month`
          };
        });
        
        setRecentBookings(formattedBookings);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const isMessOwner = userType.includes('messOwner');
  const serviceLabel = isMessOwner ? 'Mess' : 'Hostel';
  const bookingLabel = isMessOwner ? 'Subscriptions' : 'Bookings';

  const quickActions = [
    {
      title: "Manage Revenue",
      colorClass: "bg-blue-600 hover:bg-blue-700",
      path: "/owner-dashboard/revenew"
    },
    {
      title: `View ${bookingLabel}`,
      colorClass: "bg-green-600 hover:bg-green-700",
      path: "/owner-dashboard/bookings"
    },
    {
      title: `Manage ${serviceLabel} Services`,
      colorClass: "bg-purple-600 hover:bg-purple-700",
      path: "/owner-dashboard/services"
    }
  ];

  const handleQuickAction = (path) => {
    navigate(path);
  };

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

  return (
    <div>
      <Stats items={statsData} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2">
          <ActivityList 
            title={`Recent ${bookingLabel}`} 
            activities={recentBookings} 
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`w-full text-white px-4 py-2 rounded ${action.colorClass}`}
                onClick={() => handleQuickAction(action.path)}
              >
                {action.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}