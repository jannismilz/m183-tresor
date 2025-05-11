import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { loginUser } from '../../comunication/FetchUser';
import { useAuth } from '../../context/AuthContext';

/**
 * LoginUser
 * @author Peter Rutschmann
 */
function LoginUser({loginValues, setLoginValues}) {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);
        
        try {
            const response = await loginUser(loginValues);
            // Use the login function from AuthContext
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
        <div>
            <h2>Login user</h2>
            <form onSubmit={handleSubmit}>
                <section>
                    <aside>
                        <div>
                            <label>Email:</label>
                            <input
                                type="text"
                                value={loginValues.email}
                                onChange={(e) =>
                                    setLoginValues(prevValues => ({...prevValues, email: e.target.value}))}
                                required
                                placeholder="Please enter your email *"
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                value={loginValues.password}
                                onChange={(e) =>
                                    setLoginValues(prevValues => ({...prevValues, password: e.target.value}))}
                                required
                                placeholder="Please enter your password *"
                            />
                        </div>
                    </aside>
                </section>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </form>
        </div>
    );
}

export default LoginUser;