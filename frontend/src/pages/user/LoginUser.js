import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { loginUser } from '../../comunication/FetchUser';
import { useAuth } from '../../context/AuthContext';
import TurnstileWidget from '../../components/TurnstileWidget';
import { getGoogleOAuthURL } from '../../utils/googleAuth';

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
                
                // Store the JWT token for the 2FA process if available
                if (response.token) {
                    // We'll use this token for the 2FA verification
                    localStorage.setItem('tempAuthToken', response.token);
                }
                
                // Redirect to 2FA verification page with userId
                navigate('/two-factor-verification', { 
                    state: { userId: response.userId, email: loginValues.email } 
                });
                return;
            }
            
            // If no 2FA required (shouldn't happen as per requirements)
            login({
                userId: response.userId,
                email: loginValues.email,
                token: response.token // Include the JWT token
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
                    
                    <div className="text-center my-3">
                        <div className="d-flex align-items-center justify-content-center">
                            <hr className="flex-grow-1" />
                            <span className="mx-2 text-muted">OR</span>
                            <hr className="flex-grow-1" />
                        </div>
                    </div>
                    
                    <button 
                        type="button" 
                        className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                        onClick={() => window.location.href = getGoogleOAuthURL()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google me-2" viewBox="0 0 16 16">
                            <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                        </svg>
                        Sign in with Google
                    </button>
                    
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