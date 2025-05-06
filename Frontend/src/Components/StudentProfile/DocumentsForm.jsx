import React, { useState, useEffect, useRef } from 'react';
import { FaFileAlt, FaUpload, FaTrash, FaCheckCircle, FaFileImage, FaFilePdf, FaDownload, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const DeleteConfirmationModal = ({ document, onClose, onConfirm, isDeleting }) => {
  if (!document) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Delete Document</h3>
        
        <div className="mb-6">
          <p className="text-gray-600">Are you sure you want to delete this document?</p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {document.url.toLowerCase().endsWith('.pdf') ? (
                <FaFilePdf className="text-red-500 text-xl mr-3" />
              ) : (
                <FaFileImage className="text-green-500 text-xl mr-3" />
              )}
              <div>
                <p className="font-medium text-gray-800">{document.name}</p>
                <p className="text-sm text-gray-500 capitalize">{document.type.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="mr-2" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DocumentsForm({ initialData, onRefresh }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentType, setDocumentType] = useState('identity');
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch documents from the backend
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/profile/documents');
      if (response.data.success && response.data.data) {
        setDocuments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData && initialData.documents) {
      setDocuments(initialData.documents);
    } else {
      // If no initial data is provided, fetch documents from the backend
      fetchDocuments();
    }
  }, [initialData]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid file type (JPG, PNG, or PDF)');
      return;
    }
    
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size exceeds the 5MB limit');
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
    
    // Auto-fill document name if not already set
    if (!documentName) {
      setDocumentName(file.name.split('.')[0]);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Use the existing file validation logic
      handleFileChange({ target: { files: [file] } });
    }
  };

  // Reset the form
  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDocumentName('');
    setDocumentType('identity');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload document to the server
  const uploadDocument = async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('name', documentName || selectedFile.name);
      formData.append('type', documentType);
      
      const response = await api.post('/student/profile/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      if (response.data.success) {
        toast.success('Document uploaded successfully');
        
        // Update local state or call refresh function
        if (onRefresh) {
          onRefresh();
        } else {
          // Either update local state or fetch fresh data from server
          // For consistency with upload behavior, we'll fetch from server
          await fetchDocuments();
        }
        
        // Reset form
        resetForm();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // Handle file icon display
  const getFileIcon = (url) => {
    if (url.toLowerCase().endsWith('.pdf')) {
      return <FaFilePdf className="text-red-500" />;
    } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
      return <FaFileImage className="text-green-500" />;
    } else {
      return <FaFileAlt className="text-blue-500" />;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle document download
  const handleDownloadDocument = (doc) => {
    try {
      // Create a fetch request to get the file
      fetch(doc.url)
        .then(response => response.blob())
        .then(blob => {
          // Create a blob URL for the file
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Create a temporary anchor element
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = doc.name || 'document';
          
          // Append to body, click, and remove
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          }, 100);
          
          toast.success('Download started');
        })
        .catch(error => {
          console.error('Download error:', error);
          toast.error('Failed to download document. Try opening in a new tab instead.');
          
          // Fallback: open in new tab
          window.open(doc.url, '_blank');
        });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const initiateDeleteDocument = (document) => {
    setDocumentToDelete(document);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await api.delete(`/student/profile/documents/${documentToDelete._id}`);
      
      if (response.data.success) {
        toast.success('Document deleted successfully');
        
        // Update local state or call refresh function
        if (onRefresh) {
          onRefresh();
        } else {
          // Either update local state or fetch fresh data from server
          // For consistency with upload behavior, we'll fetch from server
          await fetchDocuments();
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(error.response?.data?.message || 'Failed to delete document');
    } finally {
      setIsDeleting(false);
      setDocumentToDelete(null);
    }
  };
  
  const cancelDeleteDocument = () => {
    setDocumentToDelete(null);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      {documentToDelete && (
        <DeleteConfirmationModal
          document={documentToDelete}
          onClose={cancelDeleteDocument}
          onConfirm={confirmDeleteDocument}
          isDeleting={isDeleting}
        />
      )}
      
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <FaFileAlt className="text-green-600 mr-2" />
        Documents & Verification
      </h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Upload New Document</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Document Type*
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={uploading}
            >
              <option value="identity">Identity Proof</option>
              <option value="address_proof">Address Proof</option>
              <option value="student_id">Student ID</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Document Name (Optional)
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="E.g., Aadhar Card, Driving License"
              disabled={uploading}
            />
          </div>
        </div>
        
        <div 
          className="mt-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            disabled={uploading}
          />
          
          {previewUrl && (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Selected File</h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-red-500 hover:text-red-700"
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
              {previewUrl.startsWith('data:image') ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-40 rounded border border-gray-200 mx-auto"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded">
                  <FaFilePdf className="text-red-500 text-xl mr-2" />
                  <span>{selectedFile.name}</span>
                </div>
              )}
            </div>
          )}
          
          {!selectedFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`px-4 py-2 border-2 border-dashed rounded-lg w-full flex items-center justify-center ${
                uploading 
                  ? 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed' 
                  : 'border-green-300 hover:border-green-500 hover:bg-green-50 text-green-600'
              }`}
              disabled={uploading}
            >
              <FaUpload className="mr-2" />
              <span>Click to select a file or drag and drop (max 5MB)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={uploadDocument}
              disabled={uploading}
              className={`px-4 py-2 rounded-lg w-full flex items-center justify-center ${
                uploading 
                  ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center">
                    <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Uploading...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-white h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  <span>Upload Document</span>
                </>
              )}
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Supported file types: Images (JPG, PNG) and PDF
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Your Documents</h3>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <FaSpinner className="animate-spin text-green-600 text-2xl" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            You haven't uploaded any documents yet.
          </p>
        ) : (
          <div className="border rounded-lg divide-y">
            {documents.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="mr-3 text-xl">
                    {getFileIcon(doc.url)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{doc.name}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-3">Uploaded: {formatDate(doc.uploadedAt)}</span>
                      <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="mr-4">
                    <span className="inline-flex items-center text-green-600 text-sm">
                      <FaCheckCircle className="mr-1" />
                      Uploaded
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleDownloadDocument(doc)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Download document"
                    >
                      <FaDownload />
                    </button>
                    <button 
                      onClick={() => initiateDeleteDocument(doc)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete document"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}