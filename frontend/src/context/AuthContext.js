import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userPicture, setUserPicture] = useState('');
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on component mount by checking for JWT token
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      // If token exists, extract user info from it
      try {
        // Parse the JWT payload (second part of the token)
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        
        setIsAuthenticated(true);
        setUserId(payload.userId);
        setUserEmail(payload.email);
        setToken(storedToken);
        
        // Get additional info from localStorage if available
        const storedUserPicture = localStorage.getItem('userPicture');
        const storedIsOAuthUser = localStorage.getItem('isOAuthUser') === 'true';
        
        setUserPicture(storedUserPicture || '');
        setIsOAuthUser(storedIsOAuthUser);
      } catch (error) {
        console.error('Error parsing JWT token:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Store JWT token
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      setToken(userData.token);
      
      // Extract user info from token
      try {
        // Parse the JWT payload (second part of the token)
        const payload = JSON.parse(atob(userData.token.split('.')[1]));
        setUserId(payload.userId);
        setUserEmail(payload.email);
      } catch (error) {
        console.error('Error parsing JWT token:', error);
        // Use provided values as fallback
        setUserId(userData.userId);
        setUserEmail(userData.email);
      }
    } else {
      // Fallback for cases where token might not be available yet (e.g., during 2FA)
      setUserId(userData.userId);
      setUserEmail(userData.email);
    }
    
    // Store additional user data if available (from OAuth)
    if (userData.picture) {
      localStorage.setItem('userPicture', userData.picture);
      setUserPicture(userData.picture);
    }
    
    // Mark as OAuth user if picture is provided (indicating OAuth login)
    const isOAuth = !!userData.picture;
    localStorage.setItem('isOAuthUser', isOAuth.toString());
    setIsOAuthUser(isOAuth);
    
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Remove JWT token
    localStorage.removeItem('token');
    localStorage.removeItem('userPicture');
    localStorage.removeItem('isOAuthUser');
    
    setIsAuthenticated(false);
    setUserId(null);
    setUserEmail('');
    setUserPicture('');
    setIsOAuthUser(false);
    setToken(null);
  };

  // Function to get the authorization header for API requests
  const getAuthHeader = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userId, 
      userEmail,
      userPicture,
      isOAuthUser, 
      loading,
      token,
      getAuthHeader,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
