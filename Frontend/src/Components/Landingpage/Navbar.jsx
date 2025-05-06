import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaInfoCircle,
  FaQuestionCircle,
  FaPhoneAlt,
  FaRegUserCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const path = location.pathname;
  let col = "";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (path === "/about" || path === "/faq" || path === "/contact")
    col = "bg-blue-50";
  else if (path === "/login" || path === "/register") col = "bg-green-50";
  else col = "bg-white";

  return (
    <div className="sticky top-0 z-50">
      <nav
        className={`${col} w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-8 transition-all duration-300 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <Link to={"/"}>
            <img
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
              src="/New_Logo.PNG"
              alt="My_Logo"
            />
          </Link>
          <h1 className="font-Nutino text-blue-400 font-bold text-xl md:text-3xl">
            Campus<span className="text-blue-300">Cove</span>
          </h1>
        </div>

        <div className="hidden md:flex gap-6 items-center text-slate-50 text-base md:text-lg font-Nutino">
          <div className="flex items-center gap-2 text-blue-400 hover:text-blue-500 cursor-pointer hover:text-xl transition-all">
            <FaHome className="text-xl md:text-2xl" />
            <Link to={"/"}>Home</Link>
          </div>
          <div className="flex items-center gap-2 text-blue-400 hover:text-blue-500 cursor-pointer hover:text-xl transition-all">
            <FaInfoCircle className="text-xl md:text-2xl" />
            <Link to={"/about"}>About</Link>
          </div>
          <div className="flex items-center gap-2 text-blue-400 hover:text-blue-500 cursor-pointer hover:text-xl transition-all">
            <FaQuestionCircle className="text-xl md:text-2xl" />
            <Link to={"/faq"}>FAQs</Link>
          </div>
          <div className="flex items-center gap-2 text-blue-400 hover:text-blue-500 cursor-pointer hover:text-xl transition-all">
            <FaPhoneAlt className="text-xl md:text-2xl" />
            <Link to={"/contact"}>Contact</Link>
          </div>
          <div className="flex gap-2 items-center text-blue-400 hover:text-blue-500 cursor-pointer">
            <FaRegUserCircle className="text-xl md:text-2xl" />
            <Link to={"/login"}>Login/Signup</Link>
          </div>
        </div>

        <div className="flex md:hidden items-center text-blue-400">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="focus:outline-none p-2"
          >
            {isDropdownOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </div>
      </nav>

      <div
        className={`fixed md:hidden transition-all duration-300 ease-in-out ${
          isDropdownOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
        style={{ top: "64px", left: 0, right: 0 }}
      >
        <div className="bg-blue-100 w-full text-base font-Nutino">
          <Link
            to={"/"}
            className="flex items-center gap-2 p-3 text-blue-400 hover:bg-blue-200 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <FaHome className="text-xl" />
            Home
          </Link>
          <Link
            to={"/about"}
            className="flex items-center gap-2 p-3 text-blue-400 hover:bg-blue-200 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <FaInfoCircle className="text-xl" />
            About
          </Link>
          <Link
            to={"/faq"}
            className="flex items-center gap-2 p-3 text-blue-400 hover:bg-blue-200 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <FaQuestionCircle className="text-xl" />
            FAQs
          </Link>
          <Link
            to={"/contact"}
            className="flex items-center gap-2 p-3 text-blue-400 hover:bg-blue-200 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <FaPhoneAlt className="text-xl" />
            Contact
          </Link>
          <Link
            to={"/login"}
            className="flex items-center gap-2 p-3 text-blue-400 hover:bg-blue-200 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <FaRegUserCircle className="text-xl" />
            Login/Signup
          </Link>
        </div>
      </div>
    </div>
  );
}
