import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleGoogleCallback } from '../utils/googleAuth';
import { useAuth } from '../context/AuthContext';

/**
 * OAuth2RedirectHandler
 * Handles the OAuth2 redirect from Google
 */
function OAuth2RedirectHandler() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        async function processOAuthCode() {
            try {
                // Extract the authorization code from URL
                const params = new URLSearchParams(location.search);
                const code = params.get('code');
                
                if (!code) {
                    setError('Authorization code not found');
                    setLoading(false);
                    return;
                }

                // Exchange code for user info via backend
                const response = await handleGoogleCallback(code);
                
                if (!response.success) {
                    throw new Error(response.error || 'Authentication failed');
                }

                // Login the user
                login({
                    userId: response.userId,
                    email: response.email,
                    name: response.name,
                    picture: response.picture
                });

                // Redirect to home page
                navigate('/');
            } catch (error) {
                console.error('OAuth authentication error:', error);
                setError(error.message || 'Authentication failed');
                setLoading(false);
            }
        }

        processOAuthCode();
    }, [location, navigate, login]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Completing authentication...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    <h4>Authentication Error</h4>
                    <p>{error}</p>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => navigate('/user/login')}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return null;
}

export default OAuth2RedirectHandler;
