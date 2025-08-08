import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionWarning, setSessionWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const navigate = useNavigate();

    // Session timeout settings (2 hours)
    const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning

    const isSessionValid = useCallback(() => {
        const token = localStorage.getItem('token');
        const lastActivity = localStorage.getItem('lastActivity');

        if (!token || !lastActivity) return false;

        const now = Date.now();
        const timeSinceLastActivity = now - parseInt(lastActivity);

        return timeSinceLastActivity < SESSION_TIMEOUT;
    }, [SESSION_TIMEOUT]);

    const updateLastActivity = useCallback(() => {
        localStorage.setItem('lastActivity', Date.now().toString());
    }, []);

    const resetInactivityTimer = useCallback(() => {
        updateLastActivity();
        setSessionWarning(false);
        setTimeLeft(0);
    }, [updateLastActivity]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
        setUser(null);
        setIsAuthenticated(false);
        setSessionWarning(false);
        setTimeLeft(0);
        navigate('/');
        toast.success('Logged out successfully');
    }, [navigate]);

    const login = useCallback(async (email, otp, userType) => {
        try {
            // Simulate API call for demo
            const mockUser = {
                id: '1',
                name: userType === 'admin' ? 'Administrator' : 'Driver',
                email: email,
                role: userType,
                profileImage: null
            };

            const mockToken = 'demo-token-' + Date.now();

            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            updateLastActivity();

            setUser(mockUser);
            setIsAuthenticated(true);

            return mockUser;
        } catch (error) {
            throw new Error('Login failed');
        }
    }, [updateLastActivity]);

    const sendOTP = useCallback(async (email, userType) => {
        try {
            // Simulate OTP sending
            console.log(`Sending OTP to ${email} for ${userType}`);
            return { success: true };
        } catch (error) {
            throw new Error('Failed to send OTP');
        }
    }, []);

    // Check session validity on mount and restore if valid
    useEffect(() => {
        const checkSession = () => {
            if (isSessionValid()) {
                const savedUser = localStorage.getItem('user');
                const savedToken = localStorage.getItem('token');

                if (savedUser && savedToken) {
                    try {
                        const userData = JSON.parse(savedUser);
                        setUser(userData);
                        setIsAuthenticated(true);
                        updateLastActivity();
                    } catch (error) {
                        console.error('Error parsing saved user data:', error);
                        logout();
                    }
                }
            } else {
                logout();
            }
            setIsLoading(false);
        };

        checkSession();
    }, [isSessionValid, logout, updateLastActivity]);

    // Session timeout monitoring
    useEffect(() => {
        if (!isAuthenticated) return;

        const checkSessionTimeout = () => {
            const lastActivity = localStorage.getItem('lastActivity');
            if (!lastActivity) return;

            const now = Date.now();
            const timeSinceLastActivity = now - parseInt(lastActivity);
            const remainingTime = SESSION_TIMEOUT - timeSinceLastActivity;

            if (remainingTime <= 0) {
                logout();
            } else if (remainingTime <= WARNING_TIME) {
                setSessionWarning(true);
                setTimeLeft(Math.ceil(remainingTime / 1000)); // Convert to seconds
            }
        };

        const interval = setInterval(checkSessionTimeout, 1000);
        return () => clearInterval(interval);
    }, [isAuthenticated, logout, SESSION_TIMEOUT, WARNING_TIME]);

    // Activity listeners
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleActivity = () => {
            resetInactivityTimer();
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, handleActivity, true);
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity, true);
            });
        };
    }, [isAuthenticated, resetInactivityTimer]);

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        sendOTP,
        sessionWarning,
        timeLeft,
        resetInactivityTimer
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};