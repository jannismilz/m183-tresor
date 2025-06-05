import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {postUser} from "../../comunication/FetchUser";
import TurnstileWidget from '../../components/TurnstileWidget';

/**
 * RegisterUser
 * @author Peter Rutschmann
 */
function RegisterUser({loginValues, setLoginValues}) {
    const navigate = useNavigate();

    const initialState = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        errorMessage: ""
    };
    const [credentials, setCredentials] = useState(initialState);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        // Validate password match
        if(credentials.password !== credentials.passwordConfirmation) {
            console.log("password != passwordConfirmation");
            setErrorMessage('Password and password-confirmation are not equal.');
            setIsLoading(false);
            return;
        }
        
        // Validate password strength
        // Password regex explanation:
        // - at least one lowercase letter
        // - at least one uppercase letter
        // - at least one digit
        // - at least one special character
        // - at least 8 characters long
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        
        if(credentials.password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            setIsLoading(false);
            return;
        }
        
        if(!passwordRegex.test(credentials.password)) {
            setErrorMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            setIsLoading(false);
            return;
        }
        
        // Validate Turnstile token
        if (!turnstileToken) {
            setErrorMessage('Please complete the security check');
            setIsLoading(false);
            return;
        }

        try {
            const response = await postUser({
                ...credentials,
                turnstileToken
            });
            console.log('Registration successful:', response);
            
            // Set login values for automatic login after registration
            setLoginValues({email: credentials.email, password: credentials.password});
            setCredentials(initialState);
            
            // Redirect to login page
            navigate('/user/login');
        } catch (error) {
            console.error('Failed to register:', error.message);
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Register Account</h2>
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <div className="form-group w-100">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                id="firstName"
                                type="text"
                                value={credentials.firstName}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, firstName: e.target.value}))}
                                required
                                placeholder="Enter your first name"
                                className="mb-3"
                            />
                        </div>
                        <div className="form-group w-100">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                value={credentials.lastName}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, lastName: e.target.value}))}
                                required
                                placeholder="Enter your last name"
                                className="mb-3"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={credentials.email}
                            onChange={(e) =>
                                setCredentials(prevValues => ({...prevValues, email: e.target.value}))}
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
                            value={credentials.password}
                            onChange={(e) =>
                                setCredentials(prevValues => ({...prevValues, password: e.target.value}))}
                            required
                            placeholder="Create a strong password (min. 8 chars, uppercase, lowercase, number, special char)"
                            className="mb-3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="passwordConfirmation">Confirm Password</label>
                        <input
                            id="passwordConfirmation"
                            type="password"
                            value={credentials.passwordConfirmation}
                            onChange={(e) =>
                                setCredentials(prevValues => ({...prevValues, passwordConfirmation: e.target.value}))}
                            required
                            placeholder="Confirm your password"
                            className="mb-3"
                        />
                    </div>
                    
                    {/* Cloudflare Turnstile Widget */}
                    <div className="form-group">
                        <TurnstileWidget onVerify={setTurnstileToken} />
                    </div>
                    
                    <button type="submit" className="btn w-100" disabled={isLoading || !turnstileToken}>
                        {isLoading ? 'Registering...' : 'Create Account'}
                    </button>
                    
                    <p className="text-center mt-3">Already have an account? <a href="/user/login">Login here</a></p>
                </form>
            </div>
        </div>
    );
}

export default RegisterUser;
