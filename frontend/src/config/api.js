/**
 * API URL configuration
 */

const protocol = process.env.REACT_APP_API_PROTOCOL || 'http'; 
const host = process.env.REACT_APP_API_HOST || 'localhost';
const port = process.env.REACT_APP_API_PORT || '8080';
const path = process.env.REACT_APP_API_PATH || '/api';
const portPart = port ? `:${port}` : '';

export const API_URL = `${protocol}://${host}${portPart}`;
