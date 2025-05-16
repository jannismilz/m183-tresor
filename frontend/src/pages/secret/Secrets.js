import '../../App.css';
import React, {useEffect, useState} from 'react';
import {getSecretsforUser} from "../../comunication/FetchSecrets";
import { useAuth } from "../../context/AuthContext";
import { Link } from 'react-router-dom';

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

    // Helper function to parse the content
    const parseContent = (content) => {
        if (typeof content === 'string') {
            try {
                return JSON.parse(content);
            } catch (e) {
                console.error('Failed to parse content:', e);
                return content;
            }
        }
        return content;
    };

    // Render credential card
    const renderCredentialCard = (content, secretId) => {
        const parsedContent = parseContent(content);
        return (
            <div className="card mb-4" key={secretId}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="card-title mb-0">Login Credential</h3>
                        <span className="p-2" style={{ color: '#000', fontWeight: '500' }}>ID: {secretId}</span>
                    </div>
                    <div className="d-flex gap-3 mb-2">
                        <div style={{ flex: '1' }}>
                            <p className="mb-1" style={{ color: '#6c757d', fontSize: '0.875rem' }}>Username</p>
                            <p className="mb-3" style={{ fontWeight: '500' }}>{parsedContent.userName}</p>
                        </div>
                        <div style={{ flex: '1' }}>
                            <p className="mb-1" style={{ color: '#6c757d', fontSize: '0.875rem' }}>Password</p>
                            <p className="mb-3" style={{ fontWeight: '500' }}>••••••••</p>
                        </div>
                    </div>
                    <div>
                        <p className="mb-1" style={{ color: '#6c757d', fontSize: '0.875rem' }}>Website</p>
                        <a href={parsedContent.url} target="_blank" rel="noopener noreferrer" className="d-block mb-3">{parsedContent.url}</a>
                    </div>
                </div>
            </div>
        );
    };

    // Render credit card
    const renderCreditCard = (content, secretId) => {
        const parsedContent = parseContent(content);
        return (
            <div className="card mb-4" key={secretId}>
                <div className="card-body" style={{ background: 'linear-gradient(135deg, #3f37c9 0%, #4cc9f0 100%)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="card-title mb-0" style={{ color: 'white' }}>Credit Card</h3>
                        <span className="p-2" style={{ color: 'white', fontWeight: '500' }}>ID: {secretId}</span>
                    </div>
                    <div style={{ color: 'white' }}>
                        <p className="mb-1" style={{ fontSize: '0.875rem', opacity: 0.8 }}>Card Number</p>
                        <p className="mb-3" style={{ fontWeight: '500', letterSpacing: '2px', fontSize: '1.25rem' }}>
                            •••• •••• •••• {parsedContent.cardnumber.slice(-4)}
                        </p>
                    </div>
                    <div className="d-flex gap-3 mb-3" style={{ color: 'white' }}>
                        <div style={{ flex: '1' }}>
                            <p className="mb-1" style={{ fontSize: '0.875rem', opacity: 0.8 }}>Expiration</p>
                            <p className="mb-0" style={{ fontWeight: '500' }}>{parsedContent.expiration}</p>
                        </div>
                        <div style={{ flex: '1' }}>
                            <p className="mb-1" style={{ fontSize: '0.875rem', opacity: 0.8 }}>CVV</p>
                            <p className="mb-0" style={{ fontWeight: '500' }}>•••</p>
                        </div>
                        <div style={{ flex: '1' }}>
                            <p className="mb-1" style={{ fontSize: '0.875rem', opacity: 0.8 }}>Type</p>
                            <p className="mb-0" style={{ fontWeight: '500' }}>{parsedContent.cardtype}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render note
    const renderNote = (content, secretId) => {
        const parsedContent = parseContent(content);
        return (
            <div className="card mb-4" key={secretId}>
                <div className="card-body" style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #fbbf24' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="card-title mb-0">{parsedContent.title}</h3>
                        <span className="p-2" style={{ color: '#000', fontWeight: '500' }}>ID: {secretId}</span>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.375rem', minHeight: '100px' }}>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{parsedContent.content}</p>
                    </div>
                </div>
            </div>
        );
    };

    // Determine which type of secret to render
    const renderSecret = (secret) => {
        const content = parseContent(secret.content);
        
        if (content.kindid === 1 || content.kind === 'credential') {
            return renderCredentialCard(content, secret.id);
        } else if (content.kindid === 2 || content.kind === 'creditcard') {
            return renderCreditCard(content, secret.id);
        } else if (content.kindid === 3 || content.kind === 'note') {
            return renderNote(content, secret.id);
        } else {
            // Fallback for unknown types
            return (
                <div className="card mb-4" key={secret.id}>
                    <div className="card-body">
                        <h3 className="card-title">Unknown Secret Type</h3>
                        <pre>{JSON.stringify(content, null, 2)}</pre>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="card-title mb-0">My Secrets</h1>
                    <div className="d-flex gap-3">
                        <Link 
                            to="/secret/newcredential" 
                            className="btn btn-sm" 
                            style={{ 
                                backgroundColor: '#4361ee', 
                                color: 'white',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#3a53d0';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#4361ee';
                                e.currentTarget.style.color = 'white';
                            }}
                        >
                            New Credential
                        </Link>
                        <Link 
                            to="/secret/newcreditcard" 
                            className="btn btn-sm" 
                            style={{ 
                                backgroundColor: '#3f37c9', 
                                color: 'white',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#332ca6';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#3f37c9';
                                e.currentTarget.style.color = 'white';
                            }}
                        >
                            New Credit Card
                        </Link>
                        <Link 
                            to="/secret/newnote" 
                            className="btn btn-sm" 
                            style={{ 
                                backgroundColor: '#fbbf24', 
                                color: 'white',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#e5ac1c';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#fbbf24';
                                e.currentTarget.style.color = 'white';
                            }}
                        >
                            New Note
                        </Link>
                    </div>
                </div>
                
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                
                {loading ? (
                    <div className="d-flex align-items-center justify-content-center p-5">
                        <p>Loading your secrets...</p>
                    </div>
                ) : (
                    <div>
                        {secrets?.length > 0 ? (
                            <div>
                                {secrets.map(secret => renderSecret(secret))}
                            </div>
                        ) : (
                            <div className="text-center p-5">
                                <p>No secrets available. Create your first secret using the buttons above.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Secrets;