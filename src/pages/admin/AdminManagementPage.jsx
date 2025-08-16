import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSuperAdmin } from '../../utils/userHelpers';
import {
    UserGroupIcon,
    Cog6ToothIcon,
    CurrencyDollarIcon,
    ShieldCheckIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    KeyIcon,
    BellIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import AdminManagementTabs from '../../components/admin/AdminManagementTabs';
import AdminUsersTab from '../../components/admin/AdminUsersTab';
import SystemSettingsTab from '../../components/admin/SystemSettingsTab';
import EarningsConfigTab from '../../components/admin/EarningsConfigTab';
import AdminStatsTab from '../../components/admin/AdminStatsTab';
import toast from 'react-hot-toast';

const AdminManagementPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('admins');
    const [loading, setLoading] = useState(false);

    // Check if user is super admin
    if (!isSuperAdmin(user)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-4">
                        You don't have permission to access the Admin Management system.
                    </p>
                    <p className="text-sm text-gray-500">
                        Only Super Admins can manage admin users, system settings, and earnings configurations.
                    </p>
                </div>
            </div>
        );
    }

    const tabs = [
        {
            id: 'admins',
            name: 'Admin Users',
            icon: UserGroupIcon,
            description: 'Manage admin accounts and permissions',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            id: 'settings',
            name: 'System Settings',
            icon: Cog6ToothIcon,
            description: 'Configure platform settings and currency',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            id: 'earnings',
            name: 'Earnings Configuration',
            icon: CurrencyDollarIcon,
            description: 'Manage payment rules and structures',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        },
        {
            id: 'stats',
            name: 'Admin Statistics',
            icon: ChartBarIcon,
            description: 'View admin activity and analytics',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'admins':
                return <AdminUsersTab />;
            case 'settings':
                return <SystemSettingsTab />;
            case 'earnings':
                return <EarningsConfigTab />;
            case 'stats':
                return <AdminStatsTab />;
            default:
                return <AdminUsersTab />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Admin Management
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage admin users, system settings, and platform configuration
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-600">
                                    Super Admin Access
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <AdminManagementTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            <div className="px-4 py-6 sm:px-6 lg:px-8">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AdminManagementPage;
