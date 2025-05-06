import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaUpload, FaTrashAlt, FaSpinner, FaCheck, FaExclamationTriangle, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useOwnerProfile } from '../../context/OwnerProfileContext';

export default function DocumentsForm({ initialData, onClose }) {
  const { uploadDocument, deleteDocument, getProfile, getCompletionSteps } = useOwnerProfile();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentType, setDocumentType] = useState('businessLicense');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (initialData && initialData.documents) {
      setDocuments(initialData.documents || []);
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', documentType);
    formData.append('documentName', selectedFile.name);
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Simulate progress (in a real app, you'd use axios progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      await uploadDocument(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast.success('Document uploaded successfully');
      setSelectedFile(null);

      // Refresh profile data to ensure UI is up to date
      await getProfile();
      await getCompletionSteps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading document');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await deleteDocument(documentId);
      toast.success('Document deleted successfully');
      
      // After successful deletion, refresh the profile data
      await getProfile();
      await getCompletionSteps();
      
      // Remove document from local state for immediate UI update
      setDocuments(prevDocuments => prevDocuments.filter(doc => doc._id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const getDocumentTypeLabel = (type) => {
    const types = {
      businessLicense: 'Business License',
      identityProof: 'Identity Proof',
      addressProof: 'Address Proof',
      taxDocument: 'Tax Document',
      propertyDocument: 'Property Ownership/Lease',
      other: 'Other Document'
    };
    
    return types[type] || 'Document';
  };

  const getVerificationStatusBadge = (status) => {
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheck className="mr-1" /> Verified
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheck className="mr-1" /> Uploaded
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unverified
        </span>
      );
    }
  };

  // Check if at least one document is uploaded for completion status
  const isDocumentSectionComplete = documents && documents.length > 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={onClose}
            className="mr-4 p-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            title="Go back"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaFileAlt className="text-blue-600 mr-2" />
            Documents & Verification
          </h2>
        </div>
        {isDocumentSectionComplete && (
          <div className="flex items-center text-green-600">
            <FaCheckCircle className="mr-1" />
            <span className="text-sm">Completed</span>
          </div>
        )}
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          Upload the required documents to verify your business. This helps build trust with customers and enables all platform features.
        </p>
      </div>
      
      {/* Upload Form */}
      <form onSubmit={handleUpload} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="documentType">
              Document Type*
            </label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="businessLicense">Business License</option>
              <option value="identityProof">Identity Proof</option>
              <option value="addressProof">Address Proof</option>
              <option value="taxDocument">Tax Document (GST Registration)</option>
              <option value="propertyDocument">Property Ownership/Lease</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="documentFile">
              Select File*
            </label>
            <input
              type="file"
              id="documentFile"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Accepted formats: PDF, JPG, JPEG, PNG (Max size: 5MB)
            </p>
          </div>
        </div>
        
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {isDocumentSectionComplete ? 
              <span className="text-green-600">You have uploaded documents</span> : 
              <span>Please upload at least one document</span>
            }
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 flex items-center"
            disabled={uploading || !selectedFile}
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <FaUpload className="mr-2" />
                Upload Document
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Documents List */}
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        Uploaded Documents
      </h3>
      
      {documents.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
          <FaFileAlt className="mx-auto text-gray-400 text-4xl mb-2" />
          <p className="text-gray-500">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div key={doc._id || index} className="border border-gray-200 rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <FaFileAlt className="text-blue-500 mr-2" />
                  <h4 className="font-medium text-gray-800">
                    {getDocumentTypeLabel(doc.documentType)}
                  </h4>
                  <div className="ml-3">
                    {getVerificationStatusBadge(doc.verificationStatus)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Uploaded on: {new Date(doc.uploadDate).toLocaleDateString()}
                </p>
                {doc.verificationStatus === 'rejected' && doc.rejectionReason && (
                  <p className="text-sm text-red-600">
                    Reason: {doc.rejectionReason}
                  </p>
                )}
              </div>
              
              <div className="flex items-center mt-3 md:mt-0">
                <a 
                  href={doc.documentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-300 text-sm mr-2"
                >
                  View
                </a>
                <button 
                  onClick={() => handleDeleteDocument(doc._id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-300 text-sm flex items-center"
                >
                  <FaTrashAlt className="mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-300"
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}
