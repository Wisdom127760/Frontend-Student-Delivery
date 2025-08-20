import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    UserGroupIcon,
    ClockIcon,
    CheckCircleIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const AdminStatsTab = () => {
    const [stats, setStats] = useState({
        totalAdmins: 0,
        activeAdmins: 0,
        inactiveAdmins: 0,
        superAdmins: 0,
        regularAdmins: 0,
        recentLogins: 0,
        adminActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAdminStatistics();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            toast.error('Failed to load admin statistics');
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading admin statistics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Admin Statistics</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Monitor admin activity and platform usage
                            </p>
                        </div>
                        {/* Refresh button removed - WebSocket provides real-time updates */}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <UserGroupIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Total Admins</p>
                            <p className="text-lg font-semibold text-gray-900">{stats.totalAdmins}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Active Admins</p>
                            <p className="text-lg font-semibold text-gray-900">{stats.activeAdmins}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <ShieldCheckIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Super Admins</p>
                            <p className="text-lg font-semibold text-gray-900">{stats.superAdmins}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <ChartBarIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Recent Logins</p>
                            <p className="text-lg font-semibold text-gray-900">{stats.recentLogins}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Admin Distribution</h4>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">Active Admins</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">{stats.activeAdmins}</span>
                                <span className="text-xs text-gray-500">
                                    ({stats.totalAdmins > 0 ? Math.round((stats.activeAdmins / stats.totalAdmins) * 100) : 0}%)
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">Inactive Admins</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">{stats.inactiveAdmins}</span>
                                <span className="text-xs text-gray-500">
                                    ({stats.totalAdmins > 0 ? Math.round((stats.inactiveAdmins / stats.totalAdmins) * 100) : 0}%)
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">Super Admins</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">{stats.superAdmins}</span>
                                <span className="text-xs text-gray-500">
                                    ({stats.totalAdmins > 0 ? Math.round((stats.superAdmins / stats.totalAdmins) * 100) : 0}%)
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">Regular Admins</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">{stats.regularAdmins}</span>
                                <span className="text-xs text-gray-500">
                                    ({stats.totalAdmins > 0 ? Math.round((stats.regularAdmins / stats.totalAdmins) * 100) : 0}%)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Active Rate</span>
                            <span>{stats.totalAdmins > 0 ? Math.round((stats.activeAdmins / stats.totalAdmins) * 100) : 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${stats.totalAdmins > 0 ? (stats.activeAdmins / stats.totalAdmins) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Platform Insights</h4>
                <div className="text-sm text-blue-700 space-y-1">
                    <p>• {stats.activeAdmins} out of {stats.totalAdmins} admins are currently active</p>
                    <p>• {stats.superAdmins} super admins have full platform access</p>
                    <p>• {stats.recentLogins} admin logins recorded recently</p>
                    <p>• Platform efficiency: {stats.totalAdmins > 0 ? Math.round((stats.activeAdmins / stats.totalAdmins) * 100) : 0}%</p>
                </div>
            </div>
        </div>
    );
};

export default AdminStatsTab;
