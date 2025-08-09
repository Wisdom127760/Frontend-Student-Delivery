import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import DriverLayout, { useDriverStatus } from '../../components/layouts/DriverLayout';
import { getUserDisplayInfo } from '../../utils/userHelpers';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import {
    TruckIcon,
    CurrencyDollarIcon,
    ClockIcon,
    MapPinIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    StarIcon,
    FunnelIcon,
    CalendarIcon,
    XCircleIcon,
    ClockIcon as StatusClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DashboardContent = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isOnline } = useDriverStatus(); // Get real status from DriverLayout
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        period: 'month', // today, week, month, year
        status: 'all', // all, active, completed, pending, cancelled
        dateRange: 'all' // all, today, week, month
    });
    const [dashboardData, setDashboardData] = useState({
        deliveries: {
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0
        },
        earnings: {
            today: 0,
            week: 0,
            month: 0,
            lastPayout: 0
        },
        stats: {
            activeHours: '0h 0m',
            averageRating: 0,
            totalRating: 0,
            completionRate: 0
        },
        profile: {
            status: 'offline',
            location: 'Unknown'
        }
    });
    const [activeDeliveries, setActiveDeliveries] = useState([]);

    // Get user display info
    const userInfo = getUserDisplayInfo(user);

    // Load dashboard data
    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            // Build filter parameters based on current filter state
            const deliveryFilters = {
                limit: 10,
                ...(filters.status !== 'all' && { status: filters.status }),
                ...(filters.dateRange !== 'all' && { period: filters.dateRange })
            };

            // Load multiple endpoints in parallel with filters
            const [profileRes, deliveriesRes, earningsRes] = await Promise.allSettled([
                apiService.getDriverProfile(),
                apiService.getDriverDeliveries(deliveryFilters),
                apiService.getDriverEarnings(filters.period)
            ]);

            // Process profile data
            if (profileRes.status === 'fulfilled' && profileRes.value.success) {
                const profile = profileRes.value.data;
                setDashboardData(prev => ({
                    ...prev,
                    profile: {
                        status: profile.status || 'offline',
                        location: profile.location || profile.area || 'Unknown'
                    },
                    stats: {
                        activeHours: profile.activeHours || '0h 0m',
                        averageRating: profile.averageRating || 0,
                        totalRating: profile.totalRating || 0,
                        completionRate: profile.completionRate || 0
                    }
                }));
            }

            // Process deliveries data
            if (deliveriesRes.status === 'fulfilled' && deliveriesRes.value.success) {
                const deliveries = deliveriesRes.value.data;
                setActiveDeliveries(deliveries.data || []);

                // Calculate delivery stats

                setDashboardData(prev => ({
                    ...prev,
                    deliveries: {
                        total: deliveries.total || 0,
                        completed: deliveries.data?.filter(d => d.status === 'completed').length || 0,
                        inProgress: deliveries.data?.filter(d => d.status === 'in_progress').length || 0,
                        pending: deliveries.data?.filter(d => d.status === 'pending').length || 0
                    }
                }));
            }

            // Process earnings data
            if (earningsRes.status === 'fulfilled' && earningsRes.value.success) {
                const earnings = earningsRes.value.data;
                setDashboardData(prev => ({
                    ...prev,
                    earnings: {
                        today: earnings.today || 0,
                        week: earnings.week || 0,
                        month: earnings.month || 0,
                        lastPayout: earnings.lastPayout || 0
                    }
                }));
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [filters]); // Depend on filters to reload when they change

    // Filter change handlers
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    // Accept delivery
    const acceptDelivery = async (deliveryId) => {
        try {
            const response = await apiService.acceptDelivery(deliveryId);
            if (response.success) {
                toast.success('Delivery accepted!');
                loadDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error('Error accepting delivery:', error);
            toast.error('Failed to accept delivery');
        }
    };

    useEffect(() => {
        loadDashboardData();

        // Refresh data every 30 seconds
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, [loadDashboardData]);

    // Quick stats for display
    const quickStats = [
        {
            title: "Today's Deliveries",
            value: dashboardData.deliveries.completed.toString(),
            change: `+${dashboardData.deliveries.pending} pending`,
            icon: TruckIcon,
            color: 'bg-blue-500',
            trend: 'up'
        },
        {
            title: "Today's Earnings",
            value: `₺${dashboardData.earnings.today}`,
            change: `₺${dashboardData.earnings.week} this week`,
            icon: CurrencyDollarIcon,
            color: 'bg-green-500',
            trend: 'up'
        },
        {
            title: 'Active Hours',
            value: dashboardData.stats.activeHours,
            change: `${dashboardData.stats.completionRate}% completion`,
            icon: ClockIcon,
            color: 'bg-yellow-500',
            trend: 'neutral'
        },
        {
            title: 'Current Location',
            value: dashboardData.profile.location,
            change: isOnline ? 'Online' : 'Offline',
            icon: MapPinIcon,
            color: isOnline ? 'bg-green-500' : 'bg-gray-500',
            trend: isOnline ? 'up' : 'down'
        }
    ];

    const quickActions = [
        {
            title: 'My Deliveries',
            description: 'View and manage your deliveries',
            icon: TruckIcon,
            color: 'bg-blue-500',
            href: '/driver/deliveries',
            badge: dashboardData.deliveries.inProgress > 0 ? dashboardData.deliveries.inProgress : null
        },
        {
            title: 'Earnings Report',
            description: 'Track your earnings and statistics',
            icon: ChartBarIcon,
            color: 'bg-green-500',
            href: '/driver/earnings',
            badge: null
        },
        {
            title: 'Update Profile',
            description: 'Manage your profile and settings',
            icon: MapPinIcon,
            color: 'bg-purple-500',
            href: '/driver/profile',
            badge: null
        },
        {
            title: 'Remittances',
            description: 'View payment history and requests',
            icon: CurrencyDollarIcon,
            color: 'bg-orange-500',
            href: '/driver/remittances',
            badge: null
        }
    ];

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Welcome back, {userInfo.name}!</h1>
                        <p className="text-green-100 mt-1">
                            You're {isOnline ? 'online' : 'offline'} • {dashboardData.profile.location}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {dashboardData.stats.averageRating > 0 && (
                            <div className="flex items-center space-x-1 bg-white/20 rounded-lg px-3 py-2">
                                <StarIcon className="h-5 w-5 text-yellow-300" />
                                <span className="font-semibold">
                                    {dashboardData.stats.averageRating.toFixed(1)}
                                </span>
                                <span className="text-sm text-green-100">
                                    ({dashboardData.stats.totalRating})
                                </span>
                            </div>
                        )}
                        {/* Status indicator - Connected to real database status */}
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${isOnline
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                                }`}></div>
                            <span className="text-sm font-medium">
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Filters & Views
                    </h3>
                    <span className="text-sm text-gray-500">
                        Filter your deliveries and earnings data
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Time Period Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <CalendarIcon className="h-4 w-4 inline mr-1" />
                            Time Period
                        </label>
                        <select
                            value={filters.period}
                            onChange={(e) => handleFilterChange('period', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>

                    {/* Delivery Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TruckIcon className="h-4 w-4 inline mr-1" />
                            Delivery Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <StatusClockIcon className="h-4 w-4 inline mr-1" />
                            Date Range
                        </label>
                        <select
                            value={filters.dateRange}
                            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today Only</option>
                            <option value="week">Past Week</option>
                            <option value="month">Past Month</option>
                        </select>
                    </div>
                </div>

                {/* Active Filters Display */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {filters.period !== 'month' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Period: {filters.period}
                            <button
                                onClick={() => handleFilterChange('period', 'month')}
                                className="ml-2 text-green-600 hover:text-green-800"
                            >
                                <XCircleIcon className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.status !== 'all' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Status: {filters.status}
                            <button
                                onClick={() => handleFilterChange('status', 'all')}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                                <XCircleIcon className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.dateRange !== 'all' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Range: {filters.dateRange}
                            <button
                                onClick={() => handleFilterChange('dateRange', 'all')}
                                className="ml-2 text-purple-600 hover:text-purple-800"
                            >
                                <XCircleIcon className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {(filters.period !== 'month' || filters.status !== 'all' || filters.dateRange !== 'all') && (
                        <button
                            onClick={() => setFilters({ period: 'month', status: 'all', dateRange: 'all' })}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                <div className="flex items-center mt-2">
                                    {stat.trend === 'up' && (
                                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                                    )}
                                    <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' :
                                        stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                        {stat.change}
                                    </p>
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => navigate(action.href)}
                                    className="relative p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all text-left group"
                                >
                                    {action.badge && (
                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                                            {action.badge}
                                        </div>
                                    )}
                                    <div className="flex items-start space-x-3">
                                        <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                                            <action.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                                                {action.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {action.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Active Deliveries */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Active Deliveries</h2>
                            <button
                                onClick={() => navigate('/driver/deliveries')}
                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                                View All
                            </button>
                        </div>

                        {activeDeliveries.length > 0 ? (
                            <div className="space-y-3">
                                {activeDeliveries.slice(0, 3).map((delivery, index) => (
                                    <div key={delivery.id || index} className="p-3 border border-gray-100 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-900">
                                                #{delivery.code || `DEL-${index + 1}`}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                delivery.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {delivery.status?.replace('_', ' ') || 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">
                                            {delivery.pickupLocation || 'Pickup location'} → {delivery.deliveryLocation || 'Delivery location'}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-green-600">
                                                ₺{delivery.fee || '0'}
                                            </span>
                                            {delivery.status === 'pending' && (
                                                <button
                                                    onClick={() => acceptDelivery(delivery.id)}
                                                    className="text-xs bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
                                                >
                                                    Accept
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No active deliveries</p>
                                <p className="text-gray-400 text-xs">
                                    {dashboardData.profile.status === 'offline'
                                        ? 'Go online to receive deliveries'
                                        : 'New deliveries will appear here'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {dashboardData.deliveries.total}
                        </div>
                        <div className="text-sm text-gray-600">Total Deliveries</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {dashboardData.stats.completionRate}%
                        </div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {dashboardData.stats.averageRating.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            ₺{dashboardData.earnings.month}
                        </div>
                        <div className="text-sm text-gray-600">This Month</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main wrapper component
const DriverDashboard = () => {
    return (
        <DriverLayout>
            <DashboardContent />
        </DriverLayout>
    );
};

export default DriverDashboard;