import React from 'react';
import Stats from '../dashboard/Stats';
import ActivityList from '../dashboard/ActivityList';

export default function DashboardStats() {
  const statsData = [
    {
      title: "Active Bookings",
      value: "2",
      colorClass: "text-green-600"
    },
    {
      title: "Mess Credits",
      value: "500",
      prefix: "₹",
      colorClass: "text-green-600"
    },
    {
      title: "Gym Days Left",
      value: "15",
      colorClass: "text-green-600"
    }
  ];

  const recentActivities = [
    {
      title: "Hostel Rent Paid",
      time: "Yesterday",
      value: "5000"
    },
    {
      title: "Mess Subscription Renewed",
      time: "2 days ago",
      value: "2500"
    }
  ];

  return (
    <div>
      <Stats items={statsData} />
      <ActivityList 
        title="Recent Activities" 
        activities={recentActivities} 
      />
    </div>
  );
} 