import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { verifyEmail, resendOTP } from '../../utils/api';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaSpinner, FaRedo } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { user, login, pendingVerification, getPendingUser, completeVerification } = useAuth();
  const inputRefs = useRef([]);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Determine which email to use (regular user or pending verification user)
    const pendingUser = getPendingUser();
    const emailToUse = pendingUser?.email || user?.email;
    
    if (emailToUse) {
      setUserEmail(emailToUse);
    } else {
      // If no user data is available, redirect to login
      toast.error('No user data found for verification');
      navigate('/login');
    }
    
    // Focus on first input field when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // Redirect if user is already verified
    if (user?.isVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate, getPendingUser]);

  // Handle countdown for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // If user pastes a multi-digit string, distribute it across fields
      const digits = value.split('').slice(0, 6);
      const newOtp = [...otp];
      
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus on the last field or the next empty field
      const nextIndex = Math.min(index + digits.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    } else {
      // Handle single digit input
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto focus next input if current input is filled
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle key press (backspace, arrow keys)
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // If current field is empty and user presses backspace, focus previous field
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Left arrow key - move focus left
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      // Right arrow key - move focus right
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    
    if (!userEmail) {
      toast.error('Email address not found');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await verifyEmail({
        email: userEmail,
        otp: otpString
      });
      
      toast.success('Email verified successfully!');
      
      // Update auth context with the new token and user data
      completeVerification(response.token, response.user);
      
      // Determine where to redirect based on user type
      if (response.user.userType === 'student') {
        navigate('/dashboard');
      } else if (['hostelOwner', 'messOwner', 'gymOwner'].includes(response.user.userType)) {
        navigate('/owner-dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.error || 'Failed to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    if (!userEmail) {
      toast.error('Email address not found');
      return;
    }
    
    setResendLoading(true);
    
    try {
      await resendOTP({ email: userEmail });
      toast.success('Verification code resent successfully!');
      setCountdown(60); // Start 60-second countdown
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.error || 'Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification code to <span className="font-medium">{userEmail}</span>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center">
            <div className="flex justify-center items-center mb-6">
              <FaEnvelope className="h-12 w-12 text-blue-500" />
            </div>
            
            <div className="flex space-x-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={6} // Allow pasting full OTP
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-xl border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="off"
                />
              ))}
            </div>
            
            <button
              type="submit"
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <button
              type="button"
              className={`text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto ${
                countdown > 0 || resendLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleResendOTP}
              disabled={countdown > 0 || resendLoading}
            >
              {resendLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaRedo className="mr-2" />
              )}
              {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend verification code'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 