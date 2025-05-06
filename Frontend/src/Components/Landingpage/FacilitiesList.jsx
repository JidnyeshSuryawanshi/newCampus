import React from "react";
import { FaUserPlus, FaInfoCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function FacilitiesList() {
  return (
    <div
      className="relative w-[98%] min-h-screen bg-blue-500 bg-cover bg-center m-4 rounded-xl"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1741851373559-6879db14fd8a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
      }}
    >
      <div className="absolute inset-0 bg-gray-900 bg-opacity-40 z-0"></div>

      <div className="relative flex flex-col items-center justify-center text-center px-6 min-h-[45vh] z-10">
        <h1 className="uppercase leading-relaxed text-4xl text-white font-bold mb-6">
          Welcome to CampusCove
        </h1>
        <p className="text-xl text-white max-w-2xl">
          Your One-Stop Platform for Mess & Hostel Services
        </p>
      </div>

      <div className="relative w-[85%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-[-50px] z-10">
        <div className="bg p-6 rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-[0px_0px_20px_5px_rgba(255,255,255,0.3)]">
          <h1 className="text-2xl font-semibold text-white mb-3">
            Hostel Room Bookings
          </h1>
          <p className="text-white text-sm">
            Finding the right hostel is made easy with CampusCove. Our platform
            helps you find the best hostel for you.
          </p>
        </div>
        <div className="bg p-6 rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-[0px_0px_20px_5px_rgba(255,255,255,0.3)]">
          <h1 className="text-2xl font-semibold text-white mb-3">
            Easy Mess Bookings
          </h1>
          <p className="text-white text-sm">
            With CampusCove, you can easily book your mess services for the
            month. No more confusion about meal plans.
          </p>
        </div>
        <div className="bg p-6 rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-[0px_0px_20px_5px_rgba(255,255,255,0.3)]">
          <h1 className="text-2xl font-semibold text-white mb-3">
            Local Shops & Services
          </h1>
          <p className="text-white text-sm">
            CampusCove also helps you discover local services like breakfast
            shops, gyms, and temples in your college vicinity.
          </p>
        </div>
        <div className="bg p-6 rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-[0px_0px_20px_5px_rgba(255,255,255,0.3)]">
          <h1 className="text-2xl font-semibold text-white mb-3">
            Reviews and Ratings
          </h1>
          <p className="text-white text-sm">
            CampusCove empowers students by providing reviews and ratings of
            messes, hostels, and local services.
          </p>
        </div>
      </div>

      <div className="absolute bottom-5 left-[50%] transform -translate-x-1/2 flex gap-5 z-10 ">
        <Link
          to={"/Login"}
          className="flex items-center bg-blue-400 text-white px-5 py-2 rounded-full hover:bg-blue-500 transition hover:shadow-[0px_0px_20px_5px_rgba(255,255,255,0.3)]"
        >
          <FaUserPlus className="mr-2" /> Sign Up
        </Link>
        <Link
          to={"/about"}
          className="flex items-center bg-blue-400 text-white px-5 py-2 rounded-full hover:bg-blue-500 transition hover:shadow-[0px_0px_20px_5px_rgba(255,255,255,0.3)]"
        >
          <FaInfoCircle className="mr-2" /> About Us
        </Link>
      </div>
    </div>
  );
}