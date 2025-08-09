import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { isSuperAdmin } from '../../utils/userHelpers';
import {
    Cog6ToothIcon,
    BellIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    KeyIcon,
    UserGroupIcon,
    TruckIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    CurrencyEuroIcon,
    CurrencyPoundIcon,
    CurrencyYenIcon,
    SpeakerWaveIcon
} from '@heroicons/react/24/outline';

const SettingsPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Check if user has earnings management permission
    const canManageEarnings = isSuperAdmin(user) || user?.permissions?.includes('manage_earnings');
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: true,
            sms: false,
            deliveryUpdates: true,
            driverAssignments: true,
            systemAlerts: true,
            soundEnabled: true
        },
        display: {
            language: 'en',
            timezone: 'Europe/Istanbul',
            currency: 'TRY'
        },
        security: {
            twoFactor: false,
            sessionTimeout: 30,
            loginNotifications: true
        },
        delivery: {
            autoAssignDrivers: true,
            requireDriverConfirmation: false,
            maxDeliveryDistance: 50,
            deliveryTimeEstimate: 30
        },
        earnings: {
            commissionRate: 80,
            minimumPayout: 100,
            payoutSchedule: 'weekly'
        },
        system: {
            maintenanceMode: false,
            allowNewRegistrations: true,
            maxActiveDeliveries: 5,
            driverRatingEnabled: true
        }
    });

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    const currencies = [
        { code: 'TRY', symbol: '₺', name: 'Turkish Lira', icon: CurrencyYenIcon },
        { code: 'USD', symbol: '$', name: 'US Dollar', icon: CurrencyDollarIcon },
        { code: 'EUR', symbol: '€', name: 'Euro', icon: CurrencyEuroIcon },
        { code: 'GBP', symbol: '£', name: 'British Pound', icon: CurrencyPoundIcon }
    ];

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' }
    ];

    const timezones = [
        { value: 'Europe/Istanbul', label: 'Istanbul (UTC+3)' },
        { value: 'UTC', label: 'UTC (UTC+0)' },
        { value: 'America/New_York', label: 'New York (UTC-5)' },
        { value: 'Europe/London', label: 'London (UTC+0)' }
    ];

    // Load settings from database
    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/system-settings/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSettings(data.data);
                } else {
                    console.error('Failed to load settings:', data.error);
                    toast.error('Failed to load settings');
                }
            } else {
                console.error('Failed to load settings:', response.status);
                toast.error('Failed to load settings');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSettingChange = (category, setting, value) => {
        const newSettings = {
            ...settings,
            [category]: {
                ...settings[category],
                [setting]: value
            }
        };
        setSettings(newSettings);
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            // Filter settings based on user permissions
            const settingsToUpdate = { ...settings };

            // Remove earnings settings if user doesn't have permission
            if (!canManageEarnings) {
                delete settingsToUpdate.earnings;
            }

            const response = await fetch(`${API_BASE_URL}/system-settings/admin`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    updates: settingsToUpdate
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    toast.success('Settings saved successfully');
                    // Reload settings to get the updated data
                    await loadSettings();
                } else {
                    console.error('Failed to save settings:', data.error);
                    toast.error('Failed to save settings');
                }
            } else {
                console.error('Failed to save settings:', response.status);
                toast.error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    // Create audio context for sound generation
    const createAudioContext = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Resume audio context if suspended (required for some browsers)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        return audioContext;
    };



    const permissions = [
        { name: 'Create Deliveries', icon: TruckIcon, granted: true },
        { name: 'Edit Deliveries', icon: TruckIcon, granted: true },
        { name: 'Delete Deliveries', icon: TruckIcon, granted: true },
        { name: 'Manage Drivers', icon: UserGroupIcon, granted: true },
        { name: 'View Analytics', icon: ChartBarIcon, granted: true },
        { name: 'System Settings', icon: Cog6ToothIcon, granted: user?.role === 'super_admin' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-600">Manage system-wide settings and configurations</p>
                </div>
                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-4">
                        <BellIcon className="w-6 h-6 text-green-600 mr-3" />
                        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Email Notifications</span>
                            <button
                                onClick={() => handleSettingChange('notifications', 'email', !settings.notifications.email)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications.email ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Push Notifications</span>
                            <button
                                onClick={() => handleSettingChange('notifications', 'push', !settings.notifications.push)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications.push ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Sound Notifications</span>
                            <button
                                onClick={() => handleSettingChange('notifications', 'soundEnabled', !settings.notifications.soundEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications.soundEnabled ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>

                    </div>
                </div>

                {/* Display */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-4">
                        <GlobeAltIcon className="w-6 h-6 text-green-600 mr-3" />
                        <h2 className="text-lg font-semibold text-gray-900">Display</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                            <select
                                value={settings.display.currency}
                                onChange={(e) => handleSettingChange('display', 'currency', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                {currencies.map((currency) => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.symbol} {currency.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                            <select
                                value={settings.display.language}
                                onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                {languages.map((language) => (
                                    <option key={language.code} value={language.code}>
                                        {language.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                            <select
                                value={settings.display.timezone}
                                onChange={(e) => handleSettingChange('display', 'timezone', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                {timezones.map((tz) => (
                                    <option key={tz.value} value={tz.value}>
                                        {tz.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Delivery Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-4">
                        <TruckIcon className="w-6 h-6 text-green-600 mr-3" />
                        <h2 className="text-lg font-semibold text-gray-900">Delivery</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Auto-assign Drivers</span>
                            <button
                                onClick={() => handleSettingChange('delivery', 'autoAssignDrivers', !settings.delivery.autoAssignDrivers)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.delivery.autoAssignDrivers ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.delivery.autoAssignDrivers ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Delivery Distance (km)</label>
                            <input
                                type="number"
                                value={settings.delivery.maxDeliveryDistance}
                                onChange={(e) => handleSettingChange('delivery', 'maxDeliveryDistance', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                min="1"
                                max="200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Default Delivery Time (minutes)</label>
                            <input
                                type="number"
                                value={settings.delivery.deliveryTimeEstimate}
                                onChange={(e) => handleSettingChange('delivery', 'deliveryTimeEstimate', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                min="5"
                                max="180"
                            />
                        </div>
                    </div>
                </div>

                {/* Earnings Settings - Only visible to super admins or users with manage_earnings permission */}
                {canManageEarnings && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center mb-4">
                            <CurrencyDollarIcon className="w-6 h-6 text-green-600 mr-3" />
                            <h2 className="text-lg font-semibold text-gray-900">Earnings</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                                <input
                                    type="number"
                                    value={settings.earnings.commissionRate}
                                    onChange={(e) => handleSettingChange('earnings', 'commissionRate', parseInt(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Payout (₺)</label>
                                <input
                                    type="number"
                                    value={settings.earnings.minimumPayout}
                                    onChange={(e) => handleSettingChange('earnings', 'minimumPayout', parseInt(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    min="10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payout Schedule</label>
                                <select
                                    value={settings.earnings.payoutSchedule}
                                    onChange={(e) => handleSettingChange('earnings', 'payoutSchedule', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Information for normal admins about earnings management */}
                {!canManageEarnings && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center">
                            <ShieldCheckIcon className="w-5 h-5 text-blue-600 mr-2" />
                            <div>
                                <h3 className="text-sm font-medium text-blue-900">Earnings Management</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Earnings settings are managed by super administrators only. Contact your super admin for earnings-related changes.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* System Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-4">
                        <Cog6ToothIcon className="w-6 h-6 text-green-600 mr-3" />
                        <h2 className="text-lg font-semibold text-gray-900">System</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Maintenance Mode</span>
                            <button
                                onClick={() => handleSettingChange('system', 'maintenanceMode', !settings.system.maintenanceMode)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.system.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.system.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Allow New Registrations</span>
                            <button
                                onClick={() => handleSettingChange('system', 'allowNewRegistrations', !settings.system.allowNewRegistrations)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.system.allowNewRegistrations ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.system.allowNewRegistrations ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Active Deliveries per Driver</label>
                            <input
                                type="number"
                                value={settings.system.maxActiveDeliveries}
                                onChange={(e) => handleSettingChange('system', 'maxActiveDeliveries', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                min="1"
                                max="10"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Driver Rating System</span>
                            <button
                                onClick={() => handleSettingChange('system', 'driverRatingEnabled', !settings.system.driverRatingEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.system.driverRatingEnabled ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.system.driverRatingEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-4">
                        <ShieldCheckIcon className="w-6 h-6 text-green-600 mr-3" />
                        <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Two-Factor Authentication</span>
                            <button
                                onClick={() => handleSettingChange('security', 'twoFactor', !settings.security.twoFactor)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.security.twoFactor ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.security.twoFactor ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                value={settings.security.sessionTimeout}
                                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                min="5"
                                max="1440"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Login Notifications</span>
                            <button
                                onClick={() => handleSettingChange('security', 'loginNotifications', !settings.security.loginNotifications)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.security.loginNotifications ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.security.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Permissions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                    <KeyIcon className="w-6 h-6 text-green-600 mr-3" />
                    <h2 className="text-lg font-semibold text-gray-900">Your Permissions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {permissions.map((permission) => {
                        const Icon = permission.icon;
                        return (
                            <div key={permission.name} className="flex items-center space-x-3">
                                <Icon className={`w-5 h-5 ${permission.granted ? 'text-green-600' : 'text-gray-400'}`} />
                                <span className={`text-sm ${permission.granted ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {permission.name}
                                </span>
                                {permission.granted ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Granted
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Denied
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage; 