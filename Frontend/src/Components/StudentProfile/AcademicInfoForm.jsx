import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaIdCard, FaBook, FaCalendarAlt } from 'react-icons/fa';

export default function AcademicInfoForm({ initialData, onSave, loading }) {
  const [formData, setFormData] = useState({
    institution: '',
    studentId: '',
    course: '',
    year: '',
    graduationYear: ''
  });

  useEffect(() => {
    if (initialData && initialData.academicInfo) {
      setFormData({
        institution: initialData.academicInfo.institution || '',
        studentId: initialData.academicInfo.studentId || '',
        course: initialData.academicInfo.course || '',
        year: initialData.academicInfo.year || '',
        graduationYear: initialData.academicInfo.graduationYear || ''
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <FaGraduationCap className="text-green-600 mr-2" />
        Academic Information
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Institution */}
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="institution">
              Institution/University*
            </label>
            <input
              type="text"
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your institution name"
              required
            />
          </div>
          
          {/* Student ID */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="studentId">
              Student ID/Roll Number*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaIdCard className="text-gray-400" />
              </div>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your student ID"
                required
              />
            </div>
          </div>
          
          {/* Course */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="course">
              Course/Program*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaBook className="text-gray-400" />
              </div>
              <input
                type="text"
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="E.g., B.Tech, M.Sc, etc."
                required
              />
            </div>
          </div>
          
          {/* Year */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="year">
              Current Year
            </label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select year</option>
              <option value="1st year">1st Year</option>
              <option value="2nd year">2nd Year</option>
              <option value="3rd year">3rd Year</option>
              <option value="4th year">4th Year</option>
              <option value="5th year">5th Year</option>
              <option value="graduated">Graduated</option>
            </select>
          </div>
          
          {/* Graduation Year */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="graduationYear">
              Expected Graduation Year
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <select
                id="graduationYear"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
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
            ) : 'Save Information'}
          </button>
        </div>
      </form>
    </div>
  );
} 