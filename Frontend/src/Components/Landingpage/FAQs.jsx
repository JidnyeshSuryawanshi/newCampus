import React, { useState } from "react";
import {
  FaQuestionCircle,
  FaBook,
  FaUtensils,
  FaLock,
  FaCreditCard,
  FaRegCalendarAlt,
} from "react-icons/fa";
const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAnswer = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div className="bg-blue-50 min-h-screen flex justify-center items-center py-6 md:py-12 px-4">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-2xl w-full max-w-6xl flex flex-col lg:flex-row">
        <div className="w-full lg:w-2/5 mb-6 lg:mb-0 p-4 md:p-6">
          <img
            src="https://i.pinimg.com/736x/24/be/2e/24be2e6666be4d75f8b1a67a672e9890.jpg"
            alt="Hostel"
            className="w-full h-48 md:h-64 lg:h-full object-cover rounded-md"
          />
        </div>

        <div className="w-full lg:w-3/5">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-4 md:mb-6">
            Frequently Asked Questions (FAQ)
          </h1>

          <div className="space-y-3 md:space-y-4">
            <div className="border-b-2 shadow border-blue-300">
              <div
                onClick={() => toggleAnswer(0)}
                className={`cursor-pointer p-3 md:p-4 rounded-md ${
                  activeIndex === 0 ? "bg-blue-100" : "bg-gray-50"
                } transition-all flex items-center`}
              >
                <FaQuestionCircle className="text-lg md:text-xl mr-2 md:mr-3" />
                <h2 className="text-base md:text-lg font-semibold text-gray-700">
                  How do I book a hostel room?
                </h2>
              </div>
              {activeIndex === 0 && (
                <div className="bg-gray-50 p-3 md:p-4 shadow-2xl rounded-md mt-2">
                  <p className="text-sm md:text-base text-gray-700">
                    To book a hostel room, choose a location, and select the
                    room number with availability of rooms.
                  </p>
                </div>
              )}
            </div>

            <div className="border-b-2 border-blue-300">
              <div
                onClick={() => toggleAnswer(1)}
                className={`cursor-pointer p-3 md:p-4 rounded-md ${
                  activeIndex === 1 ? "bg-blue-100" : "bg-gray-50"
                } transition-all flex items-center`}
              >
                <FaBook className="text-lg md:text-xl mr-2 md:mr-3" />
                <h2 className="text-base md:text-lg font-semibold text-gray-700">
                  What is included in the booking?
                </h2>
              </div>
              {activeIndex === 1 && (
                <div className="bg-gray-50 p-3 md:p-4 shadow-2xl rounded-md mt-2">
                  <p className="text-sm md:text-base text-gray-700">
                    Our hostel booking includes a bed, free Wi-Fi, heater and
                    access to common areas. Meals can be added on request.
                  </p>
                </div>
              )}
            </div>

            <div className="border-b-2 border-blue-300">
              <div
                onClick={() => toggleAnswer(2)}
                className={`cursor-pointer p-3 md:p-4 rounded-md ${
                  activeIndex === 2 ? "bg-blue-100" : "bg-gray-50"
                } transition-all flex items-center`}
              >
                <FaRegCalendarAlt className="text-lg md:text-xl mr-2 md:mr-3" />
                <h2 className="text-base md:text-lg font-semibold text-gray-700">
                  Can I cancel or change my booking?
                </h2>
              </div>
              {activeIndex === 2 && (
                <div className="bg-gray-50 p-3 md:p-4 shadow-2xl rounded-md mt-2">
                  <p className="text-sm md:text-base text-gray-700">
                    Yes, you can cancel or modify your booking up to 24 hours
                    before the scheduled check-in time without a charge.
                  </p>
                </div>
              )}
            </div>

            <div className="border-b-2 border-blue-300">
              <div
                onClick={() => toggleAnswer(3)}
                className={`cursor-pointer p-3 md:p-4 rounded-md ${
                  activeIndex === 3 ? "bg-blue-100" : "bg-gray-50"
                } transition-all flex items-center`}
              >
                <FaUtensils className="text-lg md:text-xl mr-2 md:mr-3" />
                <h2 className="text-base md:text-lg font-semibold text-gray-700">
                  Is food available at the hostel?
                </h2>
              </div>
              {activeIndex === 3 && (
                <div className="bg-gray-50 p-3 md:p-4 shadow-2xl rounded-md mt-2">
                  <p className="text-sm md:text-base text-gray-700">
                    Yes, we provide meal options in our hostel as well as
                    separate food services at the mess. You can book your meals
                    along with your hostel or book them separately.
                  </p>
                </div>
              )}
            </div>

            <div className="border-b-2 border-blue-300">
              <div
                onClick={() => toggleAnswer(4)}
                className={`cursor-pointer p-3 md:p-4 rounded-md ${
                  activeIndex === 4 ? "bg-blue-100" : "bg-gray-50"
                } transition-all flex items-center`}
              >
                <FaLock className="text-lg md:text-xl mr-2 md:mr-3" />
                <h2 className="text-base md:text-lg font-semibold text-gray-700">
                  What are the hostel's security measures?
                </h2>
              </div>
              {activeIndex === 4 && (
                <div className="bg-gray-50 p-3 md:p-4 shadow-2xl rounded-md mt-2">
                  <p className="text-sm md:text-base text-gray-700">
                    Our hostels take security very seriously and provide 24/7
                    security, CCTV cameras, and electronic access to rooms for
                    added safety. You can also use lockers for personal
                    belongings.
                  </p>
                </div>
              )}
            </div>

            <div className="border-b-2 border-blue-300">
              <div
                onClick={() => toggleAnswer(5)}
                className={`cursor-pointer p-3 md:p-4 rounded-md ${
                  activeIndex === 5 ? "bg-blue-100" : "bg-gray-50"
                } transition-all flex items-center`}
              >
                <FaCreditCard className="text-lg md:text-xl mr-2 md:mr-3" />
                <h2 className="text-base md:text-lg font-semibold text-gray-700">
                  How do I make payment for my booking?
                </h2>
              </div>
              {activeIndex === 5 && (
                <div className="bg-gray-50 p-3 md:p-4 shadow-2xl rounded-md mt-2">
                  <p className="text-sm md:text-base text-gray-700">
                    We accept payments through credit cards, debit cards, and
                    various online payment platforms such as Gpay. You can pay
                    during the booking process on our website.
                  </p>
                </div>
              )}
            </div>

            <div className="border-b-2 border-blue-300">
              <div
                onClick={() => toggleAnswer(6)}
                className={`cursor-pointer p-3 md:p-4 rounded-md ${
                  activeIndex === 6 ? "bg-blue-100" : "bg-gray-50"
                } transition-all flex items-center`}
              >
                <FaQuestionCircle className="text-lg md:text-xl mr-2 md:mr-3" />
                <h2 className="text-base md:text-lg font-semibold text-gray-700">
                  Can I bring my own food to the hostel?
                </h2>
              </div>
              {activeIndex === 6 && (
                <div className="bg-gray-50 p-3 md:p-4 shadow-2xl rounded-md mt-2">
                  <p className="text-sm md:text-base text-gray-700">
                    Guests are allowed to bring their own food to the hostel,
                    but we request that you consume it in designated areas (such
                    as the common kitchen or dining room).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
