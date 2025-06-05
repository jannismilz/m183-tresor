import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TurnstileWidget from '../../components/TurnstileWidget';

/**
 * ForgotPassword component for requesting password reset
 */
function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

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

            const response = await fetch(`${API_URL}/password-reset/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    turnstileToken
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setIsSuccess(true);
                setMessage(data.message || 'If your email is registered with us, you will receive a password reset link shortly.');
            } else {
                setMessage(data.message || 'An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Error requesting password reset:', error);
            setMessage('An unexpected error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Forgot Password</h2>
                
                {message && (
                    <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`}>
                        {message}
                    </div>
                )}
                
                {!isSuccess ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email address"
                                className="mb-3"
                            />
                        </div>
                        
                        {/* Cloudflare Turnstile Widget */}
                        <div className="form-group">
                            <TurnstileWidget onVerify={setTurnstileToken} />
                        </div>
                        
                        <button type="submit" className="btn w-100" disabled={isLoading || !turnstileToken}>
                            {isLoading ? 'Sending...' : 'Reset Password'}
                        </button>
                        
                        <p className="text-center mt-3">
                            Remember your password? <a href="/user/login">Login here</a>
                        </p>
                    </form>
                ) : (
                    <div className="text-center mt-3">
                        <button className="btn" onClick={() => navigate('/user/login')}>
                            Return to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
