import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChartBarIcon,
    TruckIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    BellIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { getDashboardData, getRecentDeliveries, getTopDrivers } from '../../services/dashboardService';
import { formatCurrency } from '../../services/systemSettings';
import RealTimeDriverStatus from '../../components/admin/RealTimeDriverStatus';
import RealTimeNotifications from '../../components/admin/RealTimeNotifications';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';

const EnhancedAdminDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [recentDeliveries, setRecentDeliveries] = useState([]);
    const [topDrivers, setTopDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('today');

    const loadDashboardData = async (silent = false) => {
        try {
            if (!silent) {
                setIsLoading(true);
            } else {
                setIsRefreshing(true);
            }

            const [dashboard, deliveries, drivers] = await Promise.all([
                getDashboardData(selectedPeriod),
                getRecentDeliveries(),
                getTopDrivers()
            ]);

            setDashboardData(dashboard);
            setRecentDeliveries(deliveries);
            setTopDrivers(drivers);
        } catch (error) {
            if (!silent) {
                toast.error('Failed to load dashboard data');
            }
        } finally {
            if (!silent) {
                setIsLoading(false);
            } else {
                setIsRefreshing(false);
            }
        }
    };

    useEffect(() => {
        loadDashboardData();

        // Set up auto-refresh every 30 seconds
        const interval = setInterval(() => {
            loadDashboardData(true); // Silent refresh
        }, 30000);

        return () => clearInterval(interval);
    }, [selectedPeriod]);

    // Show skeleton loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <DashboardSkeleton />
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: 'Total Deliveries',
            value: dashboardData?.totalDeliveries?.toLocaleString() || '0',
            change: dashboardData?.deliveryGrowth || '+0%',
            icon: TruckIcon,
            color: 'bg-blue-500',
            description: 'All time deliveries'
        },
        {
            title: 'Active Drivers',
            value: dashboardData?.activeDrivers?.toLocaleString() || '0',
            change: dashboardData?.driverGrowth || '+0%',
            icon: UserGroupIcon,
            color: 'bg-green-500',
            description: 'Currently online'
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(dashboardData?.totalRevenue || 0),
            change: dashboardData?.revenueGrowth || '+0%',
            icon: CurrencyDollarIcon,
            color: 'bg-yellow-500',
            description: 'Platform earnings'
        },
        {
            title: 'Pending Deliveries',
            value: dashboardData?.pendingDeliveries?.toLocaleString() || '0',
            change: dashboardData?.pendingGrowth || '+0%',
            icon: ClockIcon,
            color: 'bg-orange-500',
            description: 'Awaiting assignment'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'in_progress': return 'text-blue-600 bg-blue-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
            case 'in_progress': return <TruckIcon className="w-4 h-4" />;
            case 'pending': return <ClockIcon className="w-4 h-4" />;
            case 'cancelled': return <ExclamationTriangleIcon className="w-4 h-4" />;
            default: return <ClockIcon className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Subtle refresh indicator */}
            {isRefreshing && (
                <div className="fixed top-0 left-0 right-0 z-50">
                    <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 animate-pulse"></div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="mt-2 text-gray-600">Monitor and manage your delivery platform</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <RealTimeNotifications />
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="today">Today</option>
                                <option value="thisWeek">This Week</option>
                                <option value="thisMonth">This Month</option>
                                <option value="allTime">All Time</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${stat.color}`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center">
                                    <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-2">from last period</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Deliveries */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Recent Deliveries</h2>
                                    <button
                                        onClick={() => navigate('/admin/deliveries')}
                                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                                    >
                                        View all →
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                {recentDeliveries.length === 0 ? (
                                    <div className="text-center py-8">
                                        <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No recent deliveries</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentDeliveries.slice(0, 5).map((delivery, index) => (
                                            <div key={delivery._id || delivery.id || `delivery-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-lg ${getStatusColor(delivery.status)}`}>
                                                        {getStatusIcon(delivery.status)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">#{delivery.id}</p>
                                                        <p className="text-sm text-gray-600">{delivery.pickup} → {delivery.delivery}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900">{formatCurrency(delivery.amount)}</p>
                                                    <p className="text-sm text-gray-500">{delivery.driver || 'Unassigned'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Real-time Driver Status */}
                    <div className="lg:col-span-1">
                        <RealTimeDriverStatus />
                    </div>
                </div>

                {/* Top Drivers */}
                <div className="mt-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Top Performing Drivers</h2>
                                <button
                                    onClick={() => navigate('/admin/drivers')}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    View all →
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {topDrivers.length === 0 ? (
                                <div className="text-center py-8">
                                    <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No driver data available</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {topDrivers.slice(0, 5).map((driver, index) => (
                                        <div key={driver._id || driver.id || `driver-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{driver.name}</p>
                                                    <p className="text-sm text-gray-600">{driver.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-900">{driver.deliveries} deliveries</p>
                                                <p className="text-sm text-gray-500">{formatCurrency(driver.earnings)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => navigate('/admin/drivers')}
                                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                                >
                                    <UserGroupIcon className="w-8 h-8 text-blue-600 mb-2" />
                                    <h3 className="font-medium text-blue-900">Manage Drivers</h3>
                                    <p className="text-sm text-blue-700">View and manage driver accounts</p>
                                </button>
                                <button
                                    onClick={() => navigate('/admin/deliveries')}
                                    className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                                >
                                    <TruckIcon className="w-8 h-8 text-green-600 mb-2" />
                                    <h3 className="font-medium text-green-900">Track Deliveries</h3>
                                    <p className="text-sm text-green-700">Monitor delivery status and progress</p>
                                </button>
                                <button
                                    onClick={() => navigate('/admin/analytics')}
                                    className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
                                >
                                    <ChartBarIcon className="w-8 h-8 text-purple-600 mb-2" />
                                    <h3 className="font-medium text-purple-900">View Analytics</h3>
                                    <p className="text-sm text-purple-700">Detailed performance insights</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedAdminDashboard;

