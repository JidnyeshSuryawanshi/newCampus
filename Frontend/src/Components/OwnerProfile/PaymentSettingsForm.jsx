import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaUniversity, FaQrcode } from 'react-icons/fa';

export default function PaymentSettingsForm({ initialData, onSave, loading }) {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: ''
  });

  useEffect(() => {
    if (initialData && initialData.paymentSettings) {
      setFormData({
        accountHolderName: initialData.paymentSettings.accountHolderName || '',
        accountNumber: initialData.paymentSettings.accountNumber || '',
        ifscCode: initialData.paymentSettings.ifscCode || '',
        bankName: initialData.paymentSettings.bankName || '',
        upiId: initialData.paymentSettings.upiId || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <FaMoneyBillWave className="text-blue-600 mr-2" />
        Payment Settings
      </h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> These payment details will be used to receive payments from CampusCove. 
          We're planning to integrate with Razorpay for seamless payment processing in the future.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Holder Name */}
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="accountHolderName">
              Account Holder Name*
            </label>
            <input
              type="text"
              id="accountHolderName"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter account holder name"
              required
            />
          </div>
          
          {/* Account Number */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="accountNumber">
              Account Number*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaUniversity className="text-gray-400" />
              </div>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter account number"
                required
              />
            </div>
          </div>
          
          {/* IFSC Code */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="ifscCode">
              IFSC Code*
            </label>
            <input
              type="text"
              id="ifscCode"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter IFSC code"
              required
            />
          </div>
          
          {/* Bank Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="bankName">
              Bank Name*
            </label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter bank name"
              required
            />
          </div>
          
          {/* UPI ID */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="upiId">
              UPI ID (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaQrcode className="text-gray-400" />
              </div>
              <input
                type="text"
                id="upiId"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter UPI ID (optional)"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 flex items-center"
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
            ) : (
              'Save Information'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
