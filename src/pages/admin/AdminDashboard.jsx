import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChartBarIcon,
    TruckIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    // ArrowUpIcon, // Unused import
    // ArrowDownIcon, // Unused import
    MegaphoneIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { getDashboardData, getRecentDeliveries, getTopDrivers } from '../../services/dashboardService';
import { formatCurrency } from '../../services/systemSettings';
import RealTimeDriverStatus from '../../components/admin/RealTimeDriverStatus';
// import RealTimeNotifications from '../../components/admin/RealTimeNotifications'; // Unused import
// import BroadcastMonitor from '../../components/admin/BroadcastMonitor'; // Unused import
import SocketTestPanel from '../../components/admin/SocketTestPanel';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [recentDeliveries, setRecentDeliveries] = useState([]);
    const [topDrivers, setTopDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('today');

    const loadDashboardData = useCallback(async (silent = false) => {
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
    }, [selectedPeriod]);

    useEffect(() => {
        loadDashboardData();

        // Set up auto-refresh every 30 seconds
        const interval = setInterval(() => {
            loadDashboardData(true); // Silent refresh
        }, 30000);

        return () => clearInterval(interval);
    }, [loadDashboardData]);

    // Show skeleton loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            description: 'All time deliveries',
            trend: 'up'
        },
        {
            title: 'Active Drivers',
            value: dashboardData?.activeDrivers?.toLocaleString() || '0',
            change: dashboardData?.driverGrowth || '+0%',
            icon: UserGroupIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            description: 'Currently online',
            trend: 'up'
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(dashboardData?.totalRevenue || 0),
            change: dashboardData?.revenueGrowth || '+0%',
            icon: CurrencyDollarIcon,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            description: 'Platform earnings',
            trend: 'up'
        },
        {
            title: 'Pending Deliveries',
            value: dashboardData?.pendingDeliveries?.toLocaleString() || '0',
            change: dashboardData?.pendingGrowth || '+0%',
            icon: ClockIcon,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            description: 'Awaiting assignment',
            trend: 'down'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50';
            case 'in_progress': return 'text-blue-600 bg-blue-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircleIcon className="w-3 h-3" />;
            case 'in_progress': return <TruckIcon className="w-3 h-3" />;
            case 'pending': return <ClockIcon className="w-3 h-3" />;
            case 'cancelled': return <ExclamationTriangleIcon className="w-3 h-3" />;
            default: return <ClockIcon className="w-3 h-3" />;
        }
    };

    // const getTrendIcon = (trend) => { // Unused function
    //     if (trend === 'up') {
    //         return <ArrowUpIcon className="w-3 h-3 text-green-600" />;
    //     }
    //     return <ArrowDownIcon className="w-3 h-3 text-red-600" />;
    // };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Subtle refresh indicator */}
            {isRefreshing && (
                <div className="fixed top-0 left-0 right-0 z-50">
                    <div className="h-0.5 bg-gradient-to-r from-green-400 to-green-600 animate-pulse"></div>
                </div>
            )}

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="mt-0.5 text-xs text-gray-600">Monitor and manage your delivery platform</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                                        <Icon className={`w-3 h-3 ${stat.color}`} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">{stat.change}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">{stat.title}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Enhanced Recent Deliveries */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-3 py-2 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-semibold text-gray-900">Live Delivery Activity</h2>
                                    <button
                                        onClick={() => navigate('/admin/deliveries')}
                                        className="text-xs text-green-600 hover:text-green-700 font-medium"
                                    >
                                        View all →
                                    </button>
                                </div>
                            </div>
                            <div className="p-2">
                                {recentDeliveries.length === 0 ? (
                                    <div className="text-center py-3">
                                        <TruckIcon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-500">No recent deliveries</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {recentDeliveries.slice(0, 6).map((delivery, index) => (
                                            <div key={delivery._id || delivery.id || `delivery-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-1 rounded-full ${getStatusColor(delivery.status)}`}>
                                                        {getStatusIcon(delivery.status)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <p className="text-xs font-medium text-gray-900">#{delivery.deliveryCode || delivery.id}</p>
                                                            {delivery.priority === 'high' && (
                                                                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Priority</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-600 truncate">
                                                            {delivery.customerName || 'Customer'} • {delivery.pickupAddress || delivery.pickup} → {delivery.deliveryAddress || delivery.delivery}
                                                        </p>
                                                        <div className="flex items-center space-x-3 mt-1">
                                                            <span className="text-xs text-gray-500">
                                                                {delivery.driver ? `👤 ${delivery.driver}` : '🚫 Unassigned'}
                                                            </span>
                                                            {delivery.estimatedTime && (
                                                                <span className="text-xs text-gray-500">
                                                                    ⏱️ {delivery.estimatedTime}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-2">
                                                    <p className="text-xs font-bold text-gray-900">{formatCurrency(delivery.amount)}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {delivery.paymentMethod === 'cash' ? '💵 Cash' : '💳 Card'}
                                                    </p>
                                                    {delivery.createdAt && (
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(delivery.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    )}
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

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    {/* Gamified Driver Leaderboard */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-3 py-2 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-semibold text-gray-900">🏆 Driver Leaderboard</h2>
                                <button
                                    onClick={() => navigate('/admin/drivers')}
                                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                                >
                                    View all →
                                </button>
                            </div>
                        </div>
                        <div className="p-3">
                            {topDrivers.length === 0 ? (
                                <div className="text-center py-4">
                                    <UserGroupIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-500">No driver data available</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {topDrivers.slice(0, 5).map((driver, index) => {
                                        const getRankBadge = (rank) => {
                                            switch (rank) {
                                                case 0: return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🥇' };
                                                case 1: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '🥈' };
                                                case 2: return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🥉' };
                                                default: return { bg: 'bg-blue-100', text: 'text-blue-700', icon: `#${rank + 1}` };
                                            }
                                        };

                                        const rankBadge = getRankBadge(index);
                                        const isOnline = driver.isOnline || driver.isActive;

                                        return (
                                            <div key={driver._id || driver.id || `driver-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-6 h-6 ${rankBadge.bg} rounded-full flex items-center justify-center`}>
                                                        <span className="text-xs font-bold">{rankBadge.icon}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <p className="text-xs font-medium text-gray-900">{driver.name}</p>
                                                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                        </div>
                                                        <div className="flex items-center space-x-3 mt-1">
                                                            <span className="text-xs text-gray-600">
                                                                📦 {driver.deliveries || 0} deliveries
                                                            </span>
                                                            <span className="text-xs text-gray-600">
                                                                ⭐ {driver.rating || 'N/A'}
                                                            </span>
                                                            {driver.completionRate && (
                                                                <span className="text-xs text-gray-600">
                                                                    ✅ {driver.completionRate}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-gray-900">{formatCurrency(driver.earnings)}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {driver.activeHours ? `${driver.activeHours}h` : 'N/A'} online
                                                    </p>
                                                    {driver.achievements && driver.achievements.length > 0 && (
                                                        <div className="flex justify-end space-x-1 mt-1">
                                                            {driver.achievements.slice(0, 2).map((achievement, idx) => (
                                                                <span key={idx} className="text-xs bg-green-100 text-green-700 px-1 rounded">
                                                                    {achievement}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-3 py-2 border-b border-gray-200">
                            <h2 className="text-xs font-semibold text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="p-3">
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => navigate('/admin/drivers')}
                                    className="p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors text-left"
                                >
                                    <div className="flex items-center space-x-2">
                                        <UserGroupIcon className="w-3 h-3 text-blue-600" />
                                        <div>
                                            <h3 className="text-xs font-medium text-blue-900">Manage Drivers</h3>
                                            <p className="text-xs text-blue-700">View and manage driver accounts</p>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => navigate('/admin/deliveries')}
                                    className="p-2 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors text-left"
                                >
                                    <div className="flex items-center space-x-2">
                                        <TruckIcon className="w-3 h-3 text-green-600" />
                                        <div>
                                            <h3 className="text-xs font-medium text-green-900">Track Deliveries</h3>
                                            <p className="text-xs text-green-700">Monitor delivery status and progress</p>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => navigate('/admin/analytics')}
                                    className="p-2 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors text-left"
                                >
                                    <div className="flex items-center space-x-2">
                                        <ChartBarIcon className="w-3 h-3 text-purple-600" />
                                        <div>
                                            <h3 className="text-xs font-medium text-purple-900">View Analytics</h3>
                                            <p className="text-xs text-purple-700">Detailed performance insights</p>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => navigate('/admin/broadcasts')}
                                    className="p-2 bg-orange-50 border border-orange-200 rounded hover:bg-orange-100 transition-colors text-left"
                                >
                                    <div className="flex items-center space-x-2">
                                        <MegaphoneIcon className="w-3 h-3 text-orange-600" />
                                        <div>
                                            <h3 className="text-xs font-medium text-orange-900">Broadcast Monitor</h3>
                                            <p className="text-xs text-orange-700">Monitor delivery broadcasts</p>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => navigate('/admin/search')}
                                    className="p-2 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors text-left"
                                >
                                    <div className="flex items-center space-x-2">
                                        <MagnifyingGlassIcon className="w-3 h-3 text-indigo-600" />
                                        <div>
                                            <h3 className="text-xs font-medium text-indigo-900">Global Search</h3>
                                            <p className="text-xs text-indigo-700">Search across all entities</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Socket Test Panel */}
                    <div className="mt-6">
                        <SocketTestPanel />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

