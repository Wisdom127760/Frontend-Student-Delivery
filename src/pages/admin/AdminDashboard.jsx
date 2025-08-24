import React, { useState, useEffect, useCallback } from 'react';
import { capitalizeName } from '../../utils/nameUtils';
import { useNavigate } from 'react-router-dom';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import { isDriverVerified } from '../../utils/verificationHelpers';
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
    MagnifyingGlassIcon,
    ClipboardDocumentIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { getDashboardData, getRecentDeliveries, getTopDrivers } from '../../services/dashboardService';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import RealTimeDriverStatus from '../../components/admin/RealTimeDriverStatus';
// import RealTimeNotifications from '../../components/admin/RealTimeNotifications'; // Unused import
// import BroadcastMonitor from '../../components/admin/BroadcastMonitor'; // Unused import

import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';
import socketService from '../../services/socketService';

const AdminDashboard = () => {
    const { formatCurrency } = useSystemSettings();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [recentDeliveries, setRecentDeliveries] = useState([]);
    const [topDrivers, setTopDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [isCopying, setIsCopying] = useState(false);

    // Copy leaderboard functionality
    const copyLeaderboardToClipboard = async () => {
        try {
            setIsCopying(true);

            console.log('📋 Copy function - topDrivers:', topDrivers);
            console.log('📋 Copy function - topDrivers length:', topDrivers.length);
            console.log('📋 Copy function - selectedPeriod:', selectedPeriod);

            if (topDrivers.length === 0) {
                toast.error('No driver data to copy');
                return;
            }

            const periodText = selectedPeriod === 'today' ? 'Today' :
                selectedPeriod === 'thisWeek' ? 'This Week' :
                    selectedPeriod === 'thisMonth' ? 'This Month' : 'All Time';

            let leaderboardText = `🏆 *Driver Leaderboard - ${periodText}*\n\n`;

            topDrivers.slice(0, 5).forEach((driver, index) => {
                const rank = index + 1;
                const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                const name = capitalizeName(driver.name || driver.fullNameComputed || 'Unknown Driver');
                const deliveries = driver.totalDeliveries || 0;
                const earnings = formatCurrency(driver.totalEarnings || 0);
                const avgEarnings = driver.avgEarningsPerDelivery ? `€${driver.avgEarningsPerDelivery}/delivery` : 'N/A';
                const rating = driver.rating || 'N/A';
                const avgTime = driver.avgDeliveryTime ? `${Math.round(driver.avgDeliveryTime)}m` : 'N/A';

                leaderboardText += `${rankEmoji} *${name}*\n`;
                leaderboardText += `📦 ${deliveries} deliveries | ⭐ ${rating} | ⏱️ ${avgTime}\n`;
                leaderboardText += `💰 ${earnings} (${avgEarnings})\n\n`;
            });

            leaderboardText += `📊 *Summary*\n`;
            leaderboardText += `Total Drivers: ${topDrivers.length}\n`;
            leaderboardText += `Total Earnings: ${formatCurrency(topDrivers.reduce((sum, driver) => sum + (driver.totalEarnings || 0), 0))}\n`;
            leaderboardText += `Total Deliveries: ${topDrivers.reduce((sum, driver) => sum + (driver.totalDeliveries || 0), 0)}\n\n`;
            leaderboardText += `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n`;
            leaderboardText += `📞 Need help? Contact us:\n`;
            leaderboardText += `WhatsApp: +90 533 832 97 85\n`;
            leaderboardText += `Instagram: @greepit`;

            await navigator.clipboard.writeText(leaderboardText);
            toast.success('Leaderboard copied to clipboard! Ready to share on WhatsApp');
        } catch (error) {
            console.error('Error copying leaderboard:', error);
            toast.error('Failed to copy leaderboard');
        } finally {
            setIsCopying(false);
        }
    };

    const loadDashboardData = async (silent = false) => {
        try {
            console.log('🔄 AdminDashboard: Loading dashboard data for period:', selectedPeriod, 'silent:', silent);

            if (!silent) {
                setIsLoading(true);
            } else {
                setIsRefreshing(true);
            }

            console.log('🔄 AdminDashboard: Making single API call to get all dashboard data for period:', selectedPeriod);
            const dashboardResponse = await getDashboardData(selectedPeriod);

            console.log('✅ AdminDashboard: Dashboard data loaded successfully:', dashboardResponse);

            // Extract data from the response structure
            if (dashboardResponse && dashboardResponse.data) {
                const { analytics, recentDeliveries, topDrivers } = dashboardResponse.data;

                // Check if backend returned the correct period
                const backendPeriod = analytics?.period;
                if (backendPeriod && backendPeriod !== selectedPeriod) {
                    console.warn('⚠️ AdminDashboard: Backend returned wrong period!', {
                        requested: selectedPeriod,
                        received: backendPeriod
                    });
                    toast.error(`Backend returned ${backendPeriod} data instead of ${selectedPeriod}`);
                }

                console.log('📊 AdminDashboard: Extracted data:', {
                    analytics: analytics?.stats,
                    recentDeliveriesCount: recentDeliveries?.length || 0,
                    topDriversCount: topDrivers?.length || 0,
                    period: backendPeriod
                });

                // Set dashboard stats
                setDashboardData({
                    totalDeliveries: analytics?.stats?.totalDeliveries || 0,
                    activeDrivers: analytics?.stats?.activeDrivers || 0,
                    totalRevenue: analytics?.stats?.totalRevenue || 0,
                    pendingDeliveries: analytics?.stats?.pendingDeliveries || 0,
                    completedDeliveries: analytics?.stats?.completedDeliveries || 0,
                    totalDrivers: analytics?.stats?.totalDrivers || 0,
                    deliveryGrowth: '+0%',
                    driverGrowth: '+0%',
                    revenueGrowth: '+0%',
                    pendingGrowth: '+0%'
                });

                // Set recent deliveries
                setRecentDeliveries(recentDeliveries || []);

                // Set top drivers
                console.log('🏆 AdminDashboard: Setting top drivers:', topDrivers);
                console.log('🏆 AdminDashboard: Top drivers count:', topDrivers?.length || 0);
                console.log('🏆 AdminDashboard: Top drivers data structure:', JSON.stringify(topDrivers, null, 2));
                setTopDrivers(topDrivers || []);
            } else {
                // Fallback to the old structure if needed
                setDashboardData(dashboardResponse);
                setRecentDeliveries([]);
                setTopDrivers([]);
            }
        } catch (error) {
            console.error('❌ AdminDashboard: Error loading dashboard data:', error);
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

        // Set up auto-refresh every 60 seconds (reduced from 30)
        const interval = setInterval(() => {
            loadDashboardData(true); // Silent refresh
        }, 60000);

        return () => clearInterval(interval);
    }, [selectedPeriod]); // Changed dependency to selectedPeriod



    // Socket listener for real-time driver status updates
    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket || !socketService.isConnected()) {
            console.log('⚠️ AdminDashboard: Socket not available for real-time updates');
            return;
        }

        console.log('🔌 AdminDashboard: Setting up socket event listeners');

        const handleDriverStatusChanged = (data) => {
            console.log('🔄 AdminDashboard: Driver status changed, refreshing dashboard data:', data);
            // Refresh dashboard data when driver status changes
            loadDashboardData(true); // Silent refresh
        };

        socket.on('driver-status-changed', handleDriverStatusChanged);

        return () => {
            if (socket) {
                console.log('🧹 AdminDashboard: Cleaning up socket event listeners');
                socket.off('driver-status-changed', handleDriverStatusChanged);
            }
        };
    }, []); // Removed loadDashboardData dependency

    // Show skeleton loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4">
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

            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="mt-0.5 text-xs text-gray-600">
                                Monitor and manage your delivery platform •
                                <span className="font-medium text-green-600 ml-1">
                                    {selectedPeriod === 'today' ? 'Today' :
                                        selectedPeriod === 'thisWeek' ? 'This Week' :
                                            selectedPeriod === 'thisMonth' ? 'This Month' :
                                                selectedPeriod === 'allTime' ? 'All Time' : 'Today'}
                                </span>
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => {
                                    const newPeriod = e.target.value;
                                    console.log('📊 AdminDashboard: Period changed from', selectedPeriod, 'to', newPeriod);
                                    setSelectedPeriod(newPeriod);

                                    // Explicitly trigger data reload with new period
                                    setTimeout(() => {
                                        console.log('🔄 AdminDashboard: Explicitly reloading data for new period:', newPeriod);
                                        loadDashboardData();
                                    }, 100);
                                }}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
                    {/* Enhanced Recent Deliveries */}
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
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
                            <div className="p-2 flex-1 flex flex-col">
                                {recentDeliveries.length === 0 ? (
                                    <div className="text-center py-3 flex-1 flex items-center justify-center">
                                        <div>
                                            <TruckIcon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                            <p className="text-xs text-gray-500">No recent deliveries</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1 flex-1 overflow-y-auto">
                                        {recentDeliveries.slice(0, 6).map((delivery, index) => (
                                            <div key={delivery._id || delivery.id || `delivery-${index}`} className="flex items-start justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                                <div className="flex items-start space-x-2 min-w-0 flex-1">
                                                    <div className={`p-1 rounded-full flex-shrink-0 ${getStatusColor(delivery.status)}`}>
                                                        {getStatusIcon(delivery.status)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <p className="text-xs font-medium text-gray-900 truncate">#{delivery.deliveryCode || delivery.id}</p>
                                                            {delivery.priority === 'high' && (
                                                                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex-shrink-0">Priority</span>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-gray-600 break-words leading-tight">
                                                                <span className="font-medium">{delivery.customerName || 'Customer'}</span>
                                                            </p>
                                                            <p className="text-xs text-gray-500 break-words leading-tight">
                                                                📍 {delivery.pickupLocation || delivery.pickupAddress || delivery.pickup || 'Pickup location'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 break-words leading-tight">
                                                                🎯 {delivery.deliveryLocation || delivery.deliveryAddress || delivery.delivery || 'Delivery location'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                                                            <span className="text-xs text-gray-500">
                                                                {delivery.assignedTo ? `👤 ${delivery.assignedTo.name || delivery.assignedTo.fullNameComputed}` : '🚫 Unassigned'}
                                                            </span>
                                                            {delivery.estimatedTime && (
                                                                <span className="text-xs text-gray-500">
                                                                    ⏱️ {delivery.estimatedTime}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-2 flex-shrink-0">
                                                    <p className="text-xs font-bold text-gray-900">{formatCurrency(delivery.fee || delivery.amount)}</p>
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
                    <div className="xl:col-span-1 h-full">
                        <RealTimeDriverStatus />
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
                    {/* Gamified Driver Leaderboard */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-3 py-2 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-semibold text-gray-900">🏆 Driver Leaderboard</h2>
                                <div className="flex items-center space-x-2">
                                    {/* Refresh button removed - WebSocket provides real-time updates */}
                                    <button
                                        onClick={copyLeaderboardToClipboard}
                                        disabled={isCopying}
                                        className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Copy leaderboard for sharing"
                                    >
                                        <ClipboardDocumentIcon className={`w-3 h-3 ${isCopying ? 'animate-pulse' : ''}`} />
                                        <span>{isCopying ? 'Copying...' : 'Copy'}</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/admin/drivers')}
                                        className="text-xs text-green-600 hover:text-green-700 font-medium"
                                    >
                                        View all →
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-3">
                            {/* Debug info */}
                            <div className="text-xs text-gray-500 font-italic mb-2">
                                Info: {topDrivers.length} drivers loaded | Period: {selectedPeriod}
                            </div>

                            {topDrivers.length === 0 ? (
                                <div className="text-center py-4">
                                    <UserGroupIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-500">No driver data available</p>
                                    <p className="text-xs text-gray-400">Check console for API call details</p>
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
                                            <div key={driver._id || driver.id || `driver-${index}`} className="flex items-start justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                                <div className="flex items-start space-x-2 min-w-0 flex-1">
                                                    <div className={`w-6 h-6 ${rankBadge.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                                                        <span className="text-xs font-bold">{rankBadge.icon}</span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <p className="text-xs font-medium text-gray-900 truncate">{capitalizeName(driver.name || driver.fullNameComputed)}</p>
                                                            <VerifiedBadge
                                                                isVerified={isDriverVerified(driver)}
                                                                size="xs"
                                                                className="flex-shrink-0"
                                                            />
                                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 flex-wrap gap-1">
                                                            <span className="text-xs text-gray-600">
                                                                📦 {driver.totalDeliveries || 0}
                                                            </span>
                                                            <span className="text-xs text-gray-600">
                                                                ⭐ {driver.avgEarningsPerDelivery || 'N/A'}
                                                            </span>
                                                            {driver.avgDeliveryTime && (
                                                                <span className="text-xs text-gray-600">
                                                                    ⏱️ {Math.round(driver.avgDeliveryTime)}m
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-2 flex-shrink-0">
                                                    <p className="text-xs font-bold text-gray-900">{formatCurrency(driver.totalEarnings)}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {driver.avgEarningsPerDelivery ? `€${driver.avgEarningsPerDelivery}/delivery` : 'N/A'}
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


                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

