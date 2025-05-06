import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StudentSidebar from '../dashboard/StudentSidebar';
import OwnerSidebar from '../ServiceProviders/OwnerSidebar';
import DashboardHeader from '../ServiceConsumers/DashboardHeader';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isOwner = user?.userType.includes('Owner');

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      {isOwner ? <OwnerSidebar /> : <StudentSidebar />}

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Fixed Header */}
        <DashboardHeader />
        
        {/* Dynamic Content Area */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 