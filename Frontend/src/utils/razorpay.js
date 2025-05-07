import { toast } from 'react-toastify';
import { updatePaymentStatus } from './api';

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Initialize Razorpay payment
export const initiateRazorpayPayment = async (bookingData, onSuccess) => {
  const scriptLoaded = await loadRazorpayScript();
  
  if (!scriptLoaded) {
    toast.error('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  // Calculate amount in paise (Razorpay requires amount in smallest currency unit)
  const amountInPaise = Math.round(bookingData.amount * 100);
  
  const options = {
    key: 'rzp_test_cSaPgCCDgkPbkb', // Your Razorpay Key ID
    amount: amountInPaise,
    currency: 'INR',
    name: 'New Campus',
    description: `Payment for ${bookingData.serviceType} - ${bookingData.serviceName}`,
    image: 'https://example.com/your_logo.png', // Replace with your logo URL
    order_id: bookingData.orderId, // Optional, only if you're using Orders API
    handler: async function (response) {
      try {
        // Handle successful payment
        const paymentData = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        };
        
        // Update payment status in your backend
        await updatePaymentStatus(bookingData.bookingId, 'paid', paymentData);
        
        // Show success message
        toast.success('Payment successful! Receipt generated.');
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response);
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        toast.error('Payment verification failed. Please contact support.');
      }
    },
    prefill: {
      name: bookingData.userName || '',
      email: bookingData.userEmail || '',
      contact: bookingData.userPhone || '',
    },
    notes: {
      booking_id: bookingData.bookingId,
      service_type: bookingData.serviceType,
      service_id: bookingData.serviceId,
    },
    theme: {
      color: '#16a34a', // Green color to match your UI
    },
  };

  try {
    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  } catch (error) {
    console.error('Error initializing Razorpay:', error);
    toast.error('Failed to initialize payment. Please try again.');
  }
};

// Generate receipt for a successful payment
export const generateReceipt = (paymentData) => {
  const receiptData = {
    id: paymentData.razorpay_payment_id,
    date: new Date().toLocaleString(),
    customerName: paymentData.userName,
    customerEmail: paymentData.userEmail,
    serviceName: paymentData.serviceName,
    serviceType: paymentData.serviceType,
    amount: paymentData.amount,
    paymentMethod: 'Razorpay',
    status: 'Paid',
  };
  
  return receiptData;
};
