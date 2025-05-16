import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postSecret } from "../../comunication/FetchSecrets";
import { useAuth } from "../../context/AuthContext";

/**
 * NewCredential
 * @author Peter Rutschmann
 */
function NewCredential() {
    const { userId } = useAuth();
    const initialState = {
        kindid: 1,
        kind:"credential",
        userName: "",
        password: "",
        url: ""
    };
    const [credentialValues, setCredentialValues] = useState(initialState);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (!userId) {
            setErrorMessage('You must be logged in to create a secret');
            return;
        }
        
        try {
            const content = credentialValues;
            await postSecret({ userId, content });
            setCredentialValues(initialState);
            navigate('/secret/secrets');
        } catch (error) {
            console.error('Failed to create secret:', error.message);
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Add New Credential</h2>
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={credentialValues.userName}
                            onChange={(e) =>
                                setCredentialValues(prevValues => ({...prevValues, userName: e.target.value}))}
                            required
                            placeholder="Enter the username"
                            className="mb-3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={credentialValues.password}
                            onChange={(e) =>
                                setCredentialValues(prevValues => ({...prevValues, password: e.target.value}))}
                            required
                            placeholder="Enter the password"
                            className="mb-3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="url">Website URL</label>
                        <input
                            id="url"
                            type="url"
                            value={credentialValues.url}
                            onChange={(e) =>
                                setCredentialValues(prevValues => ({...prevValues, url: e.target.value}))}
                            required
                            placeholder="Enter the website URL"
                            className="mb-4"
                        />
                    </div>
                    
                    <div className="d-flex justify-content-between">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/secret/secrets')}>Cancel</button>
                        <button type="submit" className="btn">Save Credential</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewCredential;
