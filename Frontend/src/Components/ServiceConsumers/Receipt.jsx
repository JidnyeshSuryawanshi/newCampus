import React, { useRef, useState } from 'react';
import { FaRupeeSign, FaDownload, FaCheckCircle, FaPrint, FaSpinner, FaTimes, FaFileInvoice, FaCalendarAlt, FaUser, FaEnvelope, FaBuilding, FaDumbbell } from 'react-icons/fa';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Receipt = ({ paymentData, onClose }) => {
  const receiptRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle download as PDF
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    try {
      setIsDownloading(true);
      setDownloadError(null);
      
      // Wait for any pending renders to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: false,
        removeContainer: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Add page numbers if receipt is longer than one page
      if (imgHeight > pageHeight) {
        let pageCount = Math.ceil(imgHeight / pageHeight);
        for (let i = 1; i < pageCount; i++) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, -(i * pageHeight), imgWidth, imgHeight);
        }
      }
      
      // Generate a clean filename
      const filename = `Receipt-${paymentData.receiptNumber || paymentData.razorpay_payment_id || Date.now()}.pdf`;
      pdf.save(filename);
      
      setIsDownloading(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setDownloadError('Failed to download receipt. Please try again.');
      setIsDownloading(false);
    }
  };

  // Handle print receipt
  const handlePrint = () => {
    try {
      const printContent = document.getElementById('receipt-content');
      if (!printContent) return;
      
      const originalContents = document.body.innerHTML;
      const printStyles = `
        <style>
          @media print {
            body { margin: 0; padding: 15mm; }
            .receipt-container { box-shadow: none !important; }
          }
        </style>
      `;
      
      document.body.innerHTML = printStyles + printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      
      // Reload after a short delay to restore the React app
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Failed to print receipt. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full relative animate-fadeIn shadow-2xl my-8">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-200 rounded-full p-2 hover:bg-gray-300 text-gray-700 transition-colors"
          aria-label="Close"
        >
          <FaTimes className="h-4 w-4" />
        </button>
        
        {/* Header with logo */}
        <div className="bg-green-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FaFileInvoice className="text-2xl mr-3" />
              <h2 className="text-xl font-bold">Payment Receipt</h2>
            </div>
            <div className="flex items-center bg-green-500 px-3 py-1 rounded-full text-sm">
              <FaCheckCircle className="mr-2" />
              <span>Payment Successful</span>
            </div>
          </div>
        </div>
        
        {/* Receipt content */}
        <div id="receipt-content" ref={receiptRef} className="p-6">
          {/* Receipt details */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <FaCalendarAlt className="text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Receipt Date</p>
                  <p className="font-medium">{formatDate(paymentData.paymentDate)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <FaFileInvoice className="text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Receipt Number</p>
                  <p className="font-medium">{paymentData.receiptNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Payment ID</p>
              <p className="font-mono text-xs bg-white p-2 rounded border border-gray-200 break-all">
                {paymentData.razorpay_payment_id}
              </p>
            </div>
          </div>
          
          {/* Service details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <FaDumbbell className="mr-2 text-green-600" /> Service Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Service</p>
                  <p className="font-medium">{paymentData.serviceName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Type</p>
                  <p className="font-medium capitalize">{paymentData.serviceType}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Duration</p>
                  <p className="font-medium">{paymentData.duration || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className="font-medium text-green-600 flex items-center">
                    <FaCheckCircle className="mr-1" size={12} /> Active
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Customer details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <FaUser className="mr-2 text-green-600" /> Customer Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="mt-1 mr-2">
                    <FaUser className="text-gray-400" size={14} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Name</p>
                    <p className="font-medium">{paymentData.customerName}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 mr-2">
                    <FaEnvelope className="text-gray-400" size={14} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p className="font-medium">{paymentData.customerEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment summary */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <FaRupeeSign className="mr-2 text-green-600" /> Payment Summary
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(paymentData.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="font-medium">
                  {formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-800 font-semibold">Total Amount</span>
                <span className="text-green-600 font-bold text-xl">
                  {formatCurrency(paymentData.amount)}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {paymentData.paymentMethod || 'Razorpay'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-8 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-center mb-2">
              <FaBuilding className="mr-2" />
              <span className="font-medium text-gray-700">New Campus</span>
            </div>
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <p className="mt-1">For any queries, please contact support@newcampus.com</p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-center gap-4 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${isDownloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {isDownloading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <FaDownload className="mr-2" />
                Download PDF
              </>
            )}
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center bg-gray-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <FaPrint className="mr-2" />
            Print
          </button>
          <button 
            onClick={onClose}
            className="flex items-center bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <FaTimes className="mr-2" />
            Close
          </button>
        </div>
        
        {/* Error message */}
        {downloadError && (
          <div className="bg-red-100 text-red-700 p-3 text-sm rounded-lg mx-4 mb-4 flex items-start">
            <FaTimes className="mt-0.5 mr-2 flex-shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receipt;
