import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaEnvelope, FaLock } from "react-icons/fa"
import toast, { Toaster } from "react-hot-toast"
import { useAuth } from "../context/AuthContext"

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch(
                `http://localhost:5000/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            )

            const data = await response.json()

            if (data.success) {
                // User is verified and login successful
                login(data.token, data.user)
                toast.success("Login successful!")

                switch (data.user.userType) {
                    case "student":
                        navigate("/dashboard")
                        break
                    case "hostelOwner":
                    case "messOwner":
                    case "gymOwner":
                        navigate("/owner-dashboard")
                        break
                    default:
                        toast.error("Invalid user type")
                }
            } else if (data.requiresVerification) {
                // User needs to verify their email
                toast.warning("Please verify your email before logging in")
                // Store email verification data
                login(data.token, data.user)
                // Redirect to verification page
                navigate("/verify-email")
            } else {
                toast.error(data.error || "Login failed")
            }
        } catch (error) {
            console.error("Login error:", error)
            toast.error("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex w-full max-w-5xl mx-4">
                {/* Left Side - Image */}
                <div className="hidden lg:block lg:w-1/2">
                    <div className="h-full relative">
                        <img
                            src="https://images.unsplash.com/photo-1596276020587-8044fe049813?q=80&w=2070"
                            alt="Campus"
                            className="w-full h-[600px] object-cover rounded-l-2xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-800/90 rounded-l-2xl">
                            <div className="flex flex-col justify-center h-full px-12 text-white">
                                <h2 className="text-4xl font-bold mb-6">
                                    Welcome Back!
                                </h2>
                                <p className="text-lg text-green-100">
                                    Access your CampusCove account to manage
                                    your hostel, mess, and gym services.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 bg-white p-12 rounded-2xl lg:rounded-l-none shadow-xl">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-800">
                            Sign In
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Please sign in to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    Remember me
                                </span>
                            </label>
                            <a
                                href="#"
                                className="text-sm font-medium text-green-600 hover:text-green-500"
                            >
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white py-3 rounded-lg transition duration-200 font-semibold`}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-gray-600">
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    className="font-semibold text-green-600 hover:text-green-500"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
            <Toaster position="top-right" />
        </div>
    )
}
