import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaRegCreditCard, FaCalendarAlt, FaLock } from 'react-icons/fa';

export default function PaymentInfoForm({ initialData, onSave, loading }) {
  const [formData, setFormData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });

  useEffect(() => {
    if (initialData && initialData.paymentInfo && initialData.paymentInfo.savedCards && initialData.paymentInfo.savedCards.length > 0) {
      // Get the most recent card
      const lastCard = initialData.paymentInfo.savedCards[initialData.paymentInfo.savedCards.length - 1];
      
      setFormData({
        cardHolderName: lastCard.cardHolderName || '',
        cardNumber: lastCard.lastFourDigits ? `•••• •••• •••• ${lastCard.lastFourDigits}` : '',
        expiryDate: lastCard.expiryDate || '',
        cvv: '',
        saveCard: false
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Add space after every 4 digits
    let formatted = '';
    for (let i = 0; i < digitsOnly.length; i += 4) {
      formatted += digitsOnly.slice(i, i + 4) + ' ';
    }
    return formatted.trim();
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      cardNumber: formattedValue.substring(0, 19) // Limit to 16 digits + 3 spaces
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Remove spaces from card number before saving
    const paymentData = {
      ...formData,
      cardNumber: formData.cardNumber.replace(/\s/g, '')
    };
    
    onSave(paymentData);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <FaCreditCard className="text-green-600 mr-2" />
        Payment Information
      </h2>
      
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
        <p className="text-sm">
          <strong>Note:</strong> This is a placeholder form for demonstration purposes. 
          Actual payment processing will be implemented in the future. No payment will be processed at this time.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Holder Name */}
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="cardHolderName">
              Card Holder Name*
            </label>
            <input
              type="text"
              id="cardHolderName"
              name="cardHolderName"
              value={formData.cardHolderName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Name on card"
              required
            />
          </div>
          
          {/* Card Number */}
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="cardNumber">
              Card Number*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaRegCreditCard className="text-gray-400" />
              </div>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                required
              />
            </div>
          </div>
          
          {/* Expiry Date */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="expiryDate">
              Expiry Date*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="MM/YY"
                pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                title="Please enter a valid expiry date in MM/YY format"
                required
              />
            </div>
          </div>
          
          {/* CVV */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="cvv">
              CVV*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type="password"
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="123"
                maxLength="4"
                pattern="[0-9]{3,4}"
                title="Please enter a valid 3 or 4 digit CVV"
                required
              />
            </div>
          </div>
          
          {/* Save Card Checkbox */}
          <div className="col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="saveCard"
                checked={formData.saveCard}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">
                Save this card for future payments
              </span>
            </label>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Payment Information'}
          </button>
        </div>
      </form>
    </div>
  );
} 