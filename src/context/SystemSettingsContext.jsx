import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import systemSettingsService from '../services/systemSettingsService';

const SystemSettingsContext = createContext();

export const useSystemSettings = () => {
    const context = useContext(SystemSettingsContext);
    if (!context) {
        throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
    }
    return context;
};

export const SystemSettingsProvider = ({ children }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        public: null,
        driver: null,
        admin: null
    });
    const [loading, setLoading] = useState({
        public: false,
        driver: false,
        admin: false
    });
    const [error, setError] = useState(null);

    // Load public settings (no auth required)
    const loadPublicSettings = useCallback(async () => {
        if (loading.public) return;

        setLoading(prev => ({ ...prev, public: true }));
        setError(null);

        try {
            const response = await systemSettingsService.getPublicSettings();
            setSettings(prev => ({ ...prev, public: response.data }));
        } catch (error) {
            console.error('Error loading public settings:', error);
            setError('Failed to load public settings');
        } finally {
            setLoading(prev => ({ ...prev, public: false }));
        }
    }, [loading.public]);

    // Load driver settings (driver auth required)
    const loadDriverSettings = useCallback(async () => {
        if (!user || user.userType !== 'driver' || loading.driver) return;

        setLoading(prev => ({ ...prev, driver: true }));
        setError(null);

        try {
            const response = await systemSettingsService.getDriverSettings();
            setSettings(prev => ({ ...prev, driver: response.data }));
        } catch (error) {
            console.error('Error loading driver settings:', error);
            setError('Failed to load driver settings');
        } finally {
            setLoading(prev => ({ ...prev, driver: false }));
        }
    }, [user, loading.driver]);

    // Load admin settings (admin auth required)
    const loadAdminSettings = useCallback(async () => {
        if (!user || (user.userType !== 'admin' && user.userType !== 'super_admin') || loading.admin) return;

        setLoading(prev => ({ ...prev, admin: true }));
        setError(null);

        try {
            const response = await systemSettingsService.getAdminSettings();
            setSettings(prev => ({ ...prev, admin: response.data }));
        } catch (error) {
            console.error('Error loading admin settings:', error);
            setError('Failed to load admin settings');
        } finally {
            setLoading(prev => ({ ...prev, admin: false }));
        }
    }, [user, loading.admin]);

    // Update admin settings
    const updateAdminSettings = useCallback(async (updates) => {
        if (!user || (user.userType !== 'admin' && user.userType !== 'super_admin')) {
            throw new Error('Admin access required');
        }

        try {
            const response = await systemSettingsService.updateAdminSettings(updates);
            setSettings(prev => ({ ...prev, admin: response.data }));
            return response;
        } catch (error) {
            console.error('Error updating admin settings:', error);
            throw error;
        }
    }, [user]);

    // Update specific settings category
    const updateSettingsCategory = useCallback(async (category, categorySettings) => {
        if (!user || (user.userType !== 'admin' && user.userType !== 'super_admin')) {
            throw new Error('Admin access required');
        }

        try {
            const response = await systemSettingsService.updateSettingsCategory(category, categorySettings);
            setSettings(prev => ({ ...prev, admin: response.data }));
            return response;
        } catch (error) {
            console.error(`Error updating ${category} settings:`, error);
            throw error;
        }
    }, [user]);

    // Get setting value with fallback
    const getSetting = useCallback((category, key, defaultValue = null) => {
        // Try admin settings first
        if (settings.admin && settings.admin[category] && settings.admin[category][key] !== undefined) {
            return settings.admin[category][key];
        }

        // Try driver settings
        if (settings.driver && settings.driver[category] && settings.driver[category][key] !== undefined) {
            return settings.driver[category][key];
        }

        // Try public settings
        if (settings.public && settings.public[category] && settings.public[category][key] !== undefined) {
            return settings.public[category][key];
        }

        return defaultValue;
    }, [settings]);

    // Format currency based on settings
    const formatCurrency = useCallback(async (amount) => {
        try {
            return await systemSettingsService.formatCurrency(amount);
        } catch (error) {
            console.error('Error formatting currency:', error);
            return `$${amount.toFixed(2)}`; // Default fallback
        }
    }, []);

    // Check if maintenance mode is enabled
    const isMaintenanceMode = useCallback(() => {
        return getSetting('system', 'maintenanceMode', false);
    }, [getSetting]);

    // Check if new registrations are allowed
    const areNewRegistrationsAllowed = useCallback(() => {
        return getSetting('system', 'allowNewRegistrations', true);
    }, [getSetting]);

    // Get currency
    const getCurrency = useCallback(() => {
        return getSetting('display', 'currency', 'TRY');
    }, [getSetting]);

    // Get language
    const getLanguage = useCallback(() => {
        return getSetting('display', 'language', 'en');
    }, [getSetting]);

    // Get timezone
    const getTimezone = useCallback(() => {
        return getSetting('display', 'timezone', 'Europe/Istanbul');
    }, [getSetting]);

    // Get commission rate
    const getCommissionRate = useCallback(() => {
        return getSetting('earnings', 'commissionRate', 80);
    }, [getSetting]);

    // Get minimum payout
    const getMinimumPayout = useCallback(() => {
        return getSetting('earnings', 'minimumPayout', 100);
    }, [getSetting]);

    // Get max delivery distance
    const getMaxDeliveryDistance = useCallback(() => {
        return getSetting('delivery', 'maxDeliveryDistance', 50);
    }, [getSetting]);

    // Get delivery time estimate
    const getDeliveryTimeEstimate = useCallback(() => {
        return getSetting('delivery', 'deliveryTimeEstimate', 30);
    }, [getSetting]);

    // Load settings based on user type
    useEffect(() => {
        // Always load public settings
        loadPublicSettings();

        // Load role-specific settings
        if (user) {
            if (user.userType === 'driver') {
                loadDriverSettings();
            } else if (user.userType === 'admin' || user.userType === 'super_admin') {
                loadAdminSettings();
            }
        }
    }, [user, loadPublicSettings, loadDriverSettings, loadAdminSettings]);

    // Refresh settings
    const refreshSettings = useCallback(async () => {
        await Promise.all([
            loadPublicSettings(),
            user?.userType === 'driver' ? loadDriverSettings() : Promise.resolve(),
            (user?.userType === 'admin' || user?.userType === 'super_admin') ? loadAdminSettings() : Promise.resolve()
        ]);
    }, [user, loadPublicSettings, loadDriverSettings, loadAdminSettings]);

    const value = {
        // Settings data
        settings,
        loading,
        error,

        // Loading functions
        loadPublicSettings,
        loadDriverSettings,
        loadAdminSettings,
        refreshSettings,

        // Update functions
        updateAdminSettings,
        updateSettingsCategory,

        // Getter functions
        getSetting,
        formatCurrency,
        isMaintenanceMode,
        areNewRegistrationsAllowed,
        getCurrency,
        getLanguage,
        getTimezone,
        getCommissionRate,
        getMinimumPayout,
        getMaxDeliveryDistance,
        getDeliveryTimeEstimate,

        // Convenience getters
        publicSettings: settings.public,
        driverSettings: settings.driver,
        adminSettings: settings.admin,

        // Loading states
        isLoadingPublic: loading.public,
        isLoadingDriver: loading.driver,
        isLoadingAdmin: loading.admin,

        // User type checks
        isDriver: user?.userType === 'driver',
        isAdmin: user?.userType === 'admin' || user?.userType === 'super_admin',
        canManageSettings: user?.userType === 'admin' || user?.userType === 'super_admin'
    };

    return (
        <SystemSettingsContext.Provider value={value}>
            {children}
        </SystemSettingsContext.Provider>
    );
};
