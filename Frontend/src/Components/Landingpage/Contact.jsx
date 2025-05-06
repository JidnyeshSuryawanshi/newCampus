import React from "react";
import {
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaPen,
  FaPaperPlane,
} from "react-icons/fa";

export default function Contact() {
  return (
    <div className="min-h-screen w-full bg-blue-50 shadow-lg rounded-lg flex items-center justify-center px-4 py-4 md:py-8">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-6xl flex flex-col">
        <div className="text-center mt-6 md:mt-8 mb-4 px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-600 mb-2">
            CONTACT <span className="text-blue-500">US</span>
          </h2>
          <p className="text-gray-500 text-base md:text-lg">
            Fill out the form below to send us a message.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="w-full lg:w-3/5 p-4 md:p-8">
            <form
              action="https://formspree.io/f/xrbgvvde"
              method="post"
              className="space-y-4 md:space-y-6"
            >
              <div className="flex flex-col">
                <label
                  htmlFor="name"
                  className="text-gray-700 font-medium mb-1 md:mb-2 flex items-center text-sm md:text-base"
                >
                  <FaUser className="mr-2 text-lg md:text-xl" />
                  Enter Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="e.g., Rohit Sharma"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm md:text-base"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="text-gray-700 font-medium mb-1 md:mb-2 flex items-center text-sm md:text-base"
                >
                  <FaEnvelope className="mr-2 text-lg md:text-xl" />
                  Enter Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="e.g., rohit264@gmail.com"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm md:text-base"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="company"
                  className="text-gray-700 font-medium mb-1 md:mb-2 flex items-center text-sm md:text-base"
                >
                  <FaBuilding className="mr-2 text-lg md:text-xl" />
                  Enter Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  required
                  placeholder="e.g., Mom's Kitchen, AIMFIT, GOKUL"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm md:text-base"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="subject"
                  className="text-gray-700 font-medium mb-1 md:mb-2 flex items-center text-sm md:text-base"
                >
                  <FaPen className="mr-2 text-lg md:text-xl" />
                  Enter Purpose / Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  placeholder="e.g., Suggestion"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm md:text-base"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="message"
                  className="text-gray-700 font-medium mb-1 md:mb-2 flex items-center text-sm md:text-base"
                >
                  <FaPen className="mr-2 text-lg md:text-xl" />
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  required
                  placeholder="Any suggestions or your personal queries..."
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm md:text-base resize-none"
                ></textarea>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 md:py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 hover:shadow-lg flex items-center justify-center text-sm md:text-base"
                >
                  <FaPaperPlane className="mr-2 text-lg md:text-xl" />
                  Send Message
                </button>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-2/5 h-48 md:h-64 lg:h-auto">
            <img
              src="https://i.pinimg.com/736x/ad/20/7a/ad207a674e67ef63ade2412d8090aa15.jpg"
              alt="Delivery Illustration"
              className="w-full h-full object-cover rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
