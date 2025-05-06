import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Components/Landingpage/Navbar';
import Footer from '../Components/Landingpage/Footer';

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
} 