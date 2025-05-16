import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postSecret } from "../../comunication/FetchSecrets";
import { useAuth } from "../../context/AuthContext";

/**
 * NewNote
 * @author Peter Rutschmann
 */
function NewNote() {
    const { userId } = useAuth();
    const initialState = {
        kindid: 3,
        kind:"note",
        title: "",
        content: "",
    };
    const [noteValues, setNoteValues] = useState(initialState);
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
            const content = noteValues;
            await postSecret({ userId, content });
            setNoteValues(initialState);
            navigate('/secret/secrets');
        } catch (error) {
            console.error('Failed to create secret:', error.message);
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Add New Note</h2>
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            id="title"
                            type="text"
                            value={noteValues.title}
                            onChange={(e) =>
                                setNoteValues(prevValues => ({...prevValues, title: e.target.value}))}
                            required
                            placeholder="Enter note title"
                            className="mb-3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea
                            id="content"
                            rows={6}
                            style={{
                                resize: 'vertical',
                                minHeight: '120px',
                            }}
                            value={noteValues.content}
                            onChange={(e) =>
                                setNoteValues(prevValues =>
                                    ({...prevValues, content: e.target.value}))}
                            required
                            placeholder="Enter note content"
                            className="mb-4"
                        />
                    </div>
                    
                    <div className="d-flex justify-content-between">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/secret/secrets')}>Cancel</button>
                        <button type="submit" className="btn">Save Note</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewNote;
