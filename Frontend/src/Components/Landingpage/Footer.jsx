import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="text-center sm:text-left">
            <h2 className="text-lg md:text-xl font-semibold text-white">
              About CampusCove
            </h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base">
              CampusCove is your one-stop solution for simplifying student life.
              From booking hostels to discovering local services, we make your
              campus experience hassle-free and enjoyable.
            </p>
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-lg md:text-xl font-semibold text-white">Quick Links</h2>
            <ul className="mt-3 md:mt-4 space-y-2 text-sm md:text-base">
              <li>
                <Link to={"/"} className="hover:text-green-400 transition-colors duration-200">
                  Hostel Finder
                </Link>
              </li>
              <li>
                <Link to={"/"} className="hover:text-green-400 transition-colors duration-200">
                  Mess Booking
                </Link>
              </li>
              <li>
                <Link to={"/"} className="hover:text-green-400 transition-colors duration-200">
                  Local Shops
                </Link>
              </li>
              <li>
                <Link to={"/contact"} className="hover:text-green-400 transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-lg md:text-xl font-semibold text-white">Contact Us</h2>
            <ul className="mt-3 md:mt-4 space-y-2 text-sm md:text-base">
              <li>
                <span className="font-medium">Email:</span>{" "}
                <a href="mailto:jidnyesh0149@gmail.com" className="hover:text-green-400 transition-colors duration-200">
                  jidnyesh0149@gmail.com
                </a>
              </li>
              <li>
                <span className="font-medium">Phone:</span>{" "}
                <a href="tel:+919307368397" className="hover:text-green-400 transition-colors duration-200">
                  +91 9307368397
                </a>
              </li>
              <li>
                <span className="font-medium">Address:</span> MIT Academy of
                Engineering, Alandi
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 md:mt-8"></div>

        <div className="flex flex-col md:flex-row items-center justify-between mt-4 md:mt-6">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <Link
              to={"/"}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-xl md:text-2xl"
            >
              <FaFacebook />
            </Link>
            <Link
              to={"/"}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-xl md:text-2xl"
            >
              <FaTwitter />
            </Link>
            <Link
              to={"/"}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-xl md:text-2xl"
            >
              <FaInstagram />
            </Link>
            <Link
              to={"/"}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-xl md:text-2xl"
            >
              <FaLinkedin />
            </Link>
          </div>
          <p className="text-xs md:text-sm text-center md:text-right">
            &copy; {new Date().getFullYear()} CampusCove. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
