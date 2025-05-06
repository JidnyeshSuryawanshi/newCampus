import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is trying to access the correct dashboard
  const currentPath = window.location.pathname;
  const isStudentPath = currentPath.includes('student');
  const isBusinessPath = currentPath.includes('business');

  if (isStudentPath && userType !== 'student') {
    return <Navigate to="/business-dashboard" replace />;
  }

  if (isBusinessPath && userType === 'student') {
    return <Navigate to="/student-dashboard" replace />;
  }

  return children;
};

export default PrivateRoute; 