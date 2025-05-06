import React from "react";
import {
  FaList,
  FaMapMarkerAlt,
  FaWifi,
  FaStar,
  FaDollarSign,
  FaBook,
} from "react-icons/fa";

export default function HostelBookingInfo() {
  return (
    <div className="bg-blue-50 w-full relative flex flex-col lg:flex-row gap-6 lg:gap-10">
      <div className="w-full bg-blue-50 py-6 px-4 lg:px-6 flex flex-col items-center">
        <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-6">
          How It Works
        </h2>
        <div className="flex flex-col items-center gap-8 md:gap-12">
          <div className="flex items-center w-full max-w-md">
            <div className="bg-blue-600 text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full font-bold text-sm md:text-base">
              1
            </div>
            <p className="ml-4 text-gray-800 font-medium text-sm md:text-base">
              Sign up or log in to CampusCove.
            </p>
          </div>

          <div className="w-1 bg-blue-600 h-8 md:h-10"></div>

          <div className="flex items-center w-full max-w-md">
            <div className="bg-blue-600 text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full font-bold text-sm md:text-base">
              2
            </div>
            <p className="ml-4 text-gray-800 font-medium text-sm md:text-base">
              Search for hostels by location and preferences.
            </p>
          </div>

          <div className="w-1 bg-blue-600 h-8 md:h-10"></div>

          <div className="flex items-center w-full max-w-md">
            <div className="bg-blue-600 text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full font-bold text-sm md:text-base">
              3
            </div>
            <p className="ml-4 text-gray-800 font-medium text-sm md:text-base">
              Compare amenities, pricing, and reviews.
            </p>
          </div>

          <div className="w-1 bg-blue-600 h-8 md:h-10"></div>

          <div className="flex items-center w-full max-w-md">
            <div className="bg-blue-600 text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full font-bold text-sm md:text-base">
              4
            </div>
            <p className="ml-4 text-gray-800 font-medium text-sm md:text-base">
              Book your hostel with instant confirmation.
            </p>
          </div>
        </div>
      </div>

      <div className="text-gray-800 p-4 md:p-6 lg:p-8">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600">
            CampusCove Hostel Finder
          </h1>
          <p className="mt-4 text-base md:text-lg max-w-3xl mx-auto">
            Finding the perfect hostel has never been easier. Whether you're a
            student moving to a new city or looking to upgrade your
            accommodation, CampusCove provides a hassle-free way to explore and
            book hostels tailored to your needs.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg md:text-xl font-semibold text-blue-500 mb-3 md:mb-4 flex items-center gap-2">
              <FaList className="text-blue-600" />
              Comprehensive Listings
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
              <li>
                Explore a wide range of hostels with detailed information about
                room types, amenities, and pricing.
              </li>
              <li>
                View photos and descriptions to get a clear picture of your
                options.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg md:text-xl font-semibold text-blue-500 mb-3 md:mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" />
              Search by Location
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
              <li>
                Use our location-based search to discover hostels close to your
                college or workplace.
              </li>
              <li>
                Filter results by distance, budget, and facilities for a
                personalized experience.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg md:text-xl font-semibold text-blue-500 mb-3 md:mb-4 flex items-center gap-2">
              <FaWifi className="text-blue-600" />
              Amenities at a Glance
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
              <li>
                Find hostels offering essential amenities like Wi-Fi, laundry,
                and meals.
              </li>
              <li>
                Check for extra facilities such as study rooms, gyms, or
                recreational areas.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg md:text-xl font-semibold text-blue-500 mb-3 md:mb-4 flex items-center gap-2">
              <FaStar className="text-blue-600" />
              Verified Reviews and Ratings
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
              <li>
                Read honest feedback from other users to make informed
                decisions.
              </li>
              <li>
                Leave your own reviews to help others find the right place.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg md:text-xl font-semibold text-blue-500 mb-3 md:mb-4 flex items-center gap-2">
              <FaDollarSign className="text-blue-600" />
              Affordable Pricing
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
              <li>
                Compare room prices to find an option that fits your budget.
              </li>
              <li>
                Get exclusive student discounts and offers through CampusCove.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg md:text-xl font-semibold text-blue-500 mb-3 md:mb-4 flex items-center gap-2">
              <FaBook className="text-blue-600" />
              Hassle-Free Booking
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
              <li>
                Book your hostel directly through our platform with instant
                confirmation.
              </li>
              <li>
                Secure payment options make the process smooth and reliable.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
