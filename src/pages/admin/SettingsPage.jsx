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
    CurrencyYenIcon
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
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    // Save settings to database
    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/system-settings/admin`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                toast.success('Settings saved successfully');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleSettingChange = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const permissions = [
        { name: 'Manage Drivers', icon: UserGroupIcon, granted: true },
        { name: 'Manage Deliveries', icon: TruckIcon, granted: true },
        { name: 'View Analytics', icon: ChartBarIcon, granted: true },
        { name: 'System Settings', icon: Cog6ToothIcon, granted: user?.role === 'super_admin' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">System Settings</h1>
                            <p className="text-sm text-gray-600">Manage system-wide settings and configurations</p>
                        </div>
                        <button
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Notifications */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center mb-3">
                                <BellIcon className="w-4 h-4 text-green-600 mr-2" />
                                <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-700">Email Notifications</span>
                                    <button
                                        onClick={() => handleSettingChange('notifications', 'email', !settings.notifications.email)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.notifications.email ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.notifications.email ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-700">Push Notifications</span>
                                    <button
                                        onClick={() => handleSettingChange('notifications', 'push', !settings.notifications.push)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.notifications.push ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.notifications.push ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-700">Sound Notifications</span>
                                    <button
                                        onClick={() => handleSettingChange('notifications', 'soundEnabled', !settings.notifications.soundEnabled)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.notifications.soundEnabled ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.notifications.soundEnabled ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Display */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center mb-3">
                                <GlobeAltIcon className="w-4 h-4 text-green-600 mr-2" />
                                <h2 className="text-sm font-semibold text-gray-900">Display</h2>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                                    <select
                                        value={settings.display.currency}
                                        onChange={(e) => handleSettingChange('display', 'currency', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    >
                                        {currencies.map((currency) => (
                                            <option key={currency.code} value={currency.code}>
                                                {currency.symbol} {currency.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
                                    <select
                                        value={settings.display.language}
                                        onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    >
                                        {languages.map((language) => (
                                            <option key={language.code} value={language.code}>
                                                {language.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Timezone</label>
                                    <select
                                        value={settings.display.timezone}
                                        onChange={(e) => handleSettingChange('display', 'timezone', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    >
                                        {timezones.map((timezone) => (
                                            <option key={timezone.value} value={timezone.value}>
                                                {timezone.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center mb-3">
                                <ShieldCheckIcon className="w-4 h-4 text-green-600 mr-2" />
                                <h2 className="text-sm font-semibold text-gray-900">Security</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-700">Two-Factor Authentication</span>
                                    <button
                                        onClick={() => handleSettingChange('security', 'twoFactor', !settings.security.twoFactor)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.security.twoFactor ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.security.twoFactor ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-700">Login Notifications</span>
                                    <button
                                        onClick={() => handleSettingChange('security', 'loginNotifications', !settings.security.loginNotifications)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.security.loginNotifications ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.security.loginNotifications ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                                    <input
                                        type="number"
                                        value={settings.security.sessionTimeout}
                                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                        min="5"
                                        max="120"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Delivery */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center mb-3">
                                <TruckIcon className="w-4 h-4 text-green-600 mr-2" />
                                <h2 className="text-sm font-semibold text-gray-900">Delivery</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-700">Auto-Assign Drivers</span>
                                    <button
                                        onClick={() => handleSettingChange('delivery', 'autoAssignDrivers', !settings.delivery.autoAssignDrivers)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.delivery.autoAssignDrivers ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.delivery.autoAssignDrivers ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-700">Require Driver Confirmation</span>
                                    <button
                                        onClick={() => handleSettingChange('delivery', 'requireDriverConfirmation', !settings.delivery.requireDriverConfirmation)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.delivery.requireDriverConfirmation ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.delivery.requireDriverConfirmation ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Max Delivery Distance (km)</label>
                                    <input
                                        type="number"
                                        value={settings.delivery.maxDeliveryDistance}
                                        onChange={(e) => handleSettingChange('delivery', 'maxDeliveryDistance', parseInt(e.target.value))}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                        min="1"
                                        max="100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* System */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center mb-3">
                                <Cog6ToothIcon className="w-4 h-4 text-green-600 mr-2" />
                                <h2 className="text-sm font-semibold text-gray-900">System</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-700">Maintenance Mode</span>
                                    <button
                                        onClick={() => handleSettingChange('system', 'maintenanceMode', !settings.system.maintenanceMode)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.system.maintenanceMode ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.system.maintenanceMode ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-700">Allow New Registrations</span>
                                    <button
                                        onClick={() => handleSettingChange('system', 'allowNewRegistrations', !settings.system.allowNewRegistrations)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.system.allowNewRegistrations ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.system.allowNewRegistrations ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Max Active Deliveries</label>
                                    <input
                                        type="number"
                                        value={settings.system.maxActiveDeliveries}
                                        onChange={(e) => handleSettingChange('system', 'maxActiveDeliveries', parseInt(e.target.value))}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                        min="1"
                                        max="10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Permissions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center mb-3">
                                <KeyIcon className="w-4 h-4 text-green-600 mr-2" />
                                <h2 className="text-sm font-semibold text-gray-900">Permissions</h2>
                            </div>
                            <div className="space-y-2">
                                {permissions.map((permission, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <permission.icon className="w-3 h-3 text-gray-400 mr-2" />
                                            <span className="text-xs text-gray-700">{permission.name}</span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${permission.granted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {permission.granted ? 'Granted' : 'Denied'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage; 