import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleGoogleCallback } from '../../utils/googleAuth';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Card, CardBody, Spinner, Alert } from 'reactstrap';

/**
 * OAuth2Redirect Component
 * Handles the OAuth2 redirect callback from Google
 */
const OAuth2Redirect = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const processOAuth = async () => {
      // Get the authorization code from URL query parameters
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      
      if (!code) {
        setError('No authorization code found');
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Processing OAuth code...');
        // Exchange the code for user data
        const userData = await handleGoogleCallback(code);
        
        if (userData.success) {
          console.log('OAuth authentication successful');
          
          // Login the user with all returned data
          login({
            userId: userData.userId,
            email: userData.email,
            name: userData.name,
            picture: userData.picture
          });
          
          // Redirect to home page
          navigate('/');
        } else {
          console.error('OAuth authentication failed:', userData.error);
          setError(userData.error || 'Authentication failed');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('OAuth processing error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
        setIsLoading(false);
      }
    };
    
    processOAuth();
  }, [location, login, navigate]);
  
  // Show welcome message for new users
  const showWelcomeMessage = () => {
    // Implementation for showing welcome message to new users
    // This could be a toast notification or a modal
  };
  
  if (isLoading) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <Row className="justify-content-center w-100">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="shadow-lg border-0 rounded-lg">
              <CardBody className="p-4 text-center">
                <h3 className="mb-3">Authenticating with Google</h3>
                <Spinner color="primary" />
                <p className="mt-3">Please wait while we complete your sign-in...</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <Row className="justify-content-center w-100">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="shadow-lg border-0 rounded-lg">
              <CardBody className="p-4 text-center">
                <h3 className="text-danger mb-3">Authentication Error</h3>
                <Alert color="danger">{error}</Alert>
                <button 
                  className="btn btn-primary mt-3" 
                  onClick={() => navigate('/user/login')}
                >
                  Back to Login
                </button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
  
  return null;
};

export default OAuth2Redirect;
