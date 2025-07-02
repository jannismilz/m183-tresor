import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyTwoFactorCode, requestNewVerificationCode } from '../../comunication/FetchTwoFactor';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert, Card, CardHeader, CardBody } from 'reactstrap';

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
      const response = await verifyTwoFactorCode({
        userId,
        code: verificationCode
      });
      
      if (response.verified) {
        // Login the user using AuthContext
        login({
          userId: userId,
          // Get email from location state or from temporary localStorage
          email: email || localStorage.getItem('tempUserEmail') || ''
        });
        
        // Clean up temporary email storage
        localStorage.removeItem('tempUserEmail');
        
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
      await requestNewVerificationCode(userId);
      setResendDisabled(true);
      setCountdown(300); // Reset countdown to 5 minutes
    } catch (err) {
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <CardHeader className="text-center bg-primary text-white">
              <h4>Two-Factor Authentication</h4>
            </CardHeader>
            <CardBody className="p-4">
              <p className="text-center mb-4">
                A verification code has been sent to your email address.
                Please enter the code below to complete your login.
              </p>
              
              {error && <Alert color="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <FormGroup className="mb-3">
                  <Label for="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    autoComplete="one-time-code"
                  />
                </FormGroup>
                
                <div className="d-grid gap-2">
                  <Button 
                    color="primary" 
                    type="submit" 
                    disabled={loading || verificationCode.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                  
                  <Button
                    outline
                    color="secondary"
                    onClick={handleResendCode}
                    disabled={loading || resendDisabled}
                  >
                    {resendDisabled 
                      ? `Resend Code (${formatTime(countdown)})` 
                      : 'Resend Code'}
                  </Button>
                </div>
              </Form>
              
              <div className="text-center mt-3">
                <Button 
                  color="link" 
                  onClick={() => navigate('/login')}
                  className="text-decoration-none"
                >
                  Back to Login
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TwoFactorVerification;
