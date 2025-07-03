import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPicture, setUserPicture] = useState('');
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const storedUserId = localStorage.getItem('userId');
    const storedUserEmail = localStorage.getItem('userEmail');
    const storedUserName = localStorage.getItem('userName');
    const storedUserPicture = localStorage.getItem('userPicture');
    const storedIsOAuthUser = localStorage.getItem('isOAuthUser') === 'true';
    
    setIsAuthenticated(storedIsAuthenticated);
    setUserId(storedUserId);
    setUserEmail(storedUserEmail);
    setUserName(storedUserName || '');
    setUserPicture(storedUserPicture || '');
    setIsOAuthUser(storedIsOAuthUser);
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('userEmail', userData.email);
    
    // Store additional user data if available (from OAuth)
    if (userData.name) {
      localStorage.setItem('userName', userData.name);
      setUserName(userData.name);
    }
    
    if (userData.picture) {
      localStorage.setItem('userPicture', userData.picture);
      setUserPicture(userData.picture);
    }
    
    // Mark as OAuth user if picture is provided (indicating OAuth login)
    const isOAuth = !!userData.picture;
    localStorage.setItem('isOAuthUser', isOAuth.toString());
    setIsOAuthUser(isOAuth);
    
    setIsAuthenticated(true);
    setUserId(userData.userId);
    setUserEmail(userData.email);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPicture');
    localStorage.removeItem('isOAuthUser');
    
    setIsAuthenticated(false);
    setUserId(null);
    setUserEmail('');
    setUserName('');
    setUserPicture('');
    setIsOAuthUser(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userId, 
      userEmail,
      userName,
      userPicture,
      isOAuthUser, 
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
