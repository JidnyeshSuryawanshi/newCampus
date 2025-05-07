import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(false);

  useEffect(() => {
    // Check if user is logged in on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    // Check if there's a pending verification
    const pendingUser = sessionStorage.getItem('pendingVerification');
    if (pendingUser) {
      setPendingVerification(true);
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    if (userData.isVerified) {
      // If user is verified, proceed with normal login
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      
      // Clear any pending verification state
      setPendingVerification(false);
      sessionStorage.removeItem('pendingVerification');
    } else {
      // If user is not verified, set pending verification state
      setPendingVerification(true);
      sessionStorage.setItem('pendingVerification', JSON.stringify(userData));
      localStorage.setItem('token', token); // We still need token for verification API calls
    }
  };

  const completeVerification = (token, userData) => {
    // Set the user as verified and complete login
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    // Clear verification state
    setPendingVerification(false);
    sessionStorage.removeItem('pendingVerification');
  };

  const logout = (callback) => {
    setUser(null);
    setPendingVerification(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('pendingVerification');
    
    // If a callback is provided (like navigate function), call it
    if (callback && typeof callback === 'function') {
      callback();
    } else {
      // Fallback to window.location if no callback is provided
      window.location.href = '/login';
    }
  };

  const getPendingUser = () => {
    const pendingUser = sessionStorage.getItem('pendingVerification');
    return pendingUser ? JSON.parse(pendingUser) : null;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      pendingVerification, 
      completeVerification,
      getPendingUser
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 