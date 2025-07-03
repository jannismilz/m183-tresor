/**
 * Fetch methods for secret api calls
 * @author Peter Rutschmann
 */

import { post, get } from '../utils/apiClient';
import { API_URL } from '../config/api';

//Post secret to server
export const postSecret = async ({userId, content}) => {
    // We need to send the content as a raw JSON object, not as a JSON string
    // The backend expects the content field to be valid JSON
    try {
        const data = await post('secrets', {
            userId: userId,
            content: JSON.stringify(content)
        });
        
        console.log('Secret successfully posted:', data);
        return data;
    } catch (error) {
        console.error('Error posting secret:', error.message);
        throw new Error('Failed to save secret. ' + error.message);
    }
};

//get all secrets for a user by userId
export const getSecretsforUser = async (userId) => {
    try {
        const data = await get(`secrets/user/${userId}`);
        console.log('Secret successfully got:', data);
        return data;
    } catch (error) {
        console.error('Failed to get secrets:', error.message);
        throw new Error('Failed to get secrets. ' + error.message);
    }
};