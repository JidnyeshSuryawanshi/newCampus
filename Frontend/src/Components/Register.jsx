import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaUserTag } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        userType: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (data.success) {
                // Store the token and user data
                localStorage.setItem('token', data.token);
                
                // Use the login function from AuthContext to set pending verification
                login(data.token, data.user);
                
                toast.success("Registration successful! Redirecting to verification page...");
                setTimeout(() => {
                    navigate("/verify-email");
                }, 2000);
            } else {
                toast.error(data.error || "Registration failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative p-6">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="absolute inset-0 bg-gradient-to-r from-green-100 via-blue-50 to-green-100"></div>

            <div className="relative z-10 flex w-full max-w-[90%] h-auto bg-white bg-opacity-10 backdrop-blur-lg shadow-xl rounded-lg overflow-hidden p-8 md:p-12">
                <form
                    onSubmit={handleSubmit}
                    className="w-full md:w-3/5 p-10 bg-white rounded-lg shadow-lg"
                >
                    <h2 className="text-3xl font-bold text-green-600 text-center mb-10">
                        Create Account
                    </h2>

                    <div className="relative mb-10">
                        <input
                            type="text"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            placeholder=" "
                            className="peer w-full bg-transparent border-b-2 border-gray-400 focus:border-green-600 focus:outline-none text-gray-800 py-6 placeholder-transparent px-3"
                        />
                        <label className="absolute left-3 top-1 text-gray-400 text-sm transition-all duration-300 peer-placeholder-shown:top-10 peer-placeholder-shown:text-lg peer-focus:top-1 peer-focus:text-sm peer-focus:text-green-600">
                            <FaUser className="mr-2 inline-block text-lg text-gray-400" />
                            Username
                        </label>
                    </div>

                    <div className="relative mb-10">
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder=" "
                            className="peer w-full bg-transparent border-b-2 border-gray-400 focus:border-green-600 focus:outline-none text-gray-800 py-6 placeholder-transparent px-3"
                        />
                        <label className="absolute left-3 top-1 text-gray-400 text-sm transition-all duration-300 peer-placeholder-shown:top-10 peer-placeholder-shown:text-lg peer-focus:top-1 peer-focus:text-sm peer-focus:text-green-600">
                            <FaEnvelope className="mr-2 inline-block text-lg text-gray-400" />
                            Email
                        </label>
                    </div>

                    <div className="relative mb-10">
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder=" "
                            className="peer w-full bg-transparent border-b-2 border-gray-400 focus:border-green-600 focus:outline-none text-gray-800 py-6 placeholder-transparent px-3"
                        />
                        <label className="absolute left-3 top-1 text-gray-400 text-sm transition-all duration-300 peer-placeholder-shown:top-10 peer-placeholder-shown:text-lg peer-focus:top-1 peer-focus:text-sm peer-focus:text-green-600">
                            <FaLock className="mr-2 inline-block text-lg text-gray-400" />
                            Password
                        </label>
                    </div>

                    <div className="relative mb-10">
                        <label className="block text-gray-400 text-sm mb-2">
                            <FaUserTag className="mr-2 inline-block text-lg text-gray-400" />
                            User Type
                        </label>
                        <select
                            name="userType"
                            required
                            value={formData.userType}
                            onChange={handleChange}
                            className="w-full bg-transparent border-2 border-gray-400 focus:border-green-600 focus:outline-none text-gray-800 py-4 px-3 rounded-lg"
                        >
                            <option value="">Select User Type</option>
                            <option value="student">Student</option>
                            <option value="hostelOwner">Hostel Owner</option>
                            <option value="messOwner">Mess Owner</option>
                            <option value="gymOwner">Gym Owner</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold text-lg py-4 rounded-lg transition duration-300 mt-6`}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>

                    <div className="text-center mt-8 text-gray-500">
                        <p>
                            Already have an account? {" "}
                            <Link
                                to="/login"
                                className="text-green-600 hover:text-green-500 transition duration-300"
                            >
                                Login here
                            </Link>
                        </p>
                    </div>
                </form>

                <div className="w-2/5 hidden md:block p-6">
                    <img
                        src="https://i.pinimg.com/736x/ec/fb/9f/ecfb9ffd184bceec03b3c19161eee7fd.jpg"
                        alt="Registration Illustration"
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
}
