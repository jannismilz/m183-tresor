import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {postUser} from "../../comunication/FetchUser";

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
        if(credentials.password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await postUser(credentials);
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
        <div>
            <h2>Register user</h2>
            <form onSubmit={handleSubmit}>
                <section>
                <aside>
                    <div>
                        <label>Firstname:</label>
                        <input
                            type="text"
                            value={credentials.firstName}
                            onChange={(e) =>
                                setCredentials(prevValues => ({...prevValues, firstName: e.target.value}))}
                            required
                            placeholder="Please enter your firstname *"
                        />
                    </div>
                    <div>
                        <label>Lastname:</label>
                        <input
                            type="text"
                            value={credentials.lastName}
                            onChange={(e) =>
                                setCredentials(prevValues => ({...prevValues, lastName: e.target.value}))}
                            required
                            placeholder="Please enter your lastname *"
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="text"
                            value={credentials.email}
                            onChange={(e) =>
                                setCredentials(prevValues => ({...prevValues, email: e.target.value}))}
                            required
                            placeholder="Please enter your email"
                        />
                    </div>
                </aside>
                    <aside>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, password: e.target.value}))}
                                required
                                placeholder="Please enter your pwd *"
                            />
                        </div>
                        <div>
                            <label>Password confirmation:</label>
                            <input
                                type="password"
                                value={credentials.passwordConfirmation}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, passwordConfirmation: e.target.value}))}
                                required
                                placeholder="Please confirm your pwd *"
                            />
                        </div>
                    </aside>
                </section>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <p>Already have an account? <a href="/user/login">Login here</a></p>
            </form>
        </div>
    );
}

export default RegisterUser;
