import { API_URL } from '../config/api';

/**
 * Google OAuth2 Configuration
 * 
 * This file contains the configuration and utility functions for Google OAuth2 authentication.
 */

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = '276090410601-v26jmejp1t58ple519bhoucmr4kh60of.apps.googleusercontent.com';
const REDIRECT_URI = 'http://localhost:3000/oauth2/redirect';

/**
 * Generate Google OAuth2 URL for authentication
 * @returns {string} The complete Google OAuth2 authorization URL
 */
export const getGoogleOAuthURL = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  const options = {
    redirect_uri: REDIRECT_URI,
    client_id: GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };
  
  const qs = new URLSearchParams(options);
  
  return `${rootUrl}?${qs.toString()}`;
};

/**
 * Handle Google OAuth2 callback
 * Exchanges authorization code for user information via backend
 * @param {string} code - The authorization code from Google
 * @returns {Promise<Object>} User data from the backend
 */
export const handleGoogleCallback = async (code) => {
  try {
    console.log('Sending authorization code to backend...');
    const response = await fetch(`${API_URL}/api/oauth2/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }
    
    console.log('Received response from backend:', response.status);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error handling Google callback:', error);
    throw new Error(error.message || 'Failed to authenticate with Google');
  }
};

/**
 * Check if the current URL contains a Google OAuth code
 * @returns {string|null} The authorization code if present, null otherwise
 */
export const getAuthorizationCode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
};
