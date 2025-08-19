import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import rateLimiter from '../utils/rateLimiter';
import requestDeduplicator from '../utils/requestDeduplicator';

const BroadcastContext = createContext();

export const useBroadcasts = () => {
    const context = useContext(BroadcastContext);
    if (!context) {
        throw new Error('useBroadcasts must be used within a BroadcastProvider');
    }
    return context;
};

export const BroadcastProvider = ({ children }) => {
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastFetchTime, setLastFetchTime] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    // Global broadcast fetching function
    const fetchBroadcasts = useCallback(async (location, force = false) => {
        console.log('📍 BroadcastContext: fetchBroadcasts called with:', { location, force });

        if (!location) {
            console.log('📍 BroadcastContext: No location provided');
            return;
        }

        const now = Date.now();
        const timeSinceLastFetch = lastFetchTime ? now - lastFetchTime : Infinity;
        const minInterval = 5000; // 5 seconds minimum between fetches (reduced for testing)

        // Don't fetch if we recently fetched and this isn't a forced refresh
        if (!force && timeSinceLastFetch < minInterval) {
            console.log(`📍 BroadcastContext: Skipping fetch, last fetch was ${Math.round(timeSinceLastFetch / 1000)}s ago`);
            return;
        }

        const endpoint = '/delivery/broadcast/active';
        const requestKey = `${endpoint}?lat=${location.lat}&lng=${location.lng}`;

        return requestDeduplicator.execute(requestKey, async () => {
            // Check rate limiting
            if (!rateLimiter.canMakeRequest(endpoint)) {
                const waitTime = rateLimiter.getTimeUntilNextRequest(endpoint);
                console.warn(`⚠️ BroadcastContext: Rate limited for ${endpoint}, waiting ${waitTime}ms`);
                // Don't show toast for rate limiting to avoid spam
                return; // Return gracefully instead of throwing error
            }

            setLoading(true);
            try {
                console.log('📡 BroadcastContext: Fetching broadcasts for location:', location);
                const response = await apiService.getActiveBroadcasts(location.lat, location.lng);

                if (response && response.success) {
                    const broadcastsData = response.data?.broadcasts || response.data || [];
                    console.log('📡 BroadcastContext: Received broadcasts:', broadcastsData);
                    setBroadcasts(broadcastsData);
                    setLastFetchTime(now);
                } else {
                    console.warn('📡 BroadcastContext: No broadcasts data in response:', response);
                    setBroadcasts([]);
                }
            } catch (error) {
                console.error('❌ BroadcastContext: Error fetching broadcasts:', error);

                // Handle rate limiting specifically
                if (error.response?.status === 429 || error.message.includes('Rate limited')) {
                    console.warn('⚠️ BroadcastContext: Rate limited, will retry later');
                    // Don't clear broadcasts on rate limit to maintain UI
                } else {
                    setBroadcasts([]);
                }
            } finally {
                setLoading(false);
            }
        });
    }, [lastFetchTime]);

    // Update user location
    const updateLocation = useCallback((location) => {
        setUserLocation(location);
        if (location) {
            fetchBroadcasts(location, true); // Force refresh with new location
        }
    }, [fetchBroadcasts]);

    // Refresh broadcasts
    const refreshBroadcasts = useCallback(() => {
        if (userLocation) {
            return fetchBroadcasts(userLocation, true);
        }
    }, [userLocation, fetchBroadcasts]);

    // Auto-refresh every 2 minutes (reduced frequency)
    useEffect(() => {
        if (!userLocation) return;

        const interval = setInterval(() => {
            fetchBroadcasts(userLocation, false); // Not forced
        }, 120000); // 2 minutes

        return () => clearInterval(interval);
    }, [userLocation, fetchBroadcasts]);

    const value = {
        broadcasts,
        loading,
        userLocation,
        updateLocation,
        refreshBroadcasts,
        fetchBroadcasts
    };

    return (
        <BroadcastContext.Provider value={value}>
            {children}
        </BroadcastContext.Provider>
    );
};
