import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postSecret } from "../../comunication/FetchSecrets";
import { useAuth } from "../../context/AuthContext";

/**
 * NewCreditCard
 * @author Peter Rutschmann
 */
function NewCreditCard() {
    const { userId } = useAuth();
    const initialState = {
        kindid: 2,
        kind:"creditcard",
        cardtype: "",
        cardnumber: "",
        expiration: "",
        cvv: ""
    };
    const [creditCardValues, setCreditCardValues] = useState(initialState);
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
            const content = creditCardValues;
            await postSecret({ userId, content });
            setCreditCardValues(initialState);
            navigate('/secret/secrets');
        } catch (error) {
            console.error('Failed to create secret:', error.message);
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Add New Credit Card</h2>
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="cardtype">Card Type</label>
                        <select
                            id="cardtype"
                            className="mb-3"
                            value={creditCardValues.cardtype}
                            onChange={(e) =>
                                setCreditCardValues((prevValues) => ({
                                    ...prevValues,
                                    cardtype: e.target.value,
                                }))}
                            required
                        >
                            <option value="" disabled>
                                Select card type
                            </option>
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="cardnumber">Card Number</label>
                        <input
                            id="cardnumber"
                            type="text"
                            value={creditCardValues.cardnumber}
                            onChange={(e) =>
                                setCreditCardValues(prevValues => ({...prevValues, cardnumber: e.target.value}))}
                            required
                            placeholder="Enter card number"
                            className="mb-3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="expiration">Expiration Date (MM/YY)</label>
                        <input
                            id="expiration"
                            type="text"
                            value={creditCardValues.expiration}
                            onChange={(e) =>
                                setCreditCardValues(prevValues => ({...prevValues, expiration: e.target.value}))}
                            required
                            placeholder="MM/YY"
                            className="mb-3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input
                            id="cvv"
                            type="text"
                            value={creditCardValues.cvv}
                            onChange={(e) =>
                                setCreditCardValues(prevValues => ({...prevValues, cvv: e.target.value}))}
                            required
                            placeholder="Enter CVV"
                            className="mb-4"
                        />
                    </div>
                    
                    <div className="d-flex justify-content-between">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/secret/secrets')}>Cancel</button>
                        <button type="submit" className="btn">Save Credit Card</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewCreditCard;
