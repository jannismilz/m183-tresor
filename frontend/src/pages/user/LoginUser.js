import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { loginUser } from '../../comunication/FetchUser';
import { useAuth } from '../../context/AuthContext';
import TurnstileWidget from '../../components/TurnstileWidget';

/**
 * LoginUser
 * @author Peter Rutschmann
 */
function LoginUser({loginValues, setLoginValues}) {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);
        
        // Validate Turnstile token
        if (!turnstileToken) {
            setErrorMessage('Please complete the security check');
            setIsLoading(false);
            return;
        }
        
        try {
            const response = await loginUser({
                ...loginValues,
                turnstileToken
            });
            
            // Check if 2FA verification is required
            if (response.requiresTwoFactor) {
                console.log('2FA required, redirecting to verification page');
                // Store email temporarily for the verification process
                localStorage.setItem('tempUserEmail', loginValues.email);
                
                // Redirect to 2FA verification page with userId
                navigate('/two-factor-verification', { 
                    state: { userId: response.userId, email: loginValues.email } 
                });
                return;
            }
            
            // If no 2FA required (shouldn't happen as per requirements)
            login({
                userId: response.userId,
                email: loginValues.email
            });
            
            console.log('Login successful', response);
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            setErrorMessage(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={loginValues.email}
                            onChange={(e) =>
                                setLoginValues(prevValues => ({...prevValues, email: e.target.value}))}
                            required
                            placeholder="Enter your email address"
                            className="mb-3"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={loginValues.password}
                            onChange={(e) =>
                                setLoginValues(prevValues => ({...prevValues, password: e.target.value}))}
                            required
                            placeholder="Enter your password"
                            className="mb-3"
                        />
                    </div>
                    
                    {/* Cloudflare Turnstile Widget */}
                    <div className="form-group">
                        <TurnstileWidget onVerify={setTurnstileToken} />
                    </div>
                    
                    <button type="submit" className="btn w-100" disabled={isLoading || !turnstileToken}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                    {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
                    
                    <div className="text-center mt-3">
                        <p>
                            <a href="/user/forgot-password">Forgot your password?</a>
                        </p>
                        <p>
                            Don't have an account? <a href="/user/register">Register here</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginUser;