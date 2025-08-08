// services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem('token');

        // If no token in localStorage, use test token for demo
        if (!token) {
            token = 'test-token-for-demo';
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log('🔍 API Request:', config.method?.toUpperCase(), config.url);
        console.log('🔍 Authorization:', config.headers.Authorization);

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log('🔍 API Response:', response.status, response.config.url);
        return response.data;
    },
    (error) => {
        console.log('🔍 API Error:', error.response?.status, error.config?.url, error.response?.data);

        // Handle different error types
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - clear auth data and redirect to login
                    console.error('401 Unauthorized error:', data);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    break;

                case 403:
                    toast.error('You do not have permission to perform this action');
                    break;

                case 404:
                    toast.error('Resource not found');
                    break;

                case 429:
                    toast.error('Too many requests. Please try again later.');
                    break;

                case 500:
                    toast.error('Server error. Please try again later.');
                    break;

                default:
                    // Show specific error message if available
                    if (data?.error) {
                        toast.error(data.error);
                    } else {
                        toast.error('An unexpected error occurred');
                    }
            }
        } else if (error.request) {
            // Network error
            toast.error('Network error. Please check your connection.');
        } else {
            // Other error
            toast.error('An unexpected error occurred');
        }

        return Promise.reject(error);
    }
);

export default api;