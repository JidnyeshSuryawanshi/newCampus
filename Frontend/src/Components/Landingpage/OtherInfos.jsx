import React from "react";

export default function OtherInfos() {
  return (
    <div className="bg-gradient-to-r from-green-100 via-blue-50 to-green-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-700">
            Explore Local Shops & Services
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            CampusCove connects you with essential services around your college
            like breakfast shops, gyms, and temples, making your life easier and
            more connected.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 
          <div className="bg-white shadow-md rounded-lg p-6 hover:scale-105 transition-transform">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 text-white w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold">
                🍳
              </div>
              <h2 className="text-xl font-semibold text-green-700 ml-4">
                Breakfast Shops
              </h2>
            </div>
            <p className="text-gray-600">
              Discover the best breakfast places near your campus for delicious
              and affordable meals to start your day right.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 hover:scale-105 transition-transform">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold">
                🏋️
              </div>
              <h2 className="text-xl font-semibold text-blue-700 ml-4">
                Gyms & Fitness
              </h2>
            </div>
            <p className="text-gray-600">
              Stay fit with nearby gyms offering memberships, fitness classes,
              and personal training sessions tailored for students.
            </p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 hover:scale-105 transition-transform">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-500 text-white w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold">
                🛕
              </div>
              <h2 className="text-xl font-semibold text-yellow-700 ml-4">
                Temples & Spiritual Places
              </h2>
            </div>
            <p className="text-gray-600">
              Find peace and spiritual solace with nearby temples and other
              places of worship, perfect for moments of reflection.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button className="bg-green-600 text-white py-3 px-8 rounded-full text-lg font-medium hover:bg-green-700 transition">
            Explore More
          </button>
        </div>
      </div>
    </div>
  );
}
