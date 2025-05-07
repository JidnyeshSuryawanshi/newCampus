import React, { useState, useEffect } from 'react';
import Stats from '../dashboard/Stats';
import ActivityList from '../dashboard/ActivityList';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaUtensils, FaBuilding, FaDumbbell, FaExclamationCircle } from 'react-icons/fa';
import { getRevenueStats, getBookings, fetchUserProfile, getAcceptedBookings } from '../../utils/api';

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
        const isGymOwner = userTypeFromProfile.includes('gymOwner');
        const serviceType = isMessOwner ? 'mess' : isGymOwner ? 'gym' : 'hostel';
        const serviceLabel = isMessOwner ? 'Mess' : isGymOwner ? 'Gym' : 'Hostel';
        const subscriptionLabel = isMessOwner ? 'Subscribers' : isGymOwner ? 'Members' : 'Customers';
        
        // Fetch revenue data
        const revenueData = await getRevenueStats();
        console.log("Revenue data for dashboard:", revenueData);
        
        // Fetch pending bookings
        const pendingBookings = await getBookings('pending');
        console.log("Pending bookings:", pendingBookings);
        
        // Fetch accepted bookings to count active customers
        const acceptedBookings = await getAcceptedBookings();
        console.log("Accepted bookings:", acceptedBookings);
        
        // Filter pending bookings by service type
        const relevantPendingBookings = pendingBookings.filter(
          booking => booking.serviceType === serviceType
        );
        
        // Filter accepted bookings by service type for active customers count
        const relevantAcceptedBookings = acceptedBookings.filter(
          booking => booking.serviceType === serviceType && booking.paymentStatus === 'paid'
        );
        
        // Get service-specific revenue
        const totalServiceRevenue = revenueData.serviceTypeRevenue[serviceType] || 0;
        
        // Get relevant transactions directly from allBookings that match the service type
        const relevantTransactions = revenueData.allBookings 
          ? revenueData.allBookings.filter(booking => booking.serviceType === serviceType)
          : [];
            
        console.log(`${serviceType} transactions:`, relevantTransactions);
        
        // Set stats data
        setStatsData([
          {
            title: "Total Revenue",
            value: totalServiceRevenue.toLocaleString('en-IN'),
            prefix: "₹",
            colorClass: "text-blue-600",
            icon: isMessOwner ? <FaUtensils /> : isGymOwner ? <FaDumbbell /> : <FaBuilding />
          },
          {
            title: `Active ${subscriptionLabel}`,
            value: relevantAcceptedBookings.length.toString(),
            colorClass: "text-green-600"
          },
          {
            title: `Pending ${isMessOwner ? 'Subscriptions' : isGymOwner ? 'Memberships' : 'Bookings'}`,
            value: relevantPendingBookings.length.toString(),
            colorClass: "text-yellow-600"
          }
        ]);
        
        // Format recent bookings from relevant transactions
        const formattedBookings = relevantTransactions
          .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, most recent first
          .slice(0, 5) // Take only the 5 most recent
          .map(transaction => {
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
              const durationText = transaction.originalDuration || 
                                 `${transaction.duration} ${transaction.duration === 1 ? 'month' : 'months'}`;
              description += ` · ${durationText}`;
            }
            
            // Determine status based on payment status from the booking
            const isPaid = transaction.paid || false;
            const status = isPaid ? "Active" : "Pending Payment";
            const statusColor = isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
            
            return {
              title: transaction.student?.username || 'Unknown User',
              subtitle: transaction.student?.email || '',
              time: `Booked on ${formattedDate}`,
              status: status,
              statusColor: statusColor,
              description: description,
              value: `₹${transaction.amount.toLocaleString('en-IN')}`,
              valueCaption: transaction.monthlyPrice 
                ? `₹${transaction.monthlyPrice.toLocaleString('en-IN')}/month × ${transaction.duration || 1}`
                : ''
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
  const isGymOwner = userType.includes('gymOwner');
  const serviceLabel = isMessOwner ? 'Mess' : isGymOwner ? 'Gym' : 'Hostel';
  const bookingLabel = isMessOwner ? 'Subscriptions' : isGymOwner ? 'Memberships' : 'Bookings';

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
            emptyStateMessage={
              <div className="text-center py-10 text-gray-500">
                <FaExclamationCircle className="mx-auto text-4xl mb-3 text-gray-400" />
                <h4 className="text-lg font-medium text-gray-700">No recent {bookingLabel.toLowerCase()} found</h4>
                <p className="mt-1">
                  When you receive {bookingLabel.toLowerCase()}, they will appear here.
                </p>
              </div>
            }
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