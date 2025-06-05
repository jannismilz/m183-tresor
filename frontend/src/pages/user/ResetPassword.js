import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TurnstileWidget from '../../components/TurnstileWidget';

/**
 * ResetPassword component for setting a new password
 */
function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useState('');
    const [isValidToken, setIsValidToken] = useState(false);
    const [isTokenChecking, setIsTokenChecking] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        // Extract token from URL query parameters
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get('token');
        
        if (!tokenParam) {
            setIsTokenChecking(false);
            setMessage('Invalid password reset link. Please request a new one.');
            return;
        }
        
        setToken(tokenParam);
        
        // Validate token
        const validateToken = async () => {
            try {
                const protocol = process.env.REACT_APP_API_PROTOCOL;
                const host = process.env.REACT_APP_API_HOST;
                const port = process.env.REACT_APP_API_PORT;
                const path = process.env.REACT_APP_API_PATH;
                const portPart = port ? `:${port}` : '';
                const API_URL = `${protocol}://${host}${portPart}${path}`;

                const response = await fetch(`${API_URL}/password-reset/validate?token=${tokenParam}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();
                
                if (response.ok && data.valid) {
                    setIsValidToken(true);
                    setUserEmail(data.email);
                } else {
                    setMessage(data.message || 'Invalid or expired password reset link. Please request a new one.');
                }
            } catch (error) {
                console.error('Error validating token:', error);
                setMessage('An unexpected error occurred. Please try again later.');
            } finally {
                setIsTokenChecking(false);
            }
        };
        
        validateToken();
    }, [location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // Validate password match
        if (password !== passwordConfirmation) {
            setMessage('Passwords do not match.');
            setIsLoading(false);
            return;
        }
        
        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        
        if (password.length < 8) {
            setMessage('Password must be at least 8 characters long.');
            setIsLoading(false);
            return;
        }
        
        if (!passwordRegex.test(password)) {
            setMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            setIsLoading(false);
            return;
        }
        
        // Validate Turnstile token
        if (!turnstileToken) {
            setMessage('Please complete the security check');
            setIsLoading(false);
            return;
        }

        try {
            const protocol = process.env.REACT_APP_API_PROTOCOL;
            const host = process.env.REACT_APP_API_HOST;
            const port = process.env.REACT_APP_API_PORT;
            const path = process.env.REACT_APP_API_PATH;
            const portPart = port ? `:${port}` : '';
            const API_URL = `${protocol}://${host}${portPart}${path}`;

            const response = await fetch(`${API_URL}/password-reset/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    password,
                    passwordConfirmation,
                    turnstileToken
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setIsSuccess(true);
                setMessage(data.message || 'Your password has been reset successfully.');
            } else {
                setMessage(data.message || 'An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setMessage('An unexpected error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isTokenChecking) {
        return (
            <div className="card">
                <div className="card-body text-center">
                    <h2 className="card-title">Reset Password</h2>
                    <p>Validating your reset link...</p>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Reset Password</h2>
                
                {message && (
                    <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`}>
                        {message}
                    </div>
                )}
                
                {isValidToken && !isSuccess ? (
                    <form onSubmit={handleSubmit}>
                        {userEmail && (
                            <div className="alert alert-info">
                                Resetting password for: {userEmail}
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Create a strong password (min. 8 chars, uppercase, lowercase, number, special char)"
                                className="mb-3"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="passwordConfirmation">Confirm New Password</label>
                            <input
                                id="passwordConfirmation"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                                placeholder="Confirm your new password"
                                className="mb-3"
                            />
                        </div>
                        
                        {/* Cloudflare Turnstile Widget */}
                        <div className="form-group">
                            <TurnstileWidget onVerify={setTurnstileToken} />
                        </div>
                        
                        <button type="submit" className="btn w-100" disabled={isLoading || !turnstileToken}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                ) : isSuccess ? (
                    <div className="text-center mt-3">
                        <p>Your password has been reset successfully.</p>
                        <button className="btn" onClick={() => navigate('/user/login')}>
                            Go to Login
                        </button>
                    </div>
                ) : (
                    <div className="text-center mt-3">
                        <p>The password reset link is invalid or has expired.</p>
                        <button className="btn" onClick={() => navigate('/user/forgot-password')}>
                            Request New Reset Link
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;
