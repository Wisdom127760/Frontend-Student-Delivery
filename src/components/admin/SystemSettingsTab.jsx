import React, { useState, useEffect } from 'react';
import {
    Cog6ToothIcon,
    BellIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    CurrencyDollarIcon,
    TruckIcon,
    ChartBarIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const SystemSettingsTab = () => {
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
            maxDeliveryTime: 30
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('display');

    const currencies = [
        { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' }
    ];

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' }
    ];

    const timezones = [
        { value: 'Europe/Istanbul', name: 'Istanbul (UTC+3)' },
        { value: 'UTC', name: 'UTC (UTC+0)' },
        { value: 'America/New_York', name: 'New York (UTC-5)' },
        { value: 'Europe/London', name: 'London (UTC+0)' }
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await apiService.getSystemSettings();
            if (response.success && response.data) {
                setSettings(response.data);
            }
        } catch (error) {
            toast.error('Failed to load system settings');
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const handleCurrencyChange = async (currency) => {
        try {
            setSaving(true);
            await apiService.updateCurrency(currency);
            handleSettingChange('display', 'currency', currency);
            toast.success('Currency updated successfully');
        } catch (error) {
            toast.error('Failed to update currency');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSettings = async (section) => {
        try {
            setSaving(true);
            await apiService.updateSystemSettings({ [section]: settings[section] });
            toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`);
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        {
            id: 'display',
            name: 'Display Settings',
            icon: GlobeAltIcon,
            description: 'Language, timezone, and currency settings'
        },
        {
            id: 'notifications',
            name: 'Notifications',
            icon: BellIcon,
            description: 'Email, push, and SMS notification preferences'
        },
        {
            id: 'security',
            name: 'Security',
            icon: ShieldCheckIcon,
            description: 'Two-factor authentication and session settings'
        },
        {
            id: 'delivery',
            name: 'Delivery Settings',
            icon: TruckIcon,
            description: 'Auto-assignment and delivery configuration'
        },
        {
            id: 'earnings',
            name: 'Earnings',
            icon: CurrencyDollarIcon,
            description: 'Commission rates and payout settings'
        },
        {
            id: 'system',
            name: 'System',
            icon: Cog6ToothIcon,
            description: 'Maintenance mode and system controls'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Configure platform settings, currency, notifications, and security preferences
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <nav className="space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
                                            ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                                    {section.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                            {activeSection === 'display' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h4>

                                        {/* Currency */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Platform Currency
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {currencies.map((currency) => (
                                                    <button
                                                        key={currency.code}
                                                        onClick={() => handleCurrencyChange(currency.code)}
                                                        disabled={saving}
                                                        className={`p-3 border rounded-lg text-center transition-colors ${settings.display.currency === currency.code
                                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className="text-lg font-semibold">{currency.symbol}</div>
                                                        <div className="text-xs text-gray-600">{currency.name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Language */}
                                        <div className="mb-6">
                                            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                                                Language
                                            </label>
                                            <select
                                                id="language"
                                                value={settings.display.language}
                                                onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                            >
                                                {languages.map((lang) => (
                                                    <option key={lang.code} value={lang.code}>
                                                        {lang.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Timezone */}
                                        <div className="mb-6">
                                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                                                Timezone
                                            </label>
                                            <select
                                                id="timezone"
                                                value={settings.display.timezone}
                                                onChange={(e) => handleSettingChange('display', 'timezone', e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                            >
                                                {timezones.map((tz) => (
                                                    <option key={tz.value} value={tz.value}>
                                                        {tz.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            onClick={() => handleSaveSettings('display')}
                                            disabled={saving}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Display Settings'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'notifications' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h4>

                                        <div className="space-y-4">
                                            {Object.entries(settings.notifications).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-900">
                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        </label>
                                                        <p className="text-sm text-gray-500">
                                                            {key === 'email' && 'Send email notifications'}
                                                            {key === 'push' && 'Send push notifications'}
                                                            {key === 'sms' && 'Send SMS notifications'}
                                                            {key === 'deliveryUpdates' && 'Notify on delivery status changes'}
                                                            {key === 'driverAssignments' && 'Notify on driver assignments'}
                                                            {key === 'systemAlerts' && 'Notify on system alerts'}
                                                            {key === 'soundEnabled' && 'Play notification sounds'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSettingChange('notifications', key, !value)}
                                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${value ? 'bg-green-600' : 'bg-gray-200'
                                                            }`}
                                                    >
                                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value ? 'translate-x-5' : 'translate-x-0'
                                                            }`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handleSaveSettings('notifications')}
                                            disabled={saving}
                                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Notification Settings'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h4>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
                                                    <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                                                </div>
                                                <button
                                                    onClick={() => handleSettingChange('security', 'twoFactor', !settings.security.twoFactor)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${settings.security.twoFactor ? 'bg-green-600' : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.security.twoFactor ? 'translate-x-5' : 'translate-x-0'
                                                        }`} />
                                                </button>
                                            </div>

                                            <div>
                                                <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Session Timeout (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="sessionTimeout"
                                                    value={settings.security.sessionTimeout}
                                                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                    min="5"
                                                    max="480"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-900">Login Notifications</label>
                                                    <p className="text-sm text-gray-500">Notify on successful logins</p>
                                                </div>
                                                <button
                                                    onClick={() => handleSettingChange('security', 'loginNotifications', !settings.security.loginNotifications)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${settings.security.loginNotifications ? 'bg-green-600' : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.security.loginNotifications ? 'translate-x-5' : 'translate-x-0'
                                                        }`} />
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSaveSettings('security')}
                                            disabled={saving}
                                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Security Settings'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'delivery' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Settings</h4>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-900">Auto-Assign Drivers</label>
                                                    <p className="text-sm text-gray-500">Automatically assign drivers to deliveries</p>
                                                </div>
                                                <button
                                                    onClick={() => handleSettingChange('delivery', 'autoAssignDrivers', !settings.delivery.autoAssignDrivers)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${settings.delivery.autoAssignDrivers ? 'bg-green-600' : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.delivery.autoAssignDrivers ? 'translate-x-5' : 'translate-x-0'
                                                        }`} />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-900">Require Driver Confirmation</label>
                                                    <p className="text-sm text-gray-500">Drivers must confirm before accepting deliveries</p>
                                                </div>
                                                <button
                                                    onClick={() => handleSettingChange('delivery', 'requireDriverConfirmation', !settings.delivery.requireDriverConfirmation)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${settings.delivery.requireDriverConfirmation ? 'bg-green-600' : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.delivery.requireDriverConfirmation ? 'translate-x-5' : 'translate-x-0'
                                                        }`} />
                                                </button>
                                            </div>

                                            <div>
                                                <label htmlFor="maxDeliveryDistance" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Maximum Delivery Distance (km)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="maxDeliveryDistance"
                                                    value={settings.delivery.maxDeliveryDistance}
                                                    onChange={(e) => handleSettingChange('delivery', 'maxDeliveryDistance', parseInt(e.target.value))}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                    min="1"
                                                    max="200"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="maxDeliveryTime" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Maximum Delivery Time (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="maxDeliveryTime"
                                                    value={settings.delivery.maxDeliveryTime}
                                                    onChange={(e) => handleSettingChange('delivery', 'maxDeliveryTime', parseInt(e.target.value))}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                    min="5"
                                                    max="180"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSaveSettings('delivery')}
                                            disabled={saving}
                                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Delivery Settings'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'earnings' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Earnings Settings</h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Default Commission Rate (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="commissionRate"
                                                    value={settings.earnings.commissionRate}
                                                    onChange={(e) => handleSettingChange('earnings', 'commissionRate', parseInt(e.target.value))}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="minimumPayout" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Minimum Payout Amount
                                                </label>
                                                <input
                                                    type="number"
                                                    id="minimumPayout"
                                                    value={settings.earnings.minimumPayout}
                                                    onChange={(e) => handleSettingChange('earnings', 'minimumPayout', parseInt(e.target.value))}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                    min="0"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="payoutSchedule" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Payout Schedule
                                                </label>
                                                <select
                                                    id="payoutSchedule"
                                                    value={settings.earnings.payoutSchedule}
                                                    onChange={(e) => handleSettingChange('earnings', 'payoutSchedule', e.target.value)}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSaveSettings('earnings')}
                                            disabled={saving}
                                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Earnings Settings'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'system' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">System Settings</h4>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-900">Maintenance Mode</label>
                                                    <p className="text-sm text-gray-500">Temporarily disable the platform</p>
                                                </div>
                                                <button
                                                    onClick={() => handleSettingChange('system', 'maintenanceMode', !settings.system.maintenanceMode)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${settings.system.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.system.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                                                        }`} />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-900">Allow New Registrations</label>
                                                    <p className="text-sm text-gray-500">Allow new users to register</p>
                                                </div>
                                                <button
                                                    onClick={() => handleSettingChange('system', 'allowNewRegistrations', !settings.system.allowNewRegistrations)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${settings.system.allowNewRegistrations ? 'bg-green-600' : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.system.allowNewRegistrations ? 'translate-x-5' : 'translate-x-0'
                                                        }`} />
                                                </button>
                                            </div>

                                            <div>
                                                <label htmlFor="maxActiveDeliveries" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Maximum Active Deliveries per Driver
                                                </label>
                                                <input
                                                    type="number"
                                                    id="maxActiveDeliveries"
                                                    value={settings.system.maxActiveDeliveries}
                                                    onChange={(e) => handleSettingChange('system', 'maxActiveDeliveries', parseInt(e.target.value))}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                    min="1"
                                                    max="20"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-900">Driver Rating System</label>
                                                    <p className="text-sm text-gray-500">Enable customer ratings for drivers</p>
                                                </div>
                                                <button
                                                    onClick={() => handleSettingChange('system', 'driverRatingEnabled', !settings.system.driverRatingEnabled)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${settings.system.driverRatingEnabled ? 'bg-green-600' : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.system.driverRatingEnabled ? 'translate-x-5' : 'translate-x-0'
                                                        }`} />
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSaveSettings('system')}
                                            disabled={saving}
                                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save System Settings'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettingsTab;
