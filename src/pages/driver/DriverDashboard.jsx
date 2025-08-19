import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
// import BroadcastDeliveries from '../../components/driver/BroadcastDeliveries'; // Unused import
import DriverMessageToAdmin from '../../components/driver/DriverMessageToAdmin';
import {
    TruckIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    StarIcon,
    FunnelIcon,
    MegaphoneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Available period options for filtering (moved outside component to avoid dependency warning)
const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'currentPeriod', label: 'This Month' },
    { value: 'allTime', label: 'All Time' }
];

const DashboardContent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [dashboardData, setDashboardData] = useState(null);

    // Load dashboard data from comprehensive endpoint
    const loadDashboardData = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            console.log('📊 Loading dashboard data for period:', selectedPeriod);
            console.log('🌐 API URL:', `/api/driver/dashboard?period=${selectedPeriod}`);
            console.log('🔑 Token check:', localStorage.getItem('token') ? 'Token exists' : 'No token found');
            console.log('👤 User info:', localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : 'No user info');

            const response = await apiService.getDashboardData(selectedPeriod);

            if (response.success && response.data) {



                setDashboardData(response.data);

                // Removed success toast to prevent unwanted notifications
            } else {
                console.warn('⚠️ Invalid dashboard response:', response);
                console.warn('Response structure:', JSON.stringify(response, null, 2));
                throw new Error('Invalid response structure');
            }



        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            console.error('Request URL:', `/api/driver/dashboard?period=${selectedPeriod}`);
            console.error('Full error object:', {
                message: error.message,
                name: error.name,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });



            // Show appropriate error messages
            if (!silent) {
                if (error.response?.status === 400) {
                    toast.error(`Period "${selectedPeriod}" validation failed. Backend may not support this period type yet.`);
                } else if (error.response?.status === 401) {
                    toast.error('Please log in again to view dashboard data.');
                } else if (error.response?.status === 500) {
                    toast.error(`Server error for period "${selectedPeriod}". Backend may need implementation.`);
                } else {
                    toast.error(`Failed to load dashboard data for "${selectedPeriod}": ${error.response?.data?.error || error.message}`);
                }
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [selectedPeriod]);

    // Period change handler
    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
    };



    useEffect(() => {
        loadDashboardData();

        // Refresh data every 30 seconds (silent refresh)
        const interval = setInterval(() => loadDashboardData(true), 60000);
        return () => clearInterval(interval);
    }, [loadDashboardData]);

    // Get current period data based on selected filter
    const getCurrentPeriodData = () => {
        if (!dashboardData?.quickStats) return null;

        switch (selectedPeriod) {
            case 'today':
                return dashboardData.quickStats.today;
            case 'thisWeek':
                return dashboardData.quickStats.thisWeek;
            case 'currentPeriod':
                return dashboardData.quickStats.currentPeriod;
            case 'allTime':
                return dashboardData.quickStats.allTime;
            default:
                return dashboardData.quickStats.today;
        }
    };

    const currentData = getCurrentPeriodData();
    const rating = dashboardData?.performance?.rating || null;

    // Main dashboard metrics based on the comprehensive payload design
    const dashboardMetrics = [
        {
            title: "Total Deliveries",
            value: currentData?.deliveries || currentData?.totalDeliveries || null,
            icon: TruckIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Completion Rate',
            value: currentData?.completionRate || null,
            icon: CheckCircleIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Total Earnings',
            value: currentData?.earnings || currentData?.totalEarnings || null,
            icon: CurrencyDollarIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Algorithm Rating',
            value: rating || null,
            icon: StarIcon,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        }
    ];

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
                        <p className="text-gray-600 mt-1">Welcome back! Here's your delivery overview.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/driver/deliveries')}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <TruckIcon className="h-5 w-5" />
                            <span>View All Deliveries</span>
                        </button>
                        <button
                            onClick={() => navigate('/driver/earnings')}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <CurrencyDollarIcon className="h-5 w-5" />
                            <span>View Earnings</span>
                        </button>
                        <button
                            onClick={() => navigate('/driver/broadcasts')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <MegaphoneIcon className="h-5 w-5" />
                            <span>Available Deliveries</span>
                        </button>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Filter by Period:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Showing stats for:</span>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            {periodOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {dashboardMetrics.map((metric, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">{metric.title}</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {metric.value === null ? '0' :
                                            metric.title === 'Total Earnings' ? `₺${metric.value?.toFixed(2) || '0.00'}` :
                                                metric.title === 'Algorithm Rating' ? metric.value?.toFixed(1) || '0' :
                                                    metric.title === 'Completion Rate' ? `${metric.value || 0}%` :
                                                        metric.value || '0'}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Current Deliveries */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Current Deliveries</h2>
                                <button
                                    onClick={() => navigate('/driver/deliveries')}
                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                    View all
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {dashboardData?.deliveries?.today?.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.deliveries.today.map((delivery, index) => (
                                        <div key={delivery.id || index} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                                            <div className="p-2 bg-green-50 rounded-lg">
                                                <TruckIcon className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-gray-900">{delivery.code || delivery.id || '0'}</p>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${delivery.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                                        delivery.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                            delivery.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {delivery.status || 'assigned'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">{delivery.customer?.name || delivery.customerName || 'Customer'}</p>
                                                <p className="text-sm text-gray-500">{delivery.deliveryTime || delivery.createdAt || new Date().toLocaleTimeString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">₺{delivery.amount || delivery.price || 0}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No current deliveries</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Earnings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Earnings</h2>
                                <button
                                    onClick={() => navigate('/driver/earnings')}
                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                    View all
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {dashboardData?.earnings?.recent?.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.earnings.recent.map((earning, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                                            <div className="p-2 bg-green-50 rounded-lg">
                                                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{earning.period || '0'}</p>
                                                <p className="text-sm text-gray-600">{earning.deliveries || 0} deliveries</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">₺{earning.amount || 0}</p>
                                                <p className="text-sm text-gray-500">₺{earning.amount || 0} + ₺{earning.tips || 0} tips</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No recent earnings data</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions - REDESIGNED */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">Live Support</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Message to Admin - Enhanced */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-500 rounded-xl">
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Message Admin</h3>
                                        <p className="text-sm text-gray-600">Direct communication</p>
                                    </div>
                                </div>
                            </div>
                            <DriverMessageToAdmin />
                        </div>

                        {/* WhatsApp Support - Enhanced */}
                        <a
                            href="https://wa.me/905338329785"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-500 rounded-xl group-hover:bg-green-600 transition-colors">
                                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 2.079.529 4.0 1.459 5.68L.029 24l6.592-1.729c1.618.826 3.436 1.296 5.396 1.296 6.621 0 11.988-5.367 11.988-11.987C23.988 5.367 18.621.001 12.017.001zM12.017 21.92c-1.737 0-3.396-.441-4.838-1.204l-.347-.206-3.595.942.959-3.507-.225-.359a9.861 9.861 0 01-1.474-5.298c0-5.464 4.445-9.909 9.909-9.909s9.909 4.445 9.909 9.909-4.445 9.909-9.909 9.909z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-green-700">WhatsApp Support</h3>
                                        <p className="text-sm text-gray-600">24/7 Live Chat</p>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-green-700">Online Now</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">+90 533 832 97 85</p>
                                <p className="text-sm text-gray-600">Tap to start chatting</p>
                            </div>
                        </a>

                        {/* Instagram - Enhanced */}
                        <a
                            href="https://instagram.com/greepit"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl group-hover:from-pink-600 group-hover:to-purple-600 transition-colors">
                                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-pink-700">Follow Us</h3>
                                        <p className="text-sm text-gray-600">Stay Connected</p>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="h-5 w-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-pink-700">Latest Updates</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">@greepit</p>
                                <p className="text-sm text-gray-600">Follow for news & tips</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main wrapper component
const DriverDashboard = () => {
    return <DashboardContent />;
};

export default DriverDashboard;