/**
 * Fetch methods for user api calls
 * @author Peter Rutschmann
 */

import { get, post } from '../utils/apiClient';

export const getUsers = async () => {
    try {
        const data = await get('users');
        console.log('Users successfully retrieved:', data);
        return data;
    } catch (error) {
        console.error('Failed to get users:', error.message);
        throw new Error('Failed to get users. ' + error.message);
    }
}

export const postUser = async (content) => {
    try {
        const data = await post('users', {
            firstName: content.firstName,
            lastName: content.lastName,
            email: content.email,
            password: content.password,
            passwordConfirmation: content.passwordConfirmation,
            turnstileToken: content.turnstileToken // Include Turnstile token
        });
        
        console.log('User successfully registered:', data);
        return data;
    } catch (error) {
        console.error('Failed to register user:', error.message);
        throw new Error('Failed to save user. ' + error.message);
    }
};

export const loginUser = async (credentials) => {
    try {
        // For login, we use direct fetch to avoid authentication headers
        // since the user is not authenticated yet
        const data = await post('users/login', {
            email: credentials.email,
            password: credentials.password,
            turnstileToken: credentials.turnstileToken // Include Turnstile token
        });
        
        console.log('Login successful:', data);
        return data;
    } catch (error) {
        console.error('Login failed:', error.message);
        throw error;
    }
};