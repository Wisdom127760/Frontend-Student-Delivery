import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from './Snackbar';

const SnackbarContext = createContext();

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};

export const SnackbarProvider = ({ children }) => {
    const [snackbars, setSnackbars] = useState([]);

    const showSnackbar = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        const newSnackbar = { id, message, type, duration };
        
        setSnackbars(prev => [...prev, newSnackbar]);
        
        return id;
    }, []);

    const hideSnackbar = useCallback((id) => {
        setSnackbars(prev => prev.filter(snackbar => snackbar.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration) => {
        return showSnackbar(message, 'success', duration);
    }, [showSnackbar]);

    const showError = useCallback((message, duration) => {
        return showSnackbar(message, 'error', duration);
    }, [showSnackbar]);

    const showWarning = useCallback((message, duration) => {
        return showSnackbar(message, 'warning', duration);
    }, [showSnackbar]);

    const showInfo = useCallback((message, duration) => {
        return showSnackbar(message, 'info', duration);
    }, [showSnackbar]);

    return (
        <SnackbarContext.Provider value={{
            showSnackbar,
            showSuccess,
            showError,
            showWarning,
            showInfo,
            hideSnackbar
        }}>
            {children}
            
            {/* Render snackbars */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {snackbars.map((snackbar, index) => (
                    <div
                        key={snackbar.id}
                        style={{
                            transform: `translateY(${index * 80}px)`,
                            zIndex: 1000 - index
                        }}
                    >
                        <Snackbar
                            message={snackbar.message}
                            type={snackbar.type}
                            duration={snackbar.duration}
                            onClose={() => hideSnackbar(snackbar.id)}
                        />
                    </div>
                ))}
            </div>
        </SnackbarContext.Provider>
    );
};
