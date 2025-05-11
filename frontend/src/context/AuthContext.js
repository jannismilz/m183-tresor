import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const storedUserId = localStorage.getItem('userId');
    const storedUserEmail = localStorage.getItem('userEmail');
    
    setIsAuthenticated(storedIsAuthenticated);
    setUserId(storedUserId);
    setUserEmail(storedUserEmail);
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('userEmail', userData.email);
    
    setIsAuthenticated(true);
    setUserId(userData.userId);
    setUserEmail(userData.email);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    
    setIsAuthenticated(false);
    setUserId(null);
    setUserEmail('');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userId, 
      userEmail, 
      loading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
