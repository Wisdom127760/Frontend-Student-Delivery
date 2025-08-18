import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        return id;
    }, []);

    const hideToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration) => {
        return showToast(message, 'success', duration);
    }, [showToast]);

    const showError = useCallback((message, duration) => {
        return showToast(message, 'error', duration);
    }, [showToast]);

    const showWarning = useCallback((message, duration) => {
        return showToast(message, 'warning', duration);
    }, [showToast]);

    const showInfo = useCallback((message, duration) => {
        return showToast(message, 'info', duration);
    }, [showToast]);

    const value = {
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideToast
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-8 right-8 z-50 space-y-2">
                {toasts.map((toast, index) => (
                    <div
                        key={toast.id}
                        style={{
                            transform: `translateY(${index * 20}px)`,
                            zIndex: 1000 - index
                        }}
                    >
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={() => hideToast(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
