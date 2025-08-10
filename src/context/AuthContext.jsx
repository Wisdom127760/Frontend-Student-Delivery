import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Global flag to prevent multiple initializations across component re-mounts
let globalInitialized = false;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionWarning, setSessionWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const navigate = useNavigate();

    // Session timeout settings (2 hours)
    const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning

    // Define protected routes that should not trigger logout redirects
    const isProtectedRoute = useCallback((path) => {
        const protectedPaths = [
            '/verify-otp',
            '/admin',
            '/driver',
            '/test-otp' // Include test routes
        ];
        return protectedPaths.some(protectedPath => path.startsWith(protectedPath));
    }, []);

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

    const logout = useCallback((showToast = true, forceRedirect = false) => {
        console.log('🚪 Logout called');

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('driverProfile'); // Clear saved profile data
        setUser(null);
        setIsAuthenticated(false);
        setSessionWarning(false);
        setTimeLeft(0);

        // Reset global flag to allow re-initialization on next login
        globalInitialized = false;

        const currentPath = window.location.pathname;
        const shouldRedirect = forceRedirect || !isProtectedRoute(currentPath);

        console.log('🚪 Current path:', currentPath);
        console.log('🚪 Is protected route:', isProtectedRoute(currentPath));
        console.log('🚪 Force redirect:', forceRedirect);
        console.log('🚪 Should redirect:', shouldRedirect);

        if (shouldRedirect) {
            console.log('🚪 Redirecting to login');
            navigate('/');
        } else {
            console.log('🚪 Not redirecting - user is on protected page');
        }

        if (showToast) {
            toast.success('Logged out successfully');
        }
    }, [navigate, isProtectedRoute]);

    const login = useCallback(async (email, otp, userType) => {
        try {
            console.log(`🔑 Logging in with OTP for ${email} as ${userType}`);

            const response = await apiService.verifyOTP(email, userType, otp);

            console.log('✅ Login successful:', response);

            const { user: userData, token } = response.data || response;

            if (!token || !userData) {
                console.error('❌ Missing token or user data');
                throw new Error('Invalid response from server');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            updateLastActivity();

            setUser(userData);
            setIsAuthenticated(true);

            console.log('✅ Auth state updated successfully');

            return userData;
        } catch (error) {
            console.error('❌ Login failed:', error);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    }, [updateLastActivity]);

    const sendOTP = useCallback(async (email, userType) => {
        try {
            console.log(`📧 Sending OTP to ${email} for ${userType}`);

            const response = await apiService.sendOTP(email, userType);

            console.log('✅ OTP sent successfully');
            return response;
        } catch (error) {
            console.error('❌ Failed to send OTP:', error);
            throw new Error(error.response?.data?.message || 'Failed to send OTP');
        }
    }, []);

    // Function to update profile data
    const updateProfile = useCallback((profileData) => {
        console.log('🔄 Updating profile data in AuthContext:', profileData);
        setProfile(profileData);

        // Also update user object with profile image if available
        if (profileData?.profileImage && user) {
            setUser(prevUser => ({
                ...prevUser,
                profileImage: profileData.profileImage
            }));
        }
    }, [user]);

    // Initialize session once on mount - using global flag to prevent duplicates
    useEffect(() => {
        if (globalInitialized) {
            console.log('⚡ Auth already initialized globally, skipping...');
            setIsLoading(false);
            return;
        }

        const initializeSession = () => {
            console.log('🔄 Initializing auth session (ONCE)...');
            globalInitialized = true; // Set global flag immediately

            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (savedToken && savedUser && isSessionValid()) {
                try {
                    const userData = JSON.parse(savedUser);
                    console.log('✅ Restoring valid session for:', userData.email);

                    setUser(userData);
                    setIsAuthenticated(true);
                    updateLastActivity();
                } catch (error) {
                    console.error('❌ Error parsing saved user data:', error);
                    // Clear invalid data but don't redirect if on protected route
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('lastActivity');
                }
            } else {
                console.log('ℹ️ No valid session found');
                // Clear any invalid data but don't redirect if on protected route
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('lastActivity');
            }

            setIsLoading(false);
        };

        initializeSession();
    }, [isSessionValid, updateLastActivity]); // Include dependencies

    // Session timeout monitoring (re-enabled with better logic)
    useEffect(() => {
        if (!isAuthenticated || !globalInitialized) return;

        console.log('🕒 Starting session timeout monitoring...');

        const checkSessionTimeout = () => {
            const lastActivity = localStorage.getItem('lastActivity');
            if (!lastActivity) return;

            const now = Date.now();
            const timeSinceLastActivity = now - parseInt(lastActivity);
            const remainingTime = SESSION_TIMEOUT - timeSinceLastActivity;

            if (remainingTime <= 0) {
                console.log('⏰ Session expired - logging out');
                logout(true, true); // Force redirect on session timeout
            } else if (remainingTime <= WARNING_TIME && !sessionWarning) {
                console.log('⚠️ Session warning - showing timeout warning');
                setSessionWarning(true);
                setTimeLeft(Math.ceil(remainingTime / 1000));
            }
        };

        const interval = setInterval(checkSessionTimeout, 30000); // Check every 30 seconds instead of every second
        return () => clearInterval(interval);
    }, [isAuthenticated, logout, sessionWarning, SESSION_TIMEOUT, WARNING_TIME]);

    // Activity listeners (optimized)
    useEffect(() => {
        if (!isAuthenticated || !globalInitialized) return;

        const handleActivity = () => {
            resetInactivityTimer();
        };

        // Throttle activity updates to prevent excessive calls
        let lastUpdate = 0;
        const throttledHandleActivity = () => {
            const now = Date.now();
            if (now - lastUpdate > 60000) { // Update at most once per minute
                lastUpdate = now;
                handleActivity();
            }
        };

        const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, throttledHandleActivity, true);
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, throttledHandleActivity, true);
            });
        };
    }, [isAuthenticated, resetInactivityTimer]);

    const value = {
        user,
        profile,
        isAuthenticated,
        isLoading,
        login,
        logout,
        sendOTP,
        updateProfile,
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