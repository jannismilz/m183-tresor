/**
 * Fetch methods for two-factor authentication API calls
 */

import { API_URL } from '../config/api';
import { post } from '../utils/apiClient';

/**
 * Verify a two-factor authentication code
 * 
 * @param {Object} verificationData - The verification data
 * @param {number} verificationData.userId - The user ID
 * @param {string} verificationData.code - The verification code
 * @param {string} [verificationData.token] - Optional JWT token for authentication
 * @returns {Promise<Object>} - The response data
 */
export const verifyTwoFactorCode = async (verificationData) => {
    try {
        // Use the post function from apiClient which will automatically include the token
        // if it's available in localStorage or we can pass custom options
        const options = {};
        
        // If a specific token is provided for this request, use it
        if (verificationData.token) {
            options.headers = {
                'Authorization': `Bearer ${verificationData.token}`
            };
        }
        
        const data = await post('2fa/verify-code', {
            userId: verificationData.userId,
            code: verificationData.code
        }, options);
        
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
 * @param {string} [token] - Optional JWT token for authentication
 * @returns {Promise<Object>} - The response data
 */
export const requestNewVerificationCode = async (userId, token) => {
    try {
        // Use the post function from apiClient which will automatically include the token
        // if it's available in localStorage or we can pass custom options
        const options = {};
        
        // If a specific token is provided for this request, use it
        if (token) {
            options.headers = {
                'Authorization': `Bearer ${token}`
            };
        }
        
        const data = await post(`2fa/send-code?userId=${userId}`, {}, options);
        
        console.log('New code requested successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to request new code:', error.message);
        throw error;
    }
};
