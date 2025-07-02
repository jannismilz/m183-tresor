/**
 * Fetch methods for two-factor authentication API calls
 */

import { API_URL } from '../config/api';

/**
 * Verify a two-factor authentication code
 * 
 * @param {Object} verificationData - The verification data
 * @param {number} verificationData.userId - The user ID
 * @param {string} verificationData.code - The verification code
 * @returns {Promise<Object>} - The response data
 */
export const verifyTwoFactorCode = async (verificationData) => {
    try {
        const response = await fetch(`${API_URL}/api/2fa/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: verificationData.userId,
                code: verificationData.code
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Verification failed');
        }

        const data = await response.json();
        console.log('Verification successful:', data);
        return data;
    } catch (error) {
        console.error('Verification failed:', error.message);
        throw error;
    }
};

/**
 * Request a new verification code to be sent
 * 
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} - The response data
 */
export const requestNewVerificationCode = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/api/2fa/send-code?userId=${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send verification code');
        }

        const data = await response.json();
        console.log('New code requested successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to request new code:', error.message);
        throw error;
    }
};
