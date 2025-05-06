import React from "react";
import {
  FaBullhorn,
  FaCheckCircle,
  FaHandshake,
  FaEye,
  FaRocket,
  FaThumbsUp,
} from "react-icons/fa";

export default function AboutCampusCove() {
  return (
    <section className="bg-blue-50 py-16 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-blue-600 mb-8">
          About CampusCove
        </h2>
        <p className="text-xl text-gray-700 leading-relaxed">
          Welcome to{" "}
          <span className="font-semibold text-green-600">CampusCove</span>—a
          platform created to make your college life easier! Whether you're
          looking for the perfect hostel, a reliable mess, or convenient local
          shop services, CampusCove has got you covered. Our mission is to
          bridge the gap between students and trusted service providers,
          ensuring you spend less time searching and more time thriving in your
          new journey.
        </p>
      </div>

      <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-yellow-500 hover:scale-105 transform transition duration-300">
          <h3 className="text-2xl font-semibold text-blue-500 mb-4 flex items-center">
            <FaBullhorn className="mr-2 text-3xl text-yellow-500" />
            Our Mission
          </h3>
          <p className="text-gray-700">
            To simplify the onboarding experience for students by connecting
            them with essential services and helping them settle into their new
            environment.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-green-500 hover:scale-105 transform transition duration-300">
          <h3 className="text-2xl font-semibold text-blue-500 mb-4 flex items-center">
            <FaCheckCircle className="mr-2 text-3xl text-green-500" />
            Key Features
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-3">
            <li>Easy hostel search and booking.</li>
            <li>Access to mess and local shop services.</li>
            <li>Verified reviews and affordable pricing.</li>
          </ul>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-500 hover:scale-105 transform transition duration-300">
          <h3 className="text-2xl font-semibold text-blue-500 mb-4 flex items-center">
            <FaEye className="mr-2 text-3xl text-blue-500" />
            What We Solve
          </h3>
          <p className="text-gray-700">
            Struggles with finding trusted hostels, messes, and shops in a new
            city are over. CampusCove offers transparency, reliability, and
            convenience.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-yellow-500 hover:scale-105 transform transition duration-300">
          <h3 className="text-2xl font-semibold text-blue-500 mb-4 flex items-center">
            <FaHandshake className="mr-2 text-3xl text-yellow-500" />
            How It Works
          </h3>
          <p className="text-gray-700">
            Sign up, explore services, compare amenities and prices, and
            book—all in just a few clicks.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-green-500 hover:scale-105 transform transition duration-300">
          <h3 className="text-2xl font-semibold text-blue-500 mb-4 flex items-center">
            <FaRocket className="mr-2 text-3xl text-green-500" />
            Our Vision
          </h3>
          <p className="text-gray-700">
            To be the go-to platform for student accommodation and services
            across the country.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-500 hover:scale-105 transform transition duration-300">
          <h3 className="text-2xl font-semibold text-blue-500 mb-4 flex items-center">
            <FaThumbsUp className="mr-2 text-3xl text-blue-500" />
            Why Choose Us?
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-3">
            <li>Hassle-free booking process.</li>
            <li>Exclusive student discounts.</li>
            <li>Reliable and verified service providers.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
