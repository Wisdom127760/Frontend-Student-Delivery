import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Toaster } from 'react-hot-toast';
import './utils/globalToast'; // Import to make toast available globally

// Global error handlers
const handleUnhandledRejection = (event) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);

    // Show toast notification for unhandled promise rejections
    if (typeof window !== 'undefined' && window.toast) {
        window.toast.error('An unexpected error occurred. Please try again.', {
            duration: 6000,
        });
    }

    // Prevent the default browser behavior
    event.preventDefault();
};

const handleGlobalError = (event) => {
    console.error('🚨 Global Error:', event.error);

    // Show toast notification for global errors
    if (typeof window !== 'undefined' && window.toast) {
        window.toast.error('A system error occurred. Please refresh the page.', {
            duration: 6000,
        });
    }
};

// Add global error handlers
window.addEventListener('unhandledrejection', handleUnhandledRejection);
window.addEventListener('error', handleGlobalError);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#ffffff',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                },
                success: {
                    duration: 3000,
                    style: {
                        background: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                    },
                    iconTheme: {
                        primary: '#16a34a',
                        secondary: '#ffffff',
                    },
                },
                error: {
                    duration: 5000,
                    style: {
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                    },
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                    },
                },
                loading: {
                    style: {
                        background: '#f0f9ff',
                        color: '#0369a1',
                        border: '1px solid #bae6fd',
                    },
                    iconTheme: {
                        primary: '#0ea5e9',
                        secondary: '#ffffff',
                    },
                },
            }}
        />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
