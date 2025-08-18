import React, { useState, useEffect } from 'react';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useToast } from '../../components/common/ToastProvider';
import {
    CogIcon,
    CurrencyDollarIcon,
    GlobeAltIcon,
    BellIcon,
    ShieldCheckIcon,
    TruckIcon,
    CreditCardIcon,
    ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const SystemSettingsPage = () => {
    const {
        adminSettings,
        isLoadingAdmin,
        updateSettingsCategory,
        refreshSettings,
        canManageSettings
    } = useSystemSettings();
    const { showSuccess, showError } = useToast();
    const [activeTab, setActiveTab] = useState('display');
    const [saving, setSaving] = useState(false);

    // Form state for each category
    const [formData, setFormData] = useState({
        display: {
            language: 'en',
            timezone: 'Europe/Istanbul',
            currency: 'TRY'
        },
        notifications: {
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            deliveryUpdates: true,
            driverAssignments: true,
            systemAlerts: true,
            soundNotifications: true
        },
        security: {
            twoFactorAuth: false,
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

    // Load settings into form when they're available
    useEffect(() => {
        if (adminSettings) {
            setFormData(prev => ({
                ...prev,
                ...adminSettings
            }));
        }
    }, [adminSettings]);

    const handleInputChange = (category, key, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const handleSaveCategory = async (category) => {
        if (!canManageSettings) {
            showError('You do not have permission to manage settings');
            return;
        }

        setSaving(true);
        try {
            await updateSettingsCategory(category, formData[category]);
            showSuccess(`${category.charAt(0).toUpperCase() + category.slice(1)} settings updated successfully!`);
        } catch (error) {
            console.error(`Error updating ${category} settings:`, error);
            showError(`Failed to update ${category} settings`);
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'display', name: 'Display', icon: GlobeAltIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon },
        { id: 'delivery', name: 'Delivery', icon: TruckIcon },
        { id: 'earnings', name: 'Earnings', icon: CreditCardIcon },
        { id: 'system', name: 'System', icon: ComputerDesktopIcon }
    ];

    if (!canManageSettings) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        You do not have permission to access system settings.
                    </p>
                </div>
            </div>
        );
    }

    if (isLoadingAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-600">Loading system settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3">
                        <CogIcon className="h-8 w-8 text-green-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                            <p className="text-gray-600">Manage platform-wide settings and configurations</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow">
                    {/* Display Settings */}
                    {activeTab === 'display' && (
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Language
                                    </label>
                                    <select
                                        value={formData.display.language}
                                        onChange={(e) => handleInputChange('display', 'language', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="en">English</option>
                                        <option value="tr">Turkish</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Currency
                                    </label>
                                    <select
                                        value={formData.display.currency}
                                        onChange={(e) => handleInputChange('display', 'currency', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="TRY">Turkish Lira (₺)</option>
                                        <option value="USD">US Dollar ($)</option>
                                        <option value="EUR">Euro (€)</option>
                                        <option value="GBP">British Pound (£)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timezone
                                    </label>
                                    <select
                                        value={formData.display.timezone}
                                        onChange={(e) => handleInputChange('display', 'timezone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="Europe/Istanbul">Europe/Istanbul</option>
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">America/New_York</option>
                                        <option value="Europe/London">Europe/London</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={() => handleSaveCategory('display')}
                                    disabled={saving}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Display Settings'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Notifications Settings */}
                    {activeTab === 'notifications' && (
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                            <div className="space-y-4">
                                {Object.entries(formData.notifications).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </label>
                                            <p className="text-sm text-gray-500">
                                                {key.includes('email') && 'Send email notifications'}
                                                {key.includes('push') && 'Send push notifications'}
                                                {key.includes('sms') && 'Send SMS notifications'}
                                                {key.includes('sound') && 'Play notification sounds'}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={value}
                                                onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={() => handleSaveCategory('notifications')}
                                    disabled={saving}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Notification Settings'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* System Settings */}
                    {activeTab === 'system' && (
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                                        <p className="text-sm text-gray-500">Temporarily disable the platform for maintenance</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.system.maintenanceMode}
                                            onChange={(e) => handleInputChange('system', 'maintenanceMode', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Allow New Registrations</label>
                                        <p className="text-sm text-gray-500">Allow new users to register on the platform</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.system.allowNewRegistrations}
                                            onChange={(e) => handleInputChange('system', 'allowNewRegistrations', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Active Deliveries per Driver
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.system.maxActiveDeliveries}
                                        onChange={(e) => handleInputChange('system', 'maxActiveDeliveries', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        min="1"
                                        max="10"
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={() => handleSaveCategory('system')}
                                    disabled={saving}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save System Settings'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Other tabs can be implemented similarly */}
                    {activeTab !== 'display' && activeTab !== 'notifications' && activeTab !== 'system' && (
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
                            </h3>
                            <p className="text-gray-600">Settings for {activeTab} will be implemented here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemSettingsPage;
