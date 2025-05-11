import '../../App.css';
import React, {useEffect, useState} from 'react';
import {getSecretsforUser} from "../../comunication/FetchSecrets";
import { useAuth } from "../../context/AuthContext";

/**
 * Secrets
 * @author Peter Rutschmann
 */
const Secrets = () => {
    const { userId, isAuthenticated } = useAuth();
    const [secrets, setSecrets] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSecrets = async () => {
            setErrorMessage('');
            setLoading(true);
            
            if (!isAuthenticated || !userId) {
                console.error('Secrets: Not authenticated, please login first');
                setErrorMessage("You must be logged in to view secrets.");
                setLoading(false);
                return;
            }
            
            try {
                const data = await getSecretsforUser(userId);
                console.log('Fetched secrets:', data);
                setSecrets(data);
            } catch (error) {
                console.error('Failed to fetch secrets:', error.message);
                setErrorMessage(error.message || 'Failed to fetch secrets');
            } finally {
                setLoading(false);
            }
        };
        
        fetchSecrets();
    }, [userId, isAuthenticated]);

    return (
        <>
            <h1>My Secrets</h1>
            {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
            {loading ? <p>Loading secrets...</p> : (
            <form>
                <h2>secrets</h2>
                <table border="1">
                    <thead>
                    <tr>
                        <th>secret id</th>
                        <th>user id</th>
                        <th>content</th>
                    </tr>
                    </thead>
                    <tbody>
                    {secrets?.length > 0 ? (
                        secrets.map(secret => (
                            <tr key={secret.id}>
                                <td>{secret.id}</td>
                                <td>{secret.userId}</td>
                                <td>
                                    <pre>{JSON.stringify(secret.content, null, 2)}</pre>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No secrets available</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </form>
            )}
        </>
    );
};

export default Secrets;