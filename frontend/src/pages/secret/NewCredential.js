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
        <div>
            <h2>Add new credential secret</h2>
            <form onSubmit={handleSubmit}>
                <section>
                    <aside>
                        <div>
                            <label>username:</label>
                            <input
                                type="text"
                                value={credentialValues.userName}
                                onChange={(e) =>
                                    setCredentialValues(prevValues => ({...prevValues, userName: e.target.value}))}
                                required
                                placeholder="Please enter username"
                            />
                        </div>
                        <div>
                            <label>password:</label>
                            <input
                                type="password"
                                value={credentialValues.password}
                                onChange={(e) =>
                                    setCredentialValues(prevValues => ({...prevValues, password: e.target.value}))}
                                required
                                placeholder="Please enter password"
                            />
                        </div>
                        <div>
                            <label>url:</label>
                            <input
                                type="text"
                                value={credentialValues.url}
                                onChange={(e) =>
                                    setCredentialValues(prevValues => ({...prevValues, url: e.target.value}))}
                                required
                                placeholder="Please enter url"
                            />
                        </div>
                        <button type="submit">save secret</button>
                        {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
                    </aside>
                </section>
            </form>
        </div>
    );
}

export default NewCredential;
