import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyTwoFactorCode, requestNewVerificationCode } from '../../comunication/FetchTwoFactor';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert, Card, CardHeader, CardBody } from 'reactstrap';

// Import Bootstrap Icons CSS if not already imported in your project
// If you prefer not to use CDN, you can install the package: npm install bootstrap-icons
// and then import the CSS from node_modules
import './TwoFactorVerification.css';

const TwoFactorVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes countdown
  const [resendDisabled, setResendDisabled] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = location.state || {};
  const { login } = useAuth();
  
  useEffect(() => {
    // Redirect to login if no userId is provided
    if (!userId) {
      navigate('/login');
      return;
    }
    
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [userId, navigate]);
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Get temporary token if available
      const tempToken = localStorage.getItem('tempAuthToken');
      
      const response = await verifyTwoFactorCode({
        userId,
        code: verificationCode,
        token: tempToken // Include token if available
      });
      
      if (response.verified) {
        // Login the user using AuthContext with JWT token
        login({
          userId: userId,
          // Get email from location state or from temporary localStorage
          email: email || localStorage.getItem('tempUserEmail') || '',
          token: response.token || tempToken // Use new token from response or existing temp token
        });
        
        // Clean up temporary storage
        localStorage.removeItem('tempUserEmail');
        localStorage.removeItem('tempAuthToken');
        
        // Redirect to dashboard on successful verification
        navigate('/');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get temporary token if available
      const tempToken = localStorage.getItem('tempAuthToken');
      
      await requestNewVerificationCode(userId, tempToken);
      setResendDisabled(true);
      setCountdown(300); // Reset countdown to 5 minutes
    } catch (err) {
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="verification-page">
      <Container fluid className="h-100">
        <Row className="justify-content-center align-items-center h-100">
          <Col xs={11} sm={10} md={6} lg={5} xl={4}>
            <div className="text-center mb-4">
              <h2 className="fw-bold text-primary mb-1">Verification Required</h2>
              <p className="text-muted">Secure your account with 2FA</p>
            </div>
            
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              <CardBody className="p-4 p-lg-5">
                <div className="verification-icon text-center mb-4">
                  <div className="verification-circle mb-3">
                    <i className="bi bi-shield-lock"></i>
                  </div>
                  <p className="mb-0 fw-light">
                    We've sent a verification code to your email address.
                  </p>
                </div>
                
                {error && (
                  <Alert color="danger" className="rounded-3 border-0 shadow-sm">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      <span>{error}</span>
                    </div>
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <div className="code-input-container mb-4">
                    <Label for="verificationCode" className="fw-medium mb-2">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      className="form-control-lg text-center fw-bold letter-spacing-2"
                      placeholder="••••••"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      autoComplete="one-time-code"
                    />
                    <small className="text-muted d-block text-center mt-2">
                      Enter the 6-digit code from your email
                    </small>
                  </div>
                  
                  <Button 
                    color="primary" 
                    size="lg"
                    block
                    className="rounded-3 py-3 mb-3 fw-medium"
                    type="submit" 
                    disabled={loading || verificationCode.length !== 6}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Verifying...
                      </>
                    ) : 'Verify & Continue'}
                  </Button>
                  
                  <Button
                    color="link"
                    className="d-block w-100 text-center"
                    onClick={handleResendCode}
                    disabled={loading || resendDisabled}
                  >
                    {resendDisabled 
                      ? `Resend code in ${formatTime(countdown)}` 
                      : (
                        <>
                          <i className="bi bi-arrow-repeat me-2"></i>
                          Resend verification code
                        </>
                      )}
                  </Button>
                </Form>
              </CardBody>
            </Card>
            
            <div className="text-center mt-4">
              <Button 
                color="link" 
                onClick={() => navigate('/login')}
                className="text-decoration-none text-muted"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Login
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TwoFactorVerification;
